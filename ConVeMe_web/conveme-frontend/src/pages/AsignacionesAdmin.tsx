import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';

// Componentes y Servicios
import ModalAsignacion from '../components/inventario/ModalAsignacion';
import ActionModal from '../components/ui/ActionModal';
import type { ActionType } from '../components/ui/ActionModal';
import { getCortes, createCorte } from '../services/corte.service';
import { getAsignaciones } from '../services/asignacion.service';

import {
    Plus, ChevronDown, ChevronRight, Wallet,
    PackageOpen, Search, X, CheckCircle,
    ArrowUpDown, Loader2, Scale, Trash2, Pencil, AlertCircle
} from 'lucide-react';

import '../styles/Catalogos.css';

const TABS = [
    { id: 'cortes',       label: 'Historial de Cortes', icon: <Wallet size={16} /> },
{ id: 'asignaciones', label: 'Mercancía en Ruta',   icon: <PackageOpen size={16} /> },
];

const COLUMNAS: Record<string, { key: string; label: string; sortable?: boolean }[]> = {
    cortes: [
        { key: 'id_corte',    label: 'Folio' },
        { key: 'vendedor',    label: 'Vendedor',    sortable: true },
        { key: 'asignacion',  label: 'Asignación' },
        { key: 'entregado',   label: 'Entregado',   sortable: true },
        { key: 'diferencia',  label: 'Diferencia',  sortable: true },
        { key: 'fecha',       label: 'Fecha',       sortable: true },
    ],
    asignaciones: [
        { key: 'id_asignacion', label: 'Folio' },
        { key: 'vendedor',      label: 'Vendedor',    sortable: true },
        { key: 'fecha',         label: 'Entrega',     sortable: true },
        { key: 'piezas',        label: 'Total Piezas' },
        { key: 'estado',        label: 'Estado',      sortable: true },
    ],
};

interface Toast { msg: string; type: 'success' | 'delete' | 'error' }

export default function CortesAdmin() {
    const [tabActiva, setTabActiva] = useState('cortes');
    const [dropOpen, setDropOpen] = useState(false);

    // Modales
    const [isModalAsigOpen, setIsModalAsigOpen] = useState(false);
    const [isModalCorteOpen, setIsModalCorteOpen] = useState(false);

    // Data
    const [cortes, setCortes] = useState<any[]>([]);
    const [asignaciones, setAsignaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);

    // Estados para nuevo corte
    const [asigSel, setAsigSel] = useState<any>(null);
    const [dineroEntregado, setDineroEntregado] = useState<number | ''>('');
    const [observaciones, setObservaciones] = useState('');
    const [detallesInventario, setDetallesInventario] = useState<any[]>([]);
    const [guardandoCorte, setGuardandoCorte] = useState(false);

    const [actionModal, setActionModal] = useState<{isOpen: boolean; type: ActionType; title: string; subtitle: string; description?: string; onConfirm?: () => Promise<void>;}>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    const selectorRef = useRef<HTMLDivElement>(null);
    const tabActual = TABS.find(t => t.id === tabActiva)!;
    const columnas = COLUMNAS[tabActiva] ?? [];

    useEffect(() => {
        cargarDatos();
        const handler = (e: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) setDropOpen(false);
        };
            document.addEventListener('mousedown', handler);
            return () => document.removeEventListener('mousedown', handler);
    }, [tabActiva]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [cortesData, asigs] = await Promise.all([getCortes(), getAsignaciones()]);
            setCortes(cortesData);
            setAsignaciones(asigs);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleSort = (key: string) => {
        if (sortKey === key) setSortAsc(v => !v);
        else { setSortKey(key); setSortAsc(true); }
    };

    // Lógica de Selección para Corte
    const handleSeleccionarAsignacion = (id: string) => {
        const asig = asignaciones.find(a => a.id_asignacion === Number(id));
        setAsigSel(asig);
        if (asig) {
            setDetallesInventario(asig.detalles.map((d: any) => ({
                producto_id: d.producto.id_producto,
                nombre: d.producto.nombre,
                precio_unitario: d.producto.precio_unitario || 0,
                cantidad_asignada: d.cantidad_asignada,
                cantidad_vendida: 0,
                cantidad_devuelta: d.cantidad_asignada,
                merma_reportada: 0
            })));
        }
    };

    const handleGuardarCorte = async () => {
        if (!asigSel) return;
        setGuardandoCorte(true);
        try {
            const esperado = detallesInventario.reduce((acc, d) => acc + (d.cantidad_vendida * d.precio_unitario), 0);
            await createCorte({
                vendedor_id: asigSel.vendedor.id_vendedor,
                asignacion_id: asigSel.id_asignacion,
                dinero_esperado: esperado,
                dinero_total_entregado: Number(dineroEntregado),
                              diferencia_corte: Number(dineroEntregado) - esperado,
                              observaciones,
                              detalles: detallesInventario.map(d => ({
                                  producto_id: d.producto_id,
                                  cantidad_vendida: d.cantidad_vendida,
                                  cantidad_devuelta: d.cantidad_devuelta,
                                  merma_reportada: d.merma_reportada
                              }))
            });
            setIsModalCorteOpen(false);
            cargarDatos();
            setActionModal({ isOpen: true, type: 'success', title: 'Corte Exitoso', subtitle: 'La cuenta ha sido liquidada.' });
        } catch (e) { console.error(e); }
        finally { setGuardandoCorte(false); }
    };

    const datosTablaActual = tabActiva === 'cortes' ? cortes : asignaciones;
    const totalRegistros = datosTablaActual.length;

    return (
        <div className="cat-root">
        <UserGreeting />

        <div className="cat-header">
        <div className="cat-header-text">
        <h1>Cortes y Asignaciones</h1>
        <p>Gestiona la mercancía en ruta y realiza las conciliaciones de ventas.</p>
        </div>

        <div className="flex gap-3">
        <motion.button
        className="cat-add-btn"
        style={{ backgroundColor: '#06d6a0' }}
        onClick={() => setIsModalAsigOpen(true)}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        >
        <Plus size={17} /> Nueva Asignación
        </motion.button>
        <motion.button
        className="cat-add-btn"
        onClick={() => { setAsigSel(null); setIsModalCorteOpen(true); }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        >
        <Scale size={17} /> Realizar Corte
        </motion.button>
        </div>
        </div>

        {/* Selector de Categoría (Tabs) */}
        <div className="cat-selector-wrap" ref={selectorRef}>
        <button className="cat-selector-btn" onClick={() => setDropOpen(!dropOpen)}>
        <span className="cat-selector-icon">{tabActual.icon}</span>
        <span className="cat-selector-label">
        <span className="cat-selector-sublabel">Vista actual</span>
        <span className="cat-selector-name">{tabActual.label}</span>
        </span>
        <ChevronDown size={18} className={`cat-chevron${dropOpen ? ' open' : ''}`} />
        </button>

        <AnimatePresence>
        {dropOpen && (
            <motion.div className="cat-dropdown" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {TABS.map(tab => (
                <button key={tab.id} className={`cat-drop-item${tabActiva === tab.id ? ' active' : ''}`} onClick={() => { setTabActiva(tab.id); setDropOpen(false); }}>
                <span className="cat-drop-item-icon">{tab.icon}</span>
                <span className="cat-drop-item-label">{tab.label}</span>
                <ChevronRight size={14} className="cat-drop-check" />
                </button>
            ))}
            </motion.div>
        )}
        </AnimatePresence>
        </div>

        {/* Tabla Principal */}
        <motion.div key={tabActiva} className="cat-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div className="cat-card-header">
        <div className="cat-card-header-left">
        <span className="cat-card-title-icon">{tabActual.icon}</span>
        <span className="cat-card-title">{tabActual.label}</span>
        <span className="cat-count-badge">{totalRegistros} registros</span>
        </div>
        <div className="cat-card-header-right">
        <div className="cat-search-wrap">
        <Search size={13} />
        <input className="cat-search-input" placeholder={`Buscar en ${tabActual.label.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        </div>
        </div>

        <div className="cat-table-scroll">
        <table className="cat-table">
        <thead>
        <tr>
        {columnas.map(col => (
            <th key={col.key} className={col.sortable ? 'cat-th-sortable' : ''} onClick={() => col.sortable && handleSort(col.key)}>
            <div className="cat-th-inner">
            {col.label}
            {col.sortable && <ArrowUpDown size={11} className="cat-sort-icon" />}
            </div>
            </th>
        ))}
        <th style={{ textAlign: 'right', paddingRight: 20 }}>Acciones</th>
        </tr>
        </thead>
        <tbody>
        {loading ? (
            <tr><td colSpan={columnas.length + 1} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></td></tr>
        ) : (
            datosTablaActual.map((item, i) => (
                <motion.tr key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                {tabActiva === 'cortes' ? (
                    <>
                    <td className="font-bold">#C-{item.id_corte}</td>
                    <td style={{ color: '#cc55ff', fontWeight: 600 }}>{item.vendedor?.nombre_completo}</td>
                    <td>Asig. #{item.asignacion?.id_asignacion}</td>
                    <td style={{ color: '#06d6a0', fontWeight: 800 }}>${item.dinero_total_entregado}</td>
                    <td className={item.diferencia_corte < 0 ? 'text-red-500' : ''}>${item.diferencia_corte}</td>
                    <td>{new Date(item.fecha_corte).toLocaleDateString()}</td>
                    </>
                ) : (
                    <>
                    <td className="font-bold">#A-{item.id_asignacion}</td>
                    <td style={{ color: '#cc55ff', fontWeight: 600 }}>{item.vendedor?.nombre_completo}</td>
                    <td>{new Date(item.fecha_asignacion).toLocaleDateString()}</td>
                    <td>{item.detalles?.reduce((acc: number, d: any) => acc + d.cantidad_asignada, 0)} piezas</td>
                    <td>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${item.estado === 'Activa' ? 'bg-[#f8f5ff] text-[#cc55ff]' : 'bg-gray-100 text-gray-400'}`}>
                    {item.estado}
                    </span>
                    </td>
                    </>
                )}
                <td className="text-right">
                <div className="cat-actions justify-end">
                <button className="cat-action-btn"><Pencil size={13} /></button>
                <button className="cat-action-btn danger"><Trash2 size={13} /></button>
                </div>
                </td>
                </motion.tr>
            ))
        )}
        </tbody>
        </table>
        </div>
        </motion.div>

        {/* Modales Reutilizados */}
        <ModalAsignacion
        isOpen={isModalAsigOpen}
        onClose={() => setIsModalAsigOpen(false)}
        onSuccess={() => { cargarDatos(); setTabActiva('asignaciones'); }}
        />

        {/* Action Modal para Avisos */}
        <ActionModal
        isOpen={actionModal.isOpen}
        type={actionModal.type}
        title={actionModal.title}
        subtitle={actionModal.subtitle}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        />
        </div>
    );
}
