import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Package, ShoppingCart, Users, Settings,
    LogOut, Menu, X, Scissors, TrendingUp, ChevronRight,
    Shield, Star, Truck
} from 'lucide-react';

import letrasImg  from '../../assets/logob.png';
import mascotaImg from '../../assets/mascota.jpg';

export default function DashboardLayout() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [collapsed, setCollapsed]     = useState(false);
    const location  = useLocation();
    const navigate  = useNavigate();

    const rolId    = Number(localStorage.getItem('rol_id'))  || 0;
    const username = localStorage.getItem('username')         || 'Usuario';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol_id');
        navigate('/login');
    };

    const rolInfo: Record<number, { label: string; color: string; icon: JSX.Element }> = {
        1: { label: 'Administrador',  color: '#ffe144', icon: <Shield  size={13} /> },
        2: { label: 'Vendedor',       color: '#cc55ff', icon: <Star    size={13} /> },
        3: { label: 'Producción',     color: '#06d6a0', icon: <Truck   size={13} /> },
    };
    const rol = rolInfo[rolId] ?? { label: 'Invitado', color: '#aaa', icon: <Users size={13} /> };

    const menuItems = [
        // 👇 SOLUCIÓN: Si es rol 2 (Vendedor) va a '/dashboard-vendedor'. Si es Admin (1) o Producción (3), se queda en tu ruta original '/dashboard'
        { nombre: 'Inicio',          path: rolId === 2 ? '/dashboard-vendedor' : '/dashboard',      icono: <Home        size={18} />, roles: [1,2,3], section: 'General'    },
        { nombre: 'Mi Perfil',       path: '/perfil',          icono: <Users       size={18} />, roles: [1,2,3], section: 'General'    },
        { nombre: 'Punto de Venta',  path: '/pos',             icono: <ShoppingCart size={18}/>, roles: [1,2],   section: 'Ventas'     },
        { nombre: 'Mis Clientes',    path: '/pedidos-admin',       icono: <Users       size={18} />, roles: [1],   section: 'Ventas'     },
        { nombre: 'Inventario',      path: '/inventario',      icono: <Package     size={18} />, roles: [1,3],   section: 'Logística'  },
        { nombre: 'Producción',      path: '/produccion',      icono: <Scissors    size={18} />, roles: [1,3],   section: 'Logística'  },
        { nombre: 'Crear usuario',        path: '/crear-usuario',  icono: <Settings    size={18} />, roles: [1],     section: 'Admin'      },
        { nombre: 'Mis pedidos',        path: '/mis-pedidos',  icono: <Users    size={18} />, roles: [2],     section: 'Pedidos'      },
    ];

    const menuFiltrado = menuItems.filter(item => item.roles.includes(rolId));

    // Group by section
    const sections = Array.from(new Set(menuFiltrado.map(m => m.section)));

    const sidebarW = collapsed ? '72px' : '256px';

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            html, body, #root { width: 100%; height: 100%; overflow: hidden; }

            .dl-root {
                display: flex;
                width: 100vw;
                height: 100vh;
                font-family: 'DM Sans', sans-serif;
                background: #ede9fe;
                overflow: hidden;
            }

            /* ══════════════════════════════
             *               SIDEBAR
             *           ══════════════════════════════ */
            .dl-sidebar {
                position: relative;
                height: 100vh;
                background: #1a0060;
                border-right: 3px solid rgba(204,85,255,0.25);
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                overflow: hidden;
                transition: width 0.28s cubic-bezier(0.22,1,0.36,1);
                z-index: 50;
            }

            /* Dot grid on sidebar */
            .dl-sidebar::before {
                content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(204,85,255,0.18) 1.5px, transparent 1.5px);
    background-size: 24px 24px;
    pointer-events: none;
            }

            /* Decorative blob */
            .dl-sidebar::after {
                content: '';
    position: absolute;
    bottom: -60px; right: -60px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(204,85,255,0.08);
    border: 3px solid rgba(204,85,255,0.1);
    pointer-events: none;
            }

            /* ── Sidebar header ── */
            .dl-sb-header {
                position: relative;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 16px;
                height: 50px;
                border-bottom: 2px solid rgba(204,85,255,0.2);
                flex-shrink: 0;
                overflow: hidden;
            }
            .dl-sb-logo {
                display: flex;
                align-items: center;
                gap: 10px;
                overflow: hidden;
                min-width: 0;
            }
            .dl-sb-logo img {
                height: 23px;
                width: auto;
                flex-shrink: 0;
                filter: brightness(10);
                transition: opacity 0.2s;
            }
            .dl-collapse-btn {
                width: 32px; height: 32px;
                border-radius: 8px;
                border: 1.5px solid rgba(204,85,255,0.3);
                background: rgba(204,85,255,0.1);
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                color: rgba(255,255,255,0.6);
                flex-shrink: 0;
                transition: background .18s, color .18s, transform .18s;
            }
            .dl-collapse-btn:hover { background: rgba(204,85,255,0.25); color: #fff; }
            .dl-collapse-btn.rotated { transform: rotate(180deg); }

            /* ── User card ── */
            .dl-user-card {
                position: relative;
                z-index: 2;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                border-bottom: 2px solid rgba(204,85,255,0.15);
                flex-shrink: 0;
                overflow: hidden;
                background: rgba(255,255,255,0.04);
            }
            .dl-avatar {
                width: 40px; height: 40px;
                border-radius: 50%;
                border: 2.5px solid #cc55ff;
                overflow: hidden;
                flex-shrink: 0;
                box-shadow: 3px 3px 0px rgba(0,0,0,0.35);
            }
            .dl-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .dl-user-info { flex: 1; overflow: hidden; min-width: 0; }
            .dl-user-name {
                font-family: 'Syne', sans-serif;
                font-weight: 800;
                font-size: 13px;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .dl-role-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                border-radius: 6px;
                padding: 2px 8px;
                font-family: 'Syne', sans-serif;
                font-weight: 700;
                font-size: 9.5px;
                letter-spacing: .08em;
                text-transform: uppercase;
                color: #1a0060;
                margin-top: 3px;
                width: fit-content;
            }

            /* ── Nav ── */
            .dl-nav {
                position: relative;
                z-index: 2;
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 14px 10px;
                scrollbar-width: thin;
                scrollbar-color: rgba(204,85,255,0.3) transparent;
            }
            .dl-nav::-webkit-scrollbar { width: 4px; }
            .dl-nav::-webkit-scrollbar-track { background: transparent; }
            .dl-nav::-webkit-scrollbar-thumb { background: rgba(204,85,255,0.3); border-radius: 4px; }

            .dl-section-label {
                font-family: 'Syne', sans-serif;
                font-weight: 700;
                font-size: 9px;
                letter-spacing: .18em;
                text-transform: uppercase;
                color: rgba(255,255,255,0.25);
                padding: 10px 10px 6px;
                white-space: nowrap;
                overflow: hidden;
                transition: opacity 0.2s;
            }
            .dl-section-label.hidden-label { opacity: 0; }

            .dl-nav-link {
                display: flex;
                align-items: center;
                gap: 11px;
                padding: 10px 12px;
                border-radius: 12px;
                border: 1.5px solid transparent;
                text-decoration: none;
                font-family: 'DM Sans', sans-serif;
                font-weight: 600;
                font-size: 13.5px;
                color: rgba(255,255,255,0.55);
                transition: all .18s;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                position: relative;
            }
            .dl-nav-link:hover {
                background: rgba(204,85,255,0.12);
                border-color: rgba(204,85,255,0.2);
                color: rgba(255,255,255,0.9);
            }
            .dl-nav-link.active {
                background: #cc55ff;
                border-color: rgba(255,255,255,0.2);
                color: #fff;
                font-weight: 700;
                box-shadow: 4px 4px 0px rgba(0,0,0,0.35);
            }
            .dl-nav-link.active .dl-active-dot {
                display: block;
            }
            .dl-active-dot {
                display: none;
                position: absolute;
                right: 12px;
                width: 6px; height: 6px;
                border-radius: 50%;
                background: rgba(255,255,255,0.8);
            }
            .dl-nav-icon {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 22px;
            }
            .dl-nav-label { overflow: hidden; white-space: nowrap; transition: opacity 0.2s, max-width 0.28s; }

            /* ── Logout ── */
            .dl-sb-footer {
                position: relative;
                z-index: 2;
                padding: 12px 10px;
                border-top: 2px solid rgba(204,85,255,0.15);
                flex-shrink: 0;
            }
            .dl-logout-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                padding: 10px 14px;
                border-radius: 12px;
                border: 1.5px solid rgba(255,88,88,0.35);
                background: rgba(255,88,88,0.1);
                color: rgba(255,130,130,0.9);
                font-family: 'Syne', sans-serif;
                font-weight: 800;
                font-size: 12px;
                letter-spacing: .08em;
                text-transform: uppercase;
                cursor: pointer;
                transition: background .18s, color .18s, border-color .18s, box-shadow .18s;
                overflow: hidden;
                white-space: nowrap;
            }
            .dl-logout-btn:hover {
                background: rgba(255,88,88,0.22);
                color: #ff8080;
                border-color: rgba(255,88,88,0.5);
                box-shadow: 3px 3px 0px rgba(0,0,0,0.3);
            }
            .dl-logout-icon { flex-shrink: 0; display: flex; align-items: center; }
            .dl-logout-label { overflow: hidden; white-space: nowrap; transition: opacity 0.2s, max-width 0.28s; }

            /* ══════════════════════════════
             *               MAIN AREA
             *           ══════════════════════════════ */
            .dl-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                height: 100vh;
                overflow: hidden;
                min-width: 0;
            }

            /* ── Topbar ── */
            .dl-topbar {
                height: 50px;
                flex-shrink: 0;
                background: rgba(237,233,254,0.9);
                border-bottom: 2.5px solid rgba(26,0,96,0.1);
                backdrop-filter: blur(12px);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 28px;
                position: relative;
                z-index: 10;
            }

            .dl-topbar-left {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .dl-hamburger {
                display: none;
                width: 38px; height: 38px;
                border-radius: 10px;
                border: 2px solid rgba(26,0,96,0.18);
                background: none;
                cursor: pointer;
                align-items: center; justify-content: center;
                color: #1a0060;
                transition: background .18s;
            }
            .dl-hamburger:hover { background: rgba(26,0,96,0.06); }

            .dl-breadcrumb {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .dl-breadcrumb-home {
                font-family: 'Syne', sans-serif;
                font-weight: 700;
                font-size: 12px;
                color: rgba(26,0,96,0.4);
                text-transform: uppercase;
                letter-spacing: .08em;
            }
            .dl-breadcrumb-sep { color: rgba(26,0,96,0.25); display: flex; }
            .dl-breadcrumb-current {
                font-family: 'Syne', sans-serif;
                font-weight: 800;
                font-size: 13px;
                color: #1a0060;
                text-transform: uppercase;
                letter-spacing: .08em;
            }

            .dl-topbar-right {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .dl-topbar-chip {
                display: flex;
                align-items: center;
                gap: 6px;
                background: rgba(255,255,255,0.7);
                border: 2px solid rgba(26,0,96,0.1);
                border-radius: 10px;
                padding: 7px 14px;
                font-family: 'Syne', sans-serif;
                font-weight: 700;
                font-size: 11.5px;
                color: #1a0060;
                backdrop-filter: blur(6px);
            }
            .dl-topbar-avatar {
                width: 36px; height: 36px;
                border-radius: 50%;
                border: 2.5px solid #cc55ff;
                overflow: hidden;
                box-shadow: 2px 2px 0px #1a0060;
                cursor: pointer;
            }
            .dl-topbar-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

            /* ── Content area ── */
            .dl-content {
                flex: 1;
                overflow-y: auto;
                position: relative;
                scrollbar-width: thin;
                scrollbar-color: rgba(204,85,255,0.3) transparent;
            }
            .dl-content::-webkit-scrollbar { width: 6px; }
            .dl-content::-webkit-scrollbar-track { background: transparent; }
            .dl-content::-webkit-scrollbar-thumb { background: rgba(204,85,255,0.3); border-radius: 4px; }

            /* Dot pattern on content */
            .dl-content-dots {
                position: absolute; inset: 0;
                background-image: radial-gradient(circle, rgba(26,0,96,0.08) 1.5px, transparent 1.5px);
                background-size: 28px 28px;
                pointer-events: none;
                z-index: 0;
            }
            .dl-content-inner {
                position: relative;
                z-index: 1;
                padding: 32px;
            }

            /* ── Mobile overlay ── */
            .dl-overlay {
                display: none;
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.55);
                z-index: 45;
                backdrop-filter: blur(2px);
            }

            /* ══ RESPONSIVE ══ */
            @media (max-width: 900px) {
                .dl-sidebar {
                    position: fixed !important;
                    top: 0; left: 0;
                    height: 100vh;
                    width: 256px !important;
                    transform: translateX(-100%);
                    transition: transform 0.28s cubic-bezier(0.22,1,0.36,1) !important;
                    z-index: 50;
                }
                .dl-sidebar.mobile-open {
                    transform: translateX(0);
                }
                .dl-hamburger { display: flex; }
                .dl-overlay { display: block; }
                .dl-topbar { padding: 0 16px; }
                .dl-content-inner { padding: 20px; }
                .dl-collapse-btn { display: none; }
                .dl-topbar-chip { display: none; }
            }
            `}</style>

            <div className="dl-root">

            {/* ══ SIDEBAR ══ */}
            <motion.aside
            className={`dl-sidebar${menuAbierto ? ' mobile-open' : ''}`}
            style={{ width: sidebarW }}
            initial={false}
            >
            {/* Header */}
            <div className="dl-sb-header">
            <div className="dl-sb-logo">
            <motion.img
            src={letrasImg}
            alt="NoManches Mx"
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.22 }}
            />
            </div>
            <button
            className={`dl-collapse-btn${collapsed ? ' rotated' : ''}`}
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? 'Expandir' : 'Colapsar'}
            >
            <ChevronRight size={15} />
            </button>
            </div>

            {/* User card */}
            <div className="dl-user-card">
            <div className="dl-avatar">
            <img src={mascotaImg} alt="Avatar" />
            </div>
            <AnimatePresence>
            {!collapsed && (
                <motion.div
                className="dl-user-info"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                >
                <p className="dl-user-name">{username}</p>
                <span className="dl-role-badge" style={{ background: rol.color }}>
                {rol.icon} {rol.label}
                </span>
                </motion.div>
            )}
            </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="dl-nav">
            {sections.map(section => (
                <div key={section}>
                <p className={`dl-section-label${collapsed ? ' hidden-label' : ''}`}>
                {section}
                </p>
                {menuFiltrado
                    .filter(m => m.section === section)
                    .map((item, i) => {
                        const activo = location.pathname === item.path;
                        return (
                            <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 + 0.1 }}
                            >
                            <Link
                            to={item.path}
                            onClick={() => setMenuAbierto(false)}
                            className={`dl-nav-link${activo ? ' active' : ''}`}
                            title={collapsed ? item.nombre : undefined}
                            >
                            <span className="dl-nav-icon">{item.icono}</span>
                            <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                className="dl-nav-label"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.18 }}
                                >
                                {item.nombre}
                                </motion.span>
                            )}
                            </AnimatePresence>
                            <span className="dl-active-dot" />
                            </Link>
                            </motion.div>
                        );
                    })
                }
                </div>
            ))}
            </nav>

            {/* Footer / Logout */}
            <div className="dl-sb-footer">
            <motion.button
            className="dl-logout-btn"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            title={collapsed ? 'Cerrar sesión' : undefined}
            >
            <span className="dl-logout-icon"><LogOut size={16} /></span>
            <AnimatePresence>
            {!collapsed && (
                <motion.span
                className="dl-logout-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                >
                Cerrar sesión
                </motion.span>
            )}
            </AnimatePresence>
            </motion.button>
            </div>
            </motion.aside>

            {/* ══ MAIN ══ */}
            <main className="dl-main">

            {/* Topbar */}
            <motion.header
            className="dl-topbar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            >
            <div className="dl-topbar-left">
            {/* Hamburger (mobile only) */}
            <button
            className="dl-hamburger"
            onClick={() => setMenuAbierto(true)}
            >
            <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="dl-breadcrumb">
            <span className="dl-breadcrumb-home">NoManches ERP</span>
            <span className="dl-breadcrumb-sep"><ChevronRight size={14} /></span>
            <span className="dl-breadcrumb-current">
            {menuFiltrado.find(m => m.path === location.pathname)?.nombre ?? 'Inicio'}
            </span>
            </div>
            </div>

            <div className="dl-topbar-right">
            {/* Role chip */}
            <div className="dl-topbar-chip" style={{ borderColor: `${rol.color}40` }}>
            <span style={{ color: rol.color, display: 'flex' }}>{rol.icon}</span>
            <span style={{ color: '#1a0060' }}>{rol.label}</span>
            </div>

            {/* Avatar */}
            <div className="dl-topbar-avatar">
            <img src={mascotaImg} alt="Avatar" />
            </div>
            </div>
            </motion.header>

            {/* Content */}
            <div className="dl-content">
            <div className="dl-content-dots" />
            <motion.div
            className="dl-content-inner"
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
            >
            <Outlet />
            </motion.div>
            </div>

            </main>

            {/* Mobile overlay */}
            <AnimatePresence>
            {menuAbierto && (
                <motion.div
                className="dl-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setMenuAbierto(false)}
                />
            )}
            </AnimatePresence>

            </div>
            </>
    );
}
