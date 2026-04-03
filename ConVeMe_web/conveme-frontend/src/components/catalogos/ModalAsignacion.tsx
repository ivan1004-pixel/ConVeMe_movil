import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PackagePlus, Loader2, Search, CheckCircle2 } from 'lucide-react';
import { convemeApi } from '../../api/convemeApi';
import { createAsignacion } from '../../services/asignacion.service'; // Ajusta la ruta

interface ModalAsignacionProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    asigAEditar?: any; // Por si luego implementas la edición
}

export default function ModalAsignacion({ isOpen, onClose, onSuccess, asigAEditar }: ModalAsignacionProps) {
    const [guardando, setGuardando] = useState(false);

    // ── ESTADOS DEL BUSCADOR DE VENDEDORES ──
    const [searchTermVend, setSearchTermVend] = useState('');
    const [vendedoresOptions, setVendedoresOptions] = useState<any[]>([]);
    const [searchingVend, setSearchingVend] = useState(false);
    const [vendedorSel, setVendedorSel] = useState<any>(null);

    // ── ESTADOS DEL BUSCADOR DE PRODUCTOS ──
    const [searchTermProd, setSearchTermProd] = useState('');
    const [productosOptions, setProductosOptions] = useState<any[]>([]);
    const [searchingProd, setSearchingProd] = useState(false);

    // ── ESTADO DEL FORMULARIO ──
    const [detalles, setDetalles] = useState<any[]>([]);

    // Limpiar el modal cuando se abre/cierra
    useEffect(() => {
        if (isOpen) {
            setSearchTermVend(''); setVendedoresOptions([]); setVendedorSel(null);
            setSearchTermProd(''); setProductosOptions([]); setDetalles([]);
        }
    }, [isOpen]);
    // ── EFECTO: BUSCAR VENDEDORES ──
    useEffect(() => {
        const delay = setTimeout(async () => {
            if (!vendedorSel) { // Solo si no han seleccionado uno
                setSearchingVend(true);
                try {
                    const query = `query { buscarVendedores(termino: "${searchTermVend}") { id_vendedor nombre_completo } }`;
                    const { data } = await convemeApi.post('', { query });
                    setVendedoresOptions(data.data.buscarVendedores || []);
                } catch (error) { console.error(error); }
                finally { setSearchingVend(false); }
            }
        }, 400);
        return () => clearTimeout(delay);
    }, [searchTermVend, vendedorSel]);

    // ── EFECTO: BUSCAR PRODUCTOS ──
    useEffect(() => {
        const delay = setTimeout(async () => {
            setSearchingProd(true);
            try {
                const query = `query { buscarProductos(termino: "${searchTermProd}") { id_producto nombre sku precio_unitario activo } }`;
                const { data } = await convemeApi.post('', { query });
                setProductosOptions(data.data.buscarProductos || []);
            } catch (error) { console.error(error); }
            finally { setSearchingProd(false); }
        }, 400);
        return () => clearTimeout(delay);
    }, [searchTermProd]);

    // ── MANEJADORES DE SELECCIÓN ──
    const handleSeleccionarVendedor = (vend: any) => {
        setVendedorSel(vend);
        setSearchTermVend('');
        setVendedoresOptions([]);
    };

    const handleAddProducto = (prod: any) => {
        // Evitar duplicados en la lista de abajo
        if (!detalles.find(d => d.producto_id === prod.id_producto)) {
            setDetalles([...detalles, {
                producto_id: prod.id_producto,
                nombre: prod.nombre,
                sku: prod.sku,
                cantidad_asignada: 1
            }]);
        }
        // Limpiar el buscador para poder buscar otro producto
        setSearchTermProd('');
        setProductosOptions([]);
    };

    const updateCantidad = (index: number, cantidad: number) => {
        const nuevos = [...detalles];
        nuevos[index].cantidad_asignada = cantidad > 0 ? cantidad : 1;
        setDetalles(nuevos);
    };

    const removeProducto = (index: number) => {
        setDetalles(detalles.filter((_, i) => i !== index));
    };

    const handleGuardar = async () => {
        if (!vendedorSel || detalles.length === 0) return alert("Selecciona un vendedor y al menos un producto.");

        setGuardando(true);
        try {
            await createAsignacion({
                vendedor_id: Number(vendedorSel.id_vendedor),
                                   estado: "Activa",
                                   detalles: detalles.map(d => ({
                                       producto_id: d.producto_id,
                                       cantidad_asignada: d.cantidad_asignada
                                   }))
            });
            onSuccess(); // Recarga la tabla y muestra notificación
            onClose();   // Cierra el modal
        } catch (error: any) {
            alert("Error al guardar: " + error.message);
        } finally {
            setGuardando(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="me-overlay" style={{zIndex: 50}}>
        <motion.div className="me-backdrop" initial={{opacity:0}} animate={{opacity:1}} onClick={onClose} />
        <motion.div className="me-modal" style={{maxWidth:'600px', width:'95%', overflow: 'visible'}} initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}}>

        {/* ── HEADER ── */}
        <div className="me-header">
        <div className="me-header-left">
        <div className="me-header-icon" style={{background:'#06d6a0', color:'#1a0060'}}><PackagePlus size={20}/></div>
        <div>
        <p className="me-header-title">Nueva Asignación</p>
        <span className="me-header-sub">Entregar mercancía a vendedor</span>
        </div>
        </div>
        <button className="me-close-btn" onClick={onClose}><X size={16}/></button>
        </div>

        <div className="me-body scrollbar-thin" style={{ overflow: 'visible' }}>

        {/* ── 1. BUSCADOR DE VENDEDORES ── */}
        <div className="mb-6 relative">
        <label className="me-label">1. Seleccionar Vendedor</label>

        {vendedorSel ? (
            // Vista de vendedor seleccionado
            <div className="flex justify-between items-center bg-[#fdfcff] border-2 border-[#cc55ff] p-3 rounded-xl shadow-[2px_2px_0px_#cc55ff]">
            <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#06d6a0]" />
            <span className="font-bold text-[#1a0060]">{vendedorSel.nombre_completo}</span>
            </div>
            <button onClick={() => setVendedorSel(null)} className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors" title="Cambiar vendedor">
            <X size={16}/>
            </button>
            </div>
        ) : (
            // Vista de input buscador
            <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
            type="text"
            className="w-full bg-white border-2 border-[#1a0060]/20 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#cc55ff] transition-colors text-sm font-bold text-[#1a0060]"
            placeholder="Buscar por nombre..."
            value={searchTermVend}
            onChange={e => setSearchTermVend(e.target.value)}
            />
            {searchingVend && <Loader2 size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#cc55ff] animate-spin" />}

            {/* Resultados Flotantes */}
            {vendedoresOptions.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border-2 border-[#1a0060] shadow-[4px_4px_0px_#1a0060] max-h-48 overflow-y-auto rounded-xl mt-2 left-0 top-full">
                {vendedoresOptions.map(v => (
                    <li key={v.id_vendedor} className="p-3 border-b border-gray-100 hover:bg-[#f8f5ff] cursor-pointer font-bold text-[#1a0060] transition-colors" onClick={() => handleSeleccionarVendedor(v)}>
                    {v.nombre_completo}
                    </li>
                ))}
                </ul>
            )}
            </div>
        )}
        </div>

        {/* ── 2. BUSCADOR DE PRODUCTOS ── */}
        <div className="mb-4 relative">
        <label className="me-label">2. Añadir Productos (Pines / Stickers)</label>
        <div className="relative">
        <PackagePlus size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
        type="text"
        className="w-full bg-[#f8f5ff] border-2 border-[#1a0060]/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#cc55ff] transition-colors text-sm font-bold text-[#1a0060]"
        placeholder="+ Buscar por nombre o SKU..."
        value={searchTermProd}
        onChange={e => setSearchTermProd(e.target.value)}
        disabled={!vendedorSel} // Deshabilitar si no hay vendedor
        />
        {searchingProd && <Loader2 size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#cc55ff] animate-spin" />}

        {/* Resultados Flotantes */}
        {productosOptions.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border-2 border-[#1a0060] shadow-[4px_4px_0px_#1a0060] max-h-48 overflow-y-auto rounded-xl mt-2 left-0 top-full">
            {productosOptions.map(p => (
                <li key={p.id_producto} className="p-3 border-b border-gray-100 hover:bg-[#06d6a0]/10 cursor-pointer flex justify-between items-center transition-colors" onClick={() => handleAddProducto(p)}>
                <div className="flex flex-col">
                <span className="font-bold text-[#1a0060]">{p.nombre}</span>
                <span className="text-[10px] font-black text-gray-400">{p.sku}</span>
                </div>
                <span className="font-black text-[#06d6a0]">${p.precio_unitario}</span>
                </li>
            ))}
            </ul>
        )}
        </div>
        </div>

        {/* ── TABLA DE PRODUCTOS AÑADIDOS ── */}
        {detalles.length > 0 && (
            <div className="bg-[#f8f5ff] rounded-2xl border-2 border-[#1a0060]/10 overflow-hidden mt-4">
            <table className="w-full text-[11px]">
            <thead className="bg-[#1a0060] text-white">
            <tr>
            <th className="p-3 text-left tracking-widest uppercase">Producto</th>
            <th className="p-3 text-center w-24 tracking-widest uppercase">Cantidad</th>
            <th className="p-3 text-center w-12"></th>
            </tr>
            </thead>
            <tbody>
            {detalles.map((det, idx) => (
                <tr key={idx} className="border-b border-[#1a0060]/5 last:border-0 bg-white">
                <td className="p-3">
                <p className="font-bold text-[#1a0060] text-sm">{det.nombre}</p>
                <p className="text-[10px] text-gray-400 font-bold">{det.sku}</p>
                </td>
                <td className="p-3">
                <input
                type="number" min="1"
                className="w-full text-center bg-[#f8f5ff] border-2 border-[#d4b8f0] rounded-lg p-2 outline-none focus:border-[#cc55ff] font-black text-[#1a0060]"
                value={det.cantidad_asignada}
                onChange={e => updateCantidad(idx, parseInt(e.target.value))}
                />
                </td>
                <td className="p-3 text-center">
                <button onClick={() => removeProducto(idx)} className="text-red-500 hover:bg-red-100 rounded-lg p-2 font-bold transition-colors">
                <X size={16}/>
                </button>
                </td>
                </tr>
            ))}
            </tbody>
            </table>
            </div>
        )}
        </div>

        {/* ── FOOTER ── */}
        <div className="me-actions-footer mt-2 border-t-2 border-[#1a0060]/10 pt-4">
        <button
        className="w-full flex justify-center items-center gap-2 bg-[#06d6a0] hover:bg-[#05b586] text-[#1a0060] font-black uppercase tracking-widest p-4 rounded-xl border-2 border-[#1a0060] shadow-[4px_4px_0px_#1a0060] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1 active:shadow-none"
        onClick={handleGuardar}
        disabled={guardando || !vendedorSel || detalles.length === 0}
        >
        {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : 'Confirmar Asignación'}
        </button>
        </div>

        </motion.div>
        </div>
    );
}
