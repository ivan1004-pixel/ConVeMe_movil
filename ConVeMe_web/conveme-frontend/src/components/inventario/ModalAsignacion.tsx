import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
    X, PackagePlus, Loader2, Plus, Trash2,
    GripHorizontal, Users, Package, Check,
    RefreshCw, AlertTriangle, Search, ChevronDown,
    Pencil
} from 'lucide-react';
import { convemeApi } from '../../api/convemeApi';
import { createAsignacion, updateAsignacion } from '../../services/asignacion.service';

interface ModalAsignacionProps {
    isOpen:         boolean;
    onClose:        () => void;
    onSuccess:      () => void;
    asigAEditar?:   any | null;
}

type Step = 'form' | 'success' | 'error';

/* ── helpers fuera del componente ── */
const sectionStyle = {
    background: 'rgba(237,233,254,0.3)',
    border: '1.5px solid rgba(26,0,96,0.08)',
    borderRadius: 14, padding: '14px 14px 12px',
};

const sectionHeadStyle = (color: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 7,
    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 9.5,
    letterSpacing: '.14em', textTransform: 'uppercase', color, marginBottom: 10,
});

function FieldLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1a0060', marginBottom: 5 }}>
        <span style={{ color: '#cc55ff', display: 'flex' }}>{icon}</span>
        {children}
        </label>
    );
}

function DropSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1.5px solid rgba(26,0,96,0.08)', background: 'rgba(237,233,254,0.5)' }}>
        <Search size={13} style={{ color: 'rgba(26,0,96,0.35)', flexShrink: 0 }} />
        <input autoFocus value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: '#1a0060' }} />
        </div>
    );
}

function DropList({ children }: { children: React.ReactNode }) {
    return <div style={{ maxHeight: 160, overflowY: 'auto', scrollbarWidth: 'thin' as any }}>{children}</div>;
}

function DropItem({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <div onClick={onClick} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
            color: selected ? '#1a0060' : 'rgba(26,0,96,0.75)',
            borderBottom: '1px solid rgba(26,0,96,0.05)',
            background: selected ? '#ffe144' : 'transparent', transition: 'background .13s',
        }}
        onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'rgba(204,85,255,0.08)'; }}
        onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = selected ? '#ffe144' : 'transparent'; }}
        >
        {children}
        {selected && <Check size={13} />}
        </div>
    );
}

function DropEmpty() {
    return <div style={{ padding: 16, textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'rgba(26,0,96,0.35)' }}>Sin resultados</div>;
}

function CustomDrop({ show, onToggle, disabled, placeholder, selected, children }: {
    show: boolean; onToggle: () => void; disabled?: boolean;
    placeholder: string; selected?: string; children: React.ReactNode;
}) {
    return (
        <div style={{ position: 'relative' }}>
        <button type="button" disabled={disabled} onClick={onToggle} style={{
            width: '100%', background: disabled ? '#f3f4f6' : '#faf5ff',
            border: `2px solid ${show ? '#cc55ff' : '#d4b8f0'}`,
            borderRadius: 10, padding: '8px 12px',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
            color: selected ? '#1a0060' : '#b9a0d4',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            outline: 'none', opacity: disabled ? .55 : 1,
            boxShadow: show ? '0 0 0 3px rgba(204,85,255,0.15), 3px 3px 0px #1a0060' : 'none',
            transition: 'border-color .18s, box-shadow .18s', textAlign: 'left',
        }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected ?? placeholder}</span>
        <ChevronDown size={15} style={{ flexShrink: 0, color: 'rgba(26,0,96,0.35)', transition: 'transform .2s', transform: show ? 'rotate(180deg)' : 'none' }} />
        </button>
        <AnimatePresence>
        {show && !disabled && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .16 }}
            style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: '2.5px solid #1a0060', borderRadius: 14, boxShadow: '5px 5px 0px #1a0060', overflow: 'hidden', zIndex: 100 }}>
            {children}
            </motion.div>
        )}
        </AnimatePresence>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */

export default function ModalAsignacion({ isOpen, onClose, onSuccess, asigAEditar }: ModalAsignacionProps) {
    const dragControls = useDragControls();

    const [vendedores,    setVendedores]    = useState<any[]>([]);
    const [productos,     setProductos]     = useState<any[]>([]);
    const [loadingData,   setLoadingData]   = useState(false);
    const [guardando,     setGuardando]     = useState(false);
    const [step,          setStep]          = useState<Step>('form');
    const [errorMsg,      setErrorMsg]      = useState('');

    /* form state */
    const [vendedorId,    setVendedorId]    = useState<number | ''>('');
    const [detalles,      setDetalles]      = useState<any[]>([]);

    /* dropdowns */
    const [showVendDrop,  setShowVendDrop]  = useState(false);
    const [showProdDrop,  setShowProdDrop]  = useState(false);
    const [searchVend,    setSearchVend]    = useState('');
    const [searchProd,    setSearchProd]    = useState('');

    useEffect(() => {
        if (isOpen) {
            cargarCatalogos();
            setStep('form');
            setErrorMsg('');

            if (asigAEditar) {
                setVendedorId(asigAEditar.vendedor?.id_vendedor || asigAEditar.vendedor_id);
                setDetalles(asigAEditar.detalles.map((d: any) => ({
                    // 👇 GUARDAMOS EL ID DEL DETALLE 👇
                    id_det_asignacion: d.id_det_asignacion,
                    producto_id: d.producto?.id_producto || d.producto_id,
                    nombre: d.producto?.nombre || "Producto",
                    sku: d.producto?.sku || "",
                    precio_unitario: Number(d.producto?.precio_unitario) || 0,
                                                                  cantidad_asignada: d.cantidad_asignada
                })));
            } else {
                resetForm();
            }
        }
        else { resetForm(); }
    }, [isOpen, asigAEditar]);

    const resetForm = () => {
        setVendedorId(''); setDetalles([]);
        setSearchVend(''); setSearchProd('');
        setShowVendDrop(false); setShowProdDrop(false);
    };

    const cargarCatalogos = async () => {
        setLoadingData(true);
        try {
            const query = `query { vendedores { id_vendedor nombre_completo } productos { id_producto nombre sku precio_unitario activo } }`;
            const { data } = await convemeApi.post('', { query });
            setVendedores(data.data.vendedores || []);
            setProductos((data.data.productos || []).filter((p: any) => p.activo));
        } catch (e) { console.error(e); }
        finally { setLoadingData(false); }
    };

    const handleAddProducto = (prod: any) => {
        if (detalles.find(d => d.producto_id === prod.id_producto)) return;
        setDetalles(prev => [...prev, { producto_id: prod.id_producto, nombre: prod.nombre, sku: prod.sku, precio_unitario: prod.precio_unitario, cantidad_asignada: 1 }]);
        setShowProdDrop(false);
        setSearchProd('');
    };

    const updateCantidad = (idx: number, val: number) => {
        setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, cantidad_asignada: Math.max(1, val) } : d));
    };

    const removeProducto = (idx: number) => setDetalles(prev => prev.filter((_, i) => i !== idx));

    const totalPiezas  = detalles.reduce((s, d) => s + d.cantidad_asignada, 0);
    const totalValor   = detalles.reduce((s, d) => s + d.cantidad_asignada * Number(d.precio_unitario), 0);

    const handleGuardar = async () => {
        if (!vendedorId || detalles.length === 0) return;
        setGuardando(true);
        setErrorMsg('');
        try {
            const payload = {
                ...(asigAEditar && { id_asignacion: asigAEditar.id_asignacion }), // Inyectamos ID en la raíz si es edit
                vendedor_id: Number(vendedorId),
                estado: 'Activa',
                detalles: detalles.map(d => ({
                    // 👇 AQUÍ ESTÁ LA SOLUCIÓN: FORZAMOS LOS IDs 👇
                    ...(asigAEditar && { asignacion_id: asigAEditar.id_asignacion }),
                                             ...(d.id_det_asignacion && { id_det_asignacion: d.id_det_asignacion }),
                                             producto_id: d.producto_id,
                                             cantidad_asignada: d.cantidad_asignada
                })),
            };

            if (asigAEditar) {
                await updateAsignacion(payload);
            } else {
                await createAsignacion(payload);
            }

            setStep('success');
            setTimeout(() => { onSuccess(); onClose(); resetForm(); setStep('form'); }, 2200);
        } catch (e: any) {
            setErrorMsg(e.message.replace('GraphQL error: ', '') || 'Error al procesar la asignación');
        } finally {
            setGuardando(false);
        }
    };

    /* filtered lists */
    const vendedoresFiltrados = vendedores.filter(v => v.nombre_completo.toLowerCase().includes(searchVend.toLowerCase()));
    const productosFiltrados  = productos
    .filter(p => !detalles.find(d => d.producto_id === p.id_producto))
    .filter(p => `${p.sku} ${p.nombre}`.toLowerCase().includes(searchProd.toLowerCase()));

    const vendedorSelected = vendedores.find(v => v.id_vendedor === vendedorId) || (asigAEditar ? asigAEditar.vendedor : null);

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

            .masig-overlay {
                position: fixed; inset: 0; z-index: 60;
                display: flex; align-items: center; justify-content: center; /* Cambiado a center para que flote bien */
                padding: 10px 12px;
                font-family: 'DM Sans', sans-serif;
                overflow-y: auto;
            }
            .masig-backdrop {
                position: fixed; inset: 0;
                background: rgba(26,0,96,0.45);
                backdrop-filter: blur(6px);
            }
            .masig-modal {
                position: relative; z-index: 2;
                background: #fff;
                border: 3px solid #1a0060;
                border-radius: 22px;
                width: 100%; max-width: 640px;
                box-shadow: 6px 6px 0px #1a0060;
                display: flex; flex-direction: column;
                max-height: calc(100dvh - 20px);
                margin: 0 auto;
            }

            /* drag */
            .masig-drag {
                display: flex; align-items: center; justify-content: space-between;
                padding: 12px 18px;
                border-bottom: 2px solid rgba(26,0,96,0.1);
                background: rgba(237,233,254,0.6);
                border-radius: 19px 19px 0 0;
                cursor: grab; flex-shrink: 0; user-select: none;
            }
            .masig-drag:active { cursor: grabbing; }
            .masig-drag-left  { display: flex; align-items: center; gap: 10px; pointer-events: none; }
            .masig-drag-icon  {
                width: 36px; height: 36px; border-radius: 11px;
                display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                background: rgba(6,214,160,0.12); border: 1.5px solid rgba(6,214,160,0.2); color: #06d6a0;
            }
            .masig-drag-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px; color: #1a0060; text-transform: uppercase; letter-spacing: .05em; line-height: 1.1; }
            .masig-drag-sub   { font-size: 10px; font-weight: 500; color: rgba(26,0,96,0.45); display: block; margin-top: 1px; }
            .masig-drag-right { display: flex; align-items: center; gap: 6px; }
            .masig-close-btn {
                width: 32px; height: 32px; border-radius: 9px;
                border: 2px solid rgba(26,0,96,0.15); background: rgba(255,255,255,0.8);
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; color: rgba(26,0,96,0.5); pointer-events: auto;
                transition: background .18s, color .18s, border-color .18s;
            }
            .masig-close-btn:hover { background: #ff5050; color: #fff; border-color: #ff5050; }

            /* body */
            .masig-body {
                flex: 1; overflow-y: auto; padding: 14px 16px;
                display: flex; flex-direction: column; gap: 12px;
                scrollbar-width: thin; scrollbar-color: rgba(204,85,255,0.3) transparent;
            }
            .masig-body::-webkit-scrollbar { width: 4px; }
            .masig-body::-webkit-scrollbar-thumb { background: rgba(204,85,255,0.3); border-radius: 4px; }

            /* footer */
            .masig-footer {
                padding: 12px 16px;
                border-top: 2px solid rgba(26,0,96,0.08);
                background: rgba(237,233,254,0.4);
                border-radius: 0 0 19px 19px;
                flex-shrink: 0;
                display: flex; flex-direction: column; gap: 8px;
            }
            .masig-save-btn {
                width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
                background: #06d6a0; color: #1a0060;
                font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px;
                letter-spacing: .1em; text-transform: uppercase;
                border: 2.5px solid #1a0060; border-radius: 14px; padding: 15px;
                cursor: pointer; box-shadow: 4px 4px 0px #1a0060;
                transition: transform .12s, box-shadow .12s, opacity .15s;
            }
            .masig-save-btn:hover:not(:disabled)  { transform: translate(-2px,-2px); box-shadow: 6px 6px 0px #1a0060; }
            .masig-save-btn:active:not(:disabled) { transform: translate(2px,2px);   box-shadow: 2px 2px 0px #1a0060; }
            .masig-save-btn:disabled { opacity: .55; cursor: not-allowed; }

            /* product table */
            .masig-table { width: 100%; border-collapse: collapse; }
            .masig-table thead tr { background: #1a0060; }
            .masig-table thead th {
                padding: 10px 14px;
                font-family: 'Syne', sans-serif; font-weight: 800; font-size: 9.5px;
                letter-spacing: .12em; text-transform: uppercase;
                color: rgba(255,255,255,0.6); text-align: left; white-space: nowrap;
                border-right: 1px solid rgba(255,255,255,0.06);
            }
            .masig-table thead th:last-child { border-right: none; text-align: center; }
            .masig-table thead th:first-child { color: #ffe144; width: 40%; }
            .masig-table tbody tr {
                border-bottom: 1.5px solid rgba(26,0,96,0.06);
                transition: background .13s;
            }
            .masig-table tbody tr:nth-child(even) { background: rgba(237,233,254,0.25); }
            .masig-table tbody tr:hover { background: rgba(204,85,255,0.06); }
            .masig-table tbody tr:last-child { border-bottom: none; }
            .masig-table tbody td {
                padding: 10px 14px; font-size: 13px; font-weight: 500;
                color: rgba(26,0,96,0.75); vertical-align: middle;
            }
            .masig-table tbody td:first-child { font-weight: 600; color: #1a0060; }

            .masig-qty-input {
                width: 70px; text-align: center; background: #faf5ff;
                border: 2px solid #d4b8f0; border-radius: 8px; padding: 5px 8px;
                font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: #1a0060;
                outline: none; transition: border-color .18s, box-shadow .18s;
            }
            .masig-qty-input:focus {
                border-color: #cc55ff;
                box-shadow: 0 0 0 3px rgba(204,85,255,0.12);
            }

            .masig-rm-btn {
                width: 28px; height: 28px; border-radius: 8px;
                border: 1.5px solid rgba(255,80,80,0.2); background: rgba(255,80,80,0.06);
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; color: rgba(255,80,80,0.7); margin: 0 auto;
                transition: background .15s, color .15s, border-color .15s;
            }
            .masig-rm-btn:hover { background: #ff5050; color: #fff; border-color: #ff5050; }

            /* summary strip */
            .masig-summary {
                display: flex; gap: 0;
                background: #1a0060;
                border-radius: 0 0 12px 12px;
                overflow: hidden;
            }
            .masig-summary-cell {
                flex: 1; padding: 10px 14px;
                border-right: 1px solid rgba(255,255,255,0.08);
                display: flex; flex-direction: column;
            }
            .masig-summary-cell:last-child { border-right: none; }
            .masig-summary-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 8.5px; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
            .masig-summary-value { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 17px; color: #ffe144; line-height: 1; }
            .masig-summary-value.green { color: #06d6a0; }

            /* error */
            .masig-error {
                background: #ffe5e8; border: 2px solid #ff4d6d; border-radius: 12px;
                padding: 10px 14px; color: #c1002b; font-size: 12px; font-weight: 600;
                display: flex; align-items: center; gap: 8px;
            }

            /* success / loading screens */
            .masig-centered {
                padding: 48px 24px;
                display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
            }
            .masig-big-icon {
                width: 72px; height: 72px; border-radius: 22px;
                display: flex; align-items: center; justify-content: center;
            }
            .masig-screen-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 20px; color: #1a0060; }
            .masig-screen-sub   { font-size: 13px; font-weight: 500; color: rgba(26,0,96,0.5); max-width: 280px; line-height: 1.55; }

            @keyframes masig-spin { to { transform: rotate(360deg); } }
            .masig-spinner { animation: masig-spin 1s linear infinite; }

            /* sku badge */
            .masig-sku {
                font-family: 'Syne', sans-serif; font-weight: 700; font-size: 9.5px;
                letter-spacing: .08em; text-transform: uppercase;
                background: rgba(204,85,255,0.1); color: #cc55ff;
                border-radius: 5px; padding: 2px 7px; display: inline-block; margin-left: 6px;
            }

            @keyframes masig-spin { to { transform: rotate(360deg); } }
            `}</style>

            <AnimatePresence>
            {isOpen && (
                <div className="masig-overlay">
                <motion.div
                className="masig-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                />

                <motion.div
                className="masig-modal"
                drag dragControls={dragControls} dragListener={false} dragMomentum={false}
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{   opacity: 0, scale: 0.88,  y: 24 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                {/* ── Drag handle ── */}
                <div className="masig-drag" onPointerDown={e => dragControls.start(e)} style={{ touchAction: 'none' }}>
                <div className="masig-drag-left">
                <div className="masig-drag-icon">
                {asigAEditar ? <Pencil size={18} /> : <PackagePlus size={18} />}
                </div>
                <div>
                <p className="masig-drag-title">
                {step === 'success' ? '¡Listo!' : asigAEditar ? 'Editar Asignación' : 'Entregar mercancía'}
                </p>
                <span className="masig-drag-sub">
                {step === 'success' ? (asigAEditar ? 'Asignación actualizada' : 'Asignación creada correctamente') : asigAEditar ? 'Modificar cantidades del folio' : 'Crear nueva asignación de productos'}
                </span>
                </div>
                </div>
                <div className="masig-drag-right">
                <GripHorizontal size={16} style={{ color: 'rgba(26,0,96,0.25)' }} />
                <button className="masig-close-btn" onClick={onClose} onPointerDown={e => e.stopPropagation()} type="button">
                <X size={16} />
                </button>
                </div>
                </div>

                {/* ── Content ── */}
                <AnimatePresence mode="wait">

                {/* LOADING */}
                {loadingData && (
                    <motion.div key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                    <div className="masig-centered">
                    <Loader2 size={36} className="masig-spinner" style={{ color: '#cc55ff' }} />
                    <p className="masig-screen-title">Cargando catálogos...</p>
                    </div>
                    </motion.div>
                )}

                {/* FORM */}
                {!loadingData && step === 'form' && (
                    <motion.div key="form"
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }} transition={{ duration: .22 }}
                    style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
                    >
                    <div className="masig-body">

                    {/* ── Sección 1: Vendedor ── */}
                    <div style={sectionStyle}>
                    <p style={sectionHeadStyle('#cc55ff')}>
                    <Users size={13} /> {asigAEditar ? 'Vendedor Asignado' : 'Seleccionar vendedor'}
                    </p>
                    <FieldLabel icon={<Users size={13} />}>Vendedor</FieldLabel>
                    <CustomDrop
                    show={showVendDrop}
                    onToggle={() => { setShowVendDrop(v => !v); setShowProdDrop(false); }}
                    disabled={!!asigAEditar}
                    placeholder="Selecciona un vendedor..."
                    selected={vendedorSelected?.nombre_completo}
                    >
                    <DropSearch value={searchVend} onChange={setSearchVend} placeholder="Buscar vendedor..." />
                    <DropList>
                    {vendedoresFiltrados.length > 0
                        ? vendedoresFiltrados.map(v => (
                            <DropItem key={v.id_vendedor} selected={vendedorId === v.id_vendedor}
                            onClick={() => { setVendedorId(v.id_vendedor); setShowVendDrop(false); setSearchVend(''); }}>
                            {v.nombre_completo}
                            </DropItem>
                        ))
                        : <DropEmpty />
                    }
                    </DropList>
                    </CustomDrop>
                    </div>

                    {/* ── Sección 2: Productos ── */}
                    <div style={sectionStyle}>
                    <p style={sectionHeadStyle('#06d6a0')}>
                    <Package size={13} /> Añadir productos
                    </p>
                    <FieldLabel icon={<Package size={13} />}>Buscar y añadir producto</FieldLabel>
                    <CustomDrop
                    show={showProdDrop}
                    onToggle={() => { setShowProdDrop(v => !v); setShowVendDrop(false); }}
                    disabled={false}
                    placeholder={productosFiltrados.length === 0 ? 'Todos los productos añadidos' : 'Selecciona un producto...'}
                    selected={undefined}
                    >
                    <DropSearch value={searchProd} onChange={setSearchProd} placeholder="Buscar por nombre o SKU..." />
                    <DropList>
                    {productosFiltrados.length > 0
                        ? productosFiltrados.map(p => (
                            <DropItem key={p.id_producto} onClick={() => handleAddProducto(p)}>
                            <span>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 10, color: '#cc55ff', marginRight: 8 }}>{p.sku}</span>
                            {p.nombre}
                            </span>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: '#06d6a0', flexShrink: 0, marginLeft: 8 }}>
                            ${p.precio_unitario}
                            </span>
                            </DropItem>
                        ))
                        : <DropEmpty />
                    }
                    </DropList>
                    </CustomDrop>

                    {/* ── Product table ── */}
                    <AnimatePresence>
                    {detalles.length > 0 && (
                        <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: 12, border: '2.5px solid #1a0060', borderRadius: 14, overflow: 'hidden', boxShadow: '4px 4px 0px #1a0060' }}
                        >
                        <table className="masig-table">
                        <thead>
                        <tr>
                        <th>Producto</th>
                        <th style={{ textAlign: 'center', width: 100 }}>Cantidad</th>
                        <th style={{ textAlign: 'center', width: 80 }}>Precio u.</th>
                        <th style={{ textAlign: 'center', width: 50 }}>—</th>
                        </tr>
                        </thead>
                        <tbody>
                        {detalles.map((det, idx) => (
                            <motion.tr key={det.producto_id}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            >
                            <td>
                            {det.nombre}
                            {det.sku && <span className="masig-sku">{det.sku}</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                            <input
                            type="number" min="1"
                            className="masig-qty-input"
                            value={det.cantidad_asignada}
                            onChange={e => updateCantidad(idx, parseInt(e.target.value) || 1)}
                            />
                            </td>
                            <td style={{ textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: '#06d6a0' }}>
                            ${Number(det.precio_unitario).toFixed(2)}
                            </td>
                            <td>
                            <button className="masig-rm-btn" onClick={() => removeProducto(idx)}>
                            <Trash2 size={13} />
                            </button>
                            </td>
                            </motion.tr>
                        ))}
                        </tbody>
                        </table>

                        {/* Summary strip */}
                        <div className="masig-summary">
                        <div className="masig-summary-cell">
                        <span className="masig-summary-label">Productos</span>
                        <span className="masig-summary-value">{detalles.length}</span>
                        </div>
                        <div className="masig-summary-cell">
                        <span className="masig-summary-label">Total piezas</span>
                        <span className="masig-summary-value">{totalPiezas}</span>
                        </div>
                        <div className="masig-summary-cell">
                        <span className="masig-summary-label">Valor total</span>
                        <span className="masig-summary-value green">${totalValor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                        </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                    </div>
                    </div>

                    {/* Footer */}
                    <div className="masig-footer">
                    {errorMsg && (
                        <div className="masig-error">
                        <AlertTriangle size={15} /> {errorMsg}
                        </div>
                    )}
                    <motion.button
                    className="masig-save-btn"
                    disabled={guardando || !vendedorId || detalles.length === 0}
                    onClick={handleGuardar}
                    whileHover={!guardando ? { scale: 1.01 } : {}}
                    whileTap={!guardando ? { scale: 0.97 } : {}}
                    >
                    {guardando
                        ? <><RefreshCw size={16} className="masig-spinner" /> Guardando...</>
                        : asigAEditar
                        ? <><Pencil size={16} /> Guardar cambios</>
                        : <><PackagePlus size={16} /> Confirmar entrega de mercancía</>
                    }
                    </motion.button>
                    </div>
                    </motion.div>
                )}

                {/* SUCCESS */}
                {step === 'success' && (
                    <motion.div key="success"
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    >
                    <div className="masig-centered">
                    <motion.div className="masig-big-icon"
                    style={{ background: 'rgba(6,214,160,0.12)', border: '2px solid rgba(6,214,160,0.25)', color: '#06d6a0' }}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: [0, 1.25, 1], rotate: [0, 10, 0] }}
                    transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}
                    >
                    <Check size={36} />
                    </motion.div>
                    <p className="masig-screen-title">¡{asigAEditar ? 'Mercancía actualizada' : 'Mercancía entregada'}!</p>
                    <p className="masig-screen-sub">
                    La asignación de <strong>{totalPiezas} piezas</strong> por valor de <strong style={{ color: '#06d6a0' }}>${totalValor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong> fue {asigAEditar ? 'actualizada' : 'registrada'} correctamente para <strong>{vendedorSelected?.nombre_completo}</strong>.
                    </p>
                    </div>
                    </motion.div>
                )}

                </AnimatePresence>
                </motion.div>
                </div>
            )}
            </AnimatePresence>
            </>
    );
}
