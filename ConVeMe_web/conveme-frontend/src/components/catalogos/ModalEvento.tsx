import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Save, Calendar, MapPin, School, DollarSign, AlignLeft, Check, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { getEstados, getMunicipiosPorEstado } from '../../services/ubicacion.service';
import { getEscuelas } from '../../services/escuela.service';

interface ModalEventoProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    onDelete?: () => Promise<void>; // 👈 Añadido para eliminar
    eventoAEditar?: any | null;
}

type ModalStep = 'form' | 'confirm-delete' | 'success' | 'success-delete'; // 👈 Añadido sistema de pasos

const formatoFechaInput = (fechaString: string) => {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// Estilos reutilizables
const inputStyle: React.CSSProperties = {
    width: '100%', background: '#fff', border: '2px solid #1a0060',
    borderRadius: 12, padding: '10px 12px', fontFamily: 'inherit',
    fontSize: 13, fontWeight: 600, color: '#1a0060', outline: 'none',
    boxSizing: 'border-box', transition: 'box-shadow 0.15s',
};
const labelStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#1a0060', marginBottom: 6,
};
const sectionStyle = (bg: string, border: string): React.CSSProperties => ({
    background: bg, border: `2px solid ${border}`, borderRadius: 18, padding: 16,
});
const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14,
};
const dotStyle = (color: string): React.CSSProperties => ({
    width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0,
});
const sectionLabelStyle = (color: string): React.CSSProperties => ({
    fontSize: 10, fontWeight: 900, letterSpacing: '0.15em',
    textTransform: 'uppercase', color,
});
const optionalTagStyle: React.CSSProperties = {
    background: '#ffe144', color: '#1a0060', border: '1.5px solid #1a0060',
    borderRadius: 999, fontSize: 8, fontWeight: 900, padding: '1px 6px',
    letterSpacing: '0.05em', marginLeft: 4,
};

export default function ModalEvento({ isOpen, onClose, onSave, onDelete, eventoAEditar }: ModalEventoProps) {
    const dragControls = useDragControls();

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [escuelaId, setEscuelaId] = useState<number | ''>('');
    const [estadoId, setEstadoId] = useState<number | ''>('');
    const [municipioId, setMunicipioId] = useState<number | ''>('');
    const [costoStand, setCostoStand] = useState<number | ''>('');

    const [estados, setEstados] = useState<any[]>([]);
    const [municipios, setMunicipios] = useState<any[]>([]);
    const [escuelas, setEscuelas] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingMun, setLoadingMun] = useState(false);
    const [step, setStep] = useState<ModalStep>('form');

    // Progreso calculado con protección String()
    const progressStep = [
        String(nombre).trim() !== '' && fechaInicio !== '' && fechaFin !== '',
        escuelaId !== '' && estadoId !== '' && municipioId !== '',
        costoStand !== '',
    ];

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            cargarCatalogosBase();
            if (eventoAEditar) {
                setNombre(String(eventoAEditar.nombre || ''));
                setDescripcion(String(eventoAEditar.descripcion || ''));
                setFechaInicio(formatoFechaInput(eventoAEditar.fecha_inicio));
                setFechaFin(formatoFechaInput(eventoAEditar.fecha_fin));
                setCostoStand(Number(eventoAEditar.costo_stand) || '');
                setEscuelaId(eventoAEditar.escuela?.id_escuela || '');
                const idEst = eventoAEditar.municipio?.estado?.id_estado;
                const idMun = eventoAEditar.municipio?.id_municipio;
                if (idEst) {
                    setEstadoId(idEst);
                    cargarMunicipios(idEst).then(() => { if (idMun) setMunicipioId(idMun); });
                }
            }
        } else {
            limpiarFormulario();
        }
    }, [isOpen, eventoAEditar]);

    useEffect(() => {
        if (estadoId && (!eventoAEditar || eventoAEditar.municipio?.estado?.id_estado !== estadoId)) {
            cargarMunicipios(Number(estadoId));
            setMunicipioId('');
        }
    }, [estadoId]);

    const cargarCatalogosBase = async () => {
        try {
            const [dataEstados, dataEscuelas] = await Promise.all([getEstados(), getEscuelas()]);
            setEstados(dataEstados);
            setEscuelas(dataEscuelas);
        } catch (error) { console.error(error); }
    };

    const cargarMunicipios = async (id: number) => {
        setLoadingMun(true);
        try {
            const data = await getMunicipiosPorEstado(id);
            setMunicipios(data);
        } catch (error) { console.error(error); }
        finally { setLoadingMun(false); }
    };

    const limpiarFormulario = () => {
        setNombre(''); setDescripcion(''); setFechaInicio(''); setFechaFin('');
        setEstadoId(''); setMunicipioId(''); setEscuelaId(''); setCostoStand('');
        setMunicipios([]); setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (new Date(fechaInicio) >= new Date(fechaFin))
            return alert('¡Cuidado! La fecha de término no puede ser anterior o igual a la de inicio.');
        if (!escuelaId) return alert('Por favor asigna una escuela como sede del evento.');
        if (!municipioId) return alert('Por favor selecciona un municipio.');

        setLoading(true);
        try {
            await onSave({
                nombre: String(nombre).trim(),
                         descripcion: String(descripcion).trim() || undefined,
                         fecha_inicio: new Date(fechaInicio).toISOString(),
                         fecha_fin: new Date(fechaFin).toISOString(),
                         escuela_id: Number(escuelaId),
                         municipio_id: Number(municipioId),
                         costo_stand: costoStand ? Number(costoStand) : undefined,
            });
            setStep('success');
            setTimeout(() => { onClose(); }, 1500);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error al procesar el evento.');
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
            setTimeout(() => { onClose(); }, 1500);
        } catch (error: any) {
            alert(error.message || 'Error al eliminar');
            setStep('form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
        {isOpen && (
            <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
            <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(26,0,96,0.38)' }}
            onClick={() => step === 'form' ? onClose() : undefined}
            />

            <motion.div
            drag dragControls={dragControls} dragListener={false} dragMomentum={false}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full flex flex-col"
            style={{
                maxWidth: 640, maxHeight: '90vh',
                background: '#fff', border: '3.5px solid #1a0060',
                borderRadius: 24, boxShadow: '7px 7px 0 #1a0060',
            }}
            >
            <div
            className="flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing"
            style={{
                background: step === 'confirm-delete' ? '#ffe5e5' : '#ffe144', borderBottom: '3.5px solid #1a0060',
                borderRadius: '20px 20px 0 0', padding: '14px 18px', touchAction: 'none', transition: 'background 0.3s'
            }}
            onPointerDown={(e) => dragControls.start(e)}
            >
            <div className="flex items-center gap-3 pointer-events-none">
            <div style={{ background: '#fff', border: '2px solid #1a0060', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {step === 'confirm-delete' ? <Trash2 size={18} color="#ff5050" /> : <Calendar size={18} color="#1a0060" />}
            </div>
            <span style={{ fontWeight: 900, color: '#1a0060', fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {step === 'confirm-delete' ? 'Eliminar Evento' : step.startsWith('success') ? '¡Listo!' : eventoAEditar ? 'Editar Evento' : 'Añadir Evento'}
            </span>
            {step === 'form' && (
                <span style={{ background: '#1a0060', color: '#ffe144', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999 }}>
                {eventoAEditar ? 'Editar' : 'Nuevo'}
                </span>
            )}
            </div>
            <button
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="hover:bg-[#1a0060] hover:text-[#ffe144] transition-colors"
            style={{ background: 'none', border: '2px solid transparent', borderRadius: 8, padding: 4, cursor: 'pointer', color: '#1a0060', display: 'flex' }}
            >
            <X size={20} />
            </button>
            </div>

            <AnimatePresence mode="wait">
            {step === 'form' && (
                <motion.form key="form" onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                >
                <div className="flex-1 overflow-y-auto" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div style={{ display: 'flex', gap: 5 }}>
                {progressStep.map((done, i) => (
                    <motion.div
                    key={i}
                    animate={{ background: done ? '#06d6a0' : i === progressStep.filter(Boolean).length ? '#cc55ff' : 'rgba(26,0,96,0.12)' }}
                    transition={{ duration: 0.3 }}
                    style={{ flex: 1, height: 5, borderRadius: 999 }}
                    />
                ))}
                </div>

                <div style={sectionStyle('#f7f5ff', '#e0d8ff')}>
                <div style={sectionHeaderStyle}>
                <div style={dotStyle('#cc55ff')} />
                <AlignLeft size={11} color="#cc55ff" />
                <span style={sectionLabelStyle('#cc55ff')}>Detalles del Evento</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nombre del Evento</label>
                <div style={{ position: 'relative' }}>
                <input
                type="text" required disabled={loading}
                value={nombre} onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Fotos Graduación Gen. 2026"
                style={{ ...inputStyle, paddingRight: nombre ? 40 : 12 }}
                className="focus:shadow-[4px_4px_0px_#cc55ff]"
                />
                <AnimatePresence>
                {nombre && (
                    <motion.div
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: '#06d6a0', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                    <Check size={11} color="#fff" strokeWidth={3} />
                    </motion.div>
                )}
                </AnimatePresence>
                </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>
                Descripción
                <span style={optionalTagStyle}>Opcional</span>
                </label>
                <textarea
                disabled={loading} value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles adicionales sobre el evento..."
                rows={2}
                style={{ ...inputStyle, resize: 'none' }}
                className="focus:shadow-[4px_4px_0px_#cc55ff]"
                />
                </div>

                <div>
                <label style={labelStyle}>
                <Calendar size={11} color="#1a0060" /> Fecha de Inicio
                </label>
                <input
                type="datetime-local" required disabled={loading}
                value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                style={inputStyle}
                className="focus:shadow-[4px_4px_0px_#cc55ff]"
                />
                </div>
                <div>
                <label style={labelStyle}>
                <Calendar size={11} color="#1a0060" /> Fecha de Término
                </label>
                <input
                type="datetime-local" required disabled={loading}
                value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                style={inputStyle}
                className="focus:shadow-[4px_4px_0px_#cc55ff]"
                />
                </div>

                {fechaInicio && fechaFin && new Date(fechaInicio) >= new Date(fechaFin) && (
                    <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ gridColumn: '1 / -1', background: '#fff0f0', border: '1.5px solid #ff4d4d', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d4d', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#cc0000' }}>
                    La fecha de término debe ser posterior a la de inicio
                    </span>
                    </motion.div>
                )}
                </div>
                </div>

                <div style={sectionStyle('#f0fdf8', '#c0f0e4')}>
                <div style={sectionHeaderStyle}>
                <div style={dotStyle('#06d6a0')} />
                <School size={11} color="#06d6a0" />
                <span style={sectionLabelStyle('#06d6a0')}>Sede</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>
                <School size={11} color="#1a0060" /> Escuela Anfitriona
                </label>
                <select
                required disabled={loading || escuelas.length === 0}
                value={escuelaId} onChange={(e) => setEscuelaId(Number(e.target.value))}
                style={{ ...inputStyle, cursor: loading ? 'not-allowed' : 'pointer' }}
                className="focus:shadow-[4px_4px_0px_#06d6a0]"
                >
                <option value="" disabled>Seleccione una escuela...</option>
                {escuelas.map(esc => (
                    <option key={esc.id_escuela} value={esc.id_escuela}>{esc.nombre}</option>
                ))}
                </select>
                </div>

                <div>
                <label style={labelStyle}>
                <MapPin size={11} color="#1a0060" /> Estado
                </label>
                <select
                required disabled={loading || estados.length === 0}
                value={estadoId} onChange={(e) => setEstadoId(Number(e.target.value))}
                style={{ ...inputStyle, cursor: loading ? 'not-allowed' : 'pointer' }}
                className="focus:shadow-[4px_4px_0px_#06d6a0]"
                >
                <option value="" disabled>Seleccione...</option>
                {estados.map(est => (
                    <option key={est.id_estado} value={est.id_estado}>{est.nombre}</option>
                ))}
                </select>
                </div>

                <div>
                <label style={labelStyle}>
                <MapPin size={11} color="#1a0060" /> Municipio
                </label>
                <select
                required disabled={loading || !estadoId || municipios.length === 0}
                value={municipioId} onChange={(e) => setMunicipioId(Number(e.target.value))}
                style={{ ...inputStyle, cursor: (!estadoId || loading) ? 'not-allowed' : 'pointer', opacity: (!estadoId) ? 0.5 : 1 }}
                className="focus:shadow-[4px_4px_0px_#06d6a0]"
                >
                <option value="" disabled>
                {loadingMun ? 'Cargando...' : !estadoId ? 'Primero selecciona estado' : 'Seleccione...'}
                </option>
                {municipios.map(mun => (
                    <option key={mun.id_municipio} value={mun.id_municipio}>{mun.nombre}</option>
                ))}
                </select>
                {loadingMun && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <motion.div
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    style={{ width: 8, height: 8, border: '2px solid #06d6a0', borderTopColor: 'transparent', borderRadius: '50%' }}
                    />
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(26,0,96,0.5)' }}>Cargando municipios...</span>
                    </div>
                )}
                </div>
                </div>
                </div>

                <div style={sectionStyle('#fffbeb', '#fde68a')}>
                <div style={sectionHeaderStyle}>
                <div style={dotStyle('#f59e0b')} />
                <DollarSign size={11} color="#f59e0b" />
                <span style={sectionLabelStyle('#b45309')}>Finanzas</span>
                <span style={optionalTagStyle}>Opcional</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                <label style={labelStyle}>Costo del Stand</label>
                <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#1a0060', fontSize: 13 }}>$</span>
                <input
                type="number" step="0.01" min="0" disabled={loading}
                value={costoStand} onChange={(e) => setCostoStand(Number(e.target.value))}
                placeholder="0.00"
                style={{ ...inputStyle, paddingLeft: 28 }}
                className="focus:shadow-[4px_4px_0px_#f59e0b]"
                />
                </div>
                </div>
                <div />
                </div>
                </div>
                </div>

                <div style={{ padding: '14px 20px', borderTop: '3.5px solid #1a0060', background: '#fff', borderRadius: '0 0 20px 20px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <motion.button
                type="submit" disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                    width: '100%', fontFamily: 'inherit', fontSize: 13, fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    border: '3px solid #1a0060', borderRadius: 14, padding: 14,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '4px 4px 0 rgba(0,0,0,0.22)',
                                 background: '#1a0060', color: '#ffe144', opacity: loading ? 0.75 : 1,
                }}
                >
                {loading ? <><RefreshCw size={17} className="animate-spin" /> Guardando...</> : <><Save size={17} /> {eventoAEditar ? 'Actualizar' : 'Guardar'} Evento</>}
                </motion.button>
                {eventoAEditar && onDelete && (
                    <button type="button" onClick={() => setStep('confirm-delete')} disabled={loading}
                    style={{ width: '100%', background: 'none', border: '2px solid rgba(255,80,80,0.25)', borderRadius: 12, padding: 10, color: 'rgba(255,80,80,0.8)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                    <Trash2 size={14} /> Eliminar este evento
                    </button>
                )}
                </div>
                </motion.form>
            )}

            {/* ════ CONFIRMAR ELIMINACIÓN ════ */}
            {step === 'confirm-delete' && (
                <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(255,80,80,0.1)', border: '2px solid rgba(255,80,80,0.25)', color: '#ff5050', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={30} />
                </div>
                <p style={{ fontWeight: 900, fontSize: 20, color: '#1a0060', margin: 0 }}>¿Eliminar evento?</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(26,0,96,0.5)', maxWidth: 300, lineHeight: 1.5, margin: 0 }}>Esta acción es permanente y no se puede deshacer.</p>
                <span style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.2)', color: '#ff5050', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: 14 }}>
                {nombre}
                </span>
                <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
                <button onClick={() => setStep('form')} style={{ flex: 1, background: 'none', border: '2.5px solid rgba(26,0,96,0.18)', borderRadius: 12, padding: 12, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', color: 'rgba(26,0,96,0.5)', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleDelete} disabled={loading} style={{ flex: 1, background: '#ff5050', border: '2.5px solid #1a0060', borderRadius: 12, padding: 12, fontWeight: 900, fontSize: 12, textTransform: 'uppercase', color: '#fff', cursor: 'pointer', boxShadow: '3px 3px 0px #1a0060' }}>
                {loading ? <RefreshCw size={14} className="animate-spin inline-block" /> : 'Sí, eliminar'}
                </button>
                </div>
                </motion.div>
            )}

            {/* ════ ÉXITOS ════ */}
            {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(6,214,160,0.12)', border: '2px solid rgba(6,214,160,0.25)', color: '#06d6a0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={36} /></div>
                <p style={{ fontWeight: 900, fontSize: 20, color: '#1a0060', margin: 0 }}>¡Evento {eventoAEditar ? 'Actualizado' : 'Guardado'}!</p>
                </motion.div>
            )}
            {step === 'success-delete' && (
                <motion.div key="success-del" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(255,80,80,0.1)', border: '2px solid rgba(255,80,80,0.2)', color: '#ff5050', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={32} /></div>
                <p style={{ fontWeight: 900, fontSize: 20, color: '#1a0060', margin: 0 }}>Evento eliminado</p>
                </motion.div>
            )}
            </AnimatePresence>

            </motion.div>
            </div>
        )}
        </AnimatePresence>
    );
}
