import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';
import {
    Users, Package, ShoppingCart, TrendingUp, ArrowRight,
    Scissors, Star, ClipboardList, Truck, Wallet, CalendarClock
} from 'lucide-react';
import '../styles/DashboardHome.css';
import DashboardPredicciones from './DashboardPredicciones';

export default function DashboardHome() {
    const rolId = Number(localStorage.getItem('rol_id'));

    const cards = [
        {
            show:    rolId === 1,
            to:      '/catalogos',
            bg:      '#cc55ff',
            accent:  '#1a0060',
            textCol: '#fff',
            subCol:  'rgba(255,255,255,0.75)',
            icon:    <Users size={28} />,
            label:   'Administración',
            title:   'Añadir (Catálogos)',
            sub:     'Escuelas, Empleados, Cuentas Bancarias, Eventos, Vendedores',
            tag:     'Gestión',
            tagBg:   'rgba(255,255,255,0.22)',
            tagCol:  '#fff',
            stat:    'Registra ahora!',
            statIcon:<Star size={20} />,
        },
        {
            show:    rolId === 1 || rolId === 2,
            to:      '/pos',
            bg:      '#06d6a0',
            accent:  '#1a0060',
            textCol: '#1a0060',
            subCol:  'rgba(26,0,96,0.6)',
            icon:    <ShoppingCart size={28} />,
            label:   'Ventas',
            title:   'Punto de Venta',
            sub:     'Registra y gestiona nuevas ventas rápidas',
            tag:     'Venta',
            tagBg:   'rgba(26,0,96,0.12)',
            tagCol:  '#1a0060',
            stat:    'Tiempo real',
            statIcon:<TrendingUp size={20} />,
        },
        {
            show:    rolId === 1 || rolId === 2,
            to:      '/pedidos-admin',
            bg:      '#00b4d8',
            accent:  '#1a0060',
            textCol: '#fff',
            subCol:  'rgba(255,255,255,0.8)',
            icon:    <ClipboardList size={28} />,
            label:   'Apartados',
            title:   'Pedidos Clientes',
            sub:     'Gestiona anticipos y entregas programadas',
            tag:     'Pedidos',
            tagBg:   'rgba(255,255,255,0.2)',
            tagCol:  '#fff',
            stat:    'Pendientes',
            statIcon:<CalendarClock size={16} />,
        },
        {
            show:    rolId === 1,
            to:      '/asignaciones-admin',
            bg:      '#1a0060',
            accent:  '#06d6a0',
            textCol: '#fff',
            subCol:  'rgba(255,255,255,0.6)',
            icon:    <Truck size={28} />,
            label:   'Vendedores',
            title:   'Asignaciones',
            sub:     'Entrega mercancía a vendedores externos',
            tag:     'Ruta',
            tagBg:   'rgba(6,214,160,0.2)',
            tagCol:  '#06d6a0',
            stat:    'En ruta',
            statIcon:<Package size={14} />,
        },
        {
            show:    rolId === 1,
            to:      '/cortes-admin',
            bg:      '#ffbe0b',
            accent:  '#1a0060',
            textCol: '#1a0060',
            subCol:  'rgba(26,0,96,0.6)',
            icon:    <Wallet size={28} />,
            label:   'Finanzas',
            title:   'Realizar Corte',
            sub:     'Conciliación de mercancía y cobranza',
            tag:     'Cierre',
            tagBg:   'rgba(26,0,96,0.1)',
            tagCol:  '#1a0060',
            stat:    'Liquidar',
            statIcon:<TrendingUp size={16} />,
        },
        {
            show:    rolId === 1 || rolId === 3,
            to:      '/inventario',
            bg:      '#ffe144',
            accent:  '#1a0060',
            textCol: '#1a0060',
            subCol:  'rgba(26,0,96,0.6)',
            icon:    <Package size={28} />,
            label:   'Stock',
            title:   'Inventario',
            sub:     'Control de stock de pines y stickers',
            tag:     'Logística',
            tagBg:   'rgba(26,0,96,0.1)',
            tagCol:  '#1a0060',
            stat:    'En vivo',
            statIcon:<Package size={12} />,
        },
        {
            show:    rolId === 1 || rolId === 3,
            to:      '/produccion',
            bg:      '#000',
            accent:  '#cc55ff',
            textCol: '#fff',
            subCol:  'rgba(255,255,255,0.55)',
            icon:    <Scissors size={28} />,
            label:   'Producción',
            title:   'Taller',
            sub:     'Seguimiento de impresión y armado',
            tag:     'Proceso',
            tagBg:   'rgba(204,85,255,0.18)',
            tagCol:  '#cc55ff',
            stat:    'Fabricando',
            statIcon:<Scissors size={12} />,
        },
    ].filter(c => c.show);

    return (
        <div className="dh-root">
        <UserGreeting />

        <motion.div
        className="dh-strip"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        >
        {[
            { icon: <TrendingUp size={18} />, num: 'Hoy',  label: 'Actividad'    },
            { icon: <Users      size={18} />, num: rolId === 1 ? 'Admin' : rolId === 2 ? 'Ventas' : 'Prod.', label: 'Tu rol' },
        ].map((chip, i) => (
            <motion.div
            key={i}
            className="dh-strip-chip"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 200 }}
            >
            <div className="dh-strip-icon">{chip.icon}</div>
            <div className="dh-strip-text">
            <span className="dh-strip-num">{chip.num}</span>
            <span className="dh-strip-label">{chip.label}</span>
            </div>
            </motion.div>
        ))}
        </motion.div>

        <motion.div
        className="dh-section-head"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        >
        <p className="dh-section-title">Panel de Control</p>
        <span className="dh-section-count">{cards.length} módulos activos</span>
        </motion.div>

        <div className="dh-grid">
        {cards.map((card, i) => (
            <motion.div
            key={card.to}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 180, damping: 18 }}
            >
            <Link to={card.to} className="dh-card" style={{ background: card.bg }}>
            <span className="dh-tag" style={{ background: card.tagBg, color: card.tagCol }}>
            {card.tag}
            </span>

            <div className="dh-icon-wrap" style={{ color: card.textCol }}>
            {card.icon}
            </div>

            <h3 className="dh-card-title" style={{ color: card.textCol }}>
            {card.title}
            </h3>
            <p className="dh-card-sub" style={{ color: card.subCol }}>
            {card.sub}
            </p>

            <div className="dh-card-footer">
            <span className="dh-stat" style={{ color: card.textCol }}>
            {card.statIcon} {card.stat}
            </span>
            <div className="dh-arrow" style={{ color: card.textCol }}>
            <ArrowRight size={15} />
            </div>
            </div>
            </Link>
            </motion.div>
        ))}
        </div>

        {/* SECCIÓN DE PREDICCIONES (Laplace) - Solo Admin */}
        {rolId === 1 && (
            <motion.div
            className="mt-12 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
            >
            <div className="dh-section-head">
            <p className="dh-section-title">Inteligencia de Negocio</p>
            <span className="dh-section-count">Powered by Laplace</span>
            </div>

            <DashboardPredicciones />
            </motion.div>
        )}

        </div>
    );
}
