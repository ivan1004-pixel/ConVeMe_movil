import { motion } from 'framer-motion';
import mascotaImg from '../../assets/mascota.jpg';

const IconWave = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
);

export default function UserGreeting() {
    const username = localStorage.getItem('username') || 'NoMancherito';

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

            .ug-wrap {
                display: inline-flex;
                align-items: center;
                gap: 0;
                position: relative;
            }

            /* Avatar pill */
            .ug-avatar {
                width: 52px;
                height: 52px;
                border-radius: 50%;
                border: 3px solid #1a0060;
                overflow: hidden;
                flex-shrink: 0;
                box-shadow: 4px 4px 0px #1a0060;
                position: relative;
                z-index: 2;
            }
            .ug-avatar img {
                width: 100%; height: 100%;
                object-fit: cover;
                display: block;
            }

            /* Main badge */
            .ug-badge {
                display: flex;
                align-items: center;
                gap: 12px;
                background: #ffe144;
                border: 3px solid #1a0060;
                border-left: none;
                border-radius: 0 16px 16px 0;
                padding: 10px 20px 10px 16px;
                box-shadow: 5px 5px 0px #1a0060;
                margin-left: -6px;
                position: relative;
                z-index: 1;
            }

            .ug-icon {
                display: flex;
                align-items: center;
                color: #1a0060;
                opacity: 0.5;
                flex-shrink: 0;
            }

            .ug-text {
                display: flex;
                flex-direction: column;
                gap: 0px;
                min-width: 0;
            }
            .ug-label {
                font-family: 'DM Sans', sans-serif;
                font-weight: 600;
                font-size: 10px;
                letter-spacing: .12em;
                text-transform: uppercase;
                color: rgba(26,0,96,0.5);
                line-height: 1;
                margin-bottom: 2px;
            }
            .ug-name {
                font-family: 'Syne', sans-serif;
                font-weight: 900;
                font-size: clamp(16px, 2vw, 22px);
                color: #1a0060;
                line-height: 1.1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 240px;
            }

            /* Pulse ring on avatar */
            @keyframes ug-pulse {
                0%   { transform: scale(1);   opacity: 0.6; }
                100% { transform: scale(1.65); opacity: 0; }
            }
            .ug-avatar-ring {
                position: absolute;
                inset: -5px;
                border-radius: 50%;
                border: 2.5px solid rgba(204,85,255,0.6);
                animation: ug-pulse 2.4s ease-out infinite;
                pointer-events: none;
                z-index: 3;
            }
            `}</style>

            <motion.div
            className="ug-wrap"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
            {/* Avatar */}
            <motion.div
            className="ug-avatar"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            >
            <img src={mascotaImg} alt="Avatar" />
            <div className="ug-avatar-ring" />
            </motion.div>

            {/* Badge */}
            <motion.div
            className="ug-badge"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
            >
            <span className="ug-icon"><IconWave /></span>
            <div className="ug-text">
            <span className="ug-label">Bienvenido de vuelta</span>
            <span className="ug-name">¡Hola, {username}!</span>
            </div>
            </motion.div>
            </motion.div>
            </>
    );
}
