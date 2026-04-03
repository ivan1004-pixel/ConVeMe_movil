import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
    X, Save, Package, User, Plus, Minus,
    Search, ChevronDown, Check, Trash2, AlertTriangle,
    RefreshCw, Scissors, GripHorizontal, Box
} from 'lucide-react';

// ASUMIMOS QUE TIENES ESTOS SERVICIOS CREADOS (Ajusta las rutas según tu proyecto)
import { getProductos } from '../../services/producto.service';
import { getEmpleados } from '../../services/empleado.service';
import { getInsumos } from '../../services/insumo.service';

interface ModalOrdenProduccionProps {
    isOpen:           boolean;
    onClose:          () => void;
    onSave:           (data: any) => Promise<void>;
    onDelete?:        (id: number) => Promise<void>;
    ordenAEditar?:    any | null;
}

type ModalStep = 'form' | 'confirm-delete' | 'success' | 'success-edit' | 'success-delete';

/* ══════════════════════════════════════════════════════
 *  HELPER COMPONENTS
 * ══════════════════════════════════════════════════════ */

const sectionStyle = {
    background: 'rgba(237,233,254,0.3)',
    border: '1.5px solid rgba(26,0,96,0.08)',
    borderRadius: 14, padding: '14px 14px 12px',
};

const sectionHeadStyle = (color: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 7,
    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 9.5,
    letterSpacing: '.14em', textTransform: 'uppercase', color, marginBottom: 8,
});

function FieldLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1a0060', marginBottom: 5 }}>
        <span style={{ color: '#cc55ff', display: 'flex' }}>{icon}</span>
        {children}
        </label>
    );
}

function FieldInput({ error, style: extraStyle, ...props }: any) {
    return (
        <input
        {...props}
        style={{
            width: '100%', background: '#faf5ff',
            border: `2px solid ${error ? '#ff4d6d' : '#d4b8f0'}`,
            borderRadius: 10, padding: '8px 12px',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: '#1a0060',
            outline: 'none', transition: 'border-color .18s, box-shadow .18s, background .18s',
            boxSizing: 'border-box',
            ...(extraStyle || {}),
        }}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
            e.currentTarget.style.borderColor = error ? '#ff4d6d' : '#cc55ff';
            e.currentTarget.style.boxShadow   = `0 0 0 3px rgba(204,85,255,0.12), 2px 2px 0px ${error ? '#ff4d6d' : '#1a0060'}`;
            e.currentTarget.style.background  = '#fff';
        }}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            e.currentTarget.style.borderColor = error ? '#ff4d6d' : '#d4b8f0';
            e.currentTarget.style.boxShadow   = 'none';
            e.currentTarget.style.background  = '#faf5ff';
        }}
        />
    );
}

function ErrorMsg({ msg }: { msg?: string }) {
    return msg ? <p style={{ fontSize: 11, fontWeight: 600, color: '#ff4d6d', marginTop: 4 }}>{msg}</p> : null;
}

function DropSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1.5px solid rgba(26,0,96,0.08)', background: 'rgba(237,233,254,0.5)' }}>
        <Search size={13} style={{ color: 'rgba(26,0,96,0.35)', flexShrink: 0 }} />
        <input autoFocus value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: '#1a0060' }} />
        </div>
    );
}

function DropList({ children }: { children: React.ReactNode }) {
    return <div style={{ maxHeight: 140, overflowY: 'auto', scrollbarWidth: 'thin' as any }}>{children}</div>;
}

function DropItem({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <div
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
            color: selected ? '#1a0060' : 'rgba(26,0,96,0.75)',
            borderBottom: '1px solid rgba(26,0,96,0.05)',
            background: selected ? '#ffe144' : 'transparent',
            transition: 'background .13s',
        }}
        onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'rgba(204,85,255,0.08)'; }}
        onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
        {children}
        {selected && <Check size={13} />}
        </div>
    );
}

function DropEmpty() {
    return <div style={{ padding: 16, textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'rgba(26,0,96,0.35)' }}>Sin resultados</div>;
}

function CustomDrop({ show, onToggle, disabled, placeholder, selected, children }: any) {
    return (
        <div style={{ position: 'relative' }}>
        <button type="button" disabled={disabled} onClick={onToggle}
        style={{
            width: '100%', background: '#faf5ff', border: `2px solid ${show ? '#cc55ff' : '#d4b8f0'}`, borderRadius: 10, padding: '8px 12px',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: selected ? '#1a0060' : '#b9a0d4',
            cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            outline: 'none', opacity: disabled ? .55 : 1, boxShadow: show ? '0 0 0 3px rgba(204,85,255,0.15), 3px 3px 0px #1a0060' : 'none',
            transition: 'border-color .18s, box-shadow .18s', textAlign: 'left',
        }}
        >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected ?? placeholder}</span>
        <ChevronDown size={15} style={{ flexShrink: 0, color: 'rgba(26,0,96,0.35)', transition: 'transform .2s', transform: show ? 'rotate(180deg)' : 'none' }} />
        </button>
        <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .16 }}
            style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: '2.5px solid #1a0060', borderRadius: 14, boxShadow: '5px 5px 0px #1a0060', overflow: 'hidden', zIndex: 100 }}
            >
            {children}
            </motion.div>
        )}
        </AnimatePresence>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */

export default function ModalOrdenProduccion({
    isOpen, onClose, onSave, onDelete, ordenAEditar
}: ModalOrdenProduccionProps) {

    const dragControls = useDragControls();
    const esEdicion    = Boolean(ordenAEditar);

    /* ── Form state ── */
    const [productoId, setProductoId]               = useState<number | ''>('');
    const [empleadoId, setEmpleadoId]               = useState<number | ''>('');
    const [cantidadAProducir, setCantidadAProducir] = useState<string>('');

    // Lista dinámica de insumos consumidos
    const [detalles, setDetalles] = useState<any[]>([{ id_det_orden: null, insumo_id: '', cantidad_consumida: '' }]);

    /* ── Lists ── */
    const [productos, setProductos] = useState<any[]>([]);
    const [empleados, setEmpleados] = useState<any[]>([]);
    const [insumos, setInsumos]     = useState<any[]>([]);

    /* ── Dropdown open states ── */
    const [showProductoDrop, setShowProductoDrop] = useState(false);
    const [showEmpleadoDrop, setShowEmpleadoDrop] = useState(false);
    const [openInsumoDropIdx, setOpenInsumoDropIdx] = useState<number | null>(null);

    /* ── Search states ── */
    const [searchProducto, setSearchProducto] = useState('');
    const [searchEmpleado, setSearchEmpleado] = useState('');
    const [searchInsumo, setSearchInsumo]     = useState('');

    /* ── UI state ── */
    const [errors,  setErrors]  = useState<Record<string, string>>({});
    const [step,    setStep]    = useState<ModalStep>('form');
    const [loading, setLoading] = useState(false);

    /* ── Load on open ── */
    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setErrors({});
            cargarCatalogosBase();

            if (ordenAEditar) {
                setProductoId(ordenAEditar.producto?.id_producto || '');
                setEmpleadoId(ordenAEditar.empleado?.id_empleado || '');
                setCantidadAProducir(String(ordenAEditar.cantidad_a_producir || ''));

                if (ordenAEditar.detalles && ordenAEditar.detalles.length > 0) {
                    setDetalles(ordenAEditar.detalles.map((d: any) => ({
                        id_det_orden: d.id_det_orden,
                        insumo_id: d.insumo?.id_insumo || '',
                        cantidad_consumida: String(d.cantidad_consumida || '')
                    })));
                } else {
                    setDetalles([{ id_det_orden: null, insumo_id: '', cantidad_consumida: '' }]);
                }
            } else {
                resetForm();
            }
        } else {
            resetForm();
        }
    }, [isOpen, ordenAEditar]);

    const resetForm = () => {
        setProductoId(''); setEmpleadoId(''); setCantidadAProducir('');
        setDetalles([{ id_det_orden: null, insumo_id: '', cantidad_consumida: '' }]);
        setShowProductoDrop(false); setShowEmpleadoDrop(false); setOpenInsumoDropIdx(null);
        setSearchProducto(''); setSearchEmpleado(''); setSearchInsumo('');
        setErrors({});
    };

    const cargarCatalogosBase = async () => {
        try {
            // Reemplaza estas llamadas por tus servicios reales
            const [dataProd, dataEmp, dataIns] = await Promise.all([
                getProductos().catch(() => []),
                                                                   getEmpleados().catch(() => []),
                                                                   getInsumos().catch(() => [])
            ]);
            setProductos(dataProd);
            setEmpleados(dataEmp);
            setInsumos(dataIns);
        } catch (err) { console.error(err); }
    };

    /* ── Dinamic Rows Handlers ── */
    const addDetalle = () => {
        setDetalles([...detalles, { id_det_orden: null, insumo_id: '', cantidad_consumida: '' }]);
    };

    const removeDetalle = (index: number) => {
        const newDetalles = detalles.filter((_, i) => i !== index);
        setDetalles(newDetalles.length ? newDetalles : [{ id_det_orden: null, insumo_id: '', cantidad_consumida: '' }]);
    };

    const updateDetalle = (index: number, field: string, value: any) => {
        const newDetalles = [...detalles];
        newDetalles[index][field] = value;
        setDetalles(newDetalles);
    };

    /* ── Validate ── */
    const validate = () => {
        const errs: Record<string, string> = {};
        if (!productoId) errs.producto = 'Selecciona el producto a fabricar';
        if (!empleadoId) errs.empleado = 'Selecciona el artesano/empleado responsable';
        if (!cantidadAProducir || Number(cantidadAProducir) <= 0) errs.cantidad = 'La cantidad debe ser mayor a 0';

        const detallesValidos = detalles.every(d => d.insumo_id && Number(d.cantidad_consumida) > 0);
        if (!detallesValidos) errs.detalles = 'Completa correctamente todos los insumos y sus cantidades.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── Submit ── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const payload: any = {
                producto_id: Number(productoId),
                empleado_id: Number(empleadoId),
                cantidad_a_producir: Number(cantidadAProducir),
                detalles: detalles.map(d => ({
                    id_det_orden: d.id_det_orden || undefined,
                    insumo_id: Number(d.insumo_id),
                                             cantidad_consumida: Number(d.cantidad_consumida)
                }))
            };

            await onSave(payload);
            setStep(esEdicion ? 'success-edit' : 'success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al procesar la orden de producción' });
        } finally {
            setLoading(false);
        }
    };

    /* ── Delete ── */
    const handleDelete = async () => {
        if (!onDelete || !ordenAEditar) return;
        setLoading(true);
        try {
            await onDelete(ordenAEditar.id_orden_produccion);
            setStep('success-delete');
            setTimeout(() => { onClose(); setStep('form'); }, 2000);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al eliminar' });
            setStep('form');
        } finally {
            setLoading(false);
        }
    };

    /* ── Filtered lists ── */
    const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(searchProducto.toLowerCase()) || p.sku.toLowerCase().includes(searchProducto.toLowerCase()));
    const empleadosFiltrados = empleados.filter(e => e.nombre_completo.toLowerCase().includes(searchEmpleado.toLowerCase()));
    const insumosFiltrados   = insumos.filter(i => i.nombre.toLowerCase().includes(searchInsumo.toLowerCase()));

    const prodSelected = productos.find(p => p.id_producto === productoId);
    const empSelected  = empleados.find(e => e.id_empleado === empleadoId);

    return (
        <>
        <style>{`
            .mop-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: flex-start; justify-content: center; padding: 10px 12px; font-family: 'DM Sans', sans-serif; overflow-y: auto; }
            .mop-backdrop { position: fixed; inset: 0; background: rgba(26,0,96,0.45); backdrop-filter: blur(6px); }
            .mop-modal { position: relative; z-index: 2; background: #fff; border: 3px solid #1a0060; border-radius: 22px; width: 100%; max-width: 600px; box-shadow: 6px 6px 0px #1a0060; display: flex; flex-direction: column; max-height: calc(100dvh - 20px); margin: 0 auto; }
            .mop-drag-handle { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-bottom: 2px solid rgba(26,0,96,0.1); background: rgba(237,233,254,0.6); border-radius: 19px 19px 0 0; cursor: grab; flex-shrink: 0; user-select: none; }
            .mop-drag-handle:active { cursor: grabbing; }
            .mop-drag-left  { display: flex; align-items: center; gap: 10px; pointer-events: none; }
            .mop-drag-icon  { width: 36px; height: 36px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .mop-drag-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px; color: #1a0060; text-transform: uppercase; letter-spacing: .05em; line-height: 1.1; }
            .mop-drag-sub { font-size: 10px; font-weight: 500; color: rgba(26,0,96,0.45); display: block; margin-top: 1px; }
            .mop-drag-grip  { display: flex; align-items: center; gap: 6px; }
            .mop-close-btn  { width: 32px; height: 32px; border-radius: 9px; border: 2px solid rgba(26,0,96,0.15); background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(26,0,96,0.5); pointer-events: auto; transition: background .18s, color .18s, border-color .18s; }
            .mop-close-btn:hover { background: #ff5050; color: #fff; border-color: #ff5050; }

            .mop-body { flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; scrollbar-width: thin; scrollbar-color: rgba(204,85,255,0.3) transparent; }
            .mop-body::-webkit-scrollbar        { width: 4px; }
            .mop-body::-webkit-scrollbar-thumb { background: rgba(204,85,255,0.3); border-radius: 4px; }

            .mop-footer { padding: 12px 16px; border-top: 2px solid rgba(26,0,96,0.08); background: rgba(237,233,254,0.4); border-radius: 0 0 19px 19px; flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }
            .mop-save-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #1a0060; color: #ffe144; font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px; letter-spacing: .1em; text-transform: uppercase; border: 2.5px solid #1a0060; border-radius: 14px; padding: 15px; cursor: pointer; box-shadow: 4px 4px 0px rgba(0,0,0,0.3); transition: transform .12s, box-shadow .12s; }
            .mop-save-btn.edit { background: #cc55ff; color: #fff; border-color: #1a0060; }
            .mop-save-btn:hover:not(:disabled)  { transform: translate(-2px,-2px); box-shadow: 6px 6px 0px rgba(0,0,0,0.3); }
            .mop-save-btn:active:not(:disabled) { transform: translate(2px,2px);   box-shadow: 2px 2px 0px rgba(0,0,0,0.25); }
            .mop-save-btn:disabled { opacity: .7; cursor: not-allowed; }

            .mop-delete-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: none; color: rgba(255,80,80,0.8); font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; border: 2px solid rgba(255,80,80,0.25); border-radius: 12px; padding: 10px; cursor: pointer; transition: background .18s, color .18s, border-color .18s; }
            .mop-delete-btn:hover { background: rgba(255,80,80,0.08); color: #ff5050; border-color: rgba(255,80,80,0.45); }

            @keyframes mop-spin { to { transform: rotate(360deg); } }
            .mop-spinner { display: inline-block; animation: mop-spin 1s linear infinite; }

            .mop-centered { padding: 40px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
            .mop-big-icon { width: 72px; height: 72px; border-radius: 22px; display: flex; align-items: center; justify-content: center; }
            .mop-screen-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 20px; color: #1a0060; }
            .mop-screen-sub { font-size: 13px; font-weight: 500; color: rgba(26,0,96,0.5); max-width: 300px; line-height: 1.55; }
            .mop-name-chip { border-radius: 10px; padding: 8px 16px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; }
            .mop-confirm-btns { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
            .mop-btn-cancel { flex: 1; background: none; border: 2.5px solid rgba(26,0,96,0.18); border-radius: 12px; padding: 12px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; text-transform: uppercase; color: rgba(26,0,96,0.5); cursor: pointer; transition: background .18s, color .18s; }
            .mop-btn-cancel:hover { background: rgba(26,0,96,0.05); color: #1a0060; }
            .mop-btn-delete-confirm { flex: 1; background: #ff5050; border: 2.5px solid #1a0060; border-radius: 12px; padding: 12px; font-family: 'Syne', sans-serif; font-weight: 900; font-size: 12px; text-transform: uppercase; color: #fff; cursor: pointer; box-shadow: 3px 3px 0px #1a0060; transition: transform .12s, box-shadow .12s; }
            .mop-btn-delete-confirm:hover    { transform: translate(-1px,-1px); box-shadow: 5px 5px 0px #1a0060; }
            .mop-btn-delete-confirm:disabled { opacity: .7; cursor: not-allowed; }

            .mop-submit-error { background: #ffe5e8; border: 2px solid #ff4d6d; border-radius: 12px; padding: 10px 14px; color: #c1002b; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
            .mop-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .mop-full  { grid-column: 1 / -1; }
            @media (max-width: 520px) { .mop-grid2 { grid-template-columns: 1fr; } }

            .mop-row-insumo { display: flex; gap: 8px; align-items: flex-end; margin-bottom: 8px; }
            .mop-btn-remove { background: #ffe5e8; border: 1.5px solid #ff4d6d; color: #c1002b; border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.1s; }
            .mop-btn-remove:hover { background: #ff4d6d; color: white; }
            .mop-btn-add { background: rgba(6,214,160,0.1); border: 2px dashed #06d6a0; color: #06d6a0; width: 100%; border-radius: 10px; padding: 10px; font-family: 'Syne', sans-serif; font-weight: 800; text-transform: uppercase; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; margin-top: 5px; transition: background 0.15s; }
            .mop-btn-add:hover { background: rgba(6,214,160,0.2); }
            `}</style>

            <AnimatePresence>
            {isOpen && (
                <div className="mop-overlay">
                <motion.div
                className="mop-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => step === 'form' ? onClose() : undefined}
                />

                <motion.div
                className="mop-modal"
                drag dragControls={dragControls} dragListener={false} dragMomentum={false}
                initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 24 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                {/* ── Header arrastrable ── */}
                <div className="mop-drag-handle" onPointerDown={e => dragControls.start(e)} style={{ touchAction: 'none' }}>
                <div className="mop-drag-left">
                <div
                className="mop-drag-icon"
                style={{
                    background: step === 'confirm-delete' ? 'rgba(255,80,80,0.1)' : esEdicion ? 'rgba(204,85,255,0.12)' : 'rgba(6,214,160,0.12)',
                        border: `1.5px solid ${step === 'confirm-delete' ? 'rgba(255,80,80,0.25)' : esEdicion ? 'rgba(204,85,255,0.2)' : 'rgba(6,214,160,0.2)'}`,
                        color: step === 'confirm-delete' ? '#ff5050' : esEdicion ? '#cc55ff' : '#06d6a0',
                }}
                >
                {step === 'confirm-delete' ? <Trash2 size={20} /> : <Scissors size={20} />}
                </div>
                <div>
                <p className="mop-drag-title">
                {step === 'confirm-delete' ? 'Eliminar Orden' : step.startsWith('success') ? '¡Listo!' : esEdicion ? 'Editar Orden' : 'Nueva Orden'}
                </p>
                <span className="mop-drag-sub">
                {step === 'confirm-delete' ? 'Esta acción no se puede deshacer' : step.startsWith('success') ? 'Operación completada' : esEdicion ? 'Modifica los detalles de la orden' : 'Registra un nuevo lote de fabricación'}
                </span>
                </div>
                </div>
                <div className="mop-drag-grip">
                <GripHorizontal size={16} style={{ color: 'rgba(26,0,96,0.25)' }} />
                <button className="mop-close-btn" onClick={onClose} onPointerDown={e => e.stopPropagation()} type="button">
                <X size={16} />
                </button>
                </div>
                </div>

                {/* ── Contenido con transiciones por step ── */}
                <AnimatePresence mode="wait">

                {/* ════ FORM ════ */}
                {step === 'form' && (
                    <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .22 }} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className="mop-body">

                    {/* Sección 1: Datos de Producción */}
                    <div style={sectionStyle}>
                    <p style={sectionHeadStyle('#cc55ff')}>
                    <Package size={13} /> Datos de la Orden
                    </p>
                    <div className="mop-grid2">

                    <div className="mop-full">
                    <FieldLabel icon={<Box size={13} />}>Producto a fabricar</FieldLabel>
                    <CustomDrop show={showProductoDrop} onToggle={() => { setShowProductoDrop(v => !v); setShowEmpleadoDrop(false); setOpenInsumoDropIdx(null); }} disabled={loading} placeholder="Selecciona un producto..." selected={prodSelected ? `[${prodSelected.sku}] ${prodSelected.nombre}` : undefined}>
                    <DropSearch value={searchProducto} onChange={setSearchProducto} placeholder="Buscar producto o SKU..." />
                    <DropList>
                    {productosFiltrados.length > 0 ? productosFiltrados.map(p => (
                        <DropItem key={p.id_producto} selected={productoId === p.id_producto} onClick={() => { setProductoId(p.id_producto); setShowProductoDrop(false); setSearchProducto(''); }}>
                        <span><span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 10, color: '#cc55ff', marginRight: 5 }}>{p.sku}</span>{p.nombre}</span>
                        </DropItem>
                    )) : <DropEmpty />}
                    </DropList>
                    </CustomDrop>
                    <ErrorMsg msg={errors.producto} />
                    </div>

                    <div>
                    <FieldLabel icon={<Scissors size={13} />}>Cantidad a Producir</FieldLabel>
                    <FieldInput type="number" min="1" required disabled={loading} value={cantidadAProducir} onChange={(e: any) => setCantidadAProducir(e.target.value)} placeholder="Ej. 100" error={errors.cantidad} />
                    <ErrorMsg msg={errors.cantidad} />
                    </div>

                    <div>
                    <FieldLabel icon={<User size={13} />}>Artesano / Empleado</FieldLabel>
                    <CustomDrop show={showEmpleadoDrop} onToggle={() => { setShowEmpleadoDrop(v => !v); setShowProductoDrop(false); setOpenInsumoDropIdx(null); }} disabled={loading} placeholder="Asignar empleado..." selected={empSelected?.nombre_completo}>
                    <DropSearch value={searchEmpleado} onChange={setSearchEmpleado} placeholder="Buscar empleado..." />
                    <DropList>
                    {empleadosFiltrados.length > 0 ? empleadosFiltrados.map(e => (
                        <DropItem key={e.id_empleado} selected={empleadoId === e.id_empleado} onClick={() => { setEmpleadoId(e.id_empleado); setShowEmpleadoDrop(false); setSearchEmpleado(''); }}>
                        {e.nombre_completo}
                        </DropItem>
                    )) : <DropEmpty />}
                    </DropList>
                    </CustomDrop>
                    <ErrorMsg msg={errors.empleado} />
                    </div>
                    </div>
                    </div>

                    {/* Sección 2: Consumo de Insumos */}
                    <div style={sectionStyle}>
                    <p style={sectionHeadStyle('#06d6a0')}>
                    <Scissors size={13} /> Insumos / Materia Prima Gastada
                    </p>

                    {detalles.map((detalle, index) => {
                        const insumoAct = insumos.find(i => i.id_insumo === detalle.insumo_id);
                        return (
                            <div key={index} className="mop-row-insumo">
                            <div style={{ flex: 2 }}>
                            <CustomDrop show={openInsumoDropIdx === index} onToggle={() => { setOpenInsumoDropIdx(openInsumoDropIdx === index ? null : index); setShowProductoDrop(false); setShowEmpleadoDrop(false); }} disabled={loading} placeholder="Insumo utilizado..." selected={insumoAct?.nombre}>
                            <DropSearch value={searchInsumo} onChange={setSearchInsumo} placeholder="Buscar insumo..." />
                            <DropList>
                            {insumosFiltrados.length > 0 ? insumosFiltrados.map(ins => (
                                <DropItem key={ins.id_insumo} selected={detalle.insumo_id === ins.id_insumo} onClick={() => { updateDetalle(index, 'insumo_id', ins.id_insumo); setOpenInsumoDropIdx(null); setSearchInsumo(''); }}>
                                <span>{ins.nombre} <span style={{fontSize: 10, color:'rgba(26,0,96,0.4)', marginLeft:4}}>({ins.stock_actual} disp)</span></span>
                                </DropItem>
                            )) : <DropEmpty />}
                            </DropList>
                            </CustomDrop>
                            </div>

                            <div style={{ flex: 1 }}>
                            <FieldInput type="number" min="0.01" step="0.01" disabled={loading} value={detalle.cantidad_consumida} onChange={(e: any) => updateDetalle(index, 'cantidad_consumida', e.target.value)} placeholder="Cant." />
                            </div>

                            <button type="button" className="mop-btn-remove" onClick={() => removeDetalle(index)} title="Quitar insumo" disabled={loading}>
                            <Minus size={16} />
                            </button>
                            </div>
                        );
                    })}

                    <ErrorMsg msg={errors.detalles} />

                    <button type="button" className="mop-btn-add" onClick={addDetalle} disabled={loading}>
                    <Plus size={14} /> Añadir otro insumo
                    </button>
                    </div>
                    </div>

                    {/* Footer */}
                    <div className="mop-footer">
                    {errors.submit && (
                        <div className="mop-submit-error">
                        <AlertTriangle size={15} /> {errors.submit}
                        </div>
                    )}
                    <motion.button type="submit" className={`mop-save-btn${esEdicion ? ' edit' : ''}`} disabled={loading} whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}>
                    {loading ? <><span className="mop-spinner"><RefreshCw size={16} /></span> Procesando...</> : <><Save size={16} /> {esEdicion ? 'Actualizar' : 'Guardar'} Orden</>}
                    </motion.button>

                    {esEdicion && onDelete && (
                        <button type="button" className="mop-delete-btn" onClick={() => setStep('confirm-delete')} disabled={loading}>
                        <Trash2 size={14} /> Eliminar orden
                        </button>
                    )}
                    </div>
                    </motion.form>
                )}

                {/* ════ CONFIRMAR ELIMINACIÓN ════ */}
                {step === 'confirm-delete' && (
                    <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                    <div className="mop-centered">
                    <motion.div className="mop-big-icon" style={{ background: 'rgba(255,80,80,0.1)', border: '2px solid rgba(255,80,80,0.25)', color: '#ff5050' }} initial={{ rotate: -15, scale: 0.7 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 16 }}>
                    <AlertTriangle size={30} />
                    </motion.div>
                    <p className="mop-screen-title">¿Eliminar Orden?</p>
                    <p className="mop-screen-sub">Se borrará del historial. Nota: Los insumos gastados NO se regresarán automáticamente al inventario.</p>
                    <div className="mop-confirm-btns">
                    <button className="mop-btn-cancel" onClick={() => setStep('form')}>Cancelar</button>
                    <button className="mop-btn-delete-confirm" onClick={handleDelete} disabled={loading}>
                    {loading ? <span className="mop-spinner"><RefreshCw size={14} /></span> : 'Sí, eliminar'}
                    </button>
                    </div>
                    </div>
                    </motion.div>
                )}

                {/* ════ ÉXITOS ════ */}
                {step === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                    <div className="mop-centered">
                    <motion.div className="mop-big-icon" style={{ background: 'rgba(6,214,160,0.12)', border: '2px solid rgba(6,214,160,0.25)', color: '#06d6a0' }} initial={{ scale: 0, rotate: -20 }} animate={{ scale: [0, 1.25, 1], rotate: [0, 10, 0] }} transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}>
                    <Package size={34} />
                    </motion.div>
                    <p className="mop-screen-title">¡Orden creada!</p>
                    <p className="mop-screen-sub">La producción fue registrada y los insumos se descontaron de tu almacén.</p>
                    </div>
                    </motion.div>
                )}

                {step === 'success-edit' && (
                    <motion.div key="success-edit" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                    <div className="mop-centered">
                    <motion.div className="mop-big-icon" style={{ background: 'rgba(204,85,255,0.12)', border: '2px solid rgba(204,85,255,0.25)', color: '#cc55ff' }} initial={{ scale: 0, rotate: -20 }} animate={{ scale: [0, 1.25, 1], rotate: [0, 10, 0] }} transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}>
                    <Scissors size={34} />
                    </motion.div>
                    <p className="mop-screen-title">¡Cambios guardados!</p>
                    <p className="mop-screen-sub">La orden de producción fue actualizada correctamente.</p>
                    </div>
                    </motion.div>
                )}

                {step === 'success-delete' && (
                    <motion.div key="success-delete" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                    <div className="mop-centered">
                    <motion.div className="mop-big-icon" style={{ background: 'rgba(255,80,80,0.1)', border: '2px solid rgba(255,80,80,0.2)', color: '#ff5050' }} initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}>
                    <Trash2 size={32} />
                    </motion.div>
                    <p className="mop-screen-title">Orden eliminada</p>
                    <p className="mop-screen-sub">El registro fue borrado permanentemente.</p>
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
