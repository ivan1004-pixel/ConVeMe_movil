import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, Modal, ScrollView,
} from 'react-native';
import {
    Plus, ChevronDown, ChevronRight, Pencil, Trash2,
    Search, X, School, Users, UserCheck, CreditCard, Calendar,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import ActionModal from '@/components/ui/ActionModal';
import type { ActionType } from '@/components/ui/ActionModal';
import ModalEscuela from '@/components/catalogos/ModalEscuela';
import ModalVendedor from '@/components/catalogos/ModalVendedor';
import ModalCuentaBancaria from '@/components/catalogos/ModalCuentaBancaria';
import ModalEvento from '@/components/catalogos/ModalEvento';
import ModalEmpleado from '@/components/catalogos/ModalEmpleado';
import { getEscuelas, createEscuela, updateEscuela, deleteEscuela } from '@/services/escuela.service';
import { getVendedores, createVendedor, updateVendedor, deleteVendedor } from '@/services/vendedor.service';
import { getCuentasBancarias, createCuentaBancaria, updateCuentaBancaria, deleteCuentaBancaria } from '@/services/cuenta-bancaria.service';
import { getEventos, createEvento, updateEvento, deleteEvento } from '@/services/evento.service';
import { getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from '@/services/empleado.service';

const TABS = [
    { id: 'escuelas',   label: 'Escuelas',          iconName: 'school' },
    { id: 'empleados',  label: 'Empleados',         iconName: 'users' },
    { id: 'vendedores', label: 'Vendedores',        iconName: 'usercheck' },
    { id: 'cuentas',    label: 'Cuentas Bancarias', iconName: 'creditcard' },
    { id: 'eventos',    label: 'Eventos',           iconName: 'calendar' },
];

const TabIcon = ({ name, size, color }: { name: string; size: number; color: string }) => {
    if (name === 'school') return <School size={size} color={color} />;
    if (name === 'users') return <Users size={size} color={color} />;
    if (name === 'usercheck') return <UserCheck size={size} color={color} />;
    if (name === 'creditcard') return <CreditCard size={size} color={color} />;
    return <Calendar size={size} color={color} />;
};

const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '—';
    return new Date(fechaStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function Catalogos() {
    const [tabActiva, setTabActiva] = useState('escuelas');
    const [addOpen, setAddOpen] = useState(false);

    const [isModalEscuelaOpen, setIsModalEscuelaOpen] = useState(false);
    const [escuelaEditando, setEscuelaEditando] = useState<any | null>(null);
    const [isModalVendedorOpen, setIsModalVendedorOpen] = useState(false);
    const [vendedorEditando, setVendedorEditando] = useState<any | null>(null);
    const [isModalCuentaOpen, setIsModalCuentaOpen] = useState(false);
    const [cuentaEditando, setCuentaEditando] = useState<any | null>(null);
    const [isModalEventoOpen, setIsModalEventoOpen] = useState(false);
    const [eventoEditando, setEventoEditando] = useState<any | null>(null);
    const [isModalEmpleadoOpen, setIsModalEmpleadoOpen] = useState(false);
    const [empleadoEditando, setEmpleadoEditando] = useState<any | null>(null);

    const [actionModal, setActionModal] = useState<{
        isOpen: boolean; type: ActionType; title: string; subtitle: string;
        description?: string; itemName?: string; onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    const [datosEscuelas, setDatosEscuelas] = useState<any[]>([]);
    const [datosVendedores, setDatosVendedores] = useState<any[]>([]);
    const [datosCuentas, setDatosCuentas] = useState<any[]>([]);
    const [datosEventos, setDatosEventos] = useState<any[]>([]);
    const [datosEmpleados, setDatosEmpleados] = useState<any[]>([]);
    const [loadingDatos, setLoadingDatos] = useState(false);

    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);

    const tabActual = TABS.find(t => t.id === tabActiva)!;

    useEffect(() => {
        if (tabActiva === 'escuelas') cargarEscuelas();
        if (tabActiva === 'vendedores') cargarVendedores();
        if (tabActiva === 'cuentas') cargarCuentas();
        if (tabActiva === 'eventos') cargarEventos();
        if (tabActiva === 'empleados') cargarEmpleados();
        setSearch(''); setSortKey(null); setSortAsc(true);
    }, [tabActiva]);

    const handleSort = (key: string) => {
        if (sortKey === key) setSortAsc(v => !v);
        else { setSortKey(key); setSortAsc(true); }
    };

    /* ══ CARGAR Y GUARDAR ══ */
    const cargarEscuelas = async () => { setLoadingDatos(true); try { setDatosEscuelas(await getEscuelas()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarEscuela = async (data: any) => {
        try {
            if (escuelaEditando) { await updateEscuela({ id_escuela: escuelaEditando.id_escuela, ...data }); }
            else { await createEscuela(data); }
            await cargarEscuelas();
        } catch (err: any) { throw err; }
    };

    const cargarVendedores = async () => { setLoadingDatos(true); try { setDatosVendedores(await getVendedores()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarVendedor = async (data: any) => {
        try {
            if (vendedorEditando) { await updateVendedor({ id_vendedor: vendedorEditando.id_vendedor, ...data }); }
            else { await createVendedor(data); }
            await cargarVendedores();
        } catch (err: any) { throw err; }
    };

    const cargarCuentas = async () => { setLoadingDatos(true); try { setDatosCuentas(await getCuentasBancarias()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarCuenta = async (data: any) => {
        try {
            if (cuentaEditando) { await updateCuentaBancaria({ id_cuenta: cuentaEditando.id_cuenta, ...data }); }
            else { await createCuentaBancaria(data); }
            await cargarCuentas();
        } catch (err: any) { throw err; }
    };

    const cargarEventos = async () => { setLoadingDatos(true); try { setDatosEventos(await getEventos()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarEvento = async (data: any) => {
        try {
            if (eventoEditando) { await updateEvento({ id_evento: eventoEditando.id_evento, ...data }); }
            else { await createEvento(data); }
            await cargarEventos();
        } catch (err: any) { throw err; }
    };

    const cargarEmpleados = async () => { setLoadingDatos(true); try { setDatosEmpleados(await getEmpleados()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarEmpleado = async (data: any) => {
        try {
            if (empleadoEditando) { await updateEmpleado({ id_empleado: empleadoEditando.id_empleado, ...data }); }
            else { await createEmpleado(data); }
            await cargarEmpleados();
        } catch (err: any) { throw err; }
    };

    /* ══ FILTRADO Y ORDENAMIENTO ══ */
    const datosTablaActual = tabActiva === 'escuelas' ? datosEscuelas
        : tabActiva === 'vendedores' ? datosVendedores
        : tabActiva === 'cuentas' ? datosCuentas
        : tabActiva === 'eventos' ? datosEventos
        : datosEmpleados;

    const datosActuales = datosTablaActual
        .filter(e => {
            const text = tabActiva === 'escuelas' ? [e.nombre, e.siglas, e.municipio?.nombre, e.municipio?.estado?.nombre].join(' ').toLowerCase()
                : tabActiva === 'vendedores' ? [e.nombre_completo, e.instagram_handle, e.escuela?.nombre].join(' ').toLowerCase()
                : tabActiva === 'cuentas' ? [e.banco, e.titular_cuenta, e.vendedor?.nombre_completo].join(' ').toLowerCase()
                : tabActiva === 'eventos' ? [e.nombre, e.escuela?.nombre, e.municipio?.estado?.nombre].join(' ').toLowerCase()
                : [e.nombre_completo, e.email, e.puesto, e.telefono].join(' ').toLowerCase();
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

    const openAddForTab = (tabId: string) => {
        setTabActiva(tabId); setAddOpen(false);
        if (tabId === 'escuelas') { setEscuelaEditando(null); setIsModalEscuelaOpen(true); }
        else if (tabId === 'vendedores') { setVendedorEditando(null); setIsModalVendedorOpen(true); }
        else if (tabId === 'cuentas') { setCuentaEditando(null); setIsModalCuentaOpen(true); }
        else if (tabId === 'eventos') { setEventoEditando(null); setIsModalEventoOpen(true); }
        else if (tabId === 'empleados') { setEmpleadoEditando(null); setIsModalEmpleadoOpen(true); }
    };

    /* ══ RENDER ITEMS ══ */
    const renderEscuelaItem = useCallback(({ item }: { item: any }) => (
        <View style={s.card} data-testid={`escuela-card-${item.id_escuela}`}>
            <View style={s.cardTop}>
                <Text style={s.idBadge}>#{item.id_escuela}</Text>
            </View>
            <Text style={s.cardName}>{item.nombre}</Text>
            <View style={s.cardMeta}>
                <View style={s.tagBadge}><Text style={s.tagBadgeText}>{item.siglas || '—'}</Text></View>
                <Text style={s.metaText}>{item.municipio?.nombre || '—'}, {item.municipio?.estado?.nombre || '—'}</Text>
            </View>
            <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => { setEscuelaEditando(item); setIsModalEscuelaOpen(true); }} data-testid={`edit-escuela-${item.id_escuela}`}>
                    <Pencil size={14} color={Colors.azulMarino} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtnDanger} onPress={() => {
                    setActionModal({
                        isOpen: true, type: 'confirm-delete', title: 'Eliminar Escuela', subtitle: 'Eliminar escuela?',
                        description: 'Esta accion es permanente y no se puede deshacer. Se eliminara la escuela junto con sus registros asociados.',
                        itemName: item.nombre,
                        onConfirm: async () => {
                            await deleteEscuela(item.id_escuela); await cargarEscuelas();
                            setActionModal({ isOpen: true, type: 'success-delete', title: 'Escuela eliminada', subtitle: 'El registro fue eliminado permanentemente.', itemName: '' });
                            setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                        },
                    });
                }} data-testid={`delete-escuela-${item.id_escuela}`}>
                    <Trash2 size={14} color={Colors.rojoPeligro} />
                </TouchableOpacity>
            </View>
        </View>
    ), []);

    const renderVendedorItem = useCallback(({ item }: { item: any }) => (
        <View style={s.card} data-testid={`vendedor-card-${item.id_vendedor}`}>
            <View style={s.cardTop}>
                <Text style={s.idBadge}>#{item.id_vendedor}</Text>
                <View style={s.comisionBadge}>
                    <Text style={s.comisionText}>{item.comision_fija_menudeo}% / {item.comision_fija_mayoreo}%</Text>
                </View>
            </View>
            <Text style={s.cardName}>{item.nombre_completo}</Text>
            <View style={s.cardMeta}>
                <View style={s.tagBadge}><Text style={s.tagBadgeText}>{item.escuela?.nombre || '—'}</Text></View>
                {item.instagram_handle ? (
                    <Text style={s.instagramText}>@{item.instagram_handle}</Text>
                ) : null}
            </View>
            <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => { setVendedorEditando(item); setIsModalVendedorOpen(true); }} data-testid={`edit-vendedor-${item.id_vendedor}`}>
                    <Pencil size={14} color={Colors.azulMarino} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtnDanger} onPress={() => {
                    setActionModal({
                        isOpen: true, type: 'confirm-delete', title: 'Eliminar Vendedor', subtitle: 'Eliminar vendedor?',
                        description: 'Esta accion es permanente y no se puede deshacer.',
                        itemName: item.nombre_completo,
                        onConfirm: async () => {
                            await deleteVendedor(item.id_vendedor); await cargarVendedores();
                            setActionModal({ isOpen: true, type: 'success-delete', title: 'Vendedor eliminado', subtitle: 'El registro fue eliminado permanentemente.', itemName: '' });
                            setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                        },
                    });
                }} data-testid={`delete-vendedor-${item.id_vendedor}`}>
                    <Trash2 size={14} color={Colors.rojoPeligro} />
                </TouchableOpacity>
            </View>
        </View>
    ), []);

    const renderCuentaItem = useCallback(({ item }: { item: any }) => (
        <View style={s.card} data-testid={`cuenta-card-${item.id_cuenta}`}>
            <View style={s.cardTop}>
                <Text style={s.idBadge}>#{item.id_cuenta}</Text>
                <View style={s.bancoBadge}><Text style={s.bancoBadgeText}>{item.banco}</Text></View>
            </View>
            <Text style={s.cardName}>{item.vendedor?.nombre_completo || '—'}</Text>
            <View style={s.cardMeta}>
                <Text style={s.metaText}>Titular: {item.titular_cuenta}</Text>
            </View>
            <Text style={s.clabeText}>{item.clabe_interbancaria || item.numero_cuenta || '—'}</Text>
            <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => { setCuentaEditando(item); setIsModalCuentaOpen(true); }} data-testid={`edit-cuenta-${item.id_cuenta}`}>
                    <Pencil size={14} color={Colors.azulMarino} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtnDanger} onPress={() => {
                    setActionModal({
                        isOpen: true, type: 'confirm-delete', title: 'Eliminar Cuenta', subtitle: 'Eliminar cuenta bancaria?',
                        description: 'Se eliminaran los datos bancarios del sistema.',
                        itemName: `${item.banco} - ${item.titular_cuenta}`,
                        onConfirm: async () => {
                            await deleteCuentaBancaria(item.id_cuenta); await cargarCuentas();
                            setActionModal({ isOpen: true, type: 'success-delete', title: 'Cuenta eliminada', subtitle: 'El registro fue eliminado permanentemente.', itemName: '' });
                            setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                        },
                    });
                }} data-testid={`delete-cuenta-${item.id_cuenta}`}>
                    <Trash2 size={14} color={Colors.rojoPeligro} />
                </TouchableOpacity>
            </View>
        </View>
    ), []);

    const renderEventoItem = useCallback(({ item }: { item: any }) => (
        <View style={s.card} data-testid={`evento-card-${item.id_evento}`}>
            <View style={s.cardTop}>
                <Text style={s.idBadge}>#{item.id_evento}</Text>
            </View>
            <Text style={s.cardName}>{item.nombre}</Text>
            <View style={s.fechasWrap}>
                <Text style={s.fechaInicio}>Inicio: {formatearFecha(item.fecha_inicio)}</Text>
                <Text style={s.fechaFin}>Fin: {formatearFecha(item.fecha_fin)}</Text>
            </View>
            <View style={s.cardMeta}>
                <View style={s.tagBadge}><Text style={s.tagBadgeText}>{item.escuela?.nombre || '—'}</Text></View>
                <Text style={s.metaText}>{item.municipio?.estado?.nombre || '—'}</Text>
            </View>
            <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => { setEventoEditando(item); setIsModalEventoOpen(true); }} data-testid={`edit-evento-${item.id_evento}`}>
                    <Pencil size={14} color={Colors.azulMarino} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtnDanger} onPress={() => {
                    setActionModal({
                        isOpen: true, type: 'confirm-delete', title: 'Eliminar Evento', subtitle: 'Eliminar evento?',
                        description: 'Esta accion desactivara el evento del sistema.',
                        itemName: item.nombre,
                        onConfirm: async () => {
                            await deleteEvento(item.id_evento); await cargarEventos();
                            setActionModal({ isOpen: true, type: 'success-delete', title: 'Evento eliminado', subtitle: 'El registro fue desactivado.', itemName: '' });
                            setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                        },
                    });
                }} data-testid={`delete-evento-${item.id_evento}`}>
                    <Trash2 size={14} color={Colors.rojoPeligro} />
                </TouchableOpacity>
            </View>
        </View>
    ), []);

    const renderEmpleadoItem = useCallback(({ item }: { item: any }) => (
        <View style={s.card} data-testid={`empleado-card-${item.id_empleado}`}>
            <View style={s.cardTop}>
                <Text style={s.idBadge}>#{item.id_empleado}</Text>
                <View style={s.puestoBadge}><Text style={s.puestoBadgeText}>{item.puesto || 'Sin puesto'}</Text></View>
            </View>
            <Text style={s.cardName}>{item.nombre_completo}</Text>
            <View style={s.cardMeta}>
                <Text style={s.metaText}>{item.telefono || '—'}</Text>
            </View>
            <Text style={s.emailText}>{item.email || '—'}</Text>
            <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => { setEmpleadoEditando(item); setIsModalEmpleadoOpen(true); }} data-testid={`edit-empleado-${item.id_empleado}`}>
                    <Pencil size={14} color={Colors.azulMarino} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtnDanger} onPress={() => {
                    setActionModal({
                        isOpen: true, type: 'confirm-delete', title: 'Eliminar Empleado', subtitle: 'Eliminar empleado?',
                        description: 'El empleado sera desactivado del sistema.',
                        itemName: item.nombre_completo,
                        onConfirm: async () => {
                            await deleteEmpleado(item.id_empleado); await cargarEmpleados();
                            setActionModal({ isOpen: true, type: 'success-delete', title: 'Empleado eliminado', subtitle: 'El registro fue desactivado.', itemName: '' });
                            setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                        },
                    });
                }} data-testid={`delete-empleado-${item.id_empleado}`}>
                    <Trash2 size={14} color={Colors.rojoPeligro} />
                </TouchableOpacity>
            </View>
        </View>
    ), []);

    const renderItem = tabActiva === 'escuelas' ? renderEscuelaItem
        : tabActiva === 'vendedores' ? renderVendedorItem
        : tabActiva === 'cuentas' ? renderCuentaItem
        : tabActiva === 'eventos' ? renderEventoItem
        : renderEmpleadoItem;

    const keyExtractor = (item: any) => String(
        tabActiva === 'escuelas' ? item.id_escuela
        : tabActiva === 'vendedores' ? item.id_vendedor
        : tabActiva === 'cuentas' ? item.id_cuenta
        : tabActiva === 'eventos' ? item.id_evento
        : item.id_empleado
    );

    const renderEmpty = () => (
        <View style={s.emptyWrap}>
            <TabIcon name={tabActual.iconName} size={40} color="rgba(26,0,96,0.15)" />
            <Text style={s.emptyTitle}>{search ? 'Sin resultados' : 'Sin registros todavia'}</Text>
            <Text style={s.emptySub}>
                {search ? `No se encontraron ${tabActual.label.toLowerCase()} con "${search}".` : `No hay ${tabActual.label.toLowerCase()} registrados.`}
            </Text>
            {!search && (
                <TouchableOpacity style={s.emptyCta} onPress={() => openAddForTab(tabActiva)} data-testid="catalogos-empty-add-btn">
                    <Plus size={14} color={Colors.blanco} /><Text style={s.emptyCtaText}>Agregar {tabActual.label.toLowerCase()}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={s.root} data-testid="catalogos-screen">
            <TopBar title="Catalogos" />

            <View style={s.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={s.pageTitle}>Catalogos Maestros</Text>
                    <Text style={s.pageSub}>Personal, escuelas y eventos del sistema.</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={() => setAddOpen(true)} data-testid="catalogos-add-btn" activeOpacity={0.8}>
                    <Plus size={16} color={Colors.amarilloAccento} />
                    <Text style={s.addBtnText}>Agregar</Text>
                    <ChevronDown size={14} color={Colors.amarilloAccento} />
                </TouchableOpacity>
            </View>

            {/* Tab selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[s.tab, tabActiva === tab.id && s.tabActive]}
                        onPress={() => setTabActiva(tab.id)}
                        data-testid={`tab-${tab.id}`}
                    >
                        <TabIcon name={tab.iconName} size={14} color={tabActiva === tab.id ? Colors.amarilloAccento : Colors.azulMarino} />
                        <Text style={[s.tabText, tabActiva === tab.id && s.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Search + count */}
            <View style={s.searchRow}>
                <View style={s.searchWrap}>
                    <Search size={14} color="rgba(26,0,96,0.3)" />
                    <TextInput
                        style={s.searchInput}
                        placeholder={`Buscar ${tabActual.label.toLowerCase()}...`}
                        placeholderTextColor="rgba(26,0,96,0.3)"
                        value={search} onChangeText={setSearch}
                        data-testid="catalogos-search"
                    />
                    {search !== '' && (
                        <TouchableOpacity onPress={() => setSearch('')} data-testid="catalogos-clear-search"><X size={14} color="rgba(26,0,96,0.3)" /></TouchableOpacity>
                    )}
                </View>
                <View style={s.countBadge}><Text style={s.countText}>{totalRegistros}</Text></View>
            </View>

            {/* List */}
            {loadingDatos ? (
                <View style={s.loadingWrap}>
                    <ActivityIndicator size="large" color={Colors.moradoAccento} />
                    <Text style={s.loadingText}>Cargando datos...</Text>
                </View>
            ) : (
                <FlatList
                    data={datosActuales}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
                    ListEmptyComponent={renderEmpty}
                    data-testid="catalogos-list"
                />
            )}

            {/* Add dropdown modal */}
            <Modal transparent visible={addOpen} animationType="fade" onRequestClose={() => setAddOpen(false)}>
                <TouchableOpacity style={s.dropOverlay} activeOpacity={1} onPress={() => setAddOpen(false)}>
                    <View style={s.dropModal}>
                        <Text style={s.dropHeader}>Que deseas registrar?</Text>
                        {TABS.map(tab => (
                            <TouchableOpacity key={tab.id} style={s.dropItem} onPress={() => openAddForTab(tab.id)} data-testid={`add-${tab.id}`}>
                                <TabIcon name={tab.iconName} size={16} color={Colors.moradoAccento} />
                                <View style={{ flex: 1 }}>
                                    <Text style={s.dropItemLabel}>{tab.label}</Text>
                                    <Text style={s.dropItemSub}>Nuevo registro</Text>
                                </View>
                                <ChevronRight size={14} color="rgba(26,0,96,0.2)" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modales de Registro/Edicion */}
            <ModalEscuela isOpen={isModalEscuelaOpen} onClose={() => { setIsModalEscuelaOpen(false); setEscuelaEditando(null); }} onSave={handleGuardarEscuela} escuelaAEditar={escuelaEditando} />
            <ModalVendedor isOpen={isModalVendedorOpen} onClose={() => { setIsModalVendedorOpen(false); setVendedorEditando(null); }} onSave={handleGuardarVendedor} vendedorAEditar={vendedorEditando} />
            <ModalCuentaBancaria isOpen={isModalCuentaOpen} onClose={() => { setIsModalCuentaOpen(false); setCuentaEditando(null); }} onSave={handleGuardarCuenta} cuentaAEditar={cuentaEditando} />
            <ModalEvento isOpen={isModalEventoOpen} onClose={() => { setIsModalEventoOpen(false); setEventoEditando(null); }} onSave={handleGuardarEvento} eventoAEditar={eventoEditando} />
            <ModalEmpleado isOpen={isModalEmpleadoOpen} onClose={() => { setIsModalEmpleadoOpen(false); setEmpleadoEditando(null); }} onSave={handleGuardarEmpleado} empleadoAEditar={empleadoEditando} />

            {/* Modal de confirmacion/exito */}
            <ActionModal
                isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title}
                subtitle={actionModal.subtitle} description={actionModal.description}
                itemName={actionModal.itemName}
                onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={actionModal.onConfirm}
            />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.fondoMoradoClaro },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 12 },
    pageTitle: { fontWeight: '900', fontSize: 24, color: Colors.azulMarino, letterSpacing: 0.5 },
    pageSub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.5)', marginTop: 2 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.azulMarino, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2.5, borderColor: Colors.azulMarino, elevation: 4, shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, shadowRadius: 0 },
    addBtnText: { fontWeight: '900', fontSize: 12, color: Colors.amarilloAccento, textTransform: 'uppercase', letterSpacing: 1 },
    tabRow: { maxHeight: 48, marginBottom: 8 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(26,0,96,0.12)', backgroundColor: Colors.blanco },
    tabActive: { backgroundColor: Colors.azulMarino, borderColor: Colors.azulMarino },
    tabText: { fontWeight: '700', fontSize: 12, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    tabTextActive: { color: Colors.amarilloAccento },
    searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, marginBottom: 4 },
    searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
    searchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    countBadge: { backgroundColor: Colors.azulMarino, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    countText: { fontWeight: '900', fontSize: 12, color: Colors.amarilloAccento },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontWeight: '700', fontSize: 13, color: 'rgba(26,0,96,0.4)' },
    card: { backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 18, padding: 16, elevation: 2, shadowColor: Colors.azulMarino, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.08, shadowRadius: 0 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    idBadge: { fontWeight: '700', fontSize: 12, color: 'rgba(26,0,96,0.4)' },
    cardName: { fontWeight: '800', fontSize: 16, color: Colors.azulMarino, marginBottom: 8 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    tagBadge: { backgroundColor: Colors.azulMarino, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    tagBadgeText: { fontWeight: '800', fontSize: 10, color: Colors.amarilloAccento },
    metaText: { fontWeight: '500', fontSize: 12, color: 'rgba(26,0,96,0.5)' },
    comisionBadge: { backgroundColor: Colors.verdeExito, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    comisionText: { fontWeight: '800', fontSize: 11, color: Colors.blanco },
    instagramText: { fontWeight: '600', fontSize: 12, color: Colors.moradoAccento },
    bancoBadge: { backgroundColor: Colors.azulMarino, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    bancoBadgeText: { fontWeight: '800', fontSize: 10, color: Colors.amarilloAccento },
    clabeText: { fontWeight: '600', fontSize: 13, color: Colors.verdeExito, marginBottom: 12 },
    fechasWrap: { marginBottom: 8 },
    fechaInicio: { fontWeight: '700', fontSize: 12, color: Colors.verdeExito },
    fechaFin: { fontWeight: '700', fontSize: 12, color: Colors.rojoPeligro, marginTop: 2 },
    puestoBadge: { backgroundColor: Colors.moradoAccento, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    puestoBadgeText: { fontWeight: '800', fontSize: 10, color: Colors.blanco },
    emailText: { fontWeight: '500', fontSize: 12, color: Colors.azulMarino, marginBottom: 12 },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(26,0,96,0.12)', backgroundColor: Colors.blanco, justifyContent: 'center', alignItems: 'center' },
    actionBtnDanger: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255,80,80,0.2)', backgroundColor: Colors.rojoFondo, justifyContent: 'center', alignItems: 'center' },
    emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyTitle: { fontWeight: '800', fontSize: 18, color: Colors.azulMarino },
    emptySub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.45)', textAlign: 'center', maxWidth: 260 },
    emptyCta: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.moradoAccento, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginTop: 8 },
    emptyCtaText: { fontWeight: '800', fontSize: 12, color: Colors.blanco, textTransform: 'uppercase', letterSpacing: 0.5 },
    dropOverlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.25)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    dropModal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 20, width: '100%', maxWidth: 340, padding: 20, elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.3, shadowRadius: 0 },
    dropHeader: { fontWeight: '800', fontSize: 11, color: 'rgba(26,0,96,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
    dropItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.06)' },
    dropItemLabel: { fontWeight: '700', fontSize: 14, color: Colors.azulMarino },
    dropItemSub: { fontWeight: '500', fontSize: 11, color: 'rgba(26,0,96,0.4)' },
});
