import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';
import ActionModal from '../components/ui/ActionModal';
import type { ActionType } from '../components/ui/ActionModal';

// Servicios
import { getOrdenesProduccion, createOrdenProduccion, updateOrdenProduccion } from '../services/produccion.service';
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from '../services/insumo.service';

// Modales
import ModalOrdenProduccion from '../components/catalogos/ModalOrdenProduccion';
import ModalInsumo from '../components/produccion/ModalInsumo'; // El que acabamos de crear

import {
    Plus, ChevronDown, Scissors, ChevronRight,
    Search, X, CheckCircle, ArrowUpDown, Loader2, Trash2, Package,
    Box, AlertTriangle, Pencil
} from 'lucide-react';

import '../styles/Catalogos.css';

const TABS = [
    { id: 'ordenes', label: 'Órdenes de Producción', icon: <Scissors size={16} /> },
{ id: 'insumos', label: 'Materia Prima (Insumos)', icon: <Box size={16} /> },
];

const COLUMNAS: Record<string, any[]> = {
    ordenes: [
        { key: 'id_orden_produccion', label: 'ID' },
        { key: 'producto', label: 'PRODUCTO', sortable: true },
        { key: 'cantidad', label: 'CANTIDAD', sortable: true },
        { key: 'empleado', label: 'ARTESANO', sortable: true },
        { key: 'estado', label: 'ESTADO', sortable: true },
    ],
    insumos: [
        { key: 'id_insumo', label: 'ID' },
        { key: 'nombre', label: 'MATERIAL', sortable: true },
        { key: 'stock_actual', label: 'STOCK ACTUAL', sortable: true },
        { key: 'stock_minimo_alerta', label: 'ALERTA MÍNIMA', sortable: true },
    ]
};

interface Toast { msg: string; type: 'success' | 'delete' | 'error' }

function ToastPortal({ toast }: { toast: Toast | null }) {
    return createPortal(
        <AnimatePresence>
        {toast && (
            <motion.div className="cat-toast" initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
            <span className="cat-toast-icon" style={{ color: toast.type === 'success' ? '#06d6a0' : '#ff5050' }}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <Trash2 size={16} />}
            </span>
            {toast.msg}
            <div className="cat-toast-bar" />
            </motion.div>
        )}
        </AnimatePresence>,
        document.body
    );
}

export default function Produccion() {
    const [tabActiva, setTabActiva] = useState('ordenes');
    const [dropOpen, setDropOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    // Estados de los Modales
    const [isModalOrdenOpen, setIsModalOrdenOpen] = useState(false);
    const [isModalInsumoOpen, setIsModalInsumoOpen] = useState(false);
    const [insumoEditando, setInsumoEditando] = useState<any | null>(null);

    // Data
    const [datosOrdenes, setDatosOrdenes] = useState<any[]>([]);
    const [datosInsumos, setDatosInsumos] = useState<any[]>([]);
    const [loadingDatos, setLoadingDatos] = useState(false);

    // Search & sort
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);

    const [toast, setToast] = useState<Toast | null>(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const addRef = useRef<HTMLDivElement>(null);

    // Modal Action (Confirmaciones y borrados)
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        type: ActionType;
        title: string;
        subtitle: string;
        description?: string;
        itemName?: string;
        onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    const tabActual = TABS.find(t => t.id === tabActiva)!;
    const columnasActivas = COLUMNAS[tabActiva];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) setDropOpen(false);
            if (addRef.current && !addRef.current.contains(e.target as Node)) setAddOpen(false);
        };
            document.addEventListener('mousedown', handler);
            return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (tabActiva === 'ordenes') cargarOrdenes();
        if (tabActiva === 'insumos') cargarInsumos();
        setSearch(''); setSortKey(null); setSortAsc(true);
    }, [tabActiva]);

    const showToast = (msg: string, type: Toast['type'] = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2600);
    };

    const handleSort = (key: string) => {
        if (sortKey === key) setSortAsc(v => !v);
        else { setSortKey(key); setSortAsc(true); }
    };

    /* ══ CARGAR Y GUARDAR ÓRDENES ══ */
    const cargarOrdenes = async () => {
        setLoadingDatos(true);
        try {
            const res = await getOrdenesProduccion();
            setDatosOrdenes(res);
        } catch (err) {
            console.error(err);
            showToast("Error al cargar órdenes", "error");
        } finally {
            setLoadingDatos(false);
        }
    };

    const handleGuardarOrden = async (data: any) => {
        try {
            await createOrdenProduccion(data);
            await cargarOrdenes();
            showToast("Orden registrada exitosamente", "success");
        } catch (err: any) {
            throw err;
        }
    };

    /* ══ CARGAR Y GUARDAR INSUMOS ══ */
    const cargarInsumos = async () => {
        setLoadingDatos(true);
        try {
            const res = await getInsumos();
            setDatosInsumos(res);
        } catch (err) {
            console.error(err);
            showToast("Error al cargar insumos", "error");
        } finally {
            setLoadingDatos(false);
        }
    };

    const handleGuardarInsumo = async (data: any) => {
        try {
            if (insumoEditando) {
                await updateInsumo({ id_insumo: insumoEditando.id_insumo, ...data });
            } else {
                await createInsumo(data);
            }
            await cargarInsumos();
            showToast("Insumo guardado exitosamente", "success");
        } catch (err: any) {
            throw err;
        }
    };

    /* ══ FINALIZAR ORDEN (LÓGICA DEL BACKEND) ══ */
    const handleFinalizarOrden = (orden: any) => {
        setActionModal({
            isOpen: true,
            type: 'confirm-delete',
            title: 'Finalizar Lote',
            subtitle: '¿Terminaste de fabricar este lote?',
            description: `Se sumarán ${orden.cantidad_a_producir} piezas de "${orden.producto.nombre}" a tu inventario activo.`,
            itemName: `Orden #${orden.id_orden_produccion}`,
            onConfirm: async () => {
                try {
                    await updateOrdenProduccion({
                        id_orden_produccion: orden.id_orden_produccion,
                        estado: 'Finalizada'
                    });
                    await cargarOrdenes();
                    setActionModal({ isOpen: true, type: 'success', title: '¡Lote Terminado!', subtitle: 'Inventario actualizado correctamente.', itemName: '' });
                    setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                    showToast("Orden Finalizada", "success");
                } catch (error) {
                    showToast("Error al finalizar la orden", "error");
                }
            }
        });
    };

    /* ── Filtered & sorted data ── */
    const datosTablaActual = tabActiva === 'ordenes' ? datosOrdenes : datosInsumos;

    const datosActuales = datosTablaActual
    .filter(item => {
        if (tabActiva === 'ordenes') {
            const text = [item.producto?.nombre, item.producto?.sku, item.empleado?.nombre_completo, item.estado].join(' ').toLowerCase();
            return text.includes(search.toLowerCase());
        } else {
            const text = [item.nombre, item.unidad_medida].join(' ').toLowerCase();
            return text.includes(search.toLowerCase());
        }
    })
    .sort((a, b) => {
        if (!sortKey) return 0;
        const val = (obj: any) => {
            if (tabActiva === 'ordenes') {
                if (sortKey === 'producto') return obj.producto?.nombre ?? '';
                if (sortKey === 'cantidad') return obj.cantidad_a_producir ?? 0;
                if (sortKey === 'empleado') return obj.empleado?.nombre_completo ?? '';
            } else if (tabActiva === 'insumos') {
                if (sortKey === 'stock_actual') return Number(obj.stock_actual) ?? 0;
                if (sortKey === 'stock_minimo_alerta') return Number(obj.stock_minimo_alerta) ?? 0;
            }
            return obj[sortKey] ?? '';
        };
        const vA = val(a), vB = val(b);
        if (typeof vA === 'number' && typeof vB === 'number') return sortAsc ? vA - vB : vB - vA;
        return sortAsc ? String(vA).localeCompare(String(vB)) : String(vB).localeCompare(String(vA));
    });

    const totalRegistros = datosActuales.length;

    return (
        <>
        <ToastPortal toast={toast} />

        <div className="cat-root">
        <UserGreeting />

        {/* ── Page header ── */}
        <div className="cat-header">
        <div className="cat-header-text">
        <h1>Taller de Producción</h1>
        <p>Administra la fabricación y el inventario de materia prima.</p>
        </div>

        {/* Add button + dropdown */}
        <div className="cat-add-wrap" ref={addRef}>
        <motion.button className="cat-add-btn" onClick={() => setAddOpen(v => !v)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <Plus size={17} /> Añadir registro <ChevronDown size={14} style={{ transition: 'transform .2s', transform: addOpen ? 'rotate(180deg)' : 'none' }} />
        </motion.button>

        <AnimatePresence>
        {addOpen && (
            <motion.div className="cat-add-dropdown" initial={{ opacity: 0, y: -10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.96 }} transition={{ duration: .18 }}>
            <p className="cat-add-drop-header">¿Qué deseas registrar?</p>

            <button className="cat-add-drop-item" onClick={() => {
                setAddOpen(false);
                setIsModalOrdenOpen(true);
            }}>
            <span className="cat-add-drop-icon"><Scissors size={16} /></span>
            <span><span className="cat-add-drop-label">Nueva Orden</span><span className="cat-add-drop-sub">Registrar lote y gastar insumo</span></span>
            <ChevronRight size={13} className="cat-add-drop-arrow" />
            </button>

            <button className="cat-add-drop-item" onClick={() => {
                setAddOpen(false);
                setInsumoEditando(null);
                setIsModalInsumoOpen(true);
            }}>
            <span className="cat-add-drop-icon"><Box size={16} /></span>
            <span><span className="cat-add-drop-label">Nuevo Insumo</span><span className="cat-add-drop-sub">Dar de alta materia prima</span></span>
            <ChevronRight size={13} className="cat-add-drop-arrow" />
            </button>

            </motion.div>
        )}
        </AnimatePresence>
        </div>
        </div>

        {/* ── Category selector ── */}
        <div className="cat-selector-wrap" ref={selectorRef}>
        <button className="cat-selector-btn" onClick={() => setDropOpen(v => !v)}>
        <span className="cat-selector-icon" style={{ color: '#000', background: 'rgba(0,0,0,0.1)', borderColor: 'rgba(0,0,0,0.2)' }}>
        {tabActual.icon}
        </span>
        <span className="cat-selector-label"><span className="cat-selector-sublabel">MÓDULO ACTIVO</span><span className="cat-selector-name">{tabActual.label}</span></span>
        <ChevronDown size={18} className={`cat-chevron${dropOpen ? ' open' : ''}`} />
        </button>

        <AnimatePresence>
        {dropOpen && (
            <motion.div className="cat-dropdown" initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }} transition={{ duration: .2, ease: [0.22, 1, 0.36, 1] }}>
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

        {/* ── Table card ── */}
        <AnimatePresence mode="wait">
        <motion.div key={tabActiva} className="cat-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .28, ease: [0.22, 1, 0.36, 1] }}>

        <div className="cat-card-header">
        <div className="cat-card-header-left">
        <span className="cat-card-title-icon" style={{ color: '#000', background: 'rgba(0,0,0,0.1)', borderColor: 'rgba(0,0,0,0.2)' }}>
        {tabActual.icon}
        </span>
        <span className="cat-card-title">{tabActual.label}</span>
        <span className="cat-count-badge" style={{ color: '#000', background: 'rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.18)' }}>
        {totalRegistros} registros
        </span>
        </div>

        <div className="cat-card-header-right">
        <div className="cat-search-wrap">
        <Search size={13} />
        <input className="cat-search-input" placeholder={`Buscar ${tabActual.label.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'rgba(26,0,96,0.3)', padding: 0 }}><X size={12} /></button>}
        </div>
        </div>
        </div>

        {/* Table */}
        <div className="cat-table-scroll">
        <table className="cat-table">
        <thead>
        <tr>
        {columnasActivas.map(col => (
            <th key={col.key} className={col.sortable ? 'cat-th-sortable' : ''} onClick={() => col.sortable && handleSort(col.key)}>
            {col.sortable ? <div className="cat-th-inner">{col.label} <ArrowUpDown size={11} className="cat-sort-icon" style={{ opacity: sortKey === col.key ? 1 : 0.35 }} /></div> : col.label}
            </th>
        ))}
        <th style={{ textAlign: 'right', paddingRight: 20 }}>ACCIONES</th>
        </tr>
        </thead>
        <tbody>

        {/* Loading */}
        {loadingDatos && (
            <tr>
            <td colSpan={columnasActivas.length + 1} style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'rgba(26,0,96,0.4)' }}>
            <Loader2 size={18} style={{ animation: 'cat-spin 1s linear infinite' }} />
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13 }}>Cargando datos...</span>
            </div>
            </td>
            </tr>
        )}

        {/* Órdenes rows */}
        {!loadingDatos && tabActiva === 'ordenes' && datosActuales.map((orden, i) => (
            <motion.tr key={orden.id_orden_produccion} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <td>#{orden.id_orden_produccion}</td>

            <td>
            <div style={{ fontWeight: 800, color: '#1a0060' }}>{orden.producto?.nombre}</div>
            <div style={{ fontSize: 11, color: '#cc55ff', fontWeight: 600 }}>{orden.producto?.sku}</div>
            </td>

            <td style={{ fontWeight: 800, fontSize: 16, color: '#1a0060' }}>
            {orden.cantidad_a_producir} <span style={{ fontSize: 11, color: 'rgba(26,0,96,0.4)', fontWeight: 600 }}>pz</span>
            </td>

            <td style={{ color: 'rgba(26,0,96,0.7)', fontWeight: 600 }}>
            {orden.empleado?.nombre_completo || '—'}
            </td>

            <td>
            {orden.estado === 'Finalizada' ? (
                <span className="cat-status active">
                <span className="cat-status-dot"></span> TERMINADA
                </span>
            ) : (
                <span className="cat-status" style={{ background: 'rgba(255,190,11,0.2)', color: '#d49b00', border: '1.5px solid rgba(255,190,11,0.4)' }}>
                <span className="cat-status-dot" style={{ background: '#ffbe0b' }}></span> EN PROCESO
                </span>
            )}
            </td>

            <td>
            <div className="cat-actions">
            {orden.estado !== 'Finalizada' ? (
                <button
                className="cat-action-btn"
                style={{ color: '#06d6a0', borderColor: 'rgba(6,214,160,0.3)', background: 'rgba(6,214,160,0.05)' }}
                title="Marcar como Finalizada"
                onClick={() => handleFinalizarOrden(orden)}
                >
                <CheckCircle size={15} />
                </button>
            ) : (
                <span style={{ display: 'inline-flex', padding: 6, color: '#06d6a0', opacity: 0.5 }}>
                <CheckCircle size={15} />
                </span>
            )}
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => { alert("Función eliminar orden"); }}>
            <Trash2 size={13} />
            </button>
            </div>
            </td>
            </motion.tr>
        ))}

        {/* Insumos rows */}
        {!loadingDatos && tabActiva === 'insumos' && datosActuales.map((insumo, i) => (
            <motion.tr key={insumo.id_insumo} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <td>#{insumo.id_insumo}</td>
            <td>
            <div style={{ fontWeight: 800, color: '#1a0060' }}>{insumo.nombre}</div>
            <div style={{ fontSize: 11, color: 'rgba(26,0,96,0.4)', fontWeight: 600 }}>{insumo.unidad_medida || '—'}</div>
            </td>
            <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 15, color: Number(insumo.stock_actual) <= Number(insumo.stock_minimo_alerta) ? '#ff5050' : '#1a0060' }}>
            {Number(insumo.stock_actual) <= Number(insumo.stock_minimo_alerta) && <AlertTriangle size={14} />}
            {insumo.stock_actual}
            </div>
            </td>
            <td style={{ color: '#cc55ff', fontWeight: 600 }}>
            {insumo.stock_minimo_alerta}
            </td>
            <td>
            <div className="cat-actions">
            <button className="cat-action-btn" title="Editar" onClick={() => { setInsumoEditando(insumo); setIsModalInsumoOpen(true); }}><Pencil size={13} /></button>
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => {
                setActionModal({
                    isOpen: true, type: 'confirm-delete', title: 'Eliminar Insumo', subtitle: '¿Borrar material?',
                    description: 'Esta acción es permanente. No se puede borrar si ya fue usado en una orden.',
                    itemName: insumo.nombre,
                    onConfirm: async () => {
                        await deleteInsumo(insumo.id_insumo); await cargarInsumos();
                        setActionModal({ isOpen: true, type: 'success-delete', title: 'Insumo eliminado', subtitle: 'Se borró el material', itemName: '' });
                        setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                    }
                });
            }}><Trash2 size={13} /></button>
            </div>
            </td>
            </motion.tr>
        ))}

        {/* Empty state */}
        {!loadingDatos && datosActuales.length === 0 && (
            <tr>
            <td colSpan={columnasActivas.length + 1} style={{ padding: 0, border: 'none' }}>
            <div className="cat-empty">
            <div className="cat-empty-icon" style={{ color: '#000', background: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.1)' }}>
            <Package size={30} />
            </div>
            <p className="cat-empty-title">{search ? 'Sin resultados' : 'El registro está vacío'}</p>
            <p className="cat-empty-sub">
            {search ? `No se encontraron resultados con "${search}".` : `No hay información en esta categoría.`}
            </p>
            </div>
            </td>
            </tr>
        )}
        </tbody>
        </table>
        </div>
        </motion.div>
        </AnimatePresence>

        {/* ── Componentes de Modales ── */}
        <ModalOrdenProduccion
        isOpen={isModalOrdenOpen}
        onClose={() => setIsModalOrdenOpen(false)}
        onSave={handleGuardarOrden}
        />

        <ModalInsumo
        isOpen={isModalInsumoOpen}
        onClose={() => { setIsModalInsumoOpen(false); setInsumoEditando(null); }}
        onSave={handleGuardarInsumo}
        insumoAEditar={insumoEditando}
        />

        {/* ── Modal de Acciones (Reutilizado) ── */}
        <ActionModal
        isOpen={actionModal.isOpen}
        type={actionModal.type}
        title={actionModal.title}
        subtitle={actionModal.subtitle}
        description={actionModal.description}
        itemName={actionModal.itemName}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        onConfirm={actionModal.onConfirm}
        />
        </div>
        </>
    );
}
