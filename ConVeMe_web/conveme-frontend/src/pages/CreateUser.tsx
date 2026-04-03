import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import '../styles/CreateUser.css';

import mascotaImg from '../assets/mascota.jpg';

import { getEmpleados, updateEmpleado, deleteEmpleado } from '../services/empleado.service';
import { getVendedores, updateVendedor, deleteVendedor } from '../services/vendedor.service';
import ModalEmpleado from '../components/catalogos/ModalEmpleado';
import ModalVendedor from '../components/catalogos/ModalVendedor';

/* ── SVG Icons ─────────────────────────────── */
const IconUser = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconLock = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const IconShield = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const IconEye = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconChevron = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8L10 13"/></svg>
);
const IconChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5"/></svg>
);
const IconRocket = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
);
const IconStar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const IconCrown = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M4 20L2 8l5 4 5-8 5 8 5-4-2 12H4z"/></svg>
);
const IconTag = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
);
const IconBox = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
);
const IconCheck = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconEdit = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

export default function CreateUser() {
    const [username, setUsername]         = useState('');
    const [password, setPassword]         = useState('');
    const [rolId, setRolId]               = useState(1);
    const [showPass, setShowPass]         = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    const [activeTab, setActiveTab]       = useState<'crear' | 'empleados' | 'vendedores'>('crear');
    const [empleados, setEmpleados]       = useState<any[]>([]);
    const [vendedores, setVendedores]     = useState<any[]>([]);
    const [loadingData, setLoadingData]   = useState(false);

    const [modalEmpOpen, setModalEmpOpen]   = useState(false);
    const [empAEditar, setEmpAEditar]       = useState<any>(null);
    const [modalVendOpen, setModalVendOpen] = useState(false);
    const [vendAEditar, setVendAEditar]     = useState<any>(null);

    const { loading, error, exito, crearUsuario, setExito } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'empleados' && empleados.length === 0) cargarEmpleados();
        if (activeTab === 'vendedores' && vendedores.length === 0) cargarVendedores();
    }, [activeTab]);

        const cargarEmpleados = async () => {
            setLoadingData(true);
            try { setEmpleados(await getEmpleados()); } catch (e) { console.error(e); }
            setLoadingData(false);
        };

        const cargarVendedores = async () => {
            setLoadingData(true);
            try { setVendedores(await getVendedores()); } catch (e) { console.error(e); }
            setLoadingData(false);
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            const fueExitoso = await crearUsuario(username, password, rolId);
            if (fueExitoso) {
                setToastVisible(true);
                setTimeout(() => {
                    setUsername(''); setPassword(''); setRolId(1);
                    setExito(false); setToastVisible(false);
                }, 3500);
            }
        };

        const roles = [
            { id: 1, label: 'Administrador',         icon: <IconCrown /> },
            { id: 2, label: 'Vendedor',               icon: <IconTag />   },
            { id: 3, label: 'Logística / Inventario', icon: <IconBox />   },
        ];

        return (
            <>
            {/* ══ TOAST ══ */}
            <AnimatePresence>
            {toastVisible && (
                <motion.div
                className="cu-toast"
                initial={{ opacity: 0, y: -80, scale: 0.85 }}
                animate={{ opacity: 1, y: 0,   scale: 1    }}
                exit={{ opacity: 0, y: -60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                <span className="cu-star cu-star-1"><IconStar /></span>
                <span className="cu-star cu-star-2"><IconStar /></span>
                <span className="cu-star cu-star-3"><IconStar /></span>

                <div className="cu-toast-avatar">
                <img src={mascotaImg} alt="Mascota" />
                </div>

                <div className="cu-toast-body">
                <p className="cu-toast-title">
                <span style={{ color: '#06d6a0', display: 'flex' }}><IconCheck /></span>
                ¡Usuario creado!
                </p>
                <p className="cu-toast-sub">
                <strong style={{ color: '#cc55ff' }}>{username || 'Nuevo usuario'}</strong> ya puede acceder al ERP.
                </p>
                </div>

                <span className="cu-toast-tag">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {roles.find(r => r.id === rolId)?.icon}
                {roles.find(r => r.id === rolId)?.label}
                </span>
                </span>

                <div className="cu-toast-bar" />
                </motion.div>
            )}
            </AnimatePresence>

            <div className="cu-root">

            {/* ══ HEADER MORADO ══ */}
            <motion.div
            className="cu-left"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
            <div className="cu-blob cu-blob-1" />
            <div className="cu-blob cu-blob-2" />

            <div className="cu-left-content">
            <motion.div
            className="cu-mascot"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
            >
            <img src={mascotaImg} alt="Mascota NoManches" />
            </motion.div>

            <div className="cu-text-wrap">
            <motion.p
            className="cu-left-heading"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            >
            {activeTab === 'crear'
                ? 'Control de Accesos'
                : activeTab === 'empleados'
                ? 'Directorio Interno'
        : 'Red de Vendedores'}
        </motion.p>
        <motion.p
        className="cu-left-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        >
        {activeTab === 'crear'
            ? 'Crea cuentas para tu equipo y asígnales un rol.'
        : 'Gestiona la información y datos de contacto de tu equipo.'}
        </motion.p>
        </div>
        </div>
        </motion.div>

        {/* ══ TARJETA BLANCA ══ */}
        <motion.div
        className="cu-right"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
        <div className="cu-card">
        <motion.button
        type="button"
        className="cu-back"
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        >
        <IconChevron /> Regresar
        </motion.button>

        {/* ── PESTAÑAS ── */}
        <div className="cu-tabs">
        <button type="button" className={`cu-tab ${activeTab === 'crear'     ? 'active' : ''}`} onClick={() => setActiveTab('crear')}>🔑 Acceso</button>
        <button type="button" className={`cu-tab ${activeTab === 'empleados' ? 'active' : ''}`} onClick={() => setActiveTab('empleados')}>💼 Empleados</button>
        <button type="button" className={`cu-tab ${activeTab === 'vendedores'? 'active' : ''}`} onClick={() => setActiveTab('vendedores')}>🏷️ Vendedores</button>
        </div>

        {/* ── FORMULARIO CREAR USUARIO ── */}
        {activeTab === 'crear' && (
            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {error && <div className="cu-error">{error}</div>}

            <div className="cu-field-group">
            <div>
            <label className="cu-label"><IconUser /> Nombre de usuario</label>
            <div className="cu-field-wrap">
            <input
            type="text"
            className="cu-input"
            placeholder="ej. ivan_admin"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
            />
            </div>
            </div>

            <div>
            <label className="cu-label"><IconLock /> Contraseña</label>
            <div className="cu-field-wrap">
            <input
            type={showPass ? 'text' : 'password'}
            className="cu-input"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
            />
            <button type="button" className="cu-pass-toggle" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
            <IconEye />
            </button>
            </div>
            </div>

            <div>
            <label className="cu-label"><IconShield /> Rol de acceso</label>
            <div className="cu-field-wrap">
            <select className="cu-select" value={rolId} onChange={e => setRolId(Number(e.target.value))} disabled={loading}>
            {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <span className="cu-select-icon"><IconChevronDown /></span>
            </div>
            </div>
            </div>

            <motion.button
            type="submit"
            className={`cu-btn${exito ? ' success' : ''}`}
            disabled={loading || exito}
            whileHover={!loading && !exito ? { scale: 1.01 } : {}}
            whileTap={!loading && !exito ? { scale: 0.97 } : {}}
            >
            {loading
                ? <><span className="cu-spinner"><IconRocket /></span> Guardando...</>
                : exito
                ? <><IconCheck /> ¡Usuario listo!</>
                : <><IconRocket /> Crear usuario</>
            }
            </motion.button>
            </motion.form>
        )}

        {/* ── LISTA DE EMPLEADOS ── */}
        {activeTab === 'empleados' && (
            <motion.div className="cu-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {loadingData
                ? <p style={{ textAlign: 'center', padding: 20, fontWeight: 'bold', color: '#cc55ff' }}>Cargando empleados...</p>
                : empleados.map(emp => (
                    <div className="cu-list-item" key={emp.id_empleado}>
                    <div>
                    <p className="cu-item-name">{emp.nombre_completo}</p>
                    <p className="cu-item-sub">{emp.puesto} • {emp.telefono}</p>
                    </div>
                    <button className="cu-item-btn" onClick={() => { setEmpAEditar(emp); setModalEmpOpen(true); }}>
                    <IconEdit />
                    </button>
                    </div>
                ))
            }
            {empleados.length === 0 && !loadingData && (
                <p style={{ textAlign: 'center', color: 'gray' }}>No hay empleados registrados.</p>
            )}
            </motion.div>
        )}

        {/* ── LISTA DE VENDEDORES ── */}
        {activeTab === 'vendedores' && (
            <motion.div className="cu-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {loadingData
                ? <p style={{ textAlign: 'center', padding: 20, fontWeight: 'bold', color: '#cc55ff' }}>Cargando vendedores...</p>
                : vendedores.map(vend => (
                    <div className="cu-list-item" key={vend.id_vendedor}>
                    <div>
                    <p className="cu-item-name">{vend.nombre_completo}</p>
                    <p className="cu-item-sub">Escuela: {vend.escuela?.nombre || 'Ninguna'} • {vend.telefono}</p>
                    </div>
                    <button className="cu-item-btn" onClick={() => { setVendAEditar(vend); setModalVendOpen(true); }}>
                    <IconEdit />
                    </button>
                    </div>
                ))
            }
            {vendedores.length === 0 && !loadingData && (
                <p style={{ textAlign: 'center', color: 'gray' }}>No hay vendedores registrados.</p>
            )}
            </motion.div>
        )}

        </div>
        </motion.div>

        </div>

        {/* ══ MODALES ══ */}
        <ModalEmpleado
        isOpen={modalEmpOpen}
        onClose={() => setModalEmpOpen(false)}
        empleadoAEditar={empAEditar}
        onSave={async (data: any) => {
            await updateEmpleado({ id_empleado: empAEditar.id_empleado, ...data });
            cargarEmpleados();
        }}
        onDelete={async (id: number) => {
            await deleteEmpleado(id);
            cargarEmpleados();
        }}
        />

        <ModalVendedor
        isOpen={modalVendOpen}
        onClose={() => setModalVendOpen(false)}
        vendedorAEditar={vendAEditar}
        onSave={async (data: any) => {
            await updateVendedor({ id_vendedor: vendAEditar.id_vendedor, ...data });
            cargarVendedores();
        }}
        onDelete={async () => {
            await deleteVendedor(vendAEditar.id_vendedor);
            cargarVendedores();
        }}
        />
        </>
        );
}
