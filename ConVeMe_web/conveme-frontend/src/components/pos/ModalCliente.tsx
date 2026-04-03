import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
    X, Save, User, MapPin, Mail, Phone, AlertTriangle, RefreshCw, Trash2, GripHorizontal, Users
} from 'lucide-react';

interface ModalClienteProps {
    isOpen:           boolean;
    onClose:          () => void;
    onSave:           (data: any) => Promise<void>;
    onDelete?:        (id: number) => Promise<void>;
    clienteAEditar?:  any | null;
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

export default function ModalCliente({ isOpen, onClose, onSave, onDelete, clienteAEditar }: ModalClienteProps) {
    const dragControls = useDragControls();
    const esEdicion    = Boolean(clienteAEditar);

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState<ModalStep>('form');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setErrors({});
            if (clienteAEditar) {
                setNombre(clienteAEditar.nombre_completo || '');
                setEmail(clienteAEditar.email || '');
                setTelefono(clienteAEditar.telefono || '');
                setDireccion(clienteAEditar.direccion_envio || '');
            } else {
                setNombre(''); setEmail(''); setTelefono(''); setDireccion('');
            }
        }
    }, [isOpen, clienteAEditar]);

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
                nombre_completo: nombre.trim(),
                email: email.trim() || undefined,
                telefono: telefono.trim() || undefined,
                direccion_envio: direccion.trim() || undefined,
            };

            await onSave(payload);
            setStep(esEdicion ? 'success-edit' : 'success');
            setTimeout(() => { onClose(); setStep('form'); }, 2000);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al guardar el cliente' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete || !clienteAEditar) return;
        setLoading(true);
        try {
            await onDelete(clienteAEditar.id_cliente);
            setStep('success-delete');
            setTimeout(() => { onClose(); setStep('form'); }, 2000);
        } catch (err: any) {
            setErrors({ submit: err.message || 'No se puede eliminar el cliente' });
            setStep('form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
        {isOpen && (
            <div className="mop-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '10px 12px', fontFamily: '"DM Sans", sans-serif', overflowY: 'auto' }}>
            <motion.div className="mop-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(26,0,96,0.45)', backdropFilter: 'blur(6px)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => step === 'form' ? onClose() : undefined} />
            <motion.div className="mop-modal" style={{ position: 'relative', zIndex: 2, background: '#fff', border: '3px solid #1a0060', borderRadius: '22px', width: '100%', maxWidth: '500px', boxShadow: '6px 6px 0px #1a0060', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 20px)', margin: '0 auto' }} drag dragControls={dragControls} dragListener={false} dragMomentum={false} initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 24 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}>

            {/* ── Header ── */}
            <div className="mop-drag-handle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '2px solid rgba(26,0,96,0.1)', background: 'rgba(237,233,254,0.6)', borderRadius: '19px 19px 0 0', cursor: 'grab', flexShrink: 0, userSelect: 'none' }} onPointerDown={e => dragControls.start(e)}>
            <div className="mop-drag-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
            <div className="mop-drag-icon" style={{ width: '36px', height: '36px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: step === 'confirm-delete' ? 'rgba(255,80,80,0.1)' : 'rgba(6,214,160,0.12)', border: `1.5px solid ${step === 'confirm-delete' ? 'rgba(255,80,80,0.25)' : 'rgba(6,214,160,0.2)'}`, color: step === 'confirm-delete' ? '#ff5050' : '#06d6a0' }}>
            {step === 'confirm-delete' ? <Trash2 size={20} /> : <User size={20} />}
            </div>
            <div>
            <p className="mop-drag-title" style={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '14px', color: '#1a0060', textTransform: 'uppercase', letterSpacing: '.05em', lineHeight: 1.1 }}>{step === 'confirm-delete' ? 'Eliminar Cliente' : step.startsWith('success') ? '¡Listo!' : esEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}</p>
            <span className="mop-drag-sub" style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(26,0,96,0.45)', display: 'block', marginTop: '1px' }}>{step === 'confirm-delete' ? 'Acción permanente' : step.startsWith('success') ? 'Operación completada' : 'Registra los datos para la venta'}</span>
            </div>
            </div>
            <div className="mop-drag-grip" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GripHorizontal size={16} style={{ color: 'rgba(26,0,96,0.25)' }} />
            <button className="mop-close-btn" style={{ width: '32px', height: '32px', borderRadius: '9px', border: '2px solid rgba(26,0,96,0.15)', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(26,0,96,0.5)', pointerEvents: 'auto', transition: 'background .18s, color .18s, border-color .18s' }} onClick={onClose} onPointerDown={e => e.stopPropagation()} type="button"><X size={16} /></button>
            </div>
            </div>

            <AnimatePresence mode="wait">
            {step === 'form' && (
                <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .22 }} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="mop-body" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={sectionStyle}>
                <p style={sectionHeadStyle('#06d6a0')}><Users size={13} /> Información del Cliente</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <div>
                <FieldLabel icon={<User size={13} />}>Nombre Completo</FieldLabel>
                <FieldInput type="text" required disabled={loading} value={nombre} onChange={(e: any) => setNombre(e.target.value)} placeholder="Ej. Juan Pérez" error={errors.nombre} />
                <ErrorMsg msg={errors.nombre} />
                </div>
                <div>
                <FieldLabel icon={<Phone size={13} />}>Teléfono (Opcional)</FieldLabel>
                <FieldInput type="tel" disabled={loading} value={telefono} onChange={(e: any) => setTelefono(e.target.value)} placeholder="Ej. 3312345678" />
                </div>
                <div>
                <FieldLabel icon={<Mail size={13} />}>Correo (Opcional)</FieldLabel>
                <FieldInput type="email" disabled={loading} value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
                </div>
                <div>
                <FieldLabel icon={<MapPin size={13} />}>Dirección de Envío (Opcional)</FieldLabel>
                <FieldInput type="text" disabled={loading} value={direccion} onChange={(e: any) => setDireccion(e.target.value)} placeholder="Calle, Número, Colonia..." />
                </div>
                </div>
                </div>
                </div>
                <div className="mop-footer" style={{ padding: '12px 16px', borderTop: '2px solid rgba(26,0,96,0.08)', background: 'rgba(237,233,254,0.4)', borderRadius: '0 0 19px 19px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {errors.submit && <div style={{ background: '#ffe5e8', border: '2px solid #ff4d6d', borderRadius: '12px', padding: '10px 14px', color: '#c1002b', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={15} /> {errors.submit}</div>}
                <motion.button type="submit" disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: esEdicion ? '#cc55ff' : '#1a0060', color: esEdicion ? '#fff' : '#ffe144', fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '14px', letterSpacing: '.1em', textTransform: 'uppercase', border: '2.5px solid #1a0060', borderRadius: '14px', padding: '15px', cursor: 'pointer', boxShadow: '4px 4px 0px rgba(0,0,0,0.3)', transition: 'transform .12s, box-shadow .12s', opacity: loading ? 0.7 : 1 }} whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}>
                {loading ? <><RefreshCw size={16} className="mop-spinner" style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</> : <><Save size={16} /> {esEdicion ? 'Actualizar' : 'Guardar'} Cliente</>}
                </motion.button>
                </div>
                </motion.form>
            )}

            {/* ════ CONFIRMAR ELIMINACIÓN ════ */}
            {step === 'confirm-delete' && (
                <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                <div className="mop-centered" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
                <motion.div className="mop-big-icon" style={{ width: '72px', height: '72px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,80,80,0.1)', border: '2px solid rgba(255,80,80,0.25)', color: '#ff5050' }} initial={{ rotate: -15, scale: 0.7 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 16 }}><AlertTriangle size={30} /></motion.div>
                <p className="mop-screen-title" style={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '20px', color: '#1a0060' }}>¿Eliminar Cliente?</p>
                <p className="mop-screen-sub" style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(26,0,96,0.5)', maxWidth: '300px', lineHeight: 1.55 }}>No podrás recuperarlo.</p>
                <div className="mop-confirm-btns" style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '4px' }}>
                <button className="mop-btn-cancel" style={{ flex: 1, background: 'none', border: '2.5px solid rgba(26,0,96,0.18)', borderRadius: '12px', padding: '12px', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', color: 'rgba(26,0,96,0.5)', cursor: 'pointer' }} onClick={() => setStep('form')}>Cancelar</button>
                <button className="mop-btn-delete-confirm" style={{ flex: 1, background: '#ff5050', border: '2.5px solid #1a0060', borderRadius: '12px', padding: '12px', fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', color: '#fff', cursor: 'pointer', boxShadow: '3px 3px 0px #1a0060' }} onClick={handleDelete} disabled={loading}>{loading ? <RefreshCw size={14} className="mop-spinner" /> : 'Sí, eliminar'}</button>
                </div>
                </div>
                </motion.div>
            )}

            {/* ════ ÉXITOS ════ */}
            {step.startsWith('success') && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                <div className="mop-centered" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
                <motion.div className="mop-big-icon" style={{ width: '72px', height: '72px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,214,160,0.12)', border: '2px solid rgba(6,214,160,0.25)', color: '#06d6a0' }} initial={{ scale: 0, rotate: -20 }} animate={{ scale: [0, 1.25, 1], rotate: [0, 10, 0] }} transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}><User size={34} /></motion.div>
                <p className="mop-screen-title" style={{ fontFamily: '"Syne", sans-serif', fontWeight: 900, fontSize: '20px', color: '#1a0060' }}>{step === 'success-delete' ? 'Eliminado' : '¡Guardado!'}</p>
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
