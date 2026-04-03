import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
    X, Save, Users, MapPin, Briefcase,
    Search, ChevronDown, Check, Trash2, AlertTriangle,
    RefreshCw, Mail, Phone, User, GripHorizontal, UserPlus, UserCog
} from 'lucide-react';
import { getEstados, getMunicipiosPorEstado } from '../../services/ubicacion.service';
import { getUsuariosParaSelect } from '../../services/vendedor.service';

interface ModalEmpleadoProps {
    isOpen:           boolean;
    onClose:          () => void;
    onSave:           (data: any) => Promise<void>;
    onDelete?:        (id: number) => Promise<void>;
    empleadoAEditar?: any | null;
}

type ModalStep = 'form' | 'confirm-delete' | 'success' | 'success-edit' | 'success-delete';

/* ══════════════════════════════════════════════════════
 *  HELPER COMPONENTS — definidos FUERA del componente
 *  principal para que React no los desmonte al re-render
 *  y el foco en los inputs sea estable.
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
        <input
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: '#1a0060' }}
        />
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

function CustomDrop({ show, onToggle, disabled, placeholder, selected, children }: {
    show: boolean; onToggle: () => void; disabled?: boolean;
    placeholder: string; selected?: string; children: React.ReactNode;
}) {
    return (
        <div style={{ position: 'relative' }}>
        <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        style={{
            width: '100%', background: '#faf5ff',
            border: `2px solid ${show ? '#cc55ff' : '#d4b8f0'}`,
            borderRadius: 10, padding: '8px 12px',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
            color: selected ? '#1a0060' : '#b9a0d4',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            outline: 'none', opacity: disabled ? .55 : 1,
            boxShadow: show ? '0 0 0 3px rgba(204,85,255,0.15), 3px 3px 0px #1a0060' : 'none',
            transition: 'border-color .18s, box-shadow .18s',
            textAlign: 'left',
        }}
        >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {selected ?? placeholder}
        </span>
        <ChevronDown
        size={15}
        style={{ flexShrink: 0, color: 'rgba(26,0,96,0.35)', transition: 'transform .2s', transform: show ? 'rotate(180deg)' : 'none' }}
        />
        </button>
        <AnimatePresence>
        {show && (
            <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -8 }}
            transition={{ duration: .16 }}
            style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: '#fff', border: '2.5px solid #1a0060', borderRadius: 14,
                  boxShadow: '5px 5px 0px #1a0060', overflow: 'hidden', zIndex: 100,
            }}
            >
            {children}
            </motion.div>
        )}
        </AnimatePresence>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */

export default function ModalEmpleado({
    isOpen, onClose, onSave, onDelete, empleadoAEditar
}: ModalEmpleadoProps) {

    const dragControls = useDragControls();
    const esEdicion    = Boolean(empleadoAEditar);

    /* ── Form state ── */
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [email,          setEmail]          = useState('');
    const [telefono,       setTelefono]       = useState('');
    const [puesto,         setPuesto]         = useState('');
    const [calleYNumero,   setCalleYNumero]   = useState('');
    const [colonia,        setColonia]        = useState('');
    const [codigoPostal,   setCodigoPostal]   = useState('');
    const [estadoId,       setEstadoId]       = useState<number | ''>('');
    const [municipioId,    setMunicipioId]    = useState<number | ''>('');
    const [usuarioId,      setUsuarioId]      = useState<number | ''>('');

    /* ── Lists ── */
    const [estados,       setEstados]       = useState<any[]>([]);
    const [municipios,    setMunicipios]    = useState<any[]>([]);
    const [usuariosLista, setUsuariosLista] = useState<any[]>([]);

    /* ── Dropdown open state ── */
    const [showEstadoDrop,  setShowEstadoDrop]  = useState(false);
    const [showMunDrop,     setShowMunDrop]     = useState(false);
    const [showUsuarioDrop, setShowUsuarioDrop] = useState(false);

    /* ── Search state ── */
    const [searchEstado,  setSearchEstado]  = useState('');
    const [searchMun,     setSearchMun]     = useState('');
    const [searchUsuario, setSearchUsuario] = useState('');

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

            if (empleadoAEditar) {
                setNombreCompleto(empleadoAEditar.nombre_completo || '');
                setEmail(empleadoAEditar.email                   || '');
                setTelefono(empleadoAEditar.telefono             || '');
                setPuesto(empleadoAEditar.puesto                 || '');
                setCalleYNumero(empleadoAEditar.calle_y_numero   || '');
                setColonia(empleadoAEditar.colonia               || '');
                setCodigoPostal(empleadoAEditar.codigo_postal    || '');

                const idEst = empleadoAEditar.municipio?.estado?.id_estado;
                const idMun = empleadoAEditar.municipio?.id_municipio;
                if (idEst) {
                    setEstadoId(idEst);
                    cargarMunicipios(idEst).then(() => { if (idMun) setMunicipioId(idMun); });
                }
            } else {
                resetForm();
            }
        } else {
            resetForm();
        }
    }, [isOpen, empleadoAEditar]);

    useEffect(() => {
        if (estadoId && (!empleadoAEditar || empleadoAEditar.municipio?.estado?.id_estado !== estadoId)) {
            cargarMunicipios(Number(estadoId));
            setMunicipioId('');
            setSearchMun('');
        }
    }, [estadoId]);

    const resetForm = () => {
        setNombreCompleto(''); setEmail(''); setTelefono(''); setPuesto('');
        setCalleYNumero(''); setColonia(''); setCodigoPostal('');
        setEstadoId(''); setMunicipioId(''); setUsuarioId('');
        setMunicipios([]);
        setShowEstadoDrop(false); setShowMunDrop(false); setShowUsuarioDrop(false);
        setSearchEstado(''); setSearchMun(''); setSearchUsuario('');
        setErrors({});
    };

    const cargarCatalogosBase = async () => {
        try {
            const [dataEstados, dataUsuarios] = await Promise.all([
                getEstados(), getUsuariosParaSelect()
            ]);
            setEstados(dataEstados);
            setUsuariosLista(dataUsuarios);
        } catch (err) { console.error(err); }
    };

    const cargarMunicipios = async (id: number) => {
        try { setMunicipios(await getMunicipiosPorEstado(id)); }
        catch (err) { console.error(err); }
    };

    /* ── Validate ── */
    const validate = () => {
        const errs: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com|live\.com)$/i;
        if (!nombreCompleto.trim())                       errs.nombre   = 'El nombre es requerido';
        if (!emailRegex.test(email))                      errs.email    = 'Usa un correo válido (@gmail, @hotmail, etc.)';
        if (telefono && !/^\d{10}$/.test(telefono))       errs.telefono = 'El teléfono debe tener 10 dígitos';
        if (!usuarioId && !esEdicion)                     errs.usuario  = 'Enlaza un usuario del sistema';
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
                nombre_completo: nombreCompleto.trim(),
                email:           email.trim(),
                telefono:        telefono.trim()     || undefined,
                puesto:          puesto.trim()       || undefined,
                calle_y_numero:  calleYNumero.trim() || undefined,
                colonia:         colonia.trim()      || undefined,
                codigo_postal:   codigoPostal.trim() || undefined,
                municipio_id:    municipioId ? Number(municipioId) : undefined,
            };
            if (!esEdicion) payload.usuario_id = Number(usuarioId);

            await onSave(payload);
            setStep(esEdicion ? 'success-edit' : 'success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al procesar el empleado' });
        } finally {
            setLoading(false);
        }
    };

    /* ── Delete ── */
    const handleDelete = async () => {
        if (!onDelete || !empleadoAEditar) return;
        setLoading(true);
        try {
            await onDelete(empleadoAEditar.id_empleado);
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
    const estadosFiltrados  = estados.filter(e  => e.nombre.toLowerCase().includes(searchEstado.toLowerCase()));
    const munFiltrados      = municipios.filter(m => m.nombre.toLowerCase().includes(searchMun.toLowerCase()));
    const usuariosFiltrados = usuariosLista.filter(u =>
    u.username.toLowerCase().includes(searchUsuario.toLowerCase()) ||
    String(u.id_usuario).includes(searchUsuario)
    );

    const estadoSelected  = estados.find(e    => e.id_estado    === estadoId);
    const munSelected     = municipios.find(m  => m.id_municipio === municipioId);
    const usuarioSelected = usuariosLista.find(u => u.id_usuario  === usuarioId);

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

            .me-overlay {
                position: fixed; inset: 0; z-index: 50;
                display: flex; align-items: flex-start; justify-content: center;
                padding: 10px 12px;
                font-family: 'DM Sans', sans-serif;
                overflow-y: auto;
            }
            .me-backdrop {
                position: fixed; inset: 0;
                background: rgba(26,0,96,0.45);
                backdrop-filter: blur(6px);
            }
            .me-modal {
                position: relative; z-index: 2;
                background: #fff;
                border: 3px solid #1a0060;
                border-radius: 22px;
                width: 100%; max-width: 600px;
                box-shadow: 6px 6px 0px #1a0060;
                display: flex; flex-direction: column;
                max-height: calc(100dvh - 20px);
                margin: 0 auto;
            }
            .me-drag-handle {
                display: flex; align-items: center; justify-content: space-between;
                padding: 12px 18px;
                border-bottom: 2px solid rgba(26,0,96,0.1);
                background: rgba(237,233,254,0.6);
                border-radius: 19px 19px 0 0;
                cursor: grab; flex-shrink: 0;
                user-select: none;
            }
            .me-drag-handle:active { cursor: grabbing; }
            .me-drag-left  { display: flex; align-items: center; gap: 10px; pointer-events: none; }
            .me-drag-icon  {
                width: 36px; height: 36px; border-radius: 11px;
                display: flex; align-items: center; justify-content: center; flex-shrink: 0;
            }
            .me-drag-title {
                font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px;
                color: #1a0060; text-transform: uppercase; letter-spacing: .05em; line-height: 1.1;
            }
            .me-drag-sub {
                font-size: 10px; font-weight: 500; color: rgba(26,0,96,0.45);
                display: block; margin-top: 1px;
            }
            .me-drag-grip  { display: flex; align-items: center; gap: 6px; }
            .me-close-btn  {
                width: 32px; height: 32px; border-radius: 9px;
                border: 2px solid rgba(26,0,96,0.15); background: rgba(255,255,255,0.8);
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; color: rgba(26,0,96,0.5); pointer-events: auto;
                transition: background .18s, color .18s, border-color .18s;
            }
            .me-close-btn:hover { background: #ff5050; color: #fff; border-color: #ff5050; }

            .me-body {
                flex: 1; overflow-y: auto; padding: 14px 16px;
                display: flex; flex-direction: column; gap: 12px;
                scrollbar-width: thin; scrollbar-color: rgba(204,85,255,0.3) transparent;
            }
            .me-body::-webkit-scrollbar       { width: 4px; }
            .me-body::-webkit-scrollbar-thumb { background: rgba(204,85,255,0.3); border-radius: 4px; }

            .me-footer {
                padding: 12px 16px;
                border-top: 2px solid rgba(26,0,96,0.08);
                background: rgba(237,233,254,0.4);
                border-radius: 0 0 19px 19px;
                flex-shrink: 0;
                display: flex; flex-direction: column; gap: 8px;
            }
            .me-save-btn {
                width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
                background: #1a0060; color: #ffe144;
                font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px;
                letter-spacing: .1em; text-transform: uppercase;
                border: 2.5px solid #1a0060; border-radius: 14px; padding: 15px;
                cursor: pointer; box-shadow: 4px 4px 0px rgba(0,0,0,0.3);
                transition: transform .12s, box-shadow .12s;
            }
            .me-save-btn.edit { background: #cc55ff; color: #fff; border-color: #1a0060; }
            .me-save-btn:hover:not(:disabled)  { transform: translate(-2px,-2px); box-shadow: 6px 6px 0px rgba(0,0,0,0.3); }
            .me-save-btn:active:not(:disabled) { transform: translate(2px,2px);   box-shadow: 2px 2px 0px rgba(0,0,0,0.25); }
            .me-save-btn:disabled { opacity: .7; cursor: not-allowed; }

            .me-delete-btn {
                width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
                background: none; color: rgba(255,80,80,0.8);
                font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px;
                letter-spacing: .08em; text-transform: uppercase;
                border: 2px solid rgba(255,80,80,0.25); border-radius: 12px; padding: 10px;
                cursor: pointer; transition: background .18s, color .18s, border-color .18s;
            }
            .me-delete-btn:hover { background: rgba(255,80,80,0.08); color: #ff5050; border-color: rgba(255,80,80,0.45); }

            @keyframes me-spin { to { transform: rotate(360deg); } }
            .me-spinner { display: inline-block; animation: me-spin 1s linear infinite; }

            .me-centered {
                padding: 40px 24px;
                display: flex; flex-direction: column; align-items: center;
                gap: 14px; text-align: center;
            }
            .me-big-icon {
                width: 72px; height: 72px; border-radius: 22px;
                display: flex; align-items: center; justify-content: center;
            }
            .me-screen-title {
                font-family: 'Syne', sans-serif; font-weight: 900; font-size: 20px; color: #1a0060;
            }
            .me-screen-sub {
                font-size: 13px; font-weight: 500; color: rgba(26,0,96,0.5);
                max-width: 300px; line-height: 1.55;
            }
            .me-name-chip {
                border-radius: 10px; padding: 8px 16px;
                font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px;
            }
            .me-confirm-btns { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
            .me-btn-cancel {
                flex: 1; background: none; border: 2.5px solid rgba(26,0,96,0.18);
                border-radius: 12px; padding: 12px;
                font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px;
                text-transform: uppercase; color: rgba(26,0,96,0.5); cursor: pointer;
                transition: background .18s, color .18s;
            }
            .me-btn-cancel:hover { background: rgba(26,0,96,0.05); color: #1a0060; }
            .me-btn-delete-confirm {
                flex: 1; background: #ff5050; border: 2.5px solid #1a0060;
                border-radius: 12px; padding: 12px;
                font-family: 'Syne', sans-serif; font-weight: 900; font-size: 12px;
                text-transform: uppercase; color: #fff; cursor: pointer;
                box-shadow: 3px 3px 0px #1a0060;
                transition: transform .12s, box-shadow .12s;
            }
            .me-btn-delete-confirm:hover    { transform: translate(-1px,-1px); box-shadow: 5px 5px 0px #1a0060; }
            .me-btn-delete-confirm:disabled { opacity: .7; cursor: not-allowed; }

            .me-submit-error {
                background: #ffe5e8; border: 2px solid #ff4d6d; border-radius: 12px;
                padding: 10px 14px; color: #c1002b; font-size: 12px; font-weight: 600;
                display: flex; align-items: center; gap: 8px;
            }
            .me-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .me-full  { grid-column: 1 / -1; }
            @media (max-width: 520px) { .me-grid2 { grid-template-columns: 1fr; } }
            `}</style>

            <AnimatePresence>
            {isOpen && (
                <div className="me-overlay">
                <motion.div
                className="me-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => step === 'form' ? onClose() : undefined}
                />

                <motion.div
                className="me-modal"
                drag dragControls={dragControls} dragListener={false} dragMomentum={false}
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{   opacity: 0, scale: 0.88,  y: 24 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                {/* ── Header arrastrable ── */}
                <div
                className="me-drag-handle"
                onPointerDown={e => dragControls.start(e)}
                style={{ touchAction: 'none' }}
                >
                <div className="me-drag-left">
                <div
                className="me-drag-icon"
                style={{
                    background: step === 'confirm-delete' ? 'rgba(255,80,80,0.1)' : esEdicion ? 'rgba(204,85,255,0.12)' : 'rgba(6,214,160,0.12)',
                        border: `1.5px solid ${step === 'confirm-delete' ? 'rgba(255,80,80,0.25)' : esEdicion ? 'rgba(204,85,255,0.2)' : 'rgba(6,214,160,0.2)'}`,
                        color:  step === 'confirm-delete' ? '#ff5050' : esEdicion ? '#cc55ff' : '#06d6a0',
                }}
                >
                {step === 'confirm-delete'
                    ? <Trash2 size={20} />
                    : esEdicion ? <UserCog size={20} /> : <UserPlus size={20} />
                }
                </div>
                <div>
                <p className="me-drag-title">
                {step === 'confirm-delete' ? 'Eliminar empleado'
                    : step.startsWith('success') ? '¡Listo!'
                    : esEdicion ? 'Editar empleado'
            : 'Nuevo empleado'}
            </p>
            <span className="me-drag-sub">
            {step === 'confirm-delete' ? 'Esta acción no se puede deshacer'
                : step.startsWith('success') ? 'Operación completada'
                : esEdicion ? 'Modifica los datos del empleado'
            : 'Registra un nuevo empleado en el sistema'}
            </span>
            </div>
            </div>
            <div className="me-drag-grip">
            <GripHorizontal size={16} style={{ color: 'rgba(26,0,96,0.25)' }} />
            <button className="me-close-btn" onClick={onClose} onPointerDown={e => e.stopPropagation()} type="button">
            <X size={16} />
            </button>
            </div>
            </div>

            {/* ── Contenido con transiciones por step ── */}
            <AnimatePresence mode="wait">

            {/* ════ FORM ════ */}
            {step === 'form' && (
                <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0  }}
                exit={{   opacity: 0, x: -20 }}
                transition={{ duration: .22 }}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
                >
                <div className="me-body">

                {/* Sección 1: Datos personales */}
                <div style={sectionStyle}>
                <p style={sectionHeadStyle('#cc55ff')}>
                <Briefcase size={13} /> Datos personales
                </p>
                <div className="me-grid2">

                <div className="me-full">
                <FieldLabel icon={<User size={13} />}>Nombre completo</FieldLabel>
                <FieldInput
                type="text" required disabled={loading}
                value={nombreCompleto}
                onChange={(e: any) => setNombreCompleto(e.target.value)}
                placeholder="Ej. Ana Torres López"
                error={errors.nombre}
                />
                <ErrorMsg msg={errors.nombre} />
                </div>

                <div>
                <FieldLabel icon={<Mail size={13} />}>Correo electrónico</FieldLabel>
                <FieldInput
                type="email" required disabled={loading}
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                placeholder="ejemplo@gmail.com"
                error={errors.email}
                />
                <ErrorMsg msg={errors.email} />
                </div>

                <div>
                <FieldLabel icon={<Phone size={13} />}>Teléfono</FieldLabel>
                <FieldInput
                type="tel" disabled={loading}
                value={telefono}
                onChange={(e: any) => setTelefono(e.target.value.replace(/\D/g, ''))}
                placeholder="10 dígitos" maxLength={10}
                error={errors.telefono}
                />
                <ErrorMsg msg={errors.telefono} />
                </div>

                <div>
                <FieldLabel icon={<Briefcase size={13} />}>Puesto</FieldLabel>
                <FieldInput
                type="text" disabled={loading}
                value={puesto}
                onChange={(e: any) => setPuesto(e.target.value)}
                placeholder="Ej. Coordinador de Ventas"
                />
                </div>

                {/* Usuario del sistema — solo en creación */}
                {!esEdicion && (
                    <div className="me-full">
                    <FieldLabel icon={<User size={13} />}>Enlazar con usuario del sistema</FieldLabel>
                    <CustomDrop
                    show={showUsuarioDrop}
                    onToggle={() => { setShowUsuarioDrop(v => !v); setShowEstadoDrop(false); setShowMunDrop(false); }}
                    disabled={loading}
                    placeholder="Selecciona usuario..."
                    selected={usuarioSelected ? `ID: ${usuarioSelected.id_usuario} — ${usuarioSelected.username}` : undefined}
                    >
                    <DropSearch value={searchUsuario} onChange={setSearchUsuario} placeholder="Buscar por nombre o ID..." />
                    <DropList>
                    {usuariosFiltrados.length > 0
                        ? usuariosFiltrados.map(u => (
                            <DropItem
                            key={u.id_usuario}
                            selected={usuarioId === u.id_usuario}
                            onClick={() => { setUsuarioId(u.id_usuario); setShowUsuarioDrop(false); setSearchUsuario(''); }}
                            >
                            <span>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 10, color: '#cc55ff', marginRight: 5 }}>ID:{u.id_usuario}</span>
                            {u.username}
                            </span>
                            </DropItem>
                        ))
                        : <DropEmpty />
                    }
                    </DropList>
                    </CustomDrop>
                    <ErrorMsg msg={errors.usuario} />
                    </div>
                )}
                </div>
                </div>

                {/* Sección 2: Dirección */}
                <div style={sectionStyle}>
                <p style={sectionHeadStyle('#06d6a0')}>
                <MapPin size={13} /> Dirección (opcional)
                </p>
                <div className="me-grid2">

                <div className="me-full">
                <FieldLabel icon={<MapPin size={13} />}>Calle y número</FieldLabel>
                <FieldInput
                type="text" disabled={loading}
                value={calleYNumero}
                onChange={(e: any) => setCalleYNumero(e.target.value)}
                placeholder="Ej. Av. Revolución 245 Int. 3"
                />
                </div>

                <div>
                <FieldLabel icon={<MapPin size={13} />}>Colonia</FieldLabel>
                <FieldInput
                type="text" disabled={loading}
                value={colonia}
                onChange={(e: any) => setColonia(e.target.value)}
                placeholder="Nombre de colonia"
                />
                </div>

                <div>
                <FieldLabel icon={<MapPin size={13} />}>Código postal</FieldLabel>
                <FieldInput
                type="text" disabled={loading}
                value={codigoPostal}
                onChange={(e: any) => setCodigoPostal(e.target.value.replace(/\D/g, ''))}
                maxLength={5} placeholder="5 dígitos"
                />
                </div>

                <div>
                <FieldLabel icon={<MapPin size={13} />}>Estado</FieldLabel>
                <CustomDrop
                show={showEstadoDrop}
                onToggle={() => { setShowEstadoDrop(v => !v); setShowMunDrop(false); setShowUsuarioDrop(false); }}
                disabled={loading || estados.length === 0}
                placeholder="Selecciona..."
                selected={estadoSelected?.nombre}
                >
                <DropSearch value={searchEstado} onChange={setSearchEstado} placeholder="Buscar estado..." />
                <DropList>
                {estadosFiltrados.length > 0
                    ? estadosFiltrados.map(est => (
                        <DropItem
                        key={est.id_estado}
                        selected={estadoId === est.id_estado}
                        onClick={() => { setEstadoId(est.id_estado); setShowEstadoDrop(false); setSearchEstado(''); }}
                        >
                        {est.nombre}
                        </DropItem>
                    ))
                    : <DropEmpty />
                }
                </DropList>
                </CustomDrop>
                </div>

                <div className="me-full">
                <FieldLabel icon={<MapPin size={13} />}>Municipio</FieldLabel>
                <CustomDrop
                show={showMunDrop}
                onToggle={() => { setShowMunDrop(v => !v); setShowEstadoDrop(false); setShowUsuarioDrop(false); }}
                disabled={loading || !estadoId || municipios.length === 0}
                placeholder={estadoId && municipios.length === 0 ? 'Cargando...' : !estadoId ? 'Primero selecciona un estado' : 'Selecciona...'}
                selected={munSelected?.nombre}
                >
                <DropSearch value={searchMun} onChange={setSearchMun} placeholder="Buscar municipio..." />
                <DropList>
                {munFiltrados.length > 0
                    ? munFiltrados.map(m => (
                        <DropItem
                        key={m.id_municipio}
                        selected={municipioId === m.id_municipio}
                        onClick={() => { setMunicipioId(m.id_municipio); setShowMunDrop(false); setSearchMun(''); }}
                        >
                        {m.nombre}
                        </DropItem>
                    ))
                    : <DropEmpty />
                }
                </DropList>
                </CustomDrop>
                </div>
                </div>
                </div>
                </div>

                {/* Footer */}
                <div className="me-footer">
                {errors.submit && (
                    <div className="me-submit-error">
                    <AlertTriangle size={15} /> {errors.submit}
                    </div>
                )}
                <motion.button
                type="submit"
                className={`me-save-btn${esEdicion ? ' edit' : ''}`}
                disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                >
                {loading
                    ? <><span className="me-spinner"><RefreshCw size={16} /></span> Guardando...</>
                    : <><Save size={16} /> {esEdicion ? 'Actualizar' : 'Guardar'} empleado</>
                }
                </motion.button>
                {esEdicion && onDelete && (
                    <button
                    type="button"
                    className="me-delete-btn"
                    onClick={() => setStep('confirm-delete')}
                    disabled={loading}
                    >
                    <Trash2 size={14} /> Eliminar este empleado
                    </button>
                )}
                </div>
                </motion.form>
            )}

            {/* ════ CONFIRMAR ELIMINACIÓN ════ */}
            {step === 'confirm-delete' && (
                <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{   opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                <div className="me-centered">
                <motion.div
                className="me-big-icon"
                style={{ background: 'rgba(255,80,80,0.1)', border: '2px solid rgba(255,80,80,0.25)', color: '#ff5050' }}
                initial={{ rotate: -15, scale: 0.7 }}
                animate={{ rotate: 0,   scale: 1   }}
                transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                >
                <AlertTriangle size={30} />
                </motion.div>
                <p className="me-screen-title">¿Eliminar empleado?</p>
                <p className="me-screen-sub">Esta acción es permanente y no se puede deshacer. Se eliminarán también los datos asociados.</p>
                <span className="me-name-chip" style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.2)', color: '#ff5050' }}>
                {nombreCompleto}
                </span>
                <div className="me-confirm-btns">
                <button className="me-btn-cancel" onClick={() => setStep('form')}>Cancelar</button>
                <button className="me-btn-delete-confirm" onClick={handleDelete} disabled={loading}>
                {loading ? <span className="me-spinner"><RefreshCw size={14} /></span> : 'Sí, eliminar'}
                </button>
                </div>
                </div>
                </motion.div>
            )}

            {/* ════ ÉXITO: CREADO ════ */}
            {step === 'success' && (
                <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                >
                <div className="me-centered">
                <motion.div
                className="me-big-icon"
                style={{ background: 'rgba(6,214,160,0.12)', border: '2px solid rgba(6,214,160,0.25)', color: '#06d6a0' }}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: [0, 1.25, 1], rotate: [0, 10, 0] }}
                transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}
                >
                <UserPlus size={34} />
                </motion.div>
                <p className="me-screen-title">¡Empleado registrado!</p>
                <p className="me-screen-sub">{nombreCompleto} fue dado de alta correctamente en el sistema.</p>
                <span className="me-name-chip" style={{ background: 'rgba(6,214,160,0.1)', border: '1.5px solid rgba(6,214,160,0.3)', color: '#0a8060' }}>
                {nombreCompleto}
                </span>
                </div>
                </motion.div>
            )}

            {/* ════ ÉXITO: EDITADO ════ */}
            {step === 'success-edit' && (
                <motion.div
                key="success-edit"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                >
                <div className="me-centered">
                <motion.div
                className="me-big-icon"
                style={{ background: 'rgba(204,85,255,0.12)', border: '2px solid rgba(204,85,255,0.25)', color: '#cc55ff' }}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: [0, 1.25, 1], rotate: [0, 10, 0] }}
                transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}
                >
                <UserCog size={34} />
                </motion.div>
                <p className="me-screen-title">¡Cambios guardados!</p>
                <p className="me-screen-sub">Los datos de {nombreCompleto} se actualizaron correctamente.</p>
                <span className="me-name-chip" style={{ background: 'rgba(204,85,255,0.1)', border: '1.5px solid rgba(204,85,255,0.3)', color: '#8833cc' }}>
                {nombreCompleto}
                </span>
                </div>
                </motion.div>
            )}

            {/* ════ ÉXITO: ELIMINADO ════ */}
            {step === 'success-delete' && (
                <motion.div
                key="success-delete"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                >
                <div className="me-centered">
                <motion.div
                className="me-big-icon"
                style={{ background: 'rgba(255,80,80,0.1)', border: '2px solid rgba(255,80,80,0.2)', color: '#ff5050' }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.05 }}
                >
                <Trash2 size={32} />
                </motion.div>
                <p className="me-screen-title">Empleado eliminado</p>
                <p className="me-screen-sub">El registro fue eliminado permanentemente del sistema.</p>
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
