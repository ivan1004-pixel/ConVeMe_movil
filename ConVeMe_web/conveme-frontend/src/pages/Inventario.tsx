import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';

import ModalCategoria from '../components/inventario/ModalCategoria';
import ModalProducto from '../components/inventario/ModalProducto';
import ModalTamano from '../components/inventario/ModalTamano';
import ActionModal from '../components/ui/ActionModal';
import type { ActionType } from '../components/ui/ActionModal';

import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/categoria.service';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../services/producto.service';
import { getTamanos, createTamano, updateTamano, deleteTamano } from '../services/tamano.service';

import {
    Plus, ChevronDown, ChevronRight,
    Pencil, Trash2, Search, X, CheckCircle,
    ArrowUpDown, Loader2, Tags, Package, Ruler
} from 'lucide-react';

import '../styles/Catalogos.css';

const TABS = [
    { id: 'productos',  label: 'Productos',         icon: <Package    size={16} /> },
{ id: 'categorias', label: 'Categorías',        icon: <Tags       size={16} /> },
{ id: 'tamanos',    label: 'Tamaños',           icon: <Ruler      size={16} /> },
];

const COLUMNAS: Record<string, { key: string; label: string; sortable?: boolean }[]> = {
    productos: [
        { key: 'sku',          label: 'SKU'           },
        { key: 'nombre',       label: 'Nombre',        sortable: true },
        { key: 'categoria',    label: 'Categoría',     sortable: true },
        { key: 'tamano',       label: 'Tamaño',        sortable: true },
        { key: 'precio',       label: 'Precio',        sortable: true },
    ],
    categorias: [
        { key: 'id_categoria', label: 'ID'            },
        { key: 'nombre',       label: 'Nombre',        sortable: true },
    ],
    tamanos: [
        { key: 'id_tamano',    label: 'ID'            },
        { key: 'descripcion',  label: 'Descripción',   sortable: true },
    ],
};

interface Toast { msg: string; type: 'success' | 'delete' | 'error' }

function ToastPortal({ toast }: { toast: Toast | null }) {
    return createPortal(
        <AnimatePresence>
        {toast && (
            <motion.div className="cat-toast" initial={{ opacity:0, y:-50, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-40, scale:0.9 }} transition={{ type:'spring', stiffness:300, damping:22 }}>
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

export default function Inventario() {
    const [tabActiva, setTabActiva] = useState('productos');
    const [dropOpen,  setDropOpen]  = useState(false);
    const [addOpen,   setAddOpen]   = useState(false);

    // Modales de Edición/Creación
    const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false);
    const [categoriaEditando,    setCategoriaEditando]    = useState<any | null>(null);
    const [isModalProductoOpen,  setIsModalProductoOpen]  = useState(false);
    const [productoEditando,     setProductoEditando]     = useState<any | null>(null);
    const [isModalTamanoOpen,    setIsModalTamanoOpen]    = useState(false);
    const [tamanoEditando,       setTamanoEditando]       = useState<any | null>(null);

    // 👇 Estado para el ActionModal
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        type: ActionType;
        title: string;
        subtitle: string;
        description?: string;
        itemName?: string;
        onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    // Data
    const [datosCategorias, setDatosCategorias] = useState<any[]>([]);
    const [datosProductos,  setDatosProductos]  = useState<any[]>([]);
    const [datosTamanos,    setDatosTamanos]    = useState<any[]>([]);
    const [loadingDatos,    setLoadingDatos]    = useState(false);

    // Search & sort
    const [search,  setSearch]  = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);

    const [toast, setToast] = useState<Toast | null>(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const addRef      = useRef<HTMLDivElement>(null);

    const tabActual = TABS.find(t => t.id === tabActiva)!;
    const columnas  = COLUMNAS[tabActiva] ?? [];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) setDropOpen(false);
            if (addRef.current      && !addRef.current.contains(e.target as Node))      setAddOpen(false);
        };
            document.addEventListener('mousedown', handler);
            return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (tabActiva === 'categorias') cargarCategorias();
        if (tabActiva === 'productos')  cargarProductos();
        if (tabActiva === 'tamanos')    cargarTamanos();
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

    /* ══ CARGAR Y GUARDAR DATOS ══ */
    const cargarCategorias = async () => { setLoadingDatos(true); try { setDatosCategorias(await getCategorias()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarCategoria = async (data: any) => {
        try {
            if (categoriaEditando) { await updateCategoria({ id_categoria: categoriaEditando.id_categoria, ...data }); } else { await createCategoria(data); }
            await cargarCategorias();
        } catch (err: any) { throw err; }
    };

    const cargarProductos = async () => { setLoadingDatos(true); try { setDatosProductos(await getProductos()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarProducto = async (data: any) => {
        try {
            if (productoEditando) { await updateProducto({ id_producto: productoEditando.id_producto, ...data }); } else { await createProducto(data); }
            await cargarProductos();
        } catch (err: any) { throw err; }
    };

    const cargarTamanos = async () => { setLoadingDatos(true); try { setDatosTamanos(await getTamanos()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarTamano = async (data: any) => {
        try {
            if (tamanoEditando) { await updateTamano({ id_tamano: tamanoEditando.id_tamano, ...data }); } else { await createTamano(data); }
            await cargarTamanos();
        } catch (err: any) { throw err; }
    };

    /* ── Filtered & sorted data ── */
    const datosTablaActual = tabActiva === 'categorias' ? datosCategorias : tabActiva === 'productos' ? datosProductos : tabActiva === 'tamanos' ? datosTamanos : [];

    const datosActuales = datosTablaActual
    .filter(e => {
        const text = tabActiva === 'categorias' ? [e.nombre].join(' ').toLowerCase()
        : tabActiva === 'productos' ? [e.sku, e.nombre, e.categoria?.nombre, e.tamano?.descripcion].join(' ').toLowerCase()
        : tabActiva === 'tamanos' ? [e.descripcion].join(' ').toLowerCase() : '';
        return text.includes(search.toLowerCase());
    })
    .sort((a, b) => {
        if (!sortKey) return 0;
        const val = (obj: any) => {
            if (tabActiva === 'categorias') return obj[sortKey] ?? '';
            if (tabActiva === 'productos') return sortKey === 'categoria' ? obj.categoria?.nombre ?? '' : sortKey === 'tamano' ? obj.tamano?.descripcion ?? '' : sortKey === 'precio' ? obj.precio_unitario ?? 0 : obj[sortKey] ?? '';
            if (tabActiva === 'tamanos') return obj[sortKey] ?? '';
            return '';
        };
        const vA = val(a), vB = val(b);
        if (typeof vA === 'number' && typeof vB === 'number') return sortAsc ? vA - vB : vB - vA;
        return sortAsc ? String(vA).localeCompare(String(vB)) : String(vB).localeCompare(String(vA));
    });

    const totalRegistros = datosTablaActual.length;

    return (
        <>
        <ToastPortal toast={toast} />

        <div className="cat-root">
        <UserGreeting />

        {/* ── Page header ── */}
        <div className="cat-header">
        <div className="cat-header-text">
        <h1>Inventario</h1>
        <p>Administra los productos, categorías y tamaños de mercancía.</p>
        </div>

        {/* Add button + dropdown */}
        <div className="cat-add-wrap" ref={addRef}>
        <motion.button className="cat-add-btn" onClick={() => setAddOpen(v => !v)} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
        <Plus size={17} /> Añadir registro <ChevronDown size={14} style={{ transition:'transform .2s', transform: addOpen ? 'rotate(180deg)' : 'none' }} />
        </motion.button>

        <AnimatePresence>
        {addOpen && (
            <motion.div className="cat-add-dropdown" initial={{ opacity:0, y:-10, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10, scale:0.96 }} transition={{ duration:.18 }}>
            <p className="cat-add-drop-header">¿Qué deseas registrar?</p>
            {TABS.map(tab => (
                <button key={tab.id} className="cat-add-drop-item" onClick={() => {
                    setTabActiva(tab.id); setAddOpen(false);
                    if (tab.id === 'categorias') { setCategoriaEditando(null); setIsModalCategoriaOpen(true); }
                    else if (tab.id === 'productos') { setProductoEditando(null); setIsModalProductoOpen(true); }
                    else if (tab.id === 'tamanos') { setTamanoEditando(null); setIsModalTamanoOpen(true); }
                }}>
                <span className="cat-add-drop-icon">{tab.icon}</span>
                <span><span className="cat-add-drop-label">{tab.label}</span><span className="cat-add-drop-sub">Nuevo registro</span></span>
                <ChevronRight size={13} className="cat-add-drop-arrow" />
                </button>
            ))}
            </motion.div>
        )}
        </AnimatePresence>
        </div>
        </div>

        {/* ── Category selector ── */}
        <div className="cat-selector-wrap" ref={selectorRef}>
        <button className="cat-selector-btn" onClick={() => setDropOpen(v => !v)}>
        <span className="cat-selector-icon">{tabActual.icon}</span>
        <span className="cat-selector-label"><span className="cat-selector-sublabel">Categoría activa</span><span className="cat-selector-name">{tabActual.label}</span></span>
        <ChevronDown size={18} className={`cat-chevron${dropOpen ? ' open' : ''}`} />
        </button>

        <AnimatePresence>
        {dropOpen && (
            <motion.div className="cat-dropdown" initial={{ opacity:0, y:-10, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10, scale:0.97 }} transition={{ duration:.2, ease:[0.22,1,0.36,1] }}>
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
        <motion.div key={tabActiva} className="cat-card" initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0  }} exit={{ opacity:0, y:-10 }} transition={{ duration:.28, ease:[0.22,1,0.36,1] }}>

        <div className="cat-card-header">
        <div className="cat-card-header-left">
        <span className="cat-card-title-icon">{tabActual.icon}</span>
        <span className="cat-card-title">{tabActual.label}</span>
        <span className="cat-count-badge">{totalRegistros} registros</span>
        </div>

        <div className="cat-card-header-right">
        <div className="cat-search-wrap">
        <Search size={13} />
        <input className="cat-search-input" placeholder={`Buscar ${tabActual.label.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'rgba(26,0,96,0.3)', padding:0 }}><X size={12} /></button>}
        </div>
        </div>
        </div>

        {/* Table */}
        <div className="cat-table-scroll">
        <table className="cat-table">
        <thead>
        <tr>
        {columnas.map(col => (
            <th key={col.key} className={col.sortable ? 'cat-th-sortable' : ''} onClick={() => col.sortable && handleSort(col.key)}>
            {col.sortable ? <div className="cat-th-inner">{col.label} <ArrowUpDown size={11} className="cat-sort-icon" style={{ opacity: sortKey === col.key ? 1 : 0.35 }} /></div> : col.label}
            </th>
        ))}
        <th style={{ textAlign:'right', paddingRight:20 }}>Acciones</th>
        </tr>
        </thead>
        <tbody>

        {/* Loading */}
        {loadingDatos && (
            <tr>
            <td colSpan={columnas.length + 1} style={{ padding:'48px 24px', textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, color:'rgba(26,0,96,0.4)' }}>
            <Loader2 size={18} style={{ animation:'cat-spin 1s linear infinite' }} />
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13 }}>Cargando datos...</span>
            </div>
            </td>
            </tr>
        )}

        {/* Productos rows */}
        {!loadingDatos && tabActiva === 'productos' && datosActuales.map((producto, i) => (
            <motion.tr key={producto.id_producto} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0  }} transition={{ delay: i * 0.03 }}>
            <td style={{ fontWeight:600, color:'#cc55ff' }}>{producto.sku}</td>
            <td style={{ fontWeight:600, color:'#1a0060' }}>{producto.nombre}</td>
            <td><span style={{ background:'#1a0060', color:'#ffe144', padding:'3px 8px', borderRadius:6, fontSize:10, fontWeight:800 }}>{producto.categoria?.nombre || '—'}</span></td>
            <td>{producto.tamano?.descripcion || '—'}</td>
            <td style={{ color: '#06d6a0', fontWeight: 600 }}>${Number(producto.precio_unitario).toFixed(2)}</td>
            <td>
            <div className="cat-actions">
            <button className="cat-action-btn" title="Editar" onClick={() => { setProductoEditando(producto); setIsModalProductoOpen(true); }}><Pencil size={13} /></button>
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => {
                setActionModal({
                    isOpen: true, type: 'confirm-delete', title: 'Eliminar Producto', subtitle: '¿Eliminar producto?',
                    description: 'El producto se ocultará del inventario activo.',
                    itemName: `${producto.sku} - ${producto.nombre}`,
                    onConfirm: async () => {
                        await deleteProducto(producto.id_producto); await cargarProductos();
                        setActionModal({ isOpen: true, type: 'success-delete', title: 'Producto eliminado', subtitle: 'El registro fue eliminado del inventario.', itemName: '' });
                        setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                    }
                });
            }}><Trash2 size={13} /></button>
            </div>
            </td>
            </motion.tr>
        ))}

        {/* Categorías rows */}
        {!loadingDatos && tabActiva === 'categorias' && datosActuales.map((categoria, i) => (
            <motion.tr key={categoria.id_categoria} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0  }} transition={{ delay: i * 0.03 }}>
            <td>#{categoria.id_categoria}</td>
            <td style={{ fontWeight:600, color:'#1a0060' }}>{categoria.nombre}</td>
            <td>
            <div className="cat-actions">
            <button className="cat-action-btn" title="Editar" onClick={() => { setCategoriaEditando(categoria); setIsModalCategoriaOpen(true); }}><Pencil size={13} /></button>
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => {
                setActionModal({
                    isOpen: true, type: 'confirm-delete', title: 'Eliminar Categoría', subtitle: '¿Eliminar categoría?',
                    description: 'Esta acción es permanente y afectará la organización del inventario.',
                    itemName: categoria.nombre,
                    onConfirm: async () => {
                        await deleteCategoria(categoria.id_categoria); await cargarCategorias();
                        setActionModal({ isOpen: true, type: 'success-delete', title: 'Categoría eliminada', subtitle: 'El registro fue eliminado permanentemente.', itemName: '' });
                        setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                    }
                });
            }}><Trash2 size={13} /></button>
            </div>
            </td>
            </motion.tr>
        ))}

        {/* Tamaños rows */}
        {!loadingDatos && tabActiva === 'tamanos' && datosActuales.map((tamano, i) => (
            <motion.tr key={tamano.id_tamano} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0  }} transition={{ delay: i * 0.03 }}>
            <td>#{tamano.id_tamano}</td>
            <td style={{ fontWeight:600, color:'#1a0060' }}>{tamano.descripcion}</td>
            <td>
            <div className="cat-actions">
            <button className="cat-action-btn" title="Editar" onClick={() => { setTamanoEditando(tamano); setIsModalTamanoOpen(true); }}><Pencil size={13} /></button>
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => {
                setActionModal({
                    isOpen: true, type: 'confirm-delete', title: 'Eliminar Tamaño', subtitle: '¿Eliminar tamaño?',
                    description: 'Esta acción es permanente.',
                    itemName: tamano.descripcion,
                    onConfirm: async () => {
                        await deleteTamano(tamano.id_tamano); await cargarTamanos();
                        setActionModal({ isOpen: true, type: 'success-delete', title: 'Tamaño eliminado', subtitle: 'El registro fue eliminado permanentemente.', itemName: '' });
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
            <td colSpan={columnas.length + 1} style={{ padding:0, border:'none' }}>
            <div className="cat-empty">
            <div className="cat-empty-icon">{tabActual.icon}</div>
            <p className="cat-empty-title">{search ? 'Sin resultados' : 'Sin registros todavía'}</p>
            <p className="cat-empty-sub">
            {search ? `No se encontraron ${tabActual.label.toLowerCase()} con "${search}".` : `No hay ${tabActual.label.toLowerCase()} registrados. Usa "Añadir registro" para crear el primero.`}
            </p>
            {!search && (
                <button className="cat-empty-cta" onClick={() => {
                    if (tabActiva === 'categorias') { setCategoriaEditando(null); setIsModalCategoriaOpen(true); }
                    if (tabActiva === 'productos')  { setProductoEditando(null); setIsModalProductoOpen(true); }
                    if (tabActiva === 'tamanos')    { setTamanoEditando(null); setIsModalTamanoOpen(true); }
                }}>
                <Plus size={14} /> Añadir {tabActual.label.toLowerCase()}
                </button>
            )}
            </div>
            </td>
            </tr>
        )}

        </tbody>
        </table>
        </div>
        </motion.div>
        </AnimatePresence>

        {/* ── Modales ── */}
        <ModalCategoria isOpen={isModalCategoriaOpen} onClose={() => { setIsModalCategoriaOpen(false); setCategoriaEditando(null); }} onSave={handleGuardarCategoria} categoriaAEditar={categoriaEditando} />
        <ModalProducto isOpen={isModalProductoOpen} onClose={() => { setIsModalProductoOpen(false); setProductoEditando(null); }} onSave={handleGuardarProducto} productoAEditar={productoEditando} />
        <ModalTamano isOpen={isModalTamanoOpen} onClose={() => { setIsModalTamanoOpen(false); setTamanoEditando(null); }} onSave={handleGuardarTamano} tamanoAEditar={tamanoEditando} />

        {/* ── Action Modal Universal ── */}
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
