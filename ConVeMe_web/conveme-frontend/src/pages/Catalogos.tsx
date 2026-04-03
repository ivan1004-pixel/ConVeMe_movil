import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';

import ModalEscuela  from '../components/catalogos/ModalEscuela';
import ModalVendedor from '../components/catalogos/ModalVendedor';
import ModalCuentaBancaria from '../components/catalogos/ModalCuentaBancaria';
import ModalEvento from '../components/catalogos/ModalEvento';
import ModalEmpleado from '../components/catalogos/ModalEmpleado';

import ActionModal from '../components/ui/ActionModal';
import type { ActionType } from '../components/ui/ActionModal';

import { getEscuelas,   createEscuela,   updateEscuela,   deleteEscuela   } from '../services/escuela.service';
import { getVendedores, createVendedor,  updateVendedor,  deleteVendedor  } from '../services/vendedor.service';
import { getCuentasBancarias, createCuentaBancaria, updateCuentaBancaria, deleteCuentaBancaria } from '../services/cuenta-bancaria.service';
import { getEventos, createEvento, updateEvento, deleteEvento } from '../services/evento.service';
import { getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from '../services/empleado.service';

import {
    Plus, ChevronDown, School, Users, UserCheck,
    CreditCard, Calendar, ChevronRight,
    Pencil, Trash2, Search, X, CheckCircle,
    ArrowUpDown, Loader2
} from 'lucide-react';

import '../styles/Catalogos.css';

const TABS = [
    { id: 'escuelas',   label: 'Escuelas',          icon: <School     size={16} /> },
{ id: 'empleados',  label: 'Empleados',         icon: <Users      size={16} /> },
{ id: 'vendedores', label: 'Vendedores',        icon: <UserCheck  size={16} /> },
{ id: 'cuentas',    label: 'Cuentas Bancarias', icon: <CreditCard size={16} /> },
{ id: 'eventos',    label: 'Eventos',           icon: <Calendar   size={16} /> },
];

const COLUMNAS: Record<string, { key: string; label: string; sortable?: boolean }[]> = {
    escuelas: [
        { key: 'id_escuela', label: 'ID'        },
        { key: 'nombre',     label: 'Nombre',    sortable: true },
        { key: 'siglas',     label: 'Siglas'    },
        { key: 'municipio',  label: 'Municipio', sortable: true },
        { key: 'estado',     label: 'Estado',    sortable: true },
    ],
    empleados: [
        { key: 'id',       label: 'ID'               },
        { key: 'nombre',   label: 'Nombre Completo',  sortable: true },
        { key: 'puesto',   label: 'Puesto',           sortable: true },
        { key: 'telefono', label: 'Teléfono'          },
        { key: 'email',    label: 'Email'             },
    ],
    vendedores: [
        { key: 'id_vendedor', label: 'ID'                },
        { key: 'nombre',      label: 'Nombre Completo',  sortable: true },
        { key: 'escuela',     label: 'Escuela Asignada', sortable: true },
        { key: 'instagram',   label: 'Instagram'         },
        { key: 'comisiones',  label: 'Comisiones',       sortable: true },
    ],
    cuentas: [
        { key: 'id_cuenta', label: 'ID'       },
        { key: 'vendedor',  label: 'Vendedor', sortable: true },
        { key: 'banco',     label: 'Banco',    sortable: true },
        { key: 'titular',   label: 'Titular'  },
        { key: 'clabe',     label: 'CLABE / Tarjeta'    },
    ],
    eventos: [
        { key: 'id',      label: 'ID'            },
        { key: 'nombre',  label: 'Nombre Evento', sortable: true },
        { key: 'fechas',  label: 'Fechas'         },
        { key: 'escuela', label: 'Escuela Sede',  sortable: true },
        { key: 'estado',  label: 'Estado',        sortable: true },
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

const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '—';
    return new Date(fechaStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function Catalogos() {
    const [tabActiva, setTabActiva] = useState('escuelas');
    const [dropOpen,  setDropOpen]  = useState(false);
    const [addOpen,   setAddOpen]   = useState(false);

    // Modales de Edición/Creación
    const [isModalEscuelaOpen,  setIsModalEscuelaOpen]  = useState(false);
    const [escuelaEditando,     setEscuelaEditando]     = useState<any | null>(null);
    const [isModalVendedorOpen, setIsModalVendedorOpen] = useState(false);
    const [vendedorEditando,    setVendedorEditando]    = useState<any | null>(null);
    const [isModalCuentaOpen, setIsModalCuentaOpen] = useState(false);
    const [cuentaEditando,    setCuentaEditando]    = useState<any | null>(null);
    const [isModalEventoOpen, setIsModalEventoOpen] = useState(false);
    const [eventoEditando,    setEventoEditando]    = useState<any | null>(null);
    const [isModalEmpleadoOpen, setIsModalEmpleadoOpen] = useState(false);
    const [empleadoEditando,    setEmpleadoEditando]    = useState<any | null>(null);

    // Estado del Modal de Acciones (Borrado bonito)
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
    const [datosEscuelas,   setDatosEscuelas]   = useState<any[]>([]);
    const [datosVendedores, setDatosVendedores] = useState<any[]>([]);
    const [datosCuentas,    setDatosCuentas]    = useState<any[]>([]);
    const [datosEventos,    setDatosEventos]    = useState<any[]>([]);
    const [datosEmpleados,  setDatosEmpleados]  = useState<any[]>([]);
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
        if (tabActiva === 'escuelas')   cargarEscuelas();
        if (tabActiva === 'vendedores') cargarVendedores();
        if (tabActiva === 'cuentas')    cargarCuentas();
        if (tabActiva === 'eventos')    cargarEventos();
        if (tabActiva === 'empleados')  cargarEmpleados();
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
    const cargarEscuelas = async () => { setLoadingDatos(true); try { setDatosEscuelas(await getEscuelas()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarEscuela = async (data: any) => {
        try {
            if (escuelaEditando) { await updateEscuela({ id_escuela: escuelaEditando.id_escuela, ...data }); } else { await createEscuela(data); }
            await cargarEscuelas();
        } catch (err: any) { throw err; }
    };

    const cargarVendedores = async () => { setLoadingDatos(true); try { setDatosVendedores(await getVendedores()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarVendedor = async (data: any) => {
        try {
            if (vendedorEditando) { await updateVendedor({ id_vendedor: vendedorEditando.id_vendedor, ...data }); } else { await createVendedor(data); }
            await cargarVendedores();
        } catch (err: any) { throw err; }
    };

    const cargarCuentas = async () => { setLoadingDatos(true); try { setDatosCuentas(await getCuentasBancarias()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarCuenta = async (data: any) => {
        try {
            if (cuentaEditando) { await updateCuentaBancaria({ id_cuenta: cuentaEditando.id_cuenta, ...data }); } else { await createCuentaBancaria(data); }
            await cargarCuentas();
        } catch (err: any) { throw err; }
    };

    const cargarEventos = async () => { setLoadingDatos(true); try { setDatosEventos(await getEventos()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarEvento = async (data: any) => {
        try {
            if (eventoEditando) { await updateEvento({ id_evento: eventoEditando.id_evento, ...data }); } else { await createEvento(data); }
            await cargarEventos();
        } catch (err: any) { throw err; }
    };

    const cargarEmpleados = async () => { setLoadingDatos(true); try { setDatosEmpleados(await getEmpleados()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarEmpleado = async (data: any) => {
        try {
            if (empleadoEditando) { await updateEmpleado({ id_empleado: empleadoEditando.id_empleado, ...data }); } else { await createEmpleado(data); }
            await cargarEmpleados();
        } catch (err: any) { throw err; }
    };


    /* ── Filtered & sorted data ── */
    const datosTablaActual = tabActiva === 'escuelas' ? datosEscuelas : tabActiva === 'vendedores' ? datosVendedores : tabActiva === 'cuentas' ? datosCuentas : tabActiva === 'eventos' ? datosEventos : tabActiva === 'empleados' ? datosEmpleados : [];

    const datosActuales = datosTablaActual
    .filter(e => {
        const text = tabActiva === 'escuelas' ? [e.nombre, e.siglas, e.municipio?.nombre, e.municipio?.estado?.nombre].join(' ').toLowerCase()
        : tabActiva === 'vendedores' ? [e.nombre_completo, e.instagram_handle, e.escuela?.nombre].join(' ').toLowerCase()
        : tabActiva === 'cuentas' ? [e.banco, e.titular_cuenta, e.vendedor?.nombre_completo].join(' ').toLowerCase()
        : tabActiva === 'eventos' ? [e.nombre, e.escuela?.nombre, e.municipio?.estado?.nombre].join(' ').toLowerCase()
        : tabActiva === 'empleados' ? [e.nombre_completo, e.email, e.puesto, e.telefono].join(' ').toLowerCase() : '';
        return text.includes(search.toLowerCase());
    })
    .sort((a, b) => {
        if (!sortKey) return 0;
        const val = (obj: any) => {
            if (tabActiva === 'escuelas') return sortKey === 'municipio' ? obj.municipio?.nombre ?? '' : sortKey === 'estado' ? obj.municipio?.estado?.nombre ?? '' : obj[sortKey] ?? '';
            if (tabActiva === 'vendedores') return sortKey === 'escuela' ? obj.escuela?.nombre ?? '' : sortKey === 'nombre' ? obj.nombre_completo ?? '' : sortKey === 'comisiones' ? obj.comision_fija_menudeo ?? 0 : obj[sortKey] ?? '';
            if (tabActiva === 'cuentas') return sortKey === 'vendedor' ? obj.vendedor?.nombre_completo ?? '' : sortKey === 'banco' ? obj.banco ?? '' : obj[sortKey] ?? '';
            if (tabActiva === 'eventos') return sortKey === 'nombre' ? obj.nombre ?? '' : sortKey === 'escuela' ? obj.escuela?.nombre ?? '' : sortKey === 'estado' ? obj.municipio?.estado?.nombre ?? '' : obj[sortKey] ?? '';
            if (tabActiva === 'empleados') return sortKey === 'nombre' ? obj.nombre_completo ?? '' : obj[sortKey] ?? '';
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
        <h1>Catálogos Maestros</h1>
        <p>Administra los registros de personal, escuelas y eventos del sistema.</p>
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
                    if (tab.id === 'escuelas') { setEscuelaEditando(null); setIsModalEscuelaOpen(true); }
                    else if (tab.id === 'vendedores') { setVendedorEditando(null); setIsModalVendedorOpen(true); }
                    else if (tab.id === 'cuentas') { setCuentaEditando(null); setIsModalCuentaOpen(true); }
                    else if (tab.id === 'eventos') { setEventoEditando(null); setIsModalEventoOpen(true); }
                    else if (tab.id === 'empleados') { setEmpleadoEditando(null); setIsModalEmpleadoOpen(true); }
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

        {/* Escuelas rows */}
        {!loadingDatos && tabActiva === 'escuelas' && datosActuales.map((escuela, i) => (
            <motion.tr key={escuela.id_escuela} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0  }} transition={{ delay: i * 0.03 }}>
            <td>#{escuela.id_escuela}</td>
            <td style={{ fontWeight:600, color:'#1a0060' }}>{escuela.nombre}</td>
            <td>{escuela.siglas}</td>
            <td>{escuela.municipio?.nombre || '—'}</td>
            <td>{escuela.municipio?.estado?.nombre || '—'}</td>
            <td>
            <div className="cat-actions">
            <button className="cat-action-btn" title="Editar" onClick={() => { setEscuelaEditando(escuela); setIsModalEscuelaOpen(true); }}><Pencil size={13} /></button>
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => {
                setActionModal({
                    isOpen: true, type: 'confirm-delete', title: 'Eliminar Escuela', subtitle: '¿Eliminar escuela?',
                    description: 'Esta acción es permanente y no se puede deshacer. Se eliminará la escuela junto con sus registros asociados.',
                    itemName: escuela.nombre,
                    onConfirm: async () => {
                        await deleteEscuela(escuela.id_escuela); await cargarEscuelas();
                        setActionModal({ isOpen: true, type: 'success-delete', title: 'Escuela eliminada', subtitle: 'El registro fue eliminado permanentemente.', itemName: '' });
                        setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                    }
                });
            }}><Trash2 size={13} /></button>
            </div>
            </td>
            </motion.tr>
        ))}

        {/* Vendedores rows */}
        {!loadingDatos && tabActiva === 'vendedores' && datosActuales.map((vendedor, i) => (
            <motion.tr key={vendedor.id_vendedor} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0  }} transition={{ delay: i * 0.03 }}>
            <td>#{vendedor.id_vendedor}</td>
            <td style={{ fontWeight:600, color:'#1a0060' }}>{vendedor.nombre_completo}</td>
            <td>{vendedor.escuela?.nombre || '—'}</td>
            <td style={{ color:'#cc55ff' }}>{vendedor.instagram_handle ? `@${vendedor.instagram_handle}` : '—'}</td>
            <td><span style={{ background:'#06d6a0', color:'#fff', padding:'3px 8px', borderRadius:6, fontSize:11, fontWeight:800, fontFamily:'Syne,sans-serif' }}>{vendedor.comision_fija_menudeo}% / {vendedor.comision_fija_mayoreo}%</span></td>
            <td>
            <div className="cat-actions">
            <button className="cat-action-btn" title="Editar" onClick={() => { setVendedorEditando(vendedor); setIsModalVendedorOpen(true); }}><Pencil size={13} /></button>
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => {
                setActionModal({
                    isOpen: true, type: 'confirm-delete', title: 'Eliminar Vendedor', subtitle: '¿Eliminar vendedor?',
                    description: 'Esta acción es permanente y no se puede deshacer.',
                    itemName: vendedor.nombre_completo,
                    onConfirm: async () => {
                        await deleteVendedor(vendedor.id_vendedor); await cargarVendedores();
                        setActionModal({ isOpen: true, type: 'success-delete', title: 'Vendedor eliminado', subtitle: 'El registro fue eliminado permanentemente.', itemName: '' });
                        setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                    }
                });
            }}><Trash2 size={13} /></button>
            </div>
            </td>
            </motion.tr>
        ))}

        {/* Cuentas Bancarias rows */}
        {!loadingDatos && tabActiva === 'cuentas' && datosActuales.map((cuenta, i) => (
            <motion.tr key={cuenta.id_cuenta} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0  }} transition={{ delay: i * 0.03 }}>
            <td>#{cuenta.id_cuenta}</td>
            <td style={{ fontWeight:600, color:'#1a0060' }}>{cuenta.vendedor?.nombre_completo || '—'}</td>
            <td><span style={{ background:'#1a0060', color:'#ffe144', padding:'3px 8px', borderRadius:6, fontSize:10, fontWeight:800 }}>{cuenta.banco}</span></td>
            <td>{cuenta.titular_cuenta}</td>
            <td style={{ color: '#06d6a0', fontWeight: 600 }}>{cuenta.clabe_interbancaria || cuenta.numero_cuenta}</td>
            <td>
            <div className="cat-actions">
            <button className="cat-action-btn" title="Editar" onClick={() => { setCuentaEditando(cuenta); setIsModalCuentaOpen(true); }}><Pencil size={13} /></button>
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => {
                setActionModal({
                    isOpen: true, type: 'confirm-delete', title: 'Eliminar Cuenta', subtitle: '¿Eliminar cuenta bancaria?',
                    description: 'Se eliminarán los datos bancarios del sistema.',
                    itemName: `${cuenta.banco} - ${cuenta.titular_cuenta}`,
                    onConfirm: async () => {
                        await deleteCuentaBancaria(cuenta.id_cuenta); await cargarCuentas();
                        setActionModal({ isOpen: true, type: 'success-delete', title: 'Cuenta eliminada', subtitle: 'El registro fue eliminado permanentemente.', itemName: '' });
                        setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                    }
                });
            }}><Trash2 size={13} /></button>
            </div>
            </td>
            </motion.tr>
        ))}

        {/* Eventos rows */}
        {!loadingDatos && tabActiva === 'eventos' && datosActuales.map((evento, i) => (
            <motion.tr key={evento.id_evento} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0  }} transition={{ delay: i * 0.03 }}>
            <td>#{evento.id_evento}</td>
            <td style={{ fontWeight:600, color:'#1a0060' }}>{evento.nombre}</td>
            <td style={{ fontSize: 12 }}>
            <div style={{ color: '#06d6a0', fontWeight: 'bold' }}>Inicio: {formatearFecha(evento.fecha_inicio)}</div>
            <div style={{ color: '#ff5050', fontWeight: 'bold' }}>Fin: {formatearFecha(evento.fecha_fin)}</div>
            </td>
            <td>{evento.escuela?.nombre || '—'}</td>
            <td>{evento.municipio?.estado?.nombre || '—'}</td>
            <td>
            <div className="cat-actions">
            <button className="cat-action-btn" title="Editar" onClick={() => { setEventoEditando(evento); setIsModalEventoOpen(true); }}><Pencil size={13} /></button>
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => {
                setActionModal({
                    isOpen: true, type: 'confirm-delete', title: 'Eliminar Evento', subtitle: '¿Eliminar evento?',
                    description: 'Esta acción desactivará el evento del sistema.',
                    itemName: evento.nombre,
                    onConfirm: async () => {
                        await deleteEvento(evento.id_evento); await cargarEventos();
                        setActionModal({ isOpen: true, type: 'success-delete', title: 'Evento eliminado', subtitle: 'El registro fue desactivado.', itemName: '' });
                        setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                    }
                });
            }}><Trash2 size={13} /></button>
            </div>
            </td>
            </motion.tr>
        ))}

        {/* Empleados rows */}
        {!loadingDatos && tabActiva === 'empleados' && datosActuales.map((empleado, i) => (
            <motion.tr key={empleado.id_empleado} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0  }} transition={{ delay: i * 0.03 }}>
            <td>#{empleado.id_empleado}</td>
            <td style={{ fontWeight:600, color:'#1a0060' }}>{empleado.nombre_completo}</td>
            <td><span style={{ background:'#cc55ff', color:'#fff', padding:'3px 8px', borderRadius:6, fontSize:10, fontWeight:800 }}>{empleado.puesto || 'Sin puesto'}</span></td>
            <td>{empleado.telefono || '—'}</td>
            <td style={{ color: '#1a0060', fontSize: 12 }}>{empleado.email}</td>
            <td>
            <div className="cat-actions">
            <button className="cat-action-btn" title="Editar" onClick={() => { setEmpleadoEditando(empleado); setIsModalEmpleadoOpen(true); }}><Pencil size={13} /></button>
            <button className="cat-action-btn danger" title="Eliminar" onClick={() => {
                setActionModal({
                    isOpen: true, type: 'confirm-delete', title: 'Eliminar Empleado', subtitle: '¿Eliminar empleado?',
                    description: 'El empleado será desactivado del sistema.',
                    itemName: empleado.nombre_completo,
                    onConfirm: async () => {
                        await deleteEmpleado(empleado.id_empleado); await cargarEmpleados();
                        setActionModal({ isOpen: true, type: 'success-delete', title: 'Empleado eliminado', subtitle: 'El registro fue desactivado.', itemName: '' });
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
                    if (tabActiva === 'escuelas')   { setEscuelaEditando(null);  setIsModalEscuelaOpen(true);  }
                    if (tabActiva === 'vendedores') { setVendedorEditando(null); setIsModalVendedorOpen(true); }
                    if (tabActiva === 'cuentas')    { setCuentaEditando(null);   setIsModalCuentaOpen(true);   }
                    if (tabActiva === 'eventos')    { setEventoEditando(null);   setIsModalEventoOpen(true);   }
                    if (tabActiva === 'empleados')  { setEmpleadoEditando(null); setIsModalEmpleadoOpen(true); }
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

        {/* ── Modales de Registro/Edición ── */}
        <ModalEscuela isOpen={isModalEscuelaOpen} onClose={() => { setIsModalEscuelaOpen(false); setEscuelaEditando(null); }} onSave={handleGuardarEscuela} escuelaAEditar={escuelaEditando} />
        <ModalVendedor isOpen={isModalVendedorOpen} onClose={() => { setIsModalVendedorOpen(false); setVendedorEditando(null); }} onSave={handleGuardarVendedor} vendedorAEditar={vendedorEditando} />
        <ModalCuentaBancaria isOpen={isModalCuentaOpen} onClose={() => { setIsModalCuentaOpen(false); setCuentaEditando(null); }} onSave={handleGuardarCuenta} cuentaAEditar={cuentaEditando} />
        <ModalEvento isOpen={isModalEventoOpen} onClose={() => { setIsModalEventoOpen(false); setEventoEditando(null); }} onSave={handleGuardarEvento} eventoAEditar={eventoEditando} />
        <ModalEmpleado isOpen={isModalEmpleadoOpen} onClose={() => { setIsModalEmpleadoOpen(false); setEmpleadoEditando(null); }} onSave={handleGuardarEmpleado} empleadoAEditar={empleadoEditando} />

        {/* ── Modal Universal de Confirmación y Éxito ── */}
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
