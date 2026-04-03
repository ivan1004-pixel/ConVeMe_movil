import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
    X, Save, Box, AlertTriangle, RefreshCw, Trash2, GripHorizontal, Droplet
} from 'lucide-react';

interface ModalInsumoProps {
    isOpen:           boolean;
    onClose:          () => void;
    onSave:           (data: any) => Promise<void>;
    onDelete?:        (id: number) => Promise<void>;
    insumoAEditar?:   any | null;
}

type ModalStep = 'form' | 'confirm-delete' | 'success' | 'success-edit' | 'success-delete';

/* ════ HELPER COMPONENTS ════ */
const sectionStyle = { background: 'rgba(237,233,254,0.3)', border: '1.5px solid rgba(26,0,96,0.08)', borderRadius: 14, padding: '14px 14px 12px' };
const sectionHeadStyle = (color: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color, marginBottom: 8 });

function FieldLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1a0060', marginBottom: 5 }}><span style={{ color: '#cc55ff', display: 'flex' }}>{icon}</span>{children}</label>;
}

function FieldInput({ error, style: extraStyle, ...props }: any) {
    return <input {...props} style={{ width: '100%', background: '#faf5ff', border: `2px solid ${error ? '#ff4d6d' : '#d4b8f0'}`, borderRadius: 10, padding: '8px 12px', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: '#1a0060', outline: 'none', transition: 'border-color .18s, box-shadow .18s, background .18s', boxSizing: 'border-box', ...(extraStyle || {}), }} onFocus={(e: any) => { e.currentTarget.style.borderColor = error ? '#ff4d6d' : '#cc55ff'; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(204,85,255,0.12), 2px 2px 0px ${error ? '#ff4d6d' : '#1a0060'}`; e.currentTarget.style.background = '#fff'; }} onBlur={(e: any) => { e.currentTarget.style.borderColor = error ? '#ff4d6d' : '#d4b8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#faf5ff'; }} />;
}

function ErrorMsg({ msg }: { msg?: string }) {
    return msg ? <p style={{ fontSize: 11, fontWeight: 600, color: '#ff4d6d', marginTop: 4 }}>{msg}</p> : null;
}

export default function ModalInsumo({ isOpen, onClose, onSave, onDelete, insumoAEditar }: ModalInsumoProps) {
    const dragControls = useDragControls();
    const esEdicion    = Boolean(insumoAEditar);

    const [nombre, setNombre] = useState('');
    const [unidadMedida, setUnidadMedida] = useState('');
    const [stockMinimo, setStockMinimo] = useState('');
    const [stockActual, setStockActual] = useState(''); // Solo para edición manual si es necesario

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState<ModalStep>('form');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setErrors({});
            if (insumoAEditar) {
                setNombre(insumoAEditar.nombre || '');
                setUnidadMedida(insumoAEditar.unidad_medida || '');
                setStockMinimo(String(insumoAEditar.stock_minimo_alerta || ''));
                setStockActual(String(insumoAEditar.stock_actual || ''));
            } else {
                setNombre(''); setUnidadMedida(''); setStockMinimo('5'); setStockActual('0');
            }
        }
    }, [isOpen, insumoAEditar]);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!nombre.trim()) errs.nombre = 'El nombre es obligatorio';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const payload: any = {
                nombre: nombre.trim(),
                unidad_medida: unidadMedida.trim() || undefined,
                stock_minimo_alerta: stockMinimo ? Number(stockMinimo) : undefined,
            };

            // Si es edición, permitimos ajustar el stock manualmente (si el backend lo permite)
            if (esEdicion && stockActual) {
                payload.stock_actual = Number(stockActual);
            }

            await onSave(payload);
            setStep(esEdicion ? 'success-edit' : 'success');
            setTimeout(() => { onClose(); setStep('form'); }, 2000);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al guardar insumo' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete || !insumoAEditar) return;
        setLoading(true);
        try {
            await onDelete(insumoAEditar.id_insumo);
            setStep('success-delete');
            setTimeout(() => { onClose(); setStep('form'); }, 2000);
        } catch (err: any) {
            setErrors({ submit: err.message || 'No se puede eliminar si ya se usó en producción' });
            setStep('form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
        {isOpen && (
            <div className="mop-overlay">
            <motion.div className="mop-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => step === 'form' ? onClose() : undefined} />
            <motion.div className="mop-modal" drag dragControls={dragControls} dragListener={false} dragMomentum={false} initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 24 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}>

            {/* ── Header ── */}
            <div className="mop-drag-handle" onPointerDown={e => dragControls.start(e)} style={{ touchAction: 'none' }}>
            <div className="mop-drag-left">
            <div className="mop-drag-icon" style={{ background: step === 'confirm-delete' ? 'rgba(255,80,80,0.1)' : 'rgba(204,85,255,0.12)', border: `1.5px solid ${step === 'confirm-delete' ? 'rgba(255,80,80,0.25)' : 'rgba(204,85,255,0.2)'}`, color: step === 'confirm-delete' ? '#ff5050' : '#cc55ff' }}>
            {step === 'confirm-delete' ? <Trash2 size={20} /> : <Box size={20} />}
            </div>
            <div>
            <p className="mop-drag-title">{step === 'confirm-delete' ? 'Eliminar Insumo' : step.startsWith('success') ? '¡Listo!' : esEdicion ? 'Editar Insumo' : 'Nuevo Insumo'}</p>
            <span className="mop-drag-sub">{step === 'confirm-delete' ? 'Acción permanente' : step.startsWith('success') ? 'Operación completada' : 'Registra materia prima para el taller'}</span>
            </div>
            </div>
            <div className="mop-drag-grip">
            <GripHorizontal size={16} style={{ color: 'rgba(26,0,96,0.25)' }} />
            <button className="mop-close-btn" onClick={onClose} onPointerDown={e => e.stopPropagation()} type="button"><X size={16} /></button>
            </div>
            </div>

            <AnimatePresence mode="wait">
            {step === 'form' && (
                <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .22 }} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="mop-body">
                <div style={sectionStyle}>
                <p style={sectionHeadStyle('#cc55ff')}><Droplet size={13} /> Información del Material</p>
                <div className="mop-grid2">
                <div className="mop-full">
                <FieldLabel icon={<Box size={13} />}>Nombre del Insumo</FieldLabel>
                <FieldInput type="text" required disabled={loading} value={nombre} onChange={(e: any) => setNombre(e.target.value)} placeholder="Ej. Bases Metálicas 3cm" error={errors.nombre} />
                <ErrorMsg msg={errors.nombre} />
                </div>
                <div>
                <FieldLabel icon={<Droplet size={13} />}>Unidad de Medida</FieldLabel>
                <FieldInput type="text" disabled={loading} value={unidadMedida} onChange={(e: any) => setUnidadMedida(e.target.value)} placeholder="Ej. Piezas, Litros, Metros" />
                </div>
                <div>
                <FieldLabel icon={<AlertTriangle size={13} />}>Alerta de Stock Mínimo</FieldLabel>
                <FieldInput type="number" min="0" step="0.01" disabled={loading} value={stockMinimo} onChange={(e: any) => setStockMinimo(e.target.value)} placeholder="Ej. 10" />
                </div>
                {esEdicion && (
                    <div className="mop-full">
                    <FieldLabel icon={<Box size={13} />}>Ajuste Manual de Stock Actual</FieldLabel>
                    <FieldInput type="number" min="0" step="0.01" disabled={loading} value={stockActual} onChange={(e: any) => setStockActual(e.target.value)} placeholder="Stock actual en taller" />
                    </div>
                )}
                </div>
                </div>
                </div>
                <div className="mop-footer">
                {errors.submit && <div className="mop-submit-error"><AlertTriangle size={15} /> {errors.submit}</div>}
                <motion.button type="submit" className={`mop-save-btn${esEdicion ? ' edit' : ''}`} disabled={loading} whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}>
                {loading ? <><span className="mop-spinner"><RefreshCw size={16} /></span> Procesando...</> : <><Save size={16} /> {esEdicion ? 'Actualizar' : 'Guardar'} Insumo</>}
                </motion.button>
                {esEdicion && onDelete && (
                    <button type="button" className="mop-delete-btn" onClick={() => setStep('confirm-delete')} disabled={loading}><Trash2 size={14} /> Eliminar insumo</button>
                )}
                </div>
                </motion.form>
            )}

            {/* ════ CONFIRMAR ELIMINACIÓN ════ */}
            {step === 'confirm-delete' && (
                <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                <div className="mop-centered">
                <motion.div className="mop-big-icon" style={{ background: 'rgba(255,80,80,0.1)', border: '2px solid rgba(255,80,80,0.25)', color: '#ff5050' }} initial={{ rotate: -15, scale: 0.7 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 16 }}><AlertTriangle size={30} /></motion.div>
                <p className="mop-screen-title">¿Eliminar Insumo?</p>
                <p className="mop-screen-sub">Solo puedes borrarlo si no ha sido usado en órdenes de producción.</p>
                <div className="mop-confirm-btns">
                <button className="mop-btn-cancel" onClick={() => setStep('form')}>Cancelar</button>
                <button className="mop-btn-delete-confirm" onClick={handleDelete} disabled={loading}>{loading ? <span className="mop-spinner"><RefreshCw size={14} /></span> : 'Sí, eliminar'}</button>
                </div>
                </div>
                </motion.div>
            )}

            {/* ════ ÉXITOS ════ */}
            {step.startsWith('success') && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                <div className="mop-centered">
                <motion.div className="mop-big-icon" style={{ background: 'rgba(6,214,160,0.12)', border: '2px solid rgba(6,214,160,0.25)', color: '#06d6a0' }} initial={{ scale: 0, rotate: -20 }} animate={{ scale: [0, 1.25, 1], rotate: [0, 10, 0] }} transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}><Box size={34} /></motion.div>
                <p className="mop-screen-title">{step === 'success-delete' ? 'Eliminado' : '¡Guardado!'}</p>
                <p className="mop-screen-sub">El catálogo de insumos ha sido actualizado.</p>
                </div>
                </motion.div>
            )}
            </AnimatePresence>
            </motion.div>
            </div>
        )}
        </AnimatePresence>
    );
}
