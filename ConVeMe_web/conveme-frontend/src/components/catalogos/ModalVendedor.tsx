import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
    X, Save, UserCheck, MapPin, School, DollarSign,
    AtSign, Search, ChevronDown, Check, Trash2,
    AlertTriangle, RefreshCw, Mail, Phone, User,
    GripHorizontal
} from 'lucide-react';
import { getEstados, getMunicipiosPorEstado } from '../../services/ubicacion.service';
import { getEscuelas } from '../../services/escuela.service';
import { getUsuariosParaSelect } from '../../services/vendedor.service';

interface ModalVendedorProps {
    isOpen:            boolean;
    onClose:           () => void;
    onSave:            (data: any) => Promise<void>;
    onDelete?:         () => Promise<void>;
    vendedorAEditar?:  any | null;
}

type ModalStep = 'form' | 'confirm-delete' | 'success' | 'success-delete';

/* ══════════════════════════════════════════════════════
 *  HELPER COMPONENTS — defined OUTSIDE ModalVendedor so
 *  React never unmounts them on parent re-render, keeping
 *  input focus stable while the user types.
 ═ *═════════════════════════════════════════════════════ */

const sectionStyle = {
    background:'rgba(237,233,254,0.3)',
    border:'1.5px solid rgba(26,0,96,0.08)',
    borderRadius:14, padding:'14px 14px 12px',
};

const sectionHeadStyle = (color: string): React.CSSProperties => ({
    display:'flex', alignItems:'center', gap:7,
    fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:9.5, letterSpacing:'.14em',
    textTransform:'uppercase', color, marginBottom:8,
});

function FieldLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <label style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'#1a0060', marginBottom:5 }}>
        <span style={{ color:'#cc55ff', display:'flex' }}>{icon}</span>
        {children}
        </label>
    );
}

function FieldInput({ error, style: extraStyle, ...props }: any) {
    return (
        <input
        {...props}
        style={{
            width:'100%', background:'#faf5ff',
            border:`2px solid ${error ? '#ff4d6d' : '#d4b8f0'}`,
            borderRadius:10, padding:'8px 12px',
            fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500, color:'#1a0060',
            outline:'none', transition:'border-color .18s, box-shadow .18s, background .18s',
            boxSizing:'border-box',
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
    return msg ? <p style={{ fontSize:11, fontWeight:600, color:'#ff4d6d', marginTop:4 }}>{msg}</p> : null;
}

function DropSearch({ value, onChange, placeholder }: { value:string; onChange:(v:string)=>void; placeholder:string }) {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderBottom:'1.5px solid rgba(26,0,96,0.08)', background:'rgba(237,233,254,0.5)' }}>
        <Search size={13} style={{ color:'rgba(26,0,96,0.35)', flexShrink:0 }} />
        <input
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex:1, border:'none', outline:'none', background:'transparent', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500, color:'#1a0060' }}
        />
        </div>
    );
}

function DropList({ children }: { children: React.ReactNode }) {
    return <div style={{ maxHeight:140, overflowY:'auto', scrollbarWidth:'thin' as any }}>{children}</div>;
}

function DropItem({ selected, onClick, children }: { selected?:boolean; onClick:()=>void; children:React.ReactNode }) {
    return (
        <div
        onClick={onClick}
        style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'10px 14px', cursor:'pointer',
            fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500,
            color: selected ? '#1a0060' : 'rgba(26,0,96,0.75)',
            borderBottom:'1px solid rgba(26,0,96,0.05)',
            background: selected ? '#ffe144' : 'transparent',
            transition:'background .13s',
        }}
        onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background='rgba(204,85,255,0.08)'; }}
        onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background= selected ? '#ffe144' : 'transparent'; }}
        >
        {children}
        {selected && <Check size={13} />}
        </div>
    );
}

function DropEmpty() {
    return <div style={{ padding:16, textAlign:'center', fontSize:12, fontWeight:600, color:'rgba(26,0,96,0.35)' }}>Sin resultados</div>;
}

function CustomDrop({ show, onToggle, disabled, placeholder, selected, children }: {
    show: boolean; onToggle: () => void; disabled?: boolean;
    placeholder: string; selected?: string; children: React.ReactNode;
}) {
    return (
        <div style={{ position:'relative' }}>
        <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        style={{
            width:'100%', background:'#faf5ff',
            border:`2px solid ${show ? '#cc55ff' : '#d4b8f0'}`,
            borderRadius:10, padding:'8px 12px',
            fontFamily:'DM Sans, sans-serif', fontSize:13, fontWeight:500,
            color: selected ? '#1a0060' : '#b9a0d4',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
            outline:'none', opacity: disabled ? .55 : 1,
            boxShadow: show ? '0 0 0 3px rgba(204,85,255,0.15), 3px 3px 0px #1a0060' : 'none',
            transition:'border-color .18s, box-shadow .18s',
            textAlign:'left',
        }}
        >
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {selected ?? placeholder}
        </span>
        <ChevronDown size={15} style={{ flexShrink:0, color:'rgba(26,0,96,0.35)', transition:'transform .2s', transform: show ? 'rotate(180deg)' : 'none' }} />
        </button>
        <AnimatePresence>
        {show && (
            <motion.div
            initial={{ opacity:0, y:-8 }}
            animate={{ opacity:1, y:0  }}
            exit={{ opacity:0,   y:-8  }}
            transition={{ duration:.16 }}
            style={{
                position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
                  background:'#fff', border:'2.5px solid #1a0060', borderRadius:14,
                  boxShadow:'5px 5px 0px #1a0060', overflow:'hidden', zIndex:100,
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

export default function ModalVendedor({
    isOpen, onClose, onSave, onDelete, vendedorAEditar
}: ModalVendedorProps) {

    const dragControls = useDragControls();
    const esEdicion    = Boolean(vendedorAEditar);

    /* ── Form state ── */
    const [nombreCompleto,    setNombreCompleto]    = useState('');
    const [email,             setEmail]             = useState('');
    const [telefono,          setTelefono]          = useState('');
    const [instagram,         setInstagram]         = useState('');
    const [usuarioId,         setUsuarioId]         = useState<number | ''>('');
    const [estadoId,          setEstadoId]          = useState<number | ''>('');
    const [municipioId,       setMunicipioId]       = useState<number | ''>('');
    const [escuelaId,         setEscuelaId]         = useState<number | ''>('');
    const [comisionMenudeo,   setComisionMenudeo]   = useState<number>(10);
    const [comisionMayoreo,   setComisionMayoreo]   = useState<number>(5);
    const [metaVentas,        setMetaVentas]        = useState<number>(0);

    /* ── Lists ── */
    const [estados,        setEstados]        = useState<any[]>([]);
    const [municipios,     setMunicipios]     = useState<any[]>([]);
    const [escuelas,       setEscuelas]       = useState<any[]>([]);
    const [usuariosLista,  setUsuariosLista]  = useState<any[]>([]);

    /* ── Dropdown open state ── */
    const [showEstadoDrop,    setShowEstadoDrop]    = useState(false);
    const [showMunDrop,       setShowMunDrop]       = useState(false);
    const [showEscuelaDrop,   setShowEscuelaDrop]   = useState(false);
    const [showUsuarioDrop,   setShowUsuarioDrop]   = useState(false);

    /* ── Search state ── */
    const [searchEstado,    setSearchEstado]    = useState('');
    const [searchMun,       setSearchMun]       = useState('');
    const [searchEscuela,   setSearchEscuela]   = useState('');
    const [searchUsuario,   setSearchUsuario]   = useState('');

    /* ── Validation errors ── */
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ── Modal step ── */
    const [step,    setStep]    = useState<ModalStep>('form');
    const [loading, setLoading] = useState(false);

    /* ── Load on open ── */
    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setErrors({});
            cargarCatalogosBase();

            if (vendedorAEditar) {
                setNombreCompleto(vendedorAEditar.nombre_completo   || '');
                setEmail(vendedorAEditar.email                      || '');
                setTelefono(vendedorAEditar.telefono                || '');
                setInstagram(vendedorAEditar.instagram_handle       || '');
                setComisionMenudeo(Number(vendedorAEditar.comision_fija_menudeo)  || 10);
                setComisionMayoreo(Number(vendedorAEditar.comision_fija_mayoreo)  || 5);
                setMetaVentas(Number(vendedorAEditar.meta_ventas_mensual)         || 0);
                setEscuelaId(vendedorAEditar.escuela?.id_escuela || '');

                const idEst = vendedorAEditar.municipio?.estado?.id_estado;
                const idMun = vendedorAEditar.municipio?.id_municipio;
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
    }, [isOpen, vendedorAEditar]);

    useEffect(() => {
        if (estadoId && (!vendedorAEditar || vendedorAEditar.municipio?.estado?.id_estado !== estadoId)) {
            cargarMunicipios(Number(estadoId));
            setMunicipioId('');
            setSearchMun('');
        }
    }, [estadoId]);

    const resetForm = () => {
        setNombreCompleto(''); setEmail(''); setTelefono(''); setInstagram('');
        setEstadoId(''); setMunicipioId(''); setEscuelaId(''); setUsuarioId('');
        setComisionMenudeo(10); setComisionMayoreo(5); setMetaVentas(0);
        setMunicipios([]);
        setShowEstadoDrop(false); setShowMunDrop(false);
        setShowEscuelaDrop(false); setShowUsuarioDrop(false);
        setSearchEstado(''); setSearchMun(''); setSearchEscuela(''); setSearchUsuario('');
        setErrors({});
    };

    const cargarCatalogosBase = async () => {
        try {
            const [dataEstados, dataEscuelas, dataUsuarios] = await Promise.all([
                getEstados(), getEscuelas(), getUsuariosParaSelect()
            ]);
            setEstados(dataEstados);
            setEscuelas(dataEscuelas);
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
        if (!nombreCompleto.trim())  errs.nombre   = 'El nombre es requerido';
        if (!emailRegex.test(email)) errs.email    = 'Usa un correo válido (@gmail, @hotmail, etc.)';
        if (telefono && !/^\d{10}$/.test(telefono)) errs.telefono = 'El teléfono debe tener 10 dígitos';
        if (!municipioId)             errs.municipio = 'Selecciona un municipio';
        if (!escuelaId)               errs.escuela   = 'Asigna una escuela';
        if (!usuarioId && !esEdicion) errs.usuario   = 'Enlaza un usuario del sistema';
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
                nombre_completo:  nombreCompleto,
                email,
                telefono:         telefono || undefined,
                instagram_handle: instagram || undefined,
                municipio_id:     Number(municipioId),
                escuela_id:       Number(escuelaId),
            };
            if (esEdicion) {
                payload.comision_fija_menudeo  = Number(comisionMenudeo);
                payload.comision_fija_mayoreo  = Number(comisionMayoreo);
                payload.meta_ventas_mensual    = Number(metaVentas);
            } else {
                payload.usuario_id = Number(usuarioId);
            }
            await onSave(payload);
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al procesar el vendedor' });
        } finally {
            setLoading(false);
        }
    };

    /* ── Delete ── */
    const handleDelete = async () => {
        if (!onDelete) return;
        setLoading(true);
        try {
            await onDelete();
            setStep('success-delete');
            setTimeout(() => { onClose(); setStep('form'); }, 2000);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al eliminar' });
        } finally {
            setLoading(false);
        }
    };

    /* ── Filtered lists ── */
    const estadosFiltrados  = estados.filter(e  => e.nombre.toLowerCase().includes(searchEstado.toLowerCase()));
    const munFiltrados      = municipios.filter(m => m.nombre.toLowerCase().includes(searchMun.toLowerCase()));
    const escuelasFiltradas = escuelas.filter(e  => e.nombre.toLowerCase().includes(searchEscuela.toLowerCase()));
    const usuariosFiltrados = usuariosLista.filter(u =>
    u.username.toLowerCase().includes(searchUsuario.toLowerCase()) ||
    String(u.id_usuario).includes(searchUsuario)
    );

    const estadoSelected  = estados.find(e  => e.id_estado    === estadoId);
    const munSelected     = municipios.find(m => m.id_municipio === municipioId);
    const escuelaSelected = escuelas.find(e  => e.id_escuela   === escuelaId);
    const usuarioSelected = usuariosLista.find(u => u.id_usuario === usuarioId);

    /* ── Reusable custom dropdown ── */
    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

            .mv-overlay {
                position: fixed; inset: 0; z-index: 50;
                display: flex; align-items: flex-start; justify-content: center;
                padding: 10px 12px;
                font-family: 'DM Sans', sans-serif;
                overflow-y: auto;
            }
            .mv-backdrop {
                position: fixed; inset: 0;
                background: rgba(26,0,96,0.45);
                backdrop-filter: blur(6px);
            }
            .mv-modal {
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

            /* Drag handle */
            .mv-drag-handle {
                display: flex; align-items: center; justify-content: space-between;
                padding: 12px 18px;
                border-bottom: 2px solid rgba(26,0,96,0.1);
                background: rgba(237,233,254,0.6);
                border-radius: 19px 19px 0 0;
                cursor: grab; flex-shrink: 0;
                user-select: none;
            }
            .mv-drag-handle:active { cursor: grabbing; }
            .mv-drag-left { display: flex; align-items: center; gap: 10px; pointer-events: none; }
            .mv-drag-icon {
                width: 36px; height: 36px; border-radius: 11px;
                display: flex; align-items: center; justify-content: center; flex-shrink: 0;
            }
            .mv-drag-title {
                font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px;
                color: #1a0060; text-transform: uppercase; letter-spacing: .05em; line-height: 1.1;
            }
            .mv-drag-sub {
                font-size: 10px; font-weight: 500; color: rgba(26,0,96,0.45);
                display: block; margin-top: 1px;
            }
            .mv-drag-grip {
                display: flex; align-items: center; gap: 6px;
            }
            .mv-close-btn {
                width: 32px; height: 32px; border-radius: 9px;
                border: 2px solid rgba(26,0,96,0.15); background: rgba(255,255,255,0.8);
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; color: rgba(26,0,96,0.5); pointer-events: auto;
                transition: background .18s, color .18s, border-color .18s;
            }
            .mv-close-btn:hover { background: #ff5050; color: #fff; border-color: #ff5050; }

            /* Scrollable form body */
            .mv-body {
                flex: 1; overflow-y: auto; padding: 14px 16px;
                display: flex; flex-direction: column; gap: 12px;
                scrollbar-width: thin; scrollbar-color: rgba(204,85,255,0.3) transparent;
            }
            .mv-body::-webkit-scrollbar { width: 4px; }
            .mv-body::-webkit-scrollbar-thumb { background: rgba(204,85,255,0.3); border-radius: 4px; }

            /* Footer */
            .mv-footer {
                padding: 12px 16px;
                border-top: 2px solid rgba(26,0,96,0.08);
                background: rgba(237,233,254,0.4);
                border-radius: 0 0 19px 19px;
                flex-shrink: 0;
                display: flex; flex-direction: column; gap: 8px;
            }

            /* Save button */
            .mv-save-btn {
                width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
                background: #1a0060; color: #ffe144;
                font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px;
                letter-spacing: .1em; text-transform: uppercase;
                border: 2.5px solid #1a0060; border-radius: 14px; padding: 15px;
                cursor: pointer; box-shadow: 4px 4px 0px rgba(0,0,0,0.3);
                transition: transform .12s, box-shadow .12s;
            }
            .mv-save-btn.edit { background: #cc55ff; color: #fff; border-color: #1a0060; }
            .mv-save-btn:hover:not(:disabled) { transform: translate(-2px,-2px); box-shadow: 6px 6px 0px rgba(0,0,0,0.3); }
            .mv-save-btn:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 2px 2px 0px rgba(0,0,0,0.25); }
            .mv-save-btn:disabled { opacity: .7; cursor: not-allowed; }

            .mv-delete-btn {
                width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
                background: none; color: rgba(255,80,80,0.8);
                font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px;
                letter-spacing: .08em; text-transform: uppercase;
                border: 2px solid rgba(255,80,80,0.25); border-radius: 12px; padding: 10px;
                cursor: pointer; transition: background .18s, color .18s, border-color .18s;
            }
            .mv-delete-btn:hover { background: rgba(255,80,80,0.08); color: #ff5050; border-color: rgba(255,80,80,0.45); }

            @keyframes mv-spin { to { transform: rotate(360deg); } }
            .mv-spinner { display: inline-block; animation: mv-spin 1s linear infinite; }

            /* Confirm / Success screens */
            .mv-centered {
                padding: 40px 24px;
                display: flex; flex-direction: column; align-items: center;
                gap: 14px; text-align: center;
            }
            .mv-big-icon {
                width: 72px; height: 72px; border-radius: 22px;
                display: flex; align-items: center; justify-content: center;
            }
            .mv-screen-title {
                font-family: 'Syne', sans-serif; font-weight: 900; font-size: 20px; color: #1a0060;
            }
            .mv-screen-sub {
                font-size: 13px; font-weight: 500; color: rgba(26,0,96,0.5);
                max-width: 300px; line-height: 1.55;
            }
            .mv-name-chip {
                border-radius: 10px; padding: 8px 16px;
                font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px;
            }
            .mv-confirm-btns {
                display: flex; gap: 10px; width: 100%; margin-top: 4px;
            }
            .mv-btn-cancel {
                flex: 1; background: none; border: 2.5px solid rgba(26,0,96,0.18);
                border-radius: 12px; padding: 12px;
                font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px;
                text-transform: uppercase; color: rgba(26,0,96,0.5); cursor: pointer;
                transition: background .18s, color .18s;
            }
            .mv-btn-cancel:hover { background: rgba(26,0,96,0.05); color: #1a0060; }
            .mv-btn-delete-confirm {
                flex: 1; background: #ff5050; border: 2.5px solid #1a0060;
                border-radius: 12px; padding: 12px;
                font-family: 'Syne', sans-serif; font-weight: 900; font-size: 12px;
                text-transform: uppercase; color: #fff; cursor: pointer;
                box-shadow: 3px 3px 0px #1a0060;
                transition: transform .12s, box-shadow .12s;
            }
            .mv-btn-delete-confirm:hover { transform: translate(-1px,-1px); box-shadow: 5px 5px 0px #1a0060; }
            .mv-btn-delete-confirm:disabled { opacity: .7; cursor: not-allowed; }

            .mv-submit-error {
                background: #ffe5e8; border: 2px solid #ff4d6d; border-radius: 12px;
                padding: 10px 14px; color: #c1002b; font-size: 12px; font-weight: 600;
                display: flex; align-items: center; gap: 8px;
            }
            .mv-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .mv-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
            .mv-full  { grid-column: 1 / -1; }
            @media (max-width: 520px) {
                .mv-grid2 { grid-template-columns: 1fr; }
                .mv-grid3 { grid-template-columns: 1fr; }
            }
            `}</style>

            <AnimatePresence>
            {isOpen && (
                <div className="mv-overlay">
                <motion.div
                className="mv-backdrop"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                onClick={() => step === 'form' ? onClose() : undefined}
                />

                <motion.div
                className="mv-modal"
                drag dragControls={dragControls} dragListener={false} dragMomentum={false}
                initial={{ opacity:0, scale:0.88, y:24 }}
                animate={{ opacity:1, scale:1,    y:0  }}
                exit={{ opacity:0,   scale:0.88,  y:24 }}
                transition={{ type:'spring', stiffness:280, damping:22 }}
                >
                {/* ── Drag handle / header ── */}
                <div
                className="mv-drag-handle"
                onPointerDown={e => dragControls.start(e)}
                style={{ touchAction:'none' }}
                >
                <div className="mv-drag-left">
                <div className="mv-drag-icon" style={{
                    background: step === 'confirm-delete' ? 'rgba(255,80,80,0.1)' : esEdicion ? 'rgba(204,85,255,0.12)' : 'rgba(6,214,160,0.12)',
                        border: `1.5px solid ${step === 'confirm-delete' ? 'rgba(255,80,80,0.25)' : esEdicion ? 'rgba(204,85,255,0.2)' : 'rgba(6,214,160,0.2)'}`,
                        color:  step === 'confirm-delete' ? '#ff5050' : esEdicion ? '#cc55ff' : '#06d6a0',
                }}>
                {step === 'confirm-delete' ? <Trash2 size={20} /> : <UserCheck size={20} />}
                </div>
                <div>
                <p className="mv-drag-title">
                {step === 'confirm-delete' ? 'Eliminar vendedor'
                    : step.startsWith('success') ? '¡Listo!'
                    : esEdicion ? 'Editar vendedor'
            : 'Nuevo vendedor'}
            </p>
            <span className="mv-drag-sub">
            {step === 'confirm-delete' ? 'Esta acción no se puede deshacer'
                : step.startsWith('success') ? 'Operación completada'
                : esEdicion ? 'Modifica los datos del vendedor'
            : 'Registra un nuevo vendedor'}
            </span>
            </div>
            </div>
            <div className="mv-drag-grip">
            <GripHorizontal size={16} style={{ color:'rgba(26,0,96,0.25)' }} />
            <button className="mv-close-btn" onClick={onClose} onPointerDown={e => e.stopPropagation()} type="button">
            <X size={16} />
            </button>
            </div>
            </div>

            {/* ── Content ── */}
            <AnimatePresence mode="wait">

            {/* FORM */}
            {step === 'form' && (
                <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity:0, x:20 }}
                animate={{ opacity:1, x:0  }}
                exit={{ opacity:0,   x:-20 }}
                transition={{ duration:.22 }}
                style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0 }}
                >
                <div className="mv-body">

                {/* ── Sección 1: Datos personales ── */}
                <div style={sectionStyle}>
                <p style={sectionHeadStyle('#cc55ff')}>
                <AtSign size={13} /> Datos personales y ubicación
                </p>
                <div className="mv-grid2">
                {/* Nombre completo */}
                <div className="mv-full">
                <FieldLabel icon={<User size={13} />}>Nombre completo</FieldLabel>
                <FieldInput
                type="text" required disabled={loading}
                value={nombreCompleto}
                onChange={(e: any) => setNombreCompleto(e.target.value)}
                placeholder="Ej. María García López"
                error={errors.nombre}
                />
                <ErrorMsg msg={errors.nombre} />
                </div>

                {/* Email */}
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

                {/* Teléfono */}
                <div>
                <FieldLabel icon={<Phone size={13} />}>Teléfono (10 dígitos)</FieldLabel>
                <FieldInput
                type="tel" disabled={loading}
                value={telefono}
                onChange={(e: any) => setTelefono(e.target.value)}
                placeholder="8100000000" maxLength={10}
                error={errors.telefono}
                />
                <ErrorMsg msg={errors.telefono} />
                </div>

                {/* Instagram */}
                <div>
                <FieldLabel icon={<AtSign size={13} />}>Instagram (@)</FieldLabel>
                <FieldInput
                type="text" disabled={loading}
                value={instagram}
                onChange={(e: any) => setInstagram(e.target.value)}
                placeholder="usuario_ig"
                />
                </div>

                {/* Usuario (solo crear) */}
                {!esEdicion && (
                    <div className="mv-full">
                    <FieldLabel icon={<User size={13} />}>Enlazar con usuario del sistema</FieldLabel>
                    <CustomDrop
                    show={showUsuarioDrop}
                    onToggle={() => { setShowUsuarioDrop(v => !v); setShowEstadoDrop(false); setShowMunDrop(false); setShowEscuelaDrop(false); }}
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
                            ID: {u.id_usuario} — {u.username}
                            </DropItem>
                        ))
                        : <DropEmpty />
                    }
                    </DropList>
                    </CustomDrop>
                    <ErrorMsg msg={errors.usuario} />
                    </div>
                )}

                {/* Estado */}
                <div>
                <FieldLabel icon={<MapPin size={13} />}>Estado</FieldLabel>
                <CustomDrop
                show={showEstadoDrop}
                onToggle={() => { setShowEstadoDrop(v => !v); setShowMunDrop(false); setShowEscuelaDrop(false); setShowUsuarioDrop(false); }}
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

                {/* Municipio */}
                <div>
                <FieldLabel icon={<MapPin size={13} />}>Municipio</FieldLabel>
                <CustomDrop
                show={showMunDrop}
                onToggle={() => { setShowMunDrop(v => !v); setShowEstadoDrop(false); setShowEscuelaDrop(false); setShowUsuarioDrop(false); }}
                disabled={loading || !estadoId || municipios.length === 0}
                placeholder={estadoId && municipios.length === 0 ? 'Cargando...' : 'Selecciona...'}
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
                <ErrorMsg msg={errors.municipio} />
                </div>
                </div>
                </div>

                {/* ── Sección 2: Asignación ── */}
                <div style={sectionStyle}>
                <p style={sectionHeadStyle('#06d6a0')}>
                <School size={13} /> Asignación de escuela
                </p>
                <FieldLabel icon={<School size={13} />}>Escuela asignada</FieldLabel>
                <CustomDrop
                show={showEscuelaDrop}
                onToggle={() => { setShowEscuelaDrop(v => !v); setShowEstadoDrop(false); setShowMunDrop(false); setShowUsuarioDrop(false); }}
                disabled={loading || escuelas.length === 0}
                placeholder="Selecciona una escuela..."
                selected={escuelaSelected?.nombre}
                >
                <DropSearch value={searchEscuela} onChange={setSearchEscuela} placeholder="Buscar escuela..." />
                <DropList>
                {escuelasFiltradas.length > 0
                    ? escuelasFiltradas.map(e => (
                        <DropItem
                        key={e.id_escuela}
                        selected={escuelaId === e.id_escuela}
                        onClick={() => { setEscuelaId(e.id_escuela); setShowEscuelaDrop(false); setSearchEscuela(''); }}
                        >
                        {e.nombre}
                        </DropItem>
                    ))
                    : <DropEmpty />
                }
                </DropList>
                </CustomDrop>
                <ErrorMsg msg={errors.escuela} />
                </div>

                {/* ── Sección 3: Comisiones ── */}
                <div style={sectionStyle}>
                <p style={sectionHeadStyle('#1a0060')}>
                <DollarSign size={13} /> Comisiones y metas
                </p>
                <div className="mv-grid3">
                <div>
                <FieldLabel icon={<DollarSign size={13} />}>% Menudeo</FieldLabel>
                <FieldInput
                type="number" step="0.01" required disabled={loading}
                value={comisionMenudeo}
                onChange={(e: any) => setComisionMenudeo(Number(e.target.value))}
                style={{ textAlign:'center' }}
                />
                </div>
                <div>
                <FieldLabel icon={<DollarSign size={13} />}>% Mayoreo</FieldLabel>
                <FieldInput
                type="number" step="0.01" required disabled={loading}
                value={comisionMayoreo}
                onChange={(e: any) => setComisionMayoreo(Number(e.target.value))}
                style={{ textAlign:'center' }}
                />
                </div>
                <div>
                <FieldLabel icon={<DollarSign size={13} />}>Meta ($)</FieldLabel>
                <FieldInput
                type="number" step="0.01" required disabled={loading}
                value={metaVentas}
                onChange={(e: any) => setMetaVentas(Number(e.target.value))}
                style={{ textAlign:'center' }}
                />
                </div>
                </div>
                </div>

                </div>

                {/* Footer */}
                <div className="mv-footer">
                {errors.submit && (
                    <div className="mv-submit-error">
                    <AlertTriangle size={15} /> {errors.submit}
                    </div>
                )}
                <motion.button
                type="submit"
                className={`mv-save-btn${esEdicion ? ' edit' : ''}`}
                disabled={loading}
                whileHover={!loading ? { scale:1.01 } : {}}
                whileTap={!loading ? { scale:0.97 } : {}}
                >
                {loading
                    ? <><span className="mv-spinner"><RefreshCw size={16} /></span> Guardando...</>
                    : <><Save size={16} /> {esEdicion ? 'Actualizar' : 'Guardar'} vendedor</>
                }
                </motion.button>
                {esEdicion && onDelete && (
                    <button type="button" className="mv-delete-btn" onClick={() => setStep('confirm-delete')} disabled={loading}>
                    <Trash2 size={14} /> Eliminar este vendedor
                    </button>
                )}
                </div>
                </motion.form>
            )}

            {/* CONFIRM DELETE */}
            {step === 'confirm-delete' && (
                <motion.div
                key="confirm"
                initial={{ opacity:0, scale:0.9 }}
                animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0, scale:0.9 }}
                transition={{ type:'spring', stiffness:300, damping:22 }}
                >
                <div className="mv-centered">
                <motion.div
                className="mv-big-icon"
                style={{ background:'rgba(255,80,80,0.1)', border:'2px solid rgba(255,80,80,0.25)', color:'#ff5050' }}
                initial={{ rotate:-15, scale:0.7 }}
                animate={{ rotate:0, scale:1 }}
                transition={{ type:'spring', stiffness:280, damping:16 }}
                >
                <AlertTriangle size={30} />
                </motion.div>
                <p className="mv-screen-title">¿Eliminar vendedor?</p>
                <p className="mv-screen-sub">Esta acción es permanente y no se puede deshacer. Se eliminarán también sus datos asociados.</p>
                <span className="mv-name-chip" style={{ background:'rgba(255,80,80,0.08)', border:'1.5px solid rgba(255,80,80,0.2)', color:'#ff5050' }}>
                {nombreCompleto}
                </span>
                <div className="mv-confirm-btns">
                <button className="mv-btn-cancel" onClick={() => setStep('form')}>Cancelar</button>
                <button className="mv-btn-delete-confirm" onClick={handleDelete} disabled={loading}>
                {loading ? <span className="mv-spinner"><RefreshCw size={14} /></span> : 'Sí, eliminar'}
                </button>
                </div>
                </div>
                </motion.div>
            )}

            {/* SUCCESS */}
            {step === 'success' && (
                <motion.div
                key="success"
                initial={{ opacity:0, scale:0.85 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ type:'spring', stiffness:260, damping:18 }}
                >
                <div className="mv-centered">
                <motion.div
                className="mv-big-icon"
                style={{ background:'rgba(6,214,160,0.12)', border:'2px solid rgba(6,214,160,0.25)', color:'#06d6a0' }}
                initial={{ scale:0, rotate:-20 }}
                animate={{ scale:[0,1.25,1], rotate:[0,10,0] }}
                transition={{ type:'spring', stiffness:240, damping:14, delay:0.05 }}
                >
                <Check size={36} />
                </motion.div>
                <p className="mv-screen-title">{esEdicion ? '¡Vendedor actualizado!' : '¡Vendedor registrado!'}</p>
                <p className="mv-screen-sub">{nombreCompleto} se guardó correctamente en el sistema.</p>
                </div>
                </motion.div>
            )}

            {/* SUCCESS DELETE */}
            {step === 'success-delete' && (
                <motion.div
                key="success-delete"
                initial={{ opacity:0, scale:0.85 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ type:'spring', stiffness:260, damping:18 }}
                >
                <div className="mv-centered">
                <motion.div
                className="mv-big-icon"
                style={{ background:'rgba(255,80,80,0.1)', border:'2px solid rgba(255,80,80,0.2)', color:'#ff5050' }}
                initial={{ scale:0 }}
                animate={{ scale:[0,1.2,1] }}
                transition={{ type:'spring', stiffness:240, damping:14, delay:0.05 }}
                >
                <Trash2 size={32} />
                </motion.div>
                <p className="mv-screen-title">Vendedor eliminado</p>
                <p className="mv-screen-sub">El registro fue eliminado permanentemente del sistema.</p>
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
