import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';
import { getProductos } from '../services/producto.service';
import { getPedidos, createPedido } from '../services/pedido.service';
import ActionModal from '../components/ui/ActionModal';
import type { ActionType } from '../components/ui/ActionModal';

import {
    ClipboardList, PackagePlus, Plus, Minus, Search, Loader2,
    Check, X as XIcon, PackageOpen, ChevronLeft, Send
} from 'lucide-react';

interface CartItem {
    producto: any;
    cantidad: number | string;
}

export default function MisPedidos() {
    const vendedorId = Number(localStorage.getItem('id_vendedor'));

    // ── ESTADOS ──
    const [vista, setVista] = useState<'lista' | 'crear'>('lista');
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Carrito de pedido
    const [carrito, setCarrito] = useState<CartItem[]>([]);
    const [anticipo, setAnticipo] = useState<number | ''>('');
    const [procesando, setProcesando] = useState(false);

    // Modal
    const [actionModal, setActionModal] = useState<{isOpen: boolean, type: ActionType, title: string, subtitle: string}>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        if (vista === 'lista') cargarPedidos();
        if (vista === 'crear') cargarProductos();
    }, [vista]);

        const cargarPedidos = async () => {
            setLoading(true);
            try {
                const data = await getPedidos();
                // 👇 ¡AQUÍ ESTÁ LA MAGIA! Ahora sí busca por VENDEDOR
                const misPedidos = data.filter((p: any) => p.vendedor?.id_vendedor === vendedorId);
                setPedidos(misPedidos.sort((a: any, b: any) => b.id_pedido - a.id_pedido));
            } catch (error) {
                console.error("Error al cargar pedidos:", error);
            } finally {
                setLoading(false);
            }
        };

        const cargarProductos = async () => {
            if (productos.length > 0) return;
            setLoading(true);
            try {
                const data = await getProductos();
                setProductos(data);
            } catch (error) {
                console.error("Error al cargar catálogo:", error);
            } finally {
                setLoading(false);
            }
        };

        // ── LÓGICA DEL CARRITO DE SOLICITUD ──
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
                    const nueva = Number(item.cantidad) + delta;
                    return { ...item, cantidad: nueva > 0 ? nueva : 1 };
                }
                return item;
            }));
        };

        const quitarDelCarrito = (idProducto: number) => {
            setCarrito(prev => prev.filter(item => item.producto.id_producto !== idProducto));
        };

        const totalMonto = carrito.reduce((sum, item) => sum + (Number(item.cantidad || 0) * item.producto.precio_unitario), 0);

        const enviarPedido = async () => {
            if (carrito.length === 0) return alert("Agrega productos para solicitar.");

            setProcesando(true);
            try {
                const payload = {
                    vendedor_id: vendedorId,
                    monto_total: Number(totalMonto.toFixed(2)),
                    anticipo: Number(anticipo) || 0,
                    estado: 'Pendiente',
                    detalles: carrito.map(item => ({
                        producto_id: item.producto.id_producto,
                        cantidad: Number(item.cantidad) || 1,
                                                   precio_unitario: Number(item.producto.precio_unitario)
                    }))
                };
                await createPedido(payload);

                setActionModal({ isOpen: true, type: 'success', title: '¡Solicitud Enviada!', subtitle: 'El administrador revisará tu pedido pronto.' });
                setCarrito([]);
                setAnticipo('');
                setTimeout(() => {
                    setActionModal(prev => ({ ...prev, isOpen: false }));
                    setVista('lista');
                }, 2000);

            } catch (error: any) {
                alert(error.message || "Error al enviar la solicitud.");
            } finally {
                setProcesando(false);
            }
        };

        const getEstadoColor = (estado: string) => {
            if (estado === 'Pendiente') return 'bg-[#ffe144] text-[#1a0060] border border-[#ffe144]';
            if (estado === 'Entregado') return 'bg-[#06d6a0] text-white border border-[#05b589]';
            if (estado === 'Cancelado') return 'bg-[#ff5050] text-white border border-[#e63946]';
            return 'bg-gray-200 text-gray-700';
        };

        return (
            <div className="flex flex-col h-screen bg-[#F3F0FF] p-4 lg:p-6 overflow-hidden font-sans">
            <div className="flex items-center justify-between mb-4">
            <UserGreeting />
            {vista === 'lista' ? (
                <button onClick={() => setVista('crear')} className="flex items-center gap-2 bg-[#cc55ff] border-[2.5px] border-[#1a0060] text-white font-syne font-black uppercase tracking-wider text-xs px-5 py-3 rounded-xl shadow-[4px_4px_0px_#1a0060] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1a0060] transition-all">
                <PackagePlus size={18} /> Nuevo Pedido
                </button>
            ) : (
                <button onClick={() => setVista('lista')} className="flex items-center gap-2 bg-white border-[2.5px] border-[#1a0060] text-[#1a0060] font-syne font-black uppercase tracking-wider text-xs px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_#1a0060] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1a0060] transition-all">
                <ChevronLeft size={16} /> Regresar a Lista
                </button>
            )}
            </div>

            <AnimatePresence mode="wait">
            {vista === 'lista' ? (
                /* ── VISTA 1: LISTA DE PEDIDOS ── */
                <motion.div key="lista" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 bg-white border-[3px] border-[#1a0060] rounded-[28px] shadow-[8px_8px_0px_#1a0060] overflow-hidden flex flex-col min-h-0">
                <div className="p-5 border-b-[2.5px] border-[#1a0060]/10 bg-[#faf5ff] flex items-center justify-between">
                <h2 className="font-syne font-black text-xl text-[#1a0060] uppercase tracking-wide flex items-center gap-2">
                <ClipboardList size={24} className="text-[#00b4d8]"/> Mis Solicitudes
                </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#1a0060]/40 font-syne font-bold gap-3"><Loader2 size={32} className="animate-spin" /> Cargando tu historial...</div>
                ) : pedidos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-[#00b4d8]/10 rounded-2xl flex items-center justify-center text-[#00b4d8] border-2 border-[#00b4d8]/30 mb-4"><PackagePlus size={40}/></div>
                    <h3 className="font-syne font-black text-xl text-[#1a0060] mb-2">Aún no has solicitado mercancía</h3>
                    <p className="text-sm font-medium text-[#1a0060]/50 mb-6">Pídele al administrador los pines y stickers que te hagan falta para seguir vendiendo.</p>
                    <button onClick={() => setVista('crear')} className="bg-[#00b4d8] text-white border-[2.5px] border-[#1a0060] font-syne font-black uppercase text-sm px-6 py-3 rounded-xl shadow-[4px_4px_0px_#1a0060] hover:-translate-y-1 transition-all">Crear primer pedido</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {pedidos.map(pedido => (
                        <div key={pedido.id_pedido} className="bg-white border-2 border-[#1a0060]/10 rounded-2xl p-5 shadow-sm hover:border-[#cc55ff] hover:shadow-[4px_4px_0px_#cc55ff] transition-all flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                        <div>
                        <h4 className="font-syne font-black text-lg text-[#1a0060]">Solicitud #{pedido.id_pedido}</h4>
                        <span className="text-xs font-bold text-[#1a0060]/40">{new Date(pedido.fecha_pedido).toLocaleDateString('es-MX')}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-syne font-black uppercase tracking-wider ${getEstadoColor(pedido.estado)}`}>
                        {pedido.estado}
                        </span>
                        </div>

                        <div className="bg-[#f8f9fa] rounded-xl p-3 mb-4 flex-1">
                        <p className="text-[10px] font-syne font-bold uppercase text-[#1a0060]/60 mb-2 border-b border-[#1a0060]/10 pb-1">Productos Solicitados</p>
                        <div className="max-h-[80px] overflow-y-auto scrollbar-thin flex flex-col gap-1">
                        {pedido.detalles?.map((d: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs font-medium text-[#1a0060]">
                            <span className="truncate pr-2">{d.cantidad}x {d.producto?.nombre}</span>
                            <span className="font-bold text-[#cc55ff]">${Number(d.precio_unitario * d.cantidad).toFixed(2)}</span>
                            </div>
                        ))}
                        </div>
                        </div>

                        <div className="flex justify-between items-end mt-auto pt-3 border-t-2 border-dashed border-[#1a0060]/10">
                        <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-[#1a0060]/50">Valor del Pedido</span>
                        <span className="font-syne font-black text-lg text-[#06d6a0]">${Number(pedido.monto_total).toFixed(2)}</span>
                        </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
                </motion.div>

            ) : (
                /* ── VISTA 2: CREAR NUEVO PEDIDO (Estilo POS) ── */
                <motion.div key="crear" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

                {/* Izquierda: Catálogo */}
                <div className="flex-1 flex flex-col bg-white border-[3px] border-[#1a0060] rounded-[28px] shadow-[8px_8px_0px_#1a0060] overflow-hidden min-h-0">
                <div className="p-4 border-b-[2.5px] border-[#1a0060]/10 bg-[#faf5ff] flex items-center justify-between">
                <h2 className="font-syne font-black text-lg text-[#1a0060] uppercase flex items-center gap-2"><PackageOpen size={20} className="text-[#cc55ff]"/> Catálogo</h2>
                <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1a0060]/40" size={14}/>
                <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white border-[2px] border-[#d4b8f0] rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-[#1a0060] outline-none focus:border-[#cc55ff]" />
                </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                {loading ? (
                    <div className="h-full flex justify-center items-center"><Loader2 className="animate-spin text-[#cc55ff]" size={32}/></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase())).map(p => (
                        <div key={p.id_producto} onClick={() => agregarAlCarrito(p)} className="bg-white border-[2px] border-[#1a0060]/10 rounded-2xl p-3 cursor-pointer hover:border-[#cc55ff] hover:shadow-[4px_4px_0px_#cc55ff] transition-all flex flex-col justify-between aspect-square">
                        <span className="text-[9px] font-black uppercase text-[#1a0060]/40">{p.sku}</span>
                        <h3 className="font-bold text-[#1a0060] text-xs leading-tight line-clamp-2 mt-1 mb-2">{p.nombre}</h3>
                        <div className="flex items-end justify-between mt-auto">
                        <span className="font-syne font-black text-sm text-[#06d6a0]">${p.precio_unitario}</span>
                        <span className="bg-[#cc55ff]/10 text-[#cc55ff] w-6 h-6 rounded-md flex items-center justify-center"><Plus size={14}/></span>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
                </div>

                {/* Derecha: Resumen de Solicitud */}
                <div className="w-full lg:w-[350px] flex flex-col bg-white border-[3px] border-[#1a0060] rounded-[28px] shadow-[8px_8px_0px_#1a0060] overflow-hidden min-h-0 shrink-0">
                <div className="p-4 border-b-[2.5px] border-[#1a0060]/10 bg-[#1a0060] text-white flex justify-between items-center">
                <h2 className="font-syne font-black text-base uppercase">Mi Solicitud</h2>
                <span className="bg-[#ffe144] text-[#1a0060] px-2 py-0.5 rounded-md text-[10px] font-bold">{carrito.length} Items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-[#f8f9fa] scrollbar-thin">
                {carrito.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#1a0060]/30 font-syne text-center p-4">
                    <PackageOpen size={40} className="mb-2 opacity-30"/>
                    <p className="font-bold text-sm">Toca un producto para agregarlo a tu solicitud.</p>
                    </div>
                ) : (
                    carrito.map(item => (
                        <div key={item.producto.id_producto} className="bg-white border border-[#1a0060]/10 rounded-xl p-2.5 flex items-center gap-2 shadow-sm">
                        <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1a0060] text-xs truncate">{item.producto.nombre}</p>
                        <p className="text-[10px] font-bold text-[#06d6a0]">${item.producto.precio_unitario} c/u</p>
                        </div>

                        <div className="flex items-center gap-1 bg-[#f8f5ff] rounded-lg p-0.5 border border-[#1a0060]/5">
                        <button onClick={() => modificarCantidad(item.producto.id_producto, -1)} className="w-5 h-5 flex items-center justify-center bg-white rounded flex-shrink-0"><Minus size={12}/></button>
                        <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setCarrito(prev => prev.map(i => i.producto.id_producto === item.producto.id_producto ? { ...i, cantidad: isNaN(val) ? '' : val } : i ));
                        }}
                        onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) setCarrito(prev => prev.map(i => i.producto.id_producto === item.producto.id_producto ? { ...i, cantidad: 1 } : i ));
                        }}
                        className="font-syne font-black w-10 text-center text-[#1a0060] text-xs bg-transparent outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        <button onClick={() => modificarCantidad(item.producto.id_producto, 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded flex-shrink-0 text-[#cc55ff]"><Plus size={12}/></button>
                        </div>

                        <button onClick={() => quitarDelCarrito(item.producto.id_producto)} className="text-[#ff5050]/40 hover:text-[#ff5050]"><XIcon size={14}/></button>
                        </div>
                    ))
                )}
                </div>

                <div className="p-4 border-t-[3px] border-[#1a0060] bg-white">
                <div className="mb-4">
                <label className="block text-[10px] font-syne font-bold uppercase text-[#1a0060]/60 mb-1">Anticipo (Opcional)</label>
                <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-syne font-black text-[#1a0060]/40">$</span>
                <input type="number" placeholder="0.00" value={anticipo} onChange={e => setAnticipo(Number(e.target.value))} className="w-full bg-[#faf5ff] border-2 border-[#d4b8f0] rounded-xl py-2 pl-7 pr-3 text-sm font-bold text-[#1a0060] outline-none focus:border-[#cc55ff]" />
                </div>
                </div>
                <div className="flex justify-between items-end mb-4">
                <span className="font-syne font-bold uppercase text-[11px] text-[#1a0060]/50">Valor Total</span>
                <span className="font-syne font-black text-2xl text-[#1a0060]">${totalMonto.toFixed(2)}</span>
                </div>
                <button onClick={enviarPedido} disabled={carrito.length === 0 || procesando} className="w-full bg-[#cc55ff] text-white border-[3px] border-[#1a0060] font-syne font-black uppercase text-sm py-3 rounded-xl shadow-[4px_4px_0px_#1a0060] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1a0060] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2">
                {procesando ? <Loader2 size={18} className="animate-spin"/> : <><Send size={16}/> Enviar Solicitud</>}
                </button>
                </div>
                </div>
                </motion.div>
            )}
            </AnimatePresence>

            <ActionModal isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle} onClose={() => setActionModal({ ...actionModal, isOpen: false })} />
            </div>
        );
}
