import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';
import {
    ShoppingCart, TrendingUp, ArrowRight, PackagePlus,
    Wallet, UserCircle, Receipt, Star, User
} from 'lucide-react';
import '../styles/DashboardHome.css';
import { getVendedorByUsuarioId } from '../services/vendedor.service';

export default function DashboardVendedor() {

    // Al cargar el Dashboard, buscamos el id_vendedor
    useEffect(() => {
        const vincularVendedor = async () => {
            const usuarioId = localStorage.getItem('id_usuario');
            // Si no hay usuario logueado o ya tiene guardado el id_vendedor, no hace nada
            if (!usuarioId || localStorage.getItem('id_vendedor')) return;

            try {
                const vendedor = await getVendedorByUsuarioId(Number(usuarioId));
                if (vendedor) {
                    localStorage.setItem('id_vendedor', vendedor.id_vendedor.toString());
                }
            } catch (error) {
                console.error("Error al vincular perfil de vendedor", error);
            }
        };

        vincularVendedor();
    }, []);

    // Definimos las "Cards" específicas para el Vendedor
    const cards = [
        {
            to:      '/pos',
            bg:      '#06d6a0',
            accent:  '#1a0060',
            textCol: '#1a0060',
            subCol:  'rgba(26,0,96,0.6)',
            icon:    <ShoppingCart size={28} />,
            label:   'Ventas',
            title:   'Punto de Venta',
            sub:     'Registra tus ventas y cobra a los clientes al instante.',
            tag:     'Venta',
            tagBg:   'rgba(26,0,96,0.12)',
            tagCol:  '#1a0060',
            stat:    'Nueva Venta',
            statIcon:<TrendingUp size={20} />,
        },
        {
            to:      '/mis-pedidos',
            bg:      '#00b4d8',
            accent:  '#1a0060',
            textCol: '#fff',
            subCol:  'rgba(255,255,255,0.8)',
            icon:    <PackagePlus size={28} />,
            label:   'Stock',
            title:   'Solicitar Mercancía',
            sub:     'Haz un pedido al administrador para surtir tu inventario.',
            tag:     'Pedidos',
            tagBg:   'rgba(255,255,255,0.2)',
            tagCol:  '#fff',
            stat:    'Ver Estatus',
            statIcon:<Star size={16} />,
        },
        {
            to:      '/mis-finanzas',
            bg:      '#ffbe0b',
            accent:  '#1a0060',
            textCol: '#1a0060',
            subCol:  'rgba(26,0,96,0.6)',
            icon:    <Wallet size={28} />,
            label:   'Ingresos',
            title:   'Finanzas & Comprobantes',
            sub:     'Revisa tu historial de ventas, pagos recibidos y recibos de mercancía.',
            tag:     'Cuentas',
            tagBg:   'rgba(26,0,96,0.1)',
            tagCol:  '#1a0060',
            stat:    'Ver Detalles',
            statIcon:<Receipt size={16} />,
        },

    ];

    return (
        <div className="dh-root">
        <UserGreeting />

        {/* Tira de información rápida */}
        <motion.div
        className="dh-strip"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        >
        {[
            { icon: <TrendingUp size={18} />, num: 'Hoy',  label: 'Tus Ventas'    },
            { icon: <UserCircle size={18} />, num: 'Vendedor', label: 'Rol Actual' },
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
        <p className="dh-section-title">Tu Espacio de Trabajo</p>
        <span className="dh-section-count">{cards.length} herramientas</span>
        </motion.div>

        {/* Grid de Tarjetas usando tu CSS exacto */}
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

        </div>
    );
}
