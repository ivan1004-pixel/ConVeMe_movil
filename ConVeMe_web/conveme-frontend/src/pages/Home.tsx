import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import '../styles/Home.css';
import mascotaImg from '../assets/mascota.jpg';
import letrasImg   from '../assets/logon.png';

/* ── Icons ── */
const IconArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
);
const IconZap = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);
const IconGrid = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
);
const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
);
const IconTrendingUp = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
    </svg>
);
const IconImagePlaceholder = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
    </svg>
);


import carruselFoto1 from '../assets/carrusel/foto1.jpg';
import carruselFoto2 from '../assets/carrusel/foto2.png';
import carruselFoto3 from '../assets/carrusel/foto3.jpg';
import carruselFoto4 from '../assets/carrusel/foto4.jpg';
import carruselFoto5 from '../assets/carrusel/foto5.jpg';

const CAROUSEL_IMAGES: string[] = [
    carruselFoto1,
    carruselFoto2,
    carruselFoto3,
    carruselFoto4,
    carruselFoto5,
];

const STATS = [
    { icon: <IconGrid />,       num: 'ERP',  label: 'Sistema' },
{ icon: <IconUsers />,      num: '3',    label: 'Roles'   },
{ icon: <IconTrendingUp />, num: 'version 1', label: 'Versión' },
];

/* ── Component ── */
export default function Home() {
    const carouselRef = useRef<HTMLDivElement>(null);
    const doubled     = [...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES];

    return (
        <div className="home-root">

        {/* ══ HEADER ══ */}
        <motion.header
        className="home-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
        <div className="home-logo">
        <img src={letrasImg} alt="NoManches Mx" />
        </div>
        <nav className="home-nav">
        <Link to="/login" className="nav-pill">
        <IconArrowRight /> Iniciar sesión
        </Link>
        </nav>
        </motion.header>

        {/* ══ HERO ══ */}
        <section className="home-hero">

        {/* Left column */}
        <motion.div
        className="hero-left"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
        <motion.div
        className="hero-eyebrow"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        >
        <span className="eyebrow-dot" />
        Sistema de Gestión
        </motion.div>

        <motion.h1
        className="hero-title"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.6 }}
        >
        <span className="stroke">No</span>
        <span className="accent">Manches</span>
        <span style={{ display: 'block', color: '#1a0060' }}>ERP</span>
        </motion.h1>

        <motion.p
        className="hero-desc"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        >
        Sistema que gestiona ventas, inventario y usuarios desde un solo lugar.
        Rápido y sin complicaciones.
        </motion.p>

        <motion.div
        className="hero-ctas"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.64 }}
        >
        <Link to="/login" className="btn-cta-primary">
        <IconArrowRight /> Iniciar sesión
        </Link>
        </motion.div>

        <motion.div
        className="hero-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.78 }}
        >
        {STATS.map((s, i) => (
            <motion.div
            key={i}
            className="stat-chip"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.82 + i * 0.1, type: 'spring', stiffness: 200 }}
            >
            <span className="stat-chip-icon">{s.icon}</span>
            <div>
            <p className="stat-chip-num">{s.num}</p>
            <p className="stat-chip-label">{s.label}</p>
            </div>
            </motion.div>
        ))}
        </motion.div>
        </motion.div>

        {/* Right column */}
        <motion.div
        className="hero-right"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
        <div className="hr-blob hr-blob-1" />
        <div className="hr-blob hr-blob-2" />

        <div className="float-card fcard-1">
        <div className="float-card-icon" style={{ background: 'rgba(204,85,255,0.15)' }}>
        <IconUsers />
        </div>
        <div className="float-card-text">
        <span className="float-card-label">Usuarios</span>
        <span className="float-card-sub">Control de roles</span>
        </div>
        </div>

        <div className="float-card fcard-2">
        <div className="float-card-icon" style={{ background: 'rgba(255,225,68,0.2)' }}>
        <IconTrendingUp />
        </div>
        <div className="float-card-text">
        <span className="float-card-label">Ventas</span>
        <span className="float-card-sub">Tiempo real</span>
        </div>
        </div>

        <div className="mascot-stage">
        <div className="mascot-ring-wrap">
        <div className="mascot-ring" />

        <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        >
        <div className="mascot-circle">
        <img src={mascotaImg} alt="Mascota NoManches" />
        </div>
        </motion.div>

        <motion.div
        className="mascot-badge"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 8 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 240, damping: 14 }}
        >
        ERP v2.0
        </motion.div>

        <motion.div
        className="mascot-badge-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.75, type: 'spring', stiffness: 220, damping: 15 }}
        >
        <IconZap /> NoManches!
        </motion.div>
        </div>
        </div>
        </motion.div>

        </section>

        {/* ══ CAROUSEL ══ */}
        <motion.div
        className="carousel-strip"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        >
        <div className="carousel-track" ref={carouselRef}>
        {doubled.map((src, i) => (
            <div key={i} className="carousel-slot">
            {src ? (
                <img src={src} alt={`Evento NoManches ${i}`} />
            ) : (
                <div className="slot-empty">
                <IconImagePlaceholder />
                <span>Tu foto aquí</span>
                </div>
            )}
            </div>
        ))}
        </div>
        </motion.div>

        {/* ══ FOOTER ══ */}
        <footer className="home-footer">
        <span className="footer-copy">© 2026 NoManches Mx</span>
        <div className="footer-dots">
        <span className="fdot active" />
        <span className="fdot" />
        <span className="fdot" />
        </div>
        </footer>

        </div>
    );
}
