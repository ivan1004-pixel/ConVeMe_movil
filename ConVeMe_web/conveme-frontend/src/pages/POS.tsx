import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';
import { getProductos } from '../services/producto.service';
import { getVendedores } from '../services/vendedor.service';
import { getClientes, createCliente } from '../services/cliente.service';
import { getPromociones, createPromocion } from '../services/promocion.service';
import { createVenta } from '../services/venta.service';
import ActionModal from '../components/ui/ActionModal';
import type { ActionType } from '../components/ui/ActionModal';

// Modales
import ModalHistorialVentas from '../components/pos/ModalHistorialVentas';
import ModalCliente from '../components/pos/ModalCliente';
import ModalPromocion from '../components/pos/ModalPromocion';

import {
    Search, ShoppingCart, Plus, Minus, Trash2,
    Banknote, PackageOpen, Loader2, History, UserPlus, Tag, User, ChevronRight, Settings2, X
} from 'lucide-react';

interface CartItem {
    producto: any;
    cantidad: number | string;
}

export default function POS() {
    // ── Catálogos ──
    const [productos, setProductos] = useState<any[]>([]);
    const [vendedores, setVendedores] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);
    const [promociones, setPromociones] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // ── Estado del Flujo de Venta ──
    const [ordenIniciada, setOrdenIniciada] = useState(false);

    // ── Estado del Carrito y Venta ──
    const [carrito, setCarrito] = useState<CartItem[]>([]);
    const [vendedorId, setVendedorId] = useState<number | ''>('');
    const [clienteId, setClienteId] = useState<number | ''>('');
    const [promocionId, setPromocionId] = useState<number | ''>('');
    const [metodoPago, setMetodoPago] = useState('Efectivo');

    // ── Estados de UI (Modales) ──
    const [procesando, setProcesando] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
    const [isPromocionModalOpen, setIsPromocionModalOpen] = useState(false);

    const [actionModal, setActionModal] = useState<{isOpen: boolean, type: ActionType, title: string, subtitle: string}>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        cargarDatos();

        // ¡NUEVO! Detectar si es vendedor y autoseleccionarlo
        const rolId = localStorage.getItem('rol_id');
        const idVendedorLocal = localStorage.getItem('id_vendedor');
        if (rolId === '2' && idVendedorLocal) {
            setVendedorId(Number(idVendedorLocal));
        }
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [prods, vends, clis, promos] = await Promise.all([
                getProductos().catch(() => []),
                                                                   getVendedores().catch(() => []),
                                                                   getClientes().catch(() => []),
                                                                   getPromociones().catch(() => [])
            ]);
            setProductos(prods);
            setVendedores(vends);
            setClientes(clis);
            setPromociones(promos.filter((p: any) => p.activa));
        } catch (error) {
            console.error("Error cargando catálogos POS", error);
        } finally {
            setLoading(false);
        }
    };

    // ── Lógica del Carrito ──
    const agregarAlCarrito = (producto: any) => {
        setCarrito(prev => {
            const existe = prev.find(item => item.producto.id_producto === producto.id_producto);
            if (existe) return prev.map(item => item.producto.id_producto === producto.id_producto ? { ...item, cantidad: Number(item.cantidad) + 1 } : item);
            return [...prev, { producto, cantidad: 1 }];
        });
    };

    const modificarCantidad = (idProducto: number, delta: number) => {
        setCarrito(prev => prev.map(item => {
            if (item.producto.id_producto === idProducto) {
                const nuevaCat = Number(item.cantidad) + delta;
                return { ...item, cantidad: nuevaCat > 0 ? nuevaCat : 1 };
            }
            return item;
        }));
    };

    const quitarDelCarrito = (idProducto: number) => {
        setCarrito(prev => prev.filter(item => item.producto.id_producto !== idProducto));
    };

    const vaciarCarrito = () => {
        setCarrito([]);
        setClienteId('');
        setPromocionId('');
        // Si no es vendedor, limpiamos. Si sí es, lo dejamos puesto.
        if (localStorage.getItem('rol_id') !== '2') {
            setVendedorId('');
        }
        setOrdenIniciada(false);
    };

    // ── Cálculos Financieros ──
    const subtotal = carrito.reduce((sum, item) => sum + ((Number(item.cantidad) || 0) * item.producto.precio_unitario), 0);

    let descuentoTotal = 0;
    const promoAplicada = promociones.find(p => p.id_promocion === promocionId);
    const clienteAplicado = clientes.find(c => c.id_cliente === clienteId);

    if (promoAplicada && subtotal > 0) {
        if (promoAplicada.tipo_promocion === 'Porcentaje') {
            descuentoTotal = subtotal * (promoAplicada.valor_descuento / 100);
        } else if (promoAplicada.tipo_promocion === 'Monto Fijo') {
            descuentoTotal = Math.min(subtotal, promoAplicada.valor_descuento);
        }
    }

    const totalFinal = subtotal - descuentoTotal;

    // ── Procesar Venta ──
    const handleCobrar = async () => {
        const carritoValidado = carrito.map(item => ({ ...item, cantidad: Number(item.cantidad) || 1 }));

        if (carritoValidado.length === 0) return alert("El carrito está vacío");
        if (!vendedorId) return alert("Selecciona el vendedor que está cobrando");

        setProcesando(true);
        try {
            const payload: any = {
                vendedor_id: Number(vendedorId),
                ...(clienteId ? { cliente_id: Number(clienteId) } : {}),
                monto_total: Number(totalFinal.toFixed(2)),
                metodo_pago: metodoPago,
                estado: 'Completada',
                detalles: carritoValidado.map(item => ({
                    producto_id: item.producto.id_producto,
                    cantidad: item.cantidad,
                    precio_unitario: Number(item.producto.precio_unitario)
                }))
            };

            await createVenta(payload);

            setActionModal({ isOpen: true, type: 'success', title: '¡Venta Exitosa!', subtitle: `Total cobrado: $${totalFinal.toFixed(2)}` });

            vaciarCarrito();
            setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2500);
        } catch (error: any) {
            alert(error.message || "Error al procesar la venta");
        } finally {
            setProcesando(false);
        }
    };

    // ── Handlers de Modales Secundarios ──
    const handleGuardarClienteNuevo = async (data: any) => {
        const nuevo = await createCliente(data);
        await cargarDatos();
        setClienteId(nuevo.id_cliente);
    };

    const handleGuardarPromocionNueva = async (data: any) => {
        const nueva = await createPromocion(data);
        await cargarDatos();
        setPromocionId(nueva.id_promocion);
    };

    const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
        <div className="flex flex-col h-screen bg-[#F3F0FF] p-4 lg:p-6 overflow-hidden font-sans">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between">
        <UserGreeting />
        <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 bg-white border-[2.5px] border-[#1a0060] text-[#1a0060] font-syne font-black uppercase tracking-wider text-xs px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_#1a0060] hover:bg-[#faf5ff] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1a0060] transition-all">
        <History size={16} /> Ver Historial
        </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-full mt-4 min-h-0">

        {/* ── LADO IZQUIERDO: PRODUCTOS ── */}
        <div className="flex-1 flex flex-col bg-white border-[3px] border-[#1a0060] rounded-[28px] shadow-[8px_8px_0px_#1a0060] overflow-hidden min-h-0 relative">

        {!ordenIniciada && (
            <div className="absolute inset-0 z-10 bg-[#f3f0ff]/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white border-2 border-[#cc55ff] text-[#1a0060] font-syne font-bold px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
            <span className="bg-[#cc55ff]/10 text-[#cc55ff] p-2 rounded-lg"><Settings2 size={20}/></span>
            Configura la orden en el panel derecho para comenzar
            </div>
            </div>
        )}

        <div className={`p-5 border-b-[2.5px] border-[#1a0060]/10 bg-[#faf5ff] flex items-center justify-between gap-4 ${!ordenIniciada ? 'opacity-50' : ''}`}>
        <h2 className="font-syne font-black text-xl text-[#1a0060] uppercase tracking-wide flex items-center gap-2 shrink-0">
        <PackageOpen size={24} className="text-[#cc55ff]"/> Catálogo
        </h2>
        <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1a0060]/40" size={18}/>
        <input type="text" placeholder="Buscar por SKU o nombre..." value={search} onChange={e => setSearch(e.target.value)} disabled={!ordenIniciada} className="w-full bg-white border-[2px] border-[#d4b8f0] rounded-xl py-2.5 pl-10 pr-4 font-medium text-[#1a0060] outline-none focus:border-[#cc55ff] focus:shadow-[0_0_0_3px_rgba(204,85,255,0.15)] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"/>
        </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[#cc55ff]/30 ${!ordenIniciada ? 'opacity-50 pointer-events-none' : ''}`}>
        {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-[#1a0060]/40 font-syne font-bold gap-3"><Loader2 size={32} className="animate-spin" /> Cargando inventario...</div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {productosFiltrados.map(p => (
                <motion.div key={p.id_producto} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }} onClick={() => agregarAlCarrito(p)} className="bg-white border-[2.5px] border-[#1a0060]/10 rounded-2xl p-4 cursor-pointer hover:border-[#cc55ff] hover:shadow-[4px_4px_0px_#cc55ff] transition-all flex flex-col justify-between aspect-square">
                <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1a0060]/50 block mb-1">{p.sku}</span>
                <h3 className="font-bold text-[#1a0060] text-sm leading-tight line-clamp-3">{p.nombre}</h3>
                </div>
                <div className="mt-2 flex items-end justify-between">
                <span className="text-[10px] font-bold bg-[#f8f5ff] text-[#cc55ff] px-2 py-1 rounded-md">{p.categoria?.nombre || 'Gral'}</span>
                <span className="font-syne font-black text-lg text-[#06d6a0]">${p.precio_unitario}</span>
                </div>
                </motion.div>
            ))}
            </div>
        )}
        </div>
        </div>

        {/* ── LADO DERECHO: SETUP / CARRITO ── */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white border-[3px] border-[#1a0060] rounded-[28px] shadow-[8px_8px_0px_#1a0060] overflow-hidden min-h-0 shrink-0">

        {!ordenIniciada ? (
            /* ── VISTA 1: CONFIGURACIÓN DE LA VENTA ── */
            <div className="flex-1 flex flex-col p-6 bg-[#faf5ff] justify-start overflow-y-auto scrollbar-thin scrollbar-thumb-[#cc55ff]/30">

            <div className="text-center mb-6 mt-4">
            <div className="w-16 h-16 bg-[#cc55ff]/10 border-2 border-[#cc55ff]/30 text-[#cc55ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={32} />
            </div>
            <h3 className="font-syne font-black text-2xl text-[#1a0060] uppercase tracking-wide">Paso 1: Setup</h3>
            <p className="text-sm font-medium text-[#1a0060]/50 mt-2">¿A quién le vamos a vender hoy? Configura los detalles antes de armar el ticket.</p>
            </div>

            <div className="flex flex-col gap-5 bg-white p-5 rounded-2xl border-2 border-[#1a0060]/10 shadow-sm shrink-0">
            <div>
            <label className="flex items-center gap-2 font-syne font-bold text-[10px] uppercase tracking-widest text-[#1a0060] mb-2">
            <User size={14} className="text-[#cc55ff]" /> Seleccionar Cliente
            </label>
            <div className="flex items-center gap-2">
            <select value={clienteId} onChange={e => setClienteId(Number(e.target.value) || '')} className="flex-1 bg-[#f8f5ff] border-[2px] border-[#d4b8f0] rounded-xl p-3 font-medium text-[#1a0060] text-sm outline-none cursor-pointer focus:border-[#cc55ff]">
            <option value="">Público General (Mostrador)</option>
            {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>)}
            </select>
            <button type="button" onClick={() => setIsClienteModalOpen(true)} className="p-3 bg-[#cc55ff]/10 text-[#cc55ff] border-2 border-[#cc55ff]/30 rounded-xl hover:bg-[#cc55ff] hover:text-white transition-colors" title="Crear Cliente Rápido"><UserPlus size={18}/></button>
            </div>
            </div>

            <div>
            <label className="flex items-center gap-2 font-syne font-bold text-[10px] uppercase tracking-widest text-[#1a0060] mb-2">
            <Tag size={14} className="text-[#00b4d8]" /> Aplicar Promoción
            </label>
            <div className="flex items-center gap-2">
            <select value={promocionId} onChange={e => setPromocionId(Number(e.target.value) || '')} className="flex-1 bg-[#f0fbff] border-[2px] border-[#90e0ef] rounded-xl p-3 font-medium text-[#1a0060] text-sm outline-none cursor-pointer focus:border-[#00b4d8]">
            <option value="">Sin promoción (Precio normal)</option>
            {promociones.map(p => <option key={p.id_promocion} value={p.id_promocion}>{p.nombre} ({p.tipo_promocion})</option>)}
            </select>
            <button type="button" onClick={() => setIsPromocionModalOpen(true)} className="p-3 bg-[#00b4d8]/10 text-[#00b4d8] border-2 border-[#00b4d8]/30 rounded-xl hover:bg-[#00b4d8] hover:text-white transition-colors" title="Crear Promoción"><Plus size={18}/></button>
            </div>
            </div>
            </div>

            <motion.button
            onClick={() => setOrdenIniciada(true)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="mt-8 mb-4 bg-[#06d6a0] text-[#1a0060] font-syne font-black py-4 rounded-xl shadow-[4px_4px_0px_#1a0060] flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1a0060] transition-all uppercase tracking-widest text-sm shrink-0"
            >
            Abrir Orden <ChevronRight size={18} />
            </motion.button>
            </div>
        ) : (
            /* ── VISTA 2: CARRITO DE COMPRAS (TODO JUNTO) ── */
            <div className="flex flex-col flex-1 min-h-0">

            {/* Header Ticket (Fijo arriba) */}
            <div className="p-3 border-b-[2.5px] border-[#1a0060]/10 bg-[#1a0060] text-white flex items-center justify-between shrink-0">
            <h2 className="font-syne font-black text-lg uppercase tracking-wide flex items-center gap-2"><ShoppingCart size={20} className="text-[#ffe144]"/> Ticket</h2>
            <span className="text-xs font-bold bg-[#ffe144] text-[#1a0060] px-2 py-1 rounded-md">{carrito.length} Items</span>
            </div>

            {/* ── CONTENEDOR CON SCROLL (Pines y Totales juntos) ── */}
            <div className="flex-1 overflow-y-auto bg-[#f8f9fa] scrollbar-thin scrollbar-thumb-[#1a0060]/20 flex flex-col">

            {/* Resumen del Setup */}
            <div className="bg-[#f8f5ff] px-4 py-3 border-b border-[#1a0060]/10 flex justify-between items-center shrink-0">
            <div className="flex flex-col gap-1.5 text-xs font-bold">
            <span className="text-[#1a0060] flex items-center gap-1.5"><User size={14} className="text-[#cc55ff]"/> {clienteAplicado?.nombre_completo || 'Público General'}</span>
            {promoAplicada && <span className="text-[#00b4d8] flex items-center gap-1.5"><Tag size={14}/> {promoAplicada.nombre}</span>}
            </div>
            <button onClick={() => setOrdenIniciada(false)} className="text-[10px] font-black bg-white border border-[#cc55ff]/30 text-[#cc55ff] px-3 py-1.5 rounded-lg hover:bg-[#cc55ff] hover:text-white transition-colors uppercase tracking-wider">Modificar</button>
            </div>

            {/* 1. Lista de Productos Pegada */}
            <div className="flex flex-col gap-2 p-3 shrink-0">
            <AnimatePresence>
            {carrito.length === 0 ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center justify-center text-[#1a0060]/30 font-syne font-bold gap-3 text-center py-10"><ShoppingCart size={48} className="opacity-20" /><p>Agrega pines o stickers del catálogo.</p></motion.div>
            ) : (
                carrito.map(item => (
                    <motion.div key={item.producto.id_producto} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border-2 border-[#1a0060]/10 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                    <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1a0060] text-sm truncate">{item.producto.nombre}</h4>
                    <p className="text-xs font-bold text-[#06d6a0]">${item.producto.precio_unitario} c/u</p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#f8f5ff] rounded-lg border border-[#1a0060]/10 p-1">
                    <button onClick={() => modificarCantidad(item.producto.id_producto, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-[#1a0060] shadow-sm hover:text-[#cc55ff] shrink-0"><Minus size={14}/></button>
                    <input type="number" min="1" value={item.cantidad} onChange={(e) => { const val = parseInt(e.target.value, 10); setCarrito(prev => prev.map(i => i.producto.id_producto === item.producto.id_producto ? { ...i, cantidad: isNaN(val) ? '' : val } : i )); }} onBlur={(e) => { const val = parseInt(e.target.value, 10); if (isNaN(val) || val < 1) setCarrito(prev => prev.map(i => i.producto.id_producto === item.producto.id_producto ? { ...i, cantidad: 1 } : i )); }} className="font-syne font-black w-10 text-center text-[#1a0060] text-sm bg-transparent outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"/>
                    <button onClick={() => modificarCantidad(item.producto.id_producto, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-[#1a0060] shadow-sm hover:text-[#cc55ff] shrink-0"><Plus size={14}/></button>
                    </div>
                    <div className="font-syne font-black text-[#1a0060] w-14 text-right">${((Number(item.cantidad) || 0) * item.producto.precio_unitario).toFixed(2)}</div>
                    <button onClick={() => quitarDelCarrito(item.producto.id_producto)} className="text-[#ff5050]/50 hover:text-[#ff5050] transition-colors ml-2"><X size={18}/></button>
                    </motion.div>
                ))
            )}
            </AnimatePresence>
            </div>

            {/* 2. Detalles de Cobro (Pegados a los productos, sin espacio extra) */}
            <div className="bg-white p-3 mx-3 mb-3 rounded-2xl border-2 border-[#1a0060]/10 shadow-sm flex flex-col gap-3 shrink-0">
            {/* Vendedor y Método */}
            <div className="flex gap-2">
            <div className="flex-1">
            <label className="block text-[9px] font-syne font-bold uppercase tracking-wider text-[#1a0060] mb-1">Vendedor</label>
            <select
            value={vendedorId}
            onChange={e => setVendedorId(Number(e.target.value))}
            disabled={localStorage.getItem('rol_id') === '2'}
            className="w-full bg-[#faf5ff] border-[2px] border-[#d4b8f0] rounded-xl p-2 font-medium text-[#1a0060] text-sm outline-none cursor-pointer focus:border-[#cc55ff] disabled:opacity-60 disabled:cursor-not-allowed"
            >
            <option value="" disabled>Seleccione...</option>
            {vendedores.map(v => <option key={v.id_vendedor} value={v.id_vendedor}>{v.nombre_completo}</option>)}
            </select>
            </div>
            <div className="flex-1">
            <label className="block text-[9px] font-syne font-bold uppercase tracking-wider text-[#1a0060] mb-1">Método</label>
            <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="w-full bg-[#faf5ff] border-[2px] border-[#d4b8f0] rounded-xl p-2 font-medium text-[#1a0060] text-sm outline-none cursor-pointer focus:border-[#cc55ff]">
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
            </select>
            </div>
            </div>

            {/* Totales */}
            <div>
            {descuentoTotal > 0 && (
                <div className="flex flex-col gap-1 mb-2 px-2 mt-1">
                <div className="flex justify-between text-xs font-bold text-[#1a0060]/50 uppercase tracking-wider"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold text-[#00b4d8] uppercase tracking-wider"><span>Descuento Promo</span><span>-${descuentoTotal.toFixed(2)}</span></div>
                </div>
            )}
            <div className="flex items-end justify-between bg-[#f8f5ff] p-3 rounded-2xl border-2 border-[#cc55ff]/30">
            <span className="font-syne font-bold text-[#1a0060]/60 uppercase tracking-widest text-xs">Total</span>
            <span className="font-syne font-black text-3xl text-[#1a0060]">${totalFinal.toFixed(2)}</span>
            </div>
            </div>
            </div>
            </div>

            {/* ── BOTONES (Fijos hasta abajo) ── */}
            <div className="p-3 border-t-[3px] border-[#1a0060] bg-white shrink-0">
            <div className="flex gap-2">
            <button onClick={vaciarCarrito} disabled={carrito.length === 0 || procesando} className="px-4 py-3 border-[2.5px] border-[#1a0060]/20 text-[#1a0060]/60 font-syne font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-[#FFEAEF] hover:text-[#ff5050] hover:border-[#ff5050]/50 transition-colors disabled:opacity-50">Cancelar</button>
            <motion.button onClick={handleCobrar} disabled={carrito.length === 0 || procesando} whileHover={carrito.length > 0 && !procesando ? { scale: 1.02 } : {}} whileTap={carrito.length > 0 && !procesando ? { scale: 0.98 } : {}} className="flex-1 bg-[#06d6a0] border-[3px] border-[#1a0060] text-[#1a0060] font-syne font-black uppercase tracking-widest text-sm rounded-xl py-3 shadow-[4px_4px_0px_#1a0060] flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:shadow-none cursor-pointer">
            {procesando ? <Loader2 size={20} className="animate-spin"/> : <><Banknote size={20}/> Cobrar</>}
            </motion.button>
            </div>
            </div>
            </div>
        )}
        </div>

        </div>
        </div>

        {/* ── Modales Secundarios ── */}
        <ActionModal isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle} onClose={() => setActionModal({ ...actionModal, isOpen: false })} />
        <ModalHistorialVentas isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
        <ModalCliente isOpen={isClienteModalOpen} onClose={() => setIsClienteModalOpen(false)} onSave={handleGuardarClienteNuevo} />
        <ModalPromocion isOpen={isPromocionModalOpen} onClose={() => setIsPromocionModalOpen(false)} onSave={handleGuardarPromocionNueva} />
        </>
    );
}
