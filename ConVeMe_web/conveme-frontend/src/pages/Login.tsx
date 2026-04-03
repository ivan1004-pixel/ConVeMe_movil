import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

import mascotaImg from '../assets/mascota.jpg';
import letrasImg from '../assets/logob.png';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const { loading, error, exito, iniciarSesion } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fueExitoso = await iniciarSesion(username, password);

        if (fueExitoso) {
            // Leemos el rol que el auth.service acaba de guardar en el LocalStorage
            const rolId = localStorage.getItem('rol_id');

            setTimeout(() => {
                if (rolId === '1') {
                    // Si es Admin, va a su dashboard normal
                    navigate('/dashboard');
                } else if (rolId === '2') {
                    // Si es Vendedor, va a su portal especial
                    navigate('/dashboard-vendedor');
                } else {
                    // Fallback de seguridad
                    navigate('/dashboard');
                }
            }, 2000);
        }
    };

    return (
        <>
        {/* SUCCESS OVERLAY */}
        <AnimatePresence>
        {exito && (
            <motion.div
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            >
            <motion.span
            style={{ fontSize: 80 }}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.3, 1], rotate: [0, 14, 0] }}
            transition={{ type: 'spring', stiffness: 240, damping: 12, delay: 0.1 }}
            >
            uwu
            </motion.span>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 28, color: '#1a0060' }}>
            ¡Acceso Concedido!
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'rgba(26,0,96,0.55)', fontWeight: 500 }}>
            Cargando ERP<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </p>
            </motion.div>
        )}
        </AnimatePresence>

        <div className="login-root">

        {/* ══ LEFT PANEL ══ */}
        <motion.div
        className="panel-left"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="left-content">
        {/* Logo */}
        <motion.div
        className="logo-banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        >
        <img src={letrasImg} alt="NoManches Mx" />
        </motion.div>

        {/* Mascot */}
        <motion.div
        className="mascot-wrap"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
        >
        <img src={mascotaImg} alt="Mascota NoManches" />
        </motion.div>

        {/* Heading */}
        <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.55 }}
        >
        <p className="welcome-heading">¡Hola,<br />NoMancherito!</p>
        </motion.div>

        <motion.p
        className="welcome-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.56 }}
        >
        Tu ERP favorito te espera. Inicia sesión para continuar.
        </motion.p>

        <motion.span
        className="tag-pill"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.65, type: 'spring', stiffness: 200 }}
        >
        © 2026 NoManches Mx
        </motion.span>
        </div>
        </motion.div>

        {/* ══ RIGHT PANEL ══ */}
        <motion.div
        className="panel-right"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
        <div className="corner-accent-br" />

        <div className="form-card">
        {/* Back button */}
        <motion.button
        type="button"
        className="btn-back"
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Regresar
        </motion.button>

        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.55 }}
        >
        <p className="form-eyebrow">Sistema ERP</p>
        <h1 className="form-title">Iniciar<br />sesión</h1>
        <p className="form-subtitle">Ingresa tus credenciales para acceder al sistema.</p>
        <div className="form-divider" />
        </motion.div>

        <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        >
        {error && (
            <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>
        )}

        <div className="field-group">
        {/* Usuario */}
        <div>
        <label className="field-label">Usuario</label>
        <div className="field-wrap">
        <input
        type="text"
        className="field-input"
        placeholder="tu_usuario"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        disabled={loading || exito}
        autoComplete="username"
        />
        </div>
        </div>

        {/* Contraseña */}
        <div>
        <label className="field-label">Contraseña</label>
        <div className="field-wrap">
        <input
        type={showPass ? 'text' : 'password'}
        className="field-input"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        disabled={loading || exito}
        autoComplete="current-password"
        />
        <button
        type="button"
        className="pass-toggle"
        onClick={() => setShowPass(v => !v)}
        tabIndex={-1}
        aria-label="Mostrar contraseña"
        >
        {showPass ? (
            /* Eye-off icon */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
        ) : (
            /* Eye icon */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
            </svg>
        )}
        </button>
        </div>
        </div>
        </div>

        <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>

        <motion.button
        type="submit"
        className={`btn-login${exito ? ' success' : ''}`}
        disabled={loading || exito}
        whileHover={!loading && !exito ? { scale: 1.01 } : {}}
        whileTap={!loading && !exito ? { scale: 0.97 } : {}}
        >
        {loading ? (
            <><span className="spinner">⚙️</span> Verificando...</>
        ) : exito ? (
            <> ¡Listo!</>
        ) : (
            <>Entrar →</>
        )}
        </motion.button>

        <p className="form-footer">Acceso restringido al personal autorizado.</p>
        </motion.form>
        </div>
        </motion.div>

        </div>
        </>
    );
}
