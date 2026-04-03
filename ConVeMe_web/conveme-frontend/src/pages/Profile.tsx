import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Importamos AMBOS servicios
import { getEmpleadoPorUsuario, updateEmpleado } from '../services/empleado.service';
import { getVendedorByUsuarioId } from '../services/vendedor.service';

import UserGreeting from '../components/ui/UserGreeting';
import {
    Edit2, Save, X, User, Shield,
    CheckCircle, AlertTriangle, Star, Truck,
    Mail, Phone, Briefcase, MapPin, AtSign, School, DollarSign
} from 'lucide-react';

import '../styles/Profile.css';
import mascotaImg from '../assets/mascota.jpg';

export default function Profile() {
    const userId = Number(localStorage.getItem('id_usuario'));
    const miRol = Number(localStorage.getItem('rol_id'));
    const usernameLogueado = localStorage.getItem('username') || 'Usuario';

    const [datosPersonales, setDatosPersonales] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Estado para el formulario de EDICIÓN (Solo para Admins/Empleados)
    const [form, setForm] = useState({
        nombre_completo: '', correo: '', telefono: '', puesto: '',
        calle_numero: '', colonia: '', codigo_postal: ''
    });

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [savedOk, setSavedOk] = useState(false);

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        try {
            if (miRol === 2) {
                // Es Vendedor
                const data = await getVendedorByUsuarioId(userId);
                if (data) setDatosPersonales(data);
            } else {
                // Es Admin o Producción (Empleado)
                const data = await getEmpleadoPorUsuario(userId);
                if (data) {
                    setDatosPersonales(data);
                    setForm({
                        nombre_completo: data.nombre_completo,
                        correo: data.correo,
                        telefono: data.telefono,
                        puesto: data.puesto,
                        calle_numero: data.calle_numero || '',
                        colonia: data.colonia || '',
                        codigo_postal: data.codigo_postal || ''
                    });
                }
            }
        } catch (e) {
            console.error('Error al cargar datos personales', e);
            setErrorMsg('No se encontraron datos personales asociados a esta cuenta.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg(null);
        try {
            const payload = {
                id_empleado: datosPersonales.id_empleado,
                ...form
            };
            await updateEmpleado(payload);

            await cargarDatos();
            setIsEditing(false);
            setSavedOk(true);
            setTimeout(() => setSavedOk(false), 3000);
        } catch (err: any) {
            setErrorMsg(err.message || 'Error al actualizar los datos');
        } finally {
            setSaving(false);
        }
    };

    const rolMap: Record<number, { label: string; color: string; bg: string; icon: JSX.Element }> = {
        1: { label: 'Administrador', color: '#1a0060', bg: '#ffe144', icon: <Shield size={14} /> },
        2: { label: 'Vendedor',      color: '#fff',     bg: '#cc55ff', icon: <Star size={14} /> },
        3: { label: 'Producción',    color: '#1a0060', bg: '#06d6a0', icon: <Truck size={14} /> },
    };
    const rolInfo = rolMap[miRol] ?? rolMap[1];

    if (loading) return (
        <div className="flex items-center gap-3 p-8 font-syne font-black text-lg text-[#1a0060]">
        <div className="w-5 h-5 border-2 border-[#cc55ff] border-t-transparent rounded-full animate-spin" />
        Cargando datos personales...
        </div>
    );

    return (
        <>
        <AnimatePresence>
        {savedOk && (
            <motion.div className="pf-toast" initial={{ opacity:0, y:-50 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-40 }}>
            <span className="pf-toast-icon"><CheckCircle size={20} /></span>
            Datos actualizados correctamente
            </motion.div>
        )}
        </AnimatePresence>

        <div className="pf-root">
        <UserGreeting />

        {/* ── HERO ── */}
        <motion.div className="pf-hero" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <div className="pf-avatar-wrap">
        <div className="pf-avatar"><img src={mascotaImg} alt="Avatar" /></div>
        <div className="pf-avatar-ring" />
        </div>

        <div className="pf-hero-info">
        <span className="pf-hero-role" style={{ background: rolInfo.bg, color: rolInfo.color }}>
        {rolInfo.icon} {rolInfo.label}
        </span>
        <p className="pf-hero-username">{datosPersonales?.nombre_completo || usernameLogueado}</p>
        <span className="pf-hero-status">
        {miRol === 2
            ? <><School size={12} className="opacity-60" /> {datosPersonales?.escuela?.nombre || 'Sin escuela asignada'}</>
            : <><Briefcase size={12} className="opacity-60" /> {datosPersonales?.puesto || 'Sin puesto'}</>
        }
        </span>
        </div>

        {/* 👇 SOLO EL ADMIN PUEDE EDITAR (Y solo edita su ficha de empleado por ahora) */}
        {miRol === 1 && (
            <motion.button
            className={`pf-edit-btn ${isEditing ? 'cancel' : 'edit'}`}
            onClick={() => {
                setIsEditing(v => !v);
                setErrorMsg(null);
            }}
            whileHover={{ scale:1.02 }}
            whileTap={{ scale:0.97 }}
            >
            {isEditing ? <><X size={15} /> Cancelar</> : <><Edit2 size={15} /> Editar datos</>}
            </motion.button>
        )}
        </motion.div>

        {/* ── CONTENT ── */}
        <AnimatePresence mode="wait">
        {!isEditing ? (

            /* ══ READ VIEW (Dinámica) ══ */
            <motion.div key="read" className="pf-card" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}>
            <div className="pf-card-header">
            <div className="pf-card-header-icon"><User size={16} /></div>
            <span className="pf-card-header-title">Información Personal</span>
            </div>
            <div className="pf-card-body grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Bloques en común (Nombre, Correo, Teléfono) */}
            <div className="pf-info-block col-span-2 border-b border-dashed border-[#1a0060]/10 pb-4">
            <div className="pf-info-icon"><User size={18} /></div>
            <div className="pf-info-text">
            <span className="pf-info-label">Nombre Completo</span>
            <span className="pf-info-value !text-lg">{datosPersonales?.nombre_completo}</span>
            </div>
            </div>

            <div className="pf-info-block">
            <div className="pf-info-icon"><Mail size={18} /></div>
            <div className="pf-info-text">
            <span className="pf-info-label">Correo Electrónico</span>
            <span className="pf-info-value">{datosPersonales?.email || datosPersonales?.correo || 'No registrado'}</span>
            </div>
            </div>

            <div className="pf-info-block">
            <div className="pf-info-icon"><Phone size={18} /></div>
            <div className="pf-info-text">
            <span className="pf-info-label">Teléfono</span>
            <span className="pf-info-value">{datosPersonales?.telefono || 'No registrado'}</span>
            </div>
            </div>

            {/* Bloques exclusivos de VENDEDOR (miRol === 2) */}
            {miRol === 2 && (
                <>
                <div className="pf-info-block">
                <div className="pf-info-icon" style={{ background: 'rgba(204,85,255,0.1)', color: '#cc55ff' }}><AtSign size={18} /></div>
                <div className="pf-info-text">
                <span className="pf-info-label">Instagram</span>
                <span className="pf-info-value">{datosPersonales?.instagram_handle ? `@${datosPersonales.instagram_handle}` : 'No registrado'}</span>
                </div>
                </div>

                <div className="pf-info-block">
                <div className="pf-info-icon" style={{ background: 'rgba(6,214,160,0.1)', color: '#06d6a0' }}><MapPin size={18} /></div>
                <div className="pf-info-text">
                <span className="pf-info-label">Zona de venta</span>
                <span className="pf-info-value text-sm">
                {datosPersonales?.municipio ? `${datosPersonales.municipio.nombre}, ${datosPersonales.municipio.estado.nombre}` : 'No registrada'}
                </span>
                </div>
                </div>

                <div className="pf-info-block col-span-2 bg-[#F3F0FF] p-4 rounded-xl border border-[#1a0060]/5 mt-2">
                <div className="pf-info-icon"><DollarSign size={18} /></div>
                <div className="pf-info-text">
                <span className="pf-info-label">Esquema de Comisiones</span>
                <span className="pf-info-value text-sm flex gap-4 mt-1">
                <span><b>Menudeo:</b> {datosPersonales?.comision_fija_menudeo}%</span>
                <span><b>Mayoreo:</b> {datosPersonales?.comision_fija_mayoreo}%</span>
                </span>
                </div>
                </div>
                </>
            )}

            {/* Bloques exclusivos de EMPLEADO (miRol === 1 o 3) */}
            {miRol !== 2 && (
                <>
                <div className="pf-info-block col-span-2">
                <div className="pf-info-icon"><Briefcase size={18} /></div>
                <div className="pf-info-text">
                <span className="pf-info-label">Puesto Operativo</span>
                <span className="pf-info-value">{datosPersonales?.puesto}</span>
                </div>
                </div>

                <div className="pf-info-block col-span-2 bg-[#F3F0FF] p-4 rounded-xl border border-[#1a0060]/5 mt-2">
                <div className="pf-info-icon"><MapPin size={18} /></div>
                <div className="pf-info-text">
                <span className="pf-info-label">Dirección Particular</span>
                <span className="pf-info-value text-sm">
                {datosPersonales?.calle_numero ? `${datosPersonales.calle_numero}, ${datosPersonales.colonia}. CP: ${datosPersonales.codigo_postal}` : 'No registrada'}
                </span>
                </div>
                </div>
                </>
            )}
            </div>
            </motion.div>

        ) : (

            /* ══ EDIT VIEW (Solo Admins) ══ */
            <motion.div key="edit" className="pf-form-card" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
            <div className="pf-card-header">
            <div className="pf-card-header-icon" style={{ color:'#ffe144', background:'rgba(255,225,68,0.15)', borderColor:'rgba(255,225,68,0.25)' }}>
            <Edit2 size={16} />
            </div>
            <span className="pf-card-header-title">Actualizar datos personales</span>
            </div>

            <form onSubmit={handleGuardar} className="pf-form space-y-5 p-6 md:p-8">
            {errorMsg && (
                <div className="pf-error flex items-center gap-2 bg-[#ff5050]/10 border border-[#ff5050]/20 text-[#ff5050] p-3 rounded-lg text-sm font-medium">
                <AlertTriangle size={16} /> {errorMsg}
                </div>
            )}

            <div className="space-y-4">
            <h3 className="font-syne font-black text-[#1a0060]/50 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <User size={14}/> Datos Personales
            </h3>

            <div>
            <label className="pf-field-label">Nombre completo</label>
            <input type="text" className="pf-input" value={form.nombre_completo} onChange={e => setForm({...form, nombre_completo: e.target.value})} required disabled={saving} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="pf-field-label">Correo electrónico</label>
            <input type="email" className="pf-input" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} required disabled={saving} />
            </div>
            <div>
            <label className="pf-field-label">Teléfono</label>
            <input type="text" className="pf-input" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} required disabled={saving} />
            </div>
            </div>

            <div>
            <label className="pf-field-label">Puesto</label>
            <input type="text" className="pf-input" value={form.puesto} onChange={e => setForm({...form, puesto: e.target.value})} required disabled={saving} />
            </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed border-[#1a0060]/10">
            <h3 className="font-syne font-black text-[#1a0060]/50 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <MapPin size={14}/> Dirección (Opcional)
            </h3>
            <div>
            <label className="pf-field-label">Calle y número</label>
            <input type="text" className="pf-input" value={form.calle_numero} onChange={e => setForm({...form, calle_numero: e.target.value})} disabled={saving} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="pf-field-label">Colonia</label>
            <input type="text" className="pf-input" value={form.colonia} onChange={e => setForm({...form, colonia: e.target.value})} disabled={saving} />
            </div>
            <div>
            <label className="pf-field-label">Código Postal</label>
            <input type="text" className="pf-input" value={form.codigo_postal} onChange={e => setForm({...form, codigo_postal: e.target.value})} disabled={saving} />
            </div>
            </div>
            </div>

            <motion.button type="submit" className="pf-save-btn w-full flex items-center justify-center gap-3 bg-[#cc55ff] text-white font-syne font-black uppercase py-4 rounded-2xl border-[3px] border-[#1a0060] shadow-[6px_6px_0px_#1a0060] transition-all" disabled={saving}>
            {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</> : <><Save size={18} /> Actualizar datos</>}
            </motion.button>
            </form>
            </motion.div>
        )}
        </AnimatePresence>
        </div>
        </>
    );
}
