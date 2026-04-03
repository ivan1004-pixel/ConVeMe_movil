import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, ScrollView, Modal,
} from 'react-native';
import {
    Scissors, Box, Plus, ChevronDown, ChevronRight, Search,
    X, CheckCircle, Pencil, Trash2, AlertTriangle,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import ActionModal from '@/components/ui/ActionModal';
import type { ActionType } from '@/components/ui/ActionModal';
import ModalOrdenProduccion from '@/components/produccion/ModalOrdenProduccion';
import ModalInsumo from '@/components/produccion/ModalInsumo';
import { getOrdenesProduccion, createOrdenProduccion, updateOrdenProduccion } from '@/services/produccion.service';
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from '@/services/insumo.service';

const TABS = [
    { id: 'ordenes', label: 'Ordenes', IconComp: Scissors },
    { id: 'insumos', label: 'Materia Prima', IconComp: Box },
];

const formatFecha = (s: string) => s ? new Date(s).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function Produccion() {
    const [tabActiva, setTabActiva] = useState('ordenes');
    const [addOpen, setAddOpen] = useState(false);

    const [isModalOrdenOpen, setIsModalOrdenOpen] = useState(false);
    const [isModalInsumoOpen, setIsModalInsumoOpen] = useState(false);
    const [insumoEditando, setInsumoEditando] = useState<any | null>(null);

    const [datosOrdenes, setDatosOrdenes] = useState<any[]>([]);
    const [datosInsumos, setDatosInsumos] = useState<any[]>([]);
    const [loadingDatos, setLoadingDatos] = useState(false);
    const [search, setSearch] = useState('');

    const [actionModal, setActionModal] = useState<{
        isOpen: boolean; type: ActionType; title: string; subtitle: string;
        description?: string; itemName?: string; onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        if (tabActiva === 'ordenes') cargarOrdenes();
        if (tabActiva === 'insumos') cargarInsumos();
        setSearch('');
    }, [tabActiva]);

    const cargarOrdenes = async () => { setLoadingDatos(true); try { setDatosOrdenes(await getOrdenesProduccion()); } catch (e) { console.error(e); } finally { setLoadingDatos(false); } };
    const cargarInsumos = async () => { setLoadingDatos(true); try { setDatosInsumos(await getInsumos()); } catch (e) { console.error(e); } finally { setLoadingDatos(false); } };

    const handleGuardarOrden = async (data: any) => { await createOrdenProduccion(data); await cargarOrdenes(); };
    const handleGuardarInsumo = async (data: any) => {
        if (insumoEditando) await updateInsumo({ id_insumo: insumoEditando.id_insumo, ...data });
        else await createInsumo(data);
        await cargarInsumos();
    };

    const handleFinalizarOrden = (orden: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete',
            title: 'Finalizar Lote', subtitle: 'Terminaste de fabricar este lote?',
            description: `Se sumaran ${orden.cantidad_a_producir} piezas de "${orden.producto?.nombre}" a tu inventario.`,
            itemName: `Orden #${orden.id_orden_produccion}`,
            onConfirm: async () => {
                await updateOrdenProduccion({ id_orden_produccion: orden.id_orden_produccion, estado: 'Finalizada' });
                await cargarOrdenes();
                setActionModal({ isOpen: true, type: 'success', title: 'Lote Terminado!', subtitle: 'Inventario actualizado.', itemName: '' });
                setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
            },
        });
    };

    const ordenesFiltradas = datosOrdenes.filter(o => [o.producto?.nombre, o.producto?.sku, o.empleado?.nombre_completo, o.estado].join(' ').toLowerCase().includes(search.toLowerCase()));
    const insumosFiltrados = datosInsumos.filter(i => [i.nombre, i.unidad_medida].join(' ').toLowerCase().includes(search.toLowerCase()));

    const renderOrdenItem = useCallback(({ item }: { item: any }) => {
        const finalizada = item.estado === 'Finalizada';
        return (
            <View style={s.card} data-testid={`orden-card-${item.id_orden_produccion}`}>
                <View style={s.cardTop}><Text style={s.idBadge}>#{item.id_orden_produccion}</Text>
                    <View style={[s.estadoBadge, { backgroundColor: finalizada ? Colors.verdeFondo : 'rgba(255,190,11,0.2)' }]}>
                        <Text style={[s.estadoText, { color: finalizada ? Colors.verdeExito : '#d49b00' }]}>{finalizada ? 'TERMINADA' : 'EN PROCESO'}</Text>
                    </View>
                </View>
                <Text style={s.cardName}>{item.producto?.nombre}</Text>
                <Text style={s.skuText}>{item.producto?.sku}</Text>
                <View style={s.cardMeta}>
                    <Text style={s.cantidadText}>{item.cantidad_a_producir} pz</Text>
                    <Text style={s.artesanoText}>{item.empleado?.nombre_completo || '—'}</Text>
                </View>
                <View style={s.cardActions}>
                    {!finalizada && (
                        <TouchableOpacity style={s.finalizarBtn} onPress={() => handleFinalizarOrden(item)} data-testid={`finalizar-${item.id_orden_produccion}`}>
                            <CheckCircle size={14} color={Colors.verdeExito} /><Text style={s.finalizarBtnText}>Finalizar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }, []);

    const renderInsumoItem = useCallback(({ item }: { item: any }) => {
        const bajoStock = Number(item.stock_actual) <= Number(item.stock_minimo_alerta);
        return (
            <View style={s.card} data-testid={`insumo-card-${item.id_insumo}`}>
                <View style={s.cardTop}><Text style={s.idBadge}>#{item.id_insumo}</Text></View>
                <Text style={s.cardName}>{item.nombre}</Text>
                <Text style={s.skuText}>{item.unidad_medida || '—'}</Text>
                <View style={s.stockRow}>
                    {bajoStock && <AlertTriangle size={14} color={Colors.rojoPeligro} />}
                    <Text style={[s.stockValue, bajoStock && { color: Colors.rojoPeligro }]}>Stock: {item.stock_actual}</Text>
                    <Text style={s.stockMin}>Min: {item.stock_minimo_alerta}</Text>
                </View>
                <View style={s.cardActions}>
                    <TouchableOpacity style={s.actionBtn} onPress={() => { setInsumoEditando(item); setIsModalInsumoOpen(true); }} data-testid={`edit-insumo-${item.id_insumo}`}><Pencil size={14} color={Colors.azulMarino} /></TouchableOpacity>
                    <TouchableOpacity style={s.actionBtnDanger} onPress={() => {
                        setActionModal({ isOpen: true, type: 'confirm-delete', title: 'Eliminar Insumo', subtitle: 'Borrar material?', description: 'No se puede borrar si ya fue usado en una orden.', itemName: item.nombre,
                            onConfirm: async () => { await deleteInsumo(item.id_insumo); await cargarInsumos(); setActionModal({ isOpen: true, type: 'success-delete', title: 'Eliminado', subtitle: 'Material borrado.', itemName: '' }); setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000); },
                        });
                    }} data-testid={`delete-insumo-${item.id_insumo}`}><Trash2 size={14} color={Colors.rojoPeligro} /></TouchableOpacity>
                </View>
            </View>
        );
    }, []);

    const tabActual = TABS.find(t => t.id === tabActiva)!;
    const datosActuales = tabActiva === 'ordenes' ? ordenesFiltradas : insumosFiltrados;

    return (
        <View style={s.root} data-testid="produccion-screen">
            <TopBar title="Produccion" />
            <View style={s.headerRow}>
                <View style={{ flex: 1 }}><Text style={s.pageTitle}>Taller de Produccion</Text><Text style={s.pageSub}>Fabricacion e inventario de materia prima.</Text></View>
                <TouchableOpacity style={s.addBtn} onPress={() => setAddOpen(true)} data-testid="produccion-add-btn"><Plus size={16} color={Colors.amarilloAccento} /><Text style={s.addBtnText}>Agregar</Text><ChevronDown size={14} color={Colors.amarilloAccento} /></TouchableOpacity>
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                {TABS.map(tab => (
                    <TouchableOpacity key={tab.id} style={[s.tab, tabActiva === tab.id && s.tabActive]} onPress={() => setTabActiva(tab.id)} data-testid={`prod-tab-${tab.id}`}>
                        <tab.IconComp size={14} color={tabActiva === tab.id ? Colors.amarilloAccento : Colors.azulMarino} />
                        <Text style={[s.tabText, tabActiva === tab.id && s.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Search */}
            <View style={s.searchRow}>
                <View style={s.searchWrap}><Search size={14} color="rgba(26,0,96,0.3)" /><TextInput style={s.searchInput} placeholder={`Buscar ${tabActual.label.toLowerCase()}...`} placeholderTextColor="rgba(26,0,96,0.3)" value={search} onChangeText={setSearch} data-testid="produccion-search" />
                    {search !== '' && <TouchableOpacity onPress={() => setSearch('')}><X size={14} color="rgba(26,0,96,0.3)" /></TouchableOpacity>}
                </View>
                <View style={s.countBadge}><Text style={s.countText}>{datosActuales.length}</Text></View>
            </View>

            {/* List */}
            {loadingDatos ? (
                <View style={s.loadingWrap}><ActivityIndicator size="large" color={Colors.moradoAccento} /></View>
            ) : (
                <FlatList data={datosActuales} renderItem={tabActiva === 'ordenes' ? renderOrdenItem : renderInsumoItem}
                    keyExtractor={item => String(tabActiva === 'ordenes' ? item.id_orden_produccion : item.id_insumo)}
                    contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
                    ListEmptyComponent={<View style={s.emptyWrap}><tabActual.IconComp size={40} color="rgba(26,0,96,0.15)" /><Text style={s.emptyTitle}>Sin registros</Text></View>} />
            )}

            {/* Add dropdown */}
            <Modal transparent visible={addOpen} animationType="fade" onRequestClose={() => setAddOpen(false)}>
                <TouchableOpacity style={s.dropOverlay} activeOpacity={1} onPress={() => setAddOpen(false)}>
                    <View style={s.dropModal}>
                        <Text style={s.dropHeader}>Que deseas registrar?</Text>
                        <TouchableOpacity style={s.dropItem} onPress={() => { setAddOpen(false); setIsModalOrdenOpen(true); }} data-testid="add-orden"><Scissors size={16} color={Colors.moradoAccento} /><View style={{ flex: 1 }}><Text style={s.dropItemLabel}>Nueva Orden</Text><Text style={s.dropItemSub}>Registrar lote y gastar insumo</Text></View><ChevronRight size={14} color="rgba(26,0,96,0.2)" /></TouchableOpacity>
                        <TouchableOpacity style={s.dropItem} onPress={() => { setAddOpen(false); setInsumoEditando(null); setIsModalInsumoOpen(true); }} data-testid="add-insumo"><Box size={16} color={Colors.moradoAccento} /><View style={{ flex: 1 }}><Text style={s.dropItemLabel}>Nuevo Insumo</Text><Text style={s.dropItemSub}>Dar de alta materia prima</Text></View><ChevronRight size={14} color="rgba(26,0,96,0.2)" /></TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <ModalOrdenProduccion isOpen={isModalOrdenOpen} onClose={() => setIsModalOrdenOpen(false)} onSave={handleGuardarOrden} />
            <ModalInsumo isOpen={isModalInsumoOpen} onClose={() => { setIsModalInsumoOpen(false); setInsumoEditando(null); }} onSave={handleGuardarInsumo} insumoAEditar={insumoEditando} />
            <ActionModal isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle} description={actionModal.description} itemName={actionModal.itemName} onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))} onConfirm={actionModal.onConfirm} />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.fondoMoradoClaro },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 12 },
    pageTitle: { fontWeight: '900', fontSize: 22, color: Colors.azulMarino },
    pageSub: { fontSize: 12, fontWeight: '500', color: 'rgba(26,0,96,0.5)', marginTop: 2 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.azulMarino, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2.5, borderColor: Colors.azulMarino, elevation: 4 },
    addBtnText: { fontWeight: '900', fontSize: 12, color: Colors.amarilloAccento, textTransform: 'uppercase', letterSpacing: 1 },
    tabRow: { maxHeight: 48, marginBottom: 8 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(26,0,96,0.12)', backgroundColor: Colors.blanco },
    tabActive: { backgroundColor: Colors.azulMarino, borderColor: Colors.azulMarino },
    tabText: { fontWeight: '700', fontSize: 12, color: Colors.azulMarino, textTransform: 'uppercase' },
    tabTextActive: { color: Colors.amarilloAccento },
    searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, marginBottom: 4 },
    searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
    searchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    countBadge: { backgroundColor: Colors.azulMarino, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    countText: { fontWeight: '900', fontSize: 12, color: Colors.amarilloAccento },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 18, padding: 16, elevation: 2, shadowColor: Colors.azulMarino, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.08, shadowRadius: 0 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    idBadge: { fontWeight: '700', fontSize: 12, color: 'rgba(26,0,96,0.4)' },
    estadoBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    estadoText: { fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8 },
    cardName: { fontWeight: '800', fontSize: 16, color: Colors.azulMarino, marginBottom: 2 },
    skuText: { fontWeight: '600', fontSize: 11, color: Colors.moradoAccento, marginBottom: 8 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    cantidadText: { fontWeight: '900', fontSize: 16, color: Colors.azulMarino },
    artesanoText: { fontWeight: '500', fontSize: 12, color: 'rgba(26,0,96,0.6)' },
    stockRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    stockValue: { fontWeight: '900', fontSize: 15, color: Colors.azulMarino },
    stockMin: { fontWeight: '600', fontSize: 12, color: Colors.moradoAccento },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    finalizarBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.verdeFondo, borderWidth: 1.5, borderColor: 'rgba(6,214,160,0.2)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
    finalizarBtnText: { fontWeight: '800', fontSize: 11, color: Colors.verdeExito, textTransform: 'uppercase' },
    actionBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(26,0,96,0.12)', backgroundColor: Colors.blanco, justifyContent: 'center', alignItems: 'center' },
    actionBtnDanger: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255,80,80,0.2)', backgroundColor: Colors.rojoFondo, justifyContent: 'center', alignItems: 'center' },
    emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyTitle: { fontWeight: '800', fontSize: 18, color: Colors.azulMarino },
    dropOverlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.25)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    dropModal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 20, width: '100%', maxWidth: 340, padding: 20, elevation: 12 },
    dropHeader: { fontWeight: '800', fontSize: 11, color: 'rgba(26,0,96,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
    dropItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.06)' },
    dropItemLabel: { fontWeight: '700', fontSize: 14, color: Colors.azulMarino },
    dropItemSub: { fontWeight: '500', fontSize: 11, color: 'rgba(26,0,96,0.4)' },
});
