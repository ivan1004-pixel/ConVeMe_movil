import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';

// Componentes y Servicios
import ModalAsignacion from '../components/inventario/ModalAsignacion';
import ModalCorte from '../components/inventario/ModalCorte';
import ActionModal from '../components/ui/ActionModal';
import type { ActionType } from '../components/ui/ActionModal';

import { getCortes, createCorte, deleteCorte } from '../services/corte.service';
import { getAsignaciones, deleteAsignacion } from '../services/asignacion.service';

import {
    Plus, ChevronDown, ChevronRight, Wallet,
    PackageOpen, Search, X, CheckCircle,
    ArrowUpDown, Loader2, Scale, Trash2, Pencil, AlertCircle, PackagePlus
} from 'lucide-react';

import '../styles/Catalogos.css';

const TABS = [
    { id: 'cortes',       label: 'Historial de Cortes', icon: <Wallet size={16} /> },
{ id: 'asignaciones', label: 'Mercancía en Ruta',   icon: <PackageOpen size={16} /> },
];

export default function CortesAdmin() {
    const [tabActiva, setTabActiva] = useState('cortes');

    // Modales
    const [isModalAsigOpen, setIsModalAsigOpen] = useState(false);
    const [isModalCorteOpen, setIsModalCorteOpen] = useState(false);

    // Data (Máximo 50 registros cargados desde el backend en tiempo real)
    const [cortes, setCortes] = useState<any[]>([]);
    const [asignaciones, setAsignaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Edición
    const [asigAEditar, setAsigAEditar] = useState<any>(null);
    const [corteAEditar, setCorteAEditar] = useState<any>(null);

    const [actionModal, setActionModal] = useState<{isOpen: boolean; type: ActionType; title: string; subtitle: string; description?: string; itemName?: string; onConfirm?: () => Promise<void>;}>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    // 👇 AQUÍ ESTÁ LA MAGIA: Espera 500ms al teclear y manda buscar al backend
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            cargarDatos(search);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, tabActiva]);

    // 👇 Ahora la función recibe el texto y se lo envía a las peticiones
    const cargarDatos = async (terminoBusqueda = search) => {
        setLoading(true);
        try {
            const [cortesData, asigs] = await Promise.all([
                getCortes(terminoBusqueda),
                                                          getAsignaciones(terminoBusqueda)
            ]);
            setCortes(cortesData);
            setAsignaciones(asigs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const closeAction = () => setActionModal(p => ({ ...p, isOpen: false }));

    // --- ACCIONES ---
    const handleDeleteCorte = (corte: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete', title: 'Eliminar Corte',
            subtitle: `¿Eliminar el corte #C-${corte.id_corte}?`,
            description: 'Se eliminará el registro.',
            itemName: `#C-${corte.id_corte} — ${corte.vendedor?.nombre_completo}`,
            onConfirm: async () => {
                await deleteCorte(corte.id_corte);
                await cargarDatos();
                setActionModal({ isOpen: true, type: 'success-delete', title: 'Corte eliminado', subtitle: 'El registro fue eliminado.' });
                setTimeout(closeAction, 2200);
            },
        });
    };

    const handleDeleteAsignacion = (asig: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete', title: 'Eliminar Asignación',
            subtitle: `¿Eliminar el folio #A-${asig.id_asignacion}?`,
            description: 'Se eliminará la asignación y sus detalles.',
            itemName: `#A-${asig.id_asignacion} — ${asig.vendedor?.nombre_completo}`,
            onConfirm: async () => {
                await deleteAsignacion(asig.id_asignacion);
                await cargarDatos();
                setActionModal({ isOpen: true, type: 'success-delete', title: 'Asignación eliminada', subtitle: 'El folio fue removido.' });
                setTimeout(closeAction, 2200);
            },
        });
    };

    const handleEditarAsignacion = (asig: any) => { setAsigAEditar(asig); setIsModalAsigOpen(true); };
    const abrirNuevaAsignacion = () => { setAsigAEditar(null); setIsModalAsigOpen(true); };
    const handleEditarCorte = (corte: any) => { setCorteAEditar(corte); setIsModalCorteOpen(true); };
    const abrirNuevoCorte = () => { setCorteAEditar(null); setIsModalCorteOpen(true); };

    return (
        <>
        <style>{`
            .tbl-edit-btn { display:inline-flex;align-items:center;gap:5px;background:rgba(26,0,96,0.08);color:rgba(26,0,96,0.8);border:1.5px solid rgba(26,0,96,0.2);border-radius:8px;padding:5px 10px;font-family:'Syne',sans-serif;font-weight:800;font-size:10px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;transition:all .15s; }
            .tbl-edit-btn:hover { background:#1a0060;color:#ffe144;border-color:#1a0060; }
            .tbl-del-btn { display:inline-flex;align-items:center;gap:5px;background:rgba(255,80,80,0.08);color:rgba(255,80,80,0.8);border:1.5px solid rgba(255,80,80,0.2);border-radius:8px;padding:5px 10px;font-family:'Syne',sans-serif;font-weight:800;font-size:10px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;transition:all .15s; }
            .tbl-del-btn:hover { background:#ff5050;color:#fff;border-color:#ff5050; }
            `}</style>

            <div className="cat-root">
            <UserGreeting />

            {/* ENCABEZADO */}
            <div className="cat-header mb-2 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="cat-header-text">
            <h1>Operaciones de Vendedores</h1>
            <p>Gestiona entregas de mercancía y liquidaciones.</p>
            </div>
            <div className="flex gap-3">
            <button className="cat-add-btn shadow-md font-black" style={{ backgroundColor: '#06d6a0', color: '#1a0060' }} onClick={abrirNuevaAsignacion}>
            <PackagePlus size={18} strokeWidth={3} /> Entregar Mercancía
            </button>
            <button className="cat-add-btn shadow-md font-black" style={{ backgroundColor: '#1a0060', color: '#06d6a0' }} onClick={abrirNuevoCorte}>
            <Scale size={18} strokeWidth={3} /> Realizar Corte
            </button>
            </div>
            </div>

            {/* PESTAÑAS */}
            <div className="flex gap-6 border-b-2 border-[#1a0060]/10 mb-6 mt-4 px-2">
            <button className={`pb-3 font-black text-sm transition-all flex items-center gap-2 ${tabActiva === 'cortes' ? 'border-b-4 border-[#cc55ff] text-[#cc55ff]' : 'text-gray-400 hover:text-[#1a0060]'}`} onClick={() => setTabActiva('cortes')}>
            <Wallet size={18} /> Historial de Cortes
            </button>
            <button className={`pb-3 font-black text-sm transition-all flex items-center gap-2 ${tabActiva === 'asignaciones' ? 'border-b-4 border-[#cc55ff] text-[#cc55ff]' : 'text-gray-400 hover:text-[#1a0060]'}`} onClick={() => setTabActiva('asignaciones')}>
            <PackageOpen size={18} /> Mercancía Asignada
            </button>
            </div>

            {/* TABLAS */}
            <motion.div key={tabActiva} className="cat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="cat-card-header">
            <div className="cat-card-header-left">
            <span className="cat-card-title uppercase font-black text-[#1a0060] tracking-widest text-sm">
            {tabActiva === 'cortes' ? 'Historial de Cortes' : 'Mercancía en Ruta'}
            </span>
            <span className="cat-count-badge font-bold">
            {tabActiva === 'cortes' ? cortes.length : asignaciones.length} resultados
            </span>
            </div>
            <div className="cat-search-wrap">
            <Search size={14} className="text-gray-400" />
            <input className="cat-search-input font-bold text-[#1a0060] placeholder-gray-400" placeholder="Buscar por vendedor o folio..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            </div>

            <div className="cat-table-scroll p-4 pt-0">
            {loading ? <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-[#1a0060]" size={32} /></div> : (
                tabActiva === 'cortes' ? (
                    <table className="cat-table">
                    <thead>
                    <tr><th className="uppercase tracking-widest text-xs">Folio</th><th className="uppercase tracking-widest text-xs">Vendedor</th><th className="uppercase tracking-widest text-xs">Asignación</th><th className="uppercase tracking-widest text-xs">Esperado (Neto)</th><th className="uppercase tracking-widest text-xs">Entregado</th><th className="uppercase tracking-widest text-xs">Diferencia</th><th className="uppercase tracking-widest text-xs">Fecha</th><th className="uppercase tracking-widest text-xs text-center">Acciones</th></tr>
                    </thead>
                    <tbody>
                    {/* 👇 AQUÍ USAMOS 'cortes' DIRECTAMENTE, EL BACKEND HIZO EL TRABAJO */}
                    {cortes.map(c => (
                        <tr key={c.id_corte}>
                        <td className="font-black text-[#1a0060]">#C-{c.id_corte}</td>
                        <td className="font-bold text-[#cc55ff]">{c.vendedor?.nombre_completo}</td>
                        <td className="font-bold text-gray-500">Asig. #{c.asignacion?.id_asignacion}</td>
                        <td className="font-black text-blue-600">${Number(c.dinero_esperado).toFixed(2)}</td>
                        <td className="font-black text-[#06d6a0]">${Number(c.dinero_total_entregado).toFixed(2)}</td>
                        <td className={`font-black text-sm ${c.diferencia_corte < 0 ? 'text-red-500' : 'text-gray-500'}`}>{c.diferencia_corte < 0 ? `- $${Math.abs(c.diferencia_corte)}` : `$${c.diferencia_corte}`}</td>
                        <td className="text-xs font-bold text-gray-400">{new Date(c.fecha_corte).toLocaleDateString('es-MX')}</td>
                        <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button className="tbl-edit-btn" onClick={() => handleEditarCorte(c)}><Pencil size={13}/> Editar</button>
                        <button className="tbl-del-btn" onClick={() => handleDeleteCorte(c)}><Trash2 size={13}/> Eliminar</button>
                        </div>
                        </td>
                        </tr>
                    ))}
                    {cortes.length === 0 && <tr><td colSpan={8} className="text-center py-6 text-gray-400 font-bold">No se encontraron cortes.</td></tr>}
                    </tbody>
                    </table>
                ) : (
                    <table className="cat-table">
                    <thead>
                    <tr><th className="uppercase tracking-widest text-xs">Folio</th><th className="uppercase tracking-widest text-xs">Vendedor</th><th className="uppercase tracking-widest text-xs">Fecha de Entrega</th><th className="uppercase tracking-widest text-xs">Total Piezas</th><th className="uppercase tracking-widest text-xs">Estado</th><th className="uppercase tracking-widest text-xs text-center">Acciones</th></tr>
                    </thead>
                    <tbody>
                    {/* 👇 AQUÍ USAMOS 'asignaciones' DIRECTAMENTE */}
                    {asignaciones.map(asig => {
                        const totalPiezas = asig.detalles?.reduce((s: number, d: any) => s + d.cantidad_asignada, 0) || 0;
                        return (
                            <tr key={asig.id_asignacion}>
                            <td className="font-black text-[#1a0060]">#A-{asig.id_asignacion}</td>
                            <td className="font-bold text-[#cc55ff]">{asig.vendedor?.nombre_completo}</td>
                            <td className="text-xs font-bold text-gray-400">{new Date(asig.fecha_asignacion).toLocaleDateString('es-MX')}</td>
                            <td className="font-black text-gray-500">{totalPiezas} piezas</td>
                            <td><span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${asig.estado === 'Activa' ? 'bg-[#06d6a0] text-white' : 'bg-gray-200 text-gray-500'}`}>{asig.estado}</span></td>
                            <td>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button className="tbl-edit-btn" onClick={() => handleEditarAsignacion(asig)}><Pencil size={13}/> Editar</button>
                            <button className="tbl-del-btn" onClick={() => handleDeleteAsignacion(asig)}><Trash2 size={13}/> Eliminar</button>
                            </div>
                            </td>
                            </tr>
                        );
                    })}
                    {asignaciones.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-gray-400 font-bold">No se encontraron asignaciones.</td></tr>}
                    </tbody>
                    </table>
                )
            )}
            </div>
            </motion.div>

            {/* --- MODALES --- */}
            <ModalCorte
            isOpen={isModalCorteOpen}
            onClose={() => setIsModalCorteOpen(false)}
            corteAEditar={corteAEditar}
            onSuccess={() => {
                cargarDatos();
                setActionModal({ isOpen: true, type: 'success', title: 'Corte Exitoso', subtitle: corteAEditar ? 'Corte actualizado correctamente.' : 'La cuenta se ha cerrado.' });
                setTimeout(closeAction, 2500);
            }}
            />

            <ModalAsignacion
            isOpen={isModalAsigOpen}
            onClose={() => setIsModalAsigOpen(false)}
            asigAEditar={asigAEditar}
            onSuccess={() => {
                cargarDatos();
                setActionModal({ isOpen: true, type: 'success', title: 'Éxito', subtitle: asigAEditar ? 'Asignación actualizada.' : 'Asignación creada.' });
                setTimeout(closeAction, 2500);
            }}
            />

            <ActionModal isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle} description={actionModal.description} itemName={actionModal.itemName} onClose={closeAction} onConfirm={actionModal.onConfirm} />
            </div>
            </>
    );
}
