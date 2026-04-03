import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Save, Package, DollarSign, ListFilter, Check, Trash2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { getCategorias } from '../../services/categoria.service';
import { getTamanos } from '../../services/tamano.service';

interface ModalProductoProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    onDelete?: () => Promise<void>;
    productoAEditar?: any | null;
}

type ModalStep = 'form' | 'confirm-delete' | 'success' | 'success-delete';

export default function ModalProducto({
    isOpen, onClose, onSave, onDelete, productoAEditar
}: ModalProductoProps) {

    // Datos Básicos
    const [sku, setSku] = useState('');
    const [nombre, setNombre] = useState('');
    const [categoriaId, setCategoriaId] = useState<number | ''>('');
    const [tamanoId, setTamanoId] = useState<number | ''>('');

    // Precios
    const [precioUnitario, setPrecioUnitario] = useState<number | ''>('');
    const [precioMayoreo, setPrecioMayoreo] = useState<number | ''>('');
    const [cantidadMinima, setCantidadMinima] = useState<number | ''>(12);
    const [costoProduccion, setCostoProduccion] = useState<number | ''>('');

    // Listas
    const [categorias, setCategorias] = useState<any[]>([]);
    const [tamanos, setTamanos] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<ModalStep>('form');

    const esEdicion = Boolean(productoAEditar);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            cargarListas();
            if (productoAEditar) {
                setSku(productoAEditar.sku || '');
                setNombre(productoAEditar.nombre || '');
                setCategoriaId(productoAEditar.categoria?.id_categoria || '');
                setTamanoId(productoAEditar.tamano?.id_tamano || '');
                setPrecioUnitario(Number(productoAEditar.precio_unitario) || '');
                setPrecioMayoreo(productoAEditar.precio_mayoreo ? Number(productoAEditar.precio_mayoreo) : '');
                setCantidadMinima(Number(productoAEditar.cantidad_minima_mayoreo) || 12);
                setCostoProduccion(productoAEditar.costo_produccion ? Number(productoAEditar.costo_produccion) : '');
            } else {
                limpiarFormulario();
            }
        }
    }, [isOpen, productoAEditar]);

    const cargarListas = async () => {
        try {
            const [dataCat, dataTam] = await Promise.all([getCategorias(), getTamanos()]);
            setCategorias(dataCat);
            setTamanos(dataTam);
        } catch (error) { console.error(error); }
    };

    const limpiarFormulario = () => {
        setSku(''); setNombre(''); setCategoriaId(''); setTamanoId('');
        setPrecioUnitario(''); setPrecioMayoreo(''); setCantidadMinima(12); setCostoProduccion('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoriaId || !tamanoId) return;

        setLoading(true);
        try {
            await onSave({
                sku: sku.trim(),
                         nombre: nombre.trim(),
                         categoria_id: Number(categoriaId),
                         tamano_id: Number(tamanoId),
                         precio_unitario: Number(precioUnitario),
                         precio_mayoreo: precioMayoreo ? Number(precioMayoreo) : undefined,
                         cantidad_minima_mayoreo: Number(cantidadMinima),
                         costo_produccion: costoProduccion ? Number(costoProduccion) : undefined,
            });
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
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
            /* CSS Base reusado */
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
            .me-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'DM Sans', sans-serif; }
            .me-backdrop { position: absolute; inset: 0; background: rgba(26,0,96,0.45); backdrop-filter: blur(6px); }
            /* Aquí el width max es más grande para las 2 columnas */
            .me-modal { position: relative; background: #fff; border: 3px solid #1a0060; border-radius: 28px; width: 100%; max-width: 600px; box-shadow: 8px 8px 0px #1a0060; overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; z-index: 2; }
            .me-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 2.5px solid rgba(26,0,96,0.1); background: rgba(237,233,254,0.6); border-radius: 25px 25px 0 0; }
            .me-header-left { display: flex; align-items: center; gap: 12px; }
            .me-header-icon { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .me-header-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 16px; color: #1a0060; text-transform: uppercase; letter-spacing: .05em; line-height: 1.1; }
            .me-header-sub { font-size: 11px; font-weight: 500; color: rgba(26,0,96,0.45); display: block; margin-top: 2px; }
            .me-close-btn { width: 36px; height: 36px; border-radius: 10px; border: 2px solid rgba(26,0,96,0.15); background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(26,0,96,0.5); transition: background .18s, color .18s, border-color .18s; flex-shrink: 0; }
            .me-close-btn:hover { background: #ff5050; color: #fff; border-color: #ff5050; }
            .me-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }

            /* Section Titles */
            .me-section-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: #cc55ff; display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
            .me-section-title.green { color: #06d6a0; }

            /* Grid and Inputs */
            .me-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
            .me-label { display: flex; align-items: center; gap: 5px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: #1a0060; margin-bottom: 7px; }
            .me-input, .me-select { width: 100%; background: #faf5ff; border: 2.5px solid #d4b8f0; border-radius: 12px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #1a0060; outline: none; transition: border-color .18s, box-shadow .18s, background .18s; }
            .me-input::placeholder { color: #b9a0d4; font-weight: 400; }
            .me-input:focus, .me-select:focus { border-color: #cc55ff; box-shadow: 0 0 0 3px rgba(204,85,255,0.15), 3px 3px 0px #1a0060; background: #fff; }
            .me-input:disabled, .me-select:disabled { opacity: .6; cursor: not-allowed; }
            .me-input.uppercase-input { text-transform: uppercase; }

            /* Actions Footer */
            .me-actions-footer { padding: 16px 24px; border-top: 2.5px solid rgba(26,0,96,0.1); background: #fff; display: flex; flex-direction: column; gap: 10px; }
            .me-save-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #1a0060; color: #ffe144; font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px; letter-spacing: .1em; text-transform: uppercase; border: 2.5px solid #1a0060; border-radius: 14px; padding: 15px; cursor: pointer; box-shadow: 4px 4px 0px rgba(0,0,0,0.3); transition: transform .12s, box-shadow .12s; }
            .me-save-btn:hover:not(:disabled) { transform: translate(-2px,-2px); box-shadow: 6px 6px 0px rgba(0,0,0,0.3); }
            .me-save-btn:active:not(:disabled) { transform: translate(2px,2px);  box-shadow: 2px 2px 0px rgba(0,0,0,0.25); }
            .me-save-btn:disabled { opacity: .7; cursor: not-allowed; }
            .me-save-btn.edit { background: #cc55ff; color: #fff; border-color: #1a0060; }
            .me-delete-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: none; color: rgba(255,80,80,0.8); font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; border: 2px solid rgba(255,80,80,0.25); border-radius: 12px; padding: 10px; cursor: pointer; transition: background .18s, color .18s, border-color .18s; }
            .me-delete-btn:hover { background: rgba(255,80,80,0.08); color: #ff5050; border-color: rgba(255,80,80,0.45); }

            @keyframes me-spin { to { transform: rotate(360deg); } }
            .me-spinner { display: inline-block; animation: me-spin 1s linear infinite; }

            /* Status screens */
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
                {step === 'confirm-delete' ? <Trash2 size={20} /> : <Package size={20} />}
                </div>
                <div>
                <p className="me-header-title">
                {step === 'confirm-delete' ? 'Eliminar producto' : step.startsWith('success') ? '¡Listo!' : esEdicion ? 'Editar producto' : 'Nuevo producto'}
                </p>
                <span className="me-header-sub">
                {step === 'confirm-delete' ? 'Esta acción no se puede deshacer' : step.startsWith('success') ? 'Operación completada' : esEdicion ? 'Modifica datos y precios' : 'Registra un nuevo artículo en inventario'}
                </span>
                </div>
                </div>
                <button className="me-close-btn" onClick={onClose} type="button"><X size={16} /></button>
                </div>

                {/* ── CONTENT ── */}
                <AnimatePresence mode="wait">

                {/* FORM */}
                {step === 'form' && (
                    <motion.form key="form" onSubmit={handleSubmit} className="me-form-layout" style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0  }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                    <div className="me-body">

                    {/* Ficha */}
                    <div style={{ background: '#f8f9fa', padding: 18, borderRadius: 16, border: '2px solid rgba(26,0,96,0.1)' }}>
                    <h3 className="me-section-title"><ListFilter size={14}/> Ficha del Producto</h3>
                    <div className="me-grid2">
                    <div>
                    <label className="me-label">Código / SKU</label>
                    <input type="text" className="me-input uppercase-input" placeholder="Ej. PIN-AJO-01" value={sku} onChange={e => setSku(e.target.value.toUpperCase())} required disabled={loading} />
                    </div>
                    <div>
                    <label className="me-label">Nombre del Producto</label>
                    <input type="text" className="me-input" placeholder="Ej. Pin de Ajolote" value={nombre} onChange={e => setNombre(e.target.value)} required disabled={loading} />
                    </div>
                    <div>
                    <label className="me-label">Categoría</label>
                    <select className="me-select" required disabled={loading || categorias.length === 0} value={categoriaId} onChange={e => setCategoriaId(Number(e.target.value))}>
                    <option value="" disabled>Seleccione...</option>
                    {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                    </select>
                    </div>
                    <div>
                    <label className="me-label">Tamaño</label>
                    <select className="me-select" required disabled={loading || tamanos.length === 0} value={tamanoId} onChange={e => setTamanoId(Number(e.target.value))}>
                    <option value="" disabled>Seleccione...</option>
                    {tamanos.map(t => <option key={t.id_tamano} value={t.id_tamano}>{t.descripcion}</option>)}
                    </select>
                    </div>
                    </div>
                    </div>

                    {/* Precios */}
                    <div style={{ background: '#f8f9fa', padding: 18, borderRadius: 16, border: '2px solid rgba(26,0,96,0.1)' }}>
                    <h3 className="me-section-title green"><DollarSign size={14}/> Precios y Costos</h3>
                    <div className="me-grid2">
                    <div>
                    <label className="me-label">Precio Unitario ($)</label>
                    <input type="number" step="0.01" className="me-input" value={precioUnitario} onChange={e => setPrecioUnitario(e.target.value ? Number(e.target.value) : '')} required disabled={loading} />
                    </div>
                    <div>
                    <label className="me-label">Costo Producción ($)</label>
                    <input type="number" step="0.01" className="me-input" placeholder="Opcional" value={costoProduccion} onChange={e => setCostoProduccion(e.target.value ? Number(e.target.value) : '')} disabled={loading} />
                    </div>
                    <div>
                    <label className="me-label">Precio Mayoreo ($)</label>
                    <input type="number" step="0.01" className="me-input" placeholder="Opcional" value={precioMayoreo} onChange={e => setPrecioMayoreo(e.target.value ? Number(e.target.value) : '')} disabled={loading} />
                    </div>
                    <div>
                    <label className="me-label">Mín. Mayoreo (Pzs)</label>
                    <input type="number" className="me-input" value={cantidadMinima} onChange={e => setCantidadMinima(e.target.value ? Number(e.target.value) : '')} required disabled={loading} />
                    </div>
                    </div>
                    </div>

                    </div>

                    <div className="me-actions-footer">
                    <motion.button type="submit" className={`me-save-btn${esEdicion ? ' edit' : ''}`} disabled={loading || !sku || !nombre} whileHover={!loading ? { scale:1.01 } : {}} whileTap={!loading ? { scale:0.97 } : {}}>
                    {loading ? <><span className="me-spinner"><RefreshCw size={16} /></span> Guardando...</> : <><Save size={16} /> {esEdicion ? 'Actualizar' : 'Guardar'} producto</>}
                    </motion.button>
                    {esEdicion && onDelete && (
                        <button type="button" className="me-delete-btn" onClick={() => setStep('confirm-delete')} disabled={loading}>
                        <Trash2 size={14} /> Eliminar este producto
                        </button>
                    )}
                    </div>

                    </motion.form>
                )}

                {/* CONFIRM DELETE */}
                {step === 'confirm-delete' && (
                    <motion.div key="confirm" className="me-confirm" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }} transition={{ type:'spring', stiffness:300, damping:22 }}>
                    <motion.div className="me-confirm-icon" initial={{ rotate:-15, scale:0.7 }} animate={{ rotate:0, scale:1 }} transition={{ type:'spring', stiffness:280, damping:16 }}><AlertTriangle size={28} /></motion.div>
                    <p className="me-confirm-title">¿Eliminar producto?</p>
                    <p className="me-confirm-sub">Esta acción es permanente. Se ocultará de la lista activa de inventario.</p>
                    <div className="me-confirm-name">{sku} - {nombre}</div>
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
                    <p className="me-success-title">{esEdicion ? '¡Producto actualizado!' : '¡Producto registrado!'}</p>
                    <p className="me-success-sub">{sku} guardado correctamente.</p>
                    </motion.div>
                )}

                {/* SUCCESS DELETED */}
                {step === 'success-delete' && (
                    <motion.div key="success-delete" className="me-success" initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring', stiffness:260, damping:18 }}>
                    <motion.div className="me-success-icon red" initial={{ scale:0 }} animate={{ scale:[0,1.2,1] }} transition={{ type:'spring', stiffness:240, damping:14, delay:0.05 }}><Trash2 size={32} /></motion.div>
                    <p className="me-success-title">Producto eliminado</p>
                    <p className="me-success-sub">El registro fue eliminado del inventario activo.</p>
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
