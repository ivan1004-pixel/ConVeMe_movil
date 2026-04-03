import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Save, Tags, Check, Trash2, AlertTriangle, RefreshCw
} from 'lucide-react';

interface ModalCategoriaProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { nombre: string }) => Promise<void>;
    onDelete?: () => Promise<void>;
    categoriaAEditar?: any | null;
}

type ModalStep = 'form' | 'confirm-delete' | 'success' | 'success-delete';

export default function ModalCategoria({
    isOpen, onClose, onSave, onDelete, categoriaAEditar
}: ModalCategoriaProps) {

    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<ModalStep>('form');

    const esEdicion = Boolean(categoriaAEditar);

    /* ── Load on open ── */
    useEffect(() => {
        if (isOpen) {
            setStep('form');
            if (categoriaAEditar) {
                setNombre(categoriaAEditar.nombre || '');
            } else {
                setNombre('');
            }
        } else {
            setNombre('');
        }
    }, [isOpen, categoriaAEditar]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({ nombre: nombre.trim() });
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        setLoading(true);
        try {
            await onDelete();
            setStep('success-delete');
            setTimeout(() => { onClose(); setStep('form'); }, 2000);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

            .me-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'DM Sans', sans-serif; }
            .me-backdrop { position: absolute; inset: 0; background: rgba(26,0,96,0.45); backdrop-filter: blur(6px); }
            .me-modal { position: relative; background: #fff; border: 3px solid #1a0060; border-radius: 28px; width: 100%; max-width: 420px; box-shadow: 8px 8px 0px #1a0060; overflow: visible; z-index: 2; }
            .me-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 2.5px solid rgba(26,0,96,0.1); background: rgba(237,233,254,0.6); border-radius: 25px 25px 0 0; }
            .me-header-left { display: flex; align-items: center; gap: 12px; }
            .me-header-icon { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .me-header-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 16px; color: #1a0060; text-transform: uppercase; letter-spacing: .05em; line-height: 1.1; }
            .me-header-sub { font-size: 11px; font-weight: 500; color: rgba(26,0,96,0.45); display: block; margin-top: 2px; }
            .me-close-btn { width: 36px; height: 36px; border-radius: 10px; border: 2px solid rgba(26,0,96,0.15); background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(26,0,96,0.5); transition: background .18s, color .18s, border-color .18s; flex-shrink: 0; }
            .me-close-btn:hover { background: #ff5050; color: #fff; border-color: #ff5050; }
            .me-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
            .me-label { display: flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: #1a0060; margin-bottom: 7px; }
            .me-label svg { color: #cc55ff; }
            .me-input { width: 100%; background: #faf5ff; border: 2.5px solid #d4b8f0; border-radius: 12px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #1a0060; outline: none; transition: border-color .18s, box-shadow .18s, background .18s; }
            .me-input::placeholder { color: #b9a0d4; font-weight: 400; }
            .me-input:focus { border-color: #cc55ff; box-shadow: 0 0 0 3px rgba(204,85,255,0.15), 3px 3px 0px #1a0060; background: #fff; }
            .me-input:disabled { opacity: .6; cursor: not-allowed; }
            .me-save-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #1a0060; color: #ffe144; font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px; letter-spacing: .1em; text-transform: uppercase; border: 2.5px solid #1a0060; border-radius: 14px; padding: 15px; cursor: pointer; box-shadow: 4px 4px 0px rgba(0,0,0,0.3); transition: transform .12s, box-shadow .12s; }
            .me-save-btn:hover:not(:disabled) { transform: translate(-2px,-2px); box-shadow: 6px 6px 0px rgba(0,0,0,0.3); }
            .me-save-btn:active:not(:disabled) { transform: translate(2px,2px);  box-shadow: 2px 2px 0px rgba(0,0,0,0.25); }
            .me-save-btn:disabled { opacity: .7; cursor: not-allowed; }
            .me-save-btn.edit { background: #cc55ff; color: #fff; border-color: #1a0060; }
            .me-delete-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: none; color: rgba(255,80,80,0.8); font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; border: 2px solid rgba(255,80,80,0.25); border-radius: 12px; padding: 10px; cursor: pointer; transition: background .18s, color .18s, border-color .18s; }
            .me-delete-btn:hover { background: rgba(255,80,80,0.08); color: #ff5050; border-color: rgba(255,80,80,0.45); }
            @keyframes me-spin { to { transform: rotate(360deg); } }
            .me-spinner { display: inline-block; animation: me-spin 1s linear infinite; }
            .me-confirm { padding: 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
            .me-confirm-icon { width: 64px; height: 64px; border-radius: 20px; background: rgba(255,80,80,0.1); border: 2px solid rgba(255,80,80,0.25); display: flex; align-items: center; justify-content: center; color: #ff5050; }
            .me-confirm-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 18px; color: #1a0060; }
            .me-confirm-sub { font-size: 13px; font-weight: 500; color: rgba(26,0,96,0.55); max-width: 280px; line-height: 1.5; }
            .me-confirm-name { background: rgba(255,80,80,0.08); border: 1.5px solid rgba(255,80,80,0.2); border-radius: 10px; padding: 8px 16px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: #ff5050; }
            .me-confirm-btns { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
            .me-btn-cancel { flex: 1; background: none; border: 2.5px solid rgba(26,0,96,0.18); border-radius: 12px; padding: 12px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; text-transform: uppercase; color: rgba(26,0,96,0.5); cursor: pointer; transition: background .18s, color .18s; }
            .me-btn-cancel:hover { background: rgba(26,0,96,0.05); color: #1a0060; }
            .me-btn-delete-confirm { flex: 1; background: #ff5050; border: 2.5px solid #1a0060; border-radius: 12px; padding: 12px; font-family: 'Syne', sans-serif; font-weight: 900; font-size: 12px; text-transform: uppercase; color: #fff; cursor: pointer; box-shadow: 3px 3px 0px #1a0060; transition: transform .12s, box-shadow .12s; }
            .me-btn-delete-confirm:hover { transform: translate(-1px,-1px); box-shadow: 5px 5px 0px #1a0060; }
            .me-btn-delete-confirm:disabled { opacity: .7; cursor: not-allowed; }
            .me-success { padding: 48px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
            .me-success-icon { width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
            .me-success-icon.green { background: rgba(6,214,160,0.12); border: 2px solid rgba(6,214,160,0.25); color: #06d6a0; }
            .me-success-icon.red   { background: rgba(255,80,80,0.1);  border: 2px solid rgba(255,80,80,0.2);  color: #ff5050; }
            .me-success-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 20px; color: #1a0060; }
            .me-success-sub { font-size: 13px; font-weight: 500; color: rgba(26,0,96,0.5); }
            `}</style>

            <AnimatePresence>
            {isOpen && (
                <div className="me-overlay">
                <motion.div className="me-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => step === 'form' ? onClose() : undefined} />
                <motion.div className="me-modal" initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 24 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}>

                {/* ── HEADER ── */}
                <div className="me-header">
                <div className="me-header-left">
                <div className="me-header-icon" style={{
                    background: step === 'confirm-delete' ? 'rgba(255,80,80,0.1)' : esEdicion ? 'rgba(204,85,255,0.12)' : 'rgba(6,214,160,0.12)',
                        border: `1.5px solid ${step === 'confirm-delete' ? 'rgba(255,80,80,0.25)' : esEdicion ? 'rgba(204,85,255,0.2)' : 'rgba(6,214,160,0.2)'}`,
                        color: step === 'confirm-delete' ? '#ff5050' : esEdicion ? '#cc55ff' : '#06d6a0',
                }}>
                {step === 'confirm-delete' ? <Trash2 size={20} /> : <Tags size={20} />}
                </div>
                <div>
                <p className="me-header-title">
                {step === 'confirm-delete' ? 'Eliminar categoría' : step.startsWith('success') ? '¡Listo!' : esEdicion ? 'Editar categoría' : 'Nueva categoría'}
                </p>
                <span className="me-header-sub">
                {step === 'confirm-delete' ? 'Esta acción no se puede deshacer' : step.startsWith('success') ? 'Operación completada' : esEdicion ? 'Modifica el nombre' : 'Crea una categoría de producto'}
                </span>
                </div>
                </div>
                <button className="me-close-btn" onClick={onClose} type="button"><X size={16} /></button>
                </div>

                {/* ── CONTENT ── */}
                <AnimatePresence mode="wait">

                {/* FORM */}
                {step === 'form' && (
                    <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0  }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                    <div className="me-body">
                    <div>
                    <label className="me-label"><Tags size={13} /> Nombre de Categoría</label>
                    <input type="text" className="me-input" placeholder="Ej. Pines, Stickers..." value={nombre} onChange={e => setNombre(e.target.value)} required disabled={loading} />
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:4 }}>
                    <motion.button type="submit" className={`me-save-btn${esEdicion ? ' edit' : ''}`} disabled={loading || !nombre} whileHover={!loading ? { scale:1.01 } : {}} whileTap={!loading ? { scale:0.97 } : {}}>
                    {loading ? <><span className="me-spinner"><RefreshCw size={16} /></span> Guardando...</> : <><Save size={16} /> {esEdicion ? 'Actualizar' : 'Guardar'} categoría</>}
                    </motion.button>
                    {esEdicion && onDelete && (
                        <button type="button" className="me-delete-btn" onClick={() => setStep('confirm-delete')} disabled={loading}>
                        <Trash2 size={14} /> Eliminar esta categoría
                        </button>
                    )}
                    </div>
                    </div>
                    </motion.form>
                )}

                {/* CONFIRM DELETE */}
                {step === 'confirm-delete' && (
                    <motion.div key="confirm" className="me-confirm" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }} transition={{ type:'spring', stiffness:300, damping:22 }}>
                    <motion.div className="me-confirm-icon" initial={{ rotate:-15, scale:0.7 }} animate={{ rotate:0, scale:1 }} transition={{ type:'spring', stiffness:280, damping:16 }}><AlertTriangle size={28} /></motion.div>
                    <p className="me-confirm-title">¿Eliminar categoría?</p>
                    <p className="me-confirm-sub">Esta acción es permanente y no se puede deshacer.</p>
                    <div className="me-confirm-name">{nombre}</div>
                    <div className="me-confirm-btns">
                    <button className="me-btn-cancel" onClick={() => setStep('form')}>Cancelar</button>
                    <button className="me-btn-delete-confirm" onClick={handleDelete} disabled={loading}>{loading ? <span className="me-spinner"><RefreshCw size={14} /></span> : 'Sí, eliminar'}</button>
                    </div>
                    </motion.div>
                )}

                {/* SUCCESS SAVED */}
                {step === 'success' && (
                    <motion.div key="success" className="me-success" initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring', stiffness:260, damping:18 }}>
                    <motion.div className="me-success-icon green" initial={{ scale:0, rotate:-20 }} animate={{ scale:[0,1.25,1], rotate:[0,10,0] }} transition={{ type:'spring', stiffness:240, damping:14, delay:0.05 }}><Check size={36} /></motion.div>
                    <p className="me-success-title">{esEdicion ? '¡Categoría actualizada!' : '¡Categoría registrada!'}</p>
                    <p className="me-success-sub">"{nombre}" se guardó correctamente.</p>
                    </motion.div>
                )}

                {/* SUCCESS DELETED */}
                {step === 'success-delete' && (
                    <motion.div key="success-delete" className="me-success" initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring', stiffness:260, damping:18 }}>
                    <motion.div className="me-success-icon red" initial={{ scale:0 }} animate={{ scale:[0,1.2,1] }} transition={{ type:'spring', stiffness:240, damping:14, delay:0.05 }}><Trash2 size={32} /></motion.div>
                    <p className="me-success-title">Categoría eliminada</p>
                    <p className="me-success-sub">El registro fue eliminado del sistema.</p>
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
