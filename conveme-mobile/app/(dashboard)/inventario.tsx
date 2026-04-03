import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, Modal, ScrollView,
} from 'react-native';
import {
    Plus, ChevronDown, ChevronRight, Pencil, Trash2,
    Search, X, ArrowUpDown, Package, Tags, Ruler,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import ActionModal from '@/components/ui/ActionModal';
import type { ActionType } from '@/components/ui/ActionModal';
import ModalCategoria from '@/components/inventario/ModalCategoria';
import ModalProducto from '@/components/inventario/ModalProducto';
import ModalTamano from '@/components/inventario/ModalTamano';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '@/services/categoria.service';
import { getProductos, createProducto, updateProducto, deleteProducto } from '@/services/producto.service';
import { getTamanos, createTamano, updateTamano, deleteTamano } from '@/services/tamano.service';

const TABS = [
    { id: 'productos', label: 'Productos', iconName: 'package' },
    { id: 'categorias', label: 'Categorias', iconName: 'tags' },
    { id: 'tamanos', label: 'Tamanos', iconName: 'ruler' },
];

const TabIcon = ({ name, size, color }: { name: string; size: number; color: string }) => {
    if (name === 'package') return <Package size={size} color={color} />;
    if (name === 'tags') return <Tags size={size} color={color} />;
    return <Ruler size={size} color={color} />;
};

export default function Inventario() {
    const [tabActiva, setTabActiva] = useState('productos');
    const [addOpen, setAddOpen] = useState(false);

    const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState<any | null>(null);
    const [isModalProductoOpen, setIsModalProductoOpen] = useState(false);
    const [productoEditando, setProductoEditando] = useState<any | null>(null);
    const [isModalTamanoOpen, setIsModalTamanoOpen] = useState(false);
    const [tamanoEditando, setTamanoEditando] = useState<any | null>(null);

    const [actionModal, setActionModal] = useState<{
        isOpen: boolean; type: ActionType; title: string; subtitle: string;
        description?: string; itemName?: string; onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    const [datosCategorias, setDatosCategorias] = useState<any[]>([]);
    const [datosProductos, setDatosProductos] = useState<any[]>([]);
    const [datosTamanos, setDatosTamanos] = useState<any[]>([]);
    const [loadingDatos, setLoadingDatos] = useState(false);

    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);

    const tabActual = TABS.find(t => t.id === tabActiva)!;

    useEffect(() => {
        if (tabActiva === 'categorias') cargarCategorias();
        if (tabActiva === 'productos') cargarProductos();
        if (tabActiva === 'tamanos') cargarTamanos();
        setSearch(''); setSortKey(null); setSortAsc(true);
    }, [tabActiva]);

    const handleSort = (key: string) => {
        if (sortKey === key) setSortAsc(v => !v);
        else { setSortKey(key); setSortAsc(true); }
    };

    const cargarCategorias = async () => { setLoadingDatos(true); try { setDatosCategorias(await getCategorias()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarCategoria = async (data: any) => {
        try {
            if (categoriaEditando) { await updateCategoria({ id_categoria: categoriaEditando.id_categoria, ...data }); }
            else { await createCategoria(data); }
            await cargarCategorias();
        } catch (err: any) { throw err; }
    };

    const cargarProductos = async () => { setLoadingDatos(true); try { setDatosProductos(await getProductos()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarProducto = async (data: any) => {
        try {
            if (productoEditando) { await updateProducto({ id_producto: productoEditando.id_producto, ...data }); }
            else { await createProducto(data); }
            await cargarProductos();
        } catch (err: any) { throw err; }
    };

    const cargarTamanos = async () => { setLoadingDatos(true); try { setDatosTamanos(await getTamanos()); } catch (err) { console.error(err); } finally { setLoadingDatos(false); } };
    const handleGuardarTamano = async (data: any) => {
        try {
            if (tamanoEditando) { await updateTamano({ id_tamano: tamanoEditando.id_tamano, ...data }); }
            else { await createTamano(data); }
            await cargarTamanos();
        } catch (err: any) { throw err; }
    };

    const datosTablaActual = tabActiva === 'categorias' ? datosCategorias : tabActiva === 'productos' ? datosProductos : datosTamanos;

    const datosActuales = datosTablaActual
        .filter(e => {
            const text = tabActiva === 'categorias' ? [e.nombre].join(' ').toLowerCase()
                : tabActiva === 'productos' ? [e.sku, e.nombre, e.categoria?.nombre, e.tamano?.descripcion].join(' ').toLowerCase()
                : [e.descripcion].join(' ').toLowerCase();
            return text.includes(search.toLowerCase());
        })
        .sort((a, b) => {
            if (!sortKey) return 0;
            const val = (obj: any) => {
                if (tabActiva === 'productos') return sortKey === 'categoria' ? obj.categoria?.nombre ?? '' : sortKey === 'tamano' ? obj.tamano?.descripcion ?? '' : sortKey === 'precio' ? obj.precio_unitario ?? 0 : obj[sortKey] ?? '';
                return obj[sortKey] ?? '';
            };
            const vA = val(a), vB = val(b);
            if (typeof vA === 'number' && typeof vB === 'number') return sortAsc ? vA - vB : vB - vA;
            return sortAsc ? String(vA).localeCompare(String(vB)) : String(vB).localeCompare(String(vA));
        });

    const totalRegistros = datosTablaActual.length;

    const openAddForTab = (tabId: string) => {
        setTabActiva(tabId); setAddOpen(false);
        if (tabId === 'categorias') { setCategoriaEditando(null); setIsModalCategoriaOpen(true); }
        else if (tabId === 'productos') { setProductoEditando(null); setIsModalProductoOpen(true); }
        else if (tabId === 'tamanos') { setTamanoEditando(null); setIsModalTamanoOpen(true); }
    };

    const renderProductoItem = useCallback(({ item }: { item: any }) => (
        <View style={s.card} data-testid={`producto-card-${item.id_producto}`}>
            <View style={s.cardTop}>
                <Text style={s.skuBadge}>{item.sku}</Text>
                <Text style={s.precioBadge}>${Number(item.precio_unitario).toFixed(2)}</Text>
            </View>
            <Text style={s.cardName}>{item.nombre}</Text>
            <View style={s.cardMeta}>
                <View style={s.catBadge}><Text style={s.catBadgeText}>{item.categoria?.nombre || '—'}</Text></View>
                <Text style={s.metaText}>{item.tamano?.descripcion || '—'}</Text>
            </View>
            <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => { setProductoEditando(item); setIsModalProductoOpen(true); }}>
                    <Pencil size={14} color={Colors.azulMarino} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtnDanger} onPress={() => {
                    setActionModal({
                        isOpen: true, type: 'confirm-delete', title: 'Eliminar Producto', subtitle: 'Eliminar producto?',
                        description: 'El producto se ocultara del inventario activo.',
                        itemName: `${item.sku} - ${item.nombre}`,
                        onConfirm: async () => { await deleteProducto(item.id_producto); await cargarProductos(); },
                    });
                }}>
                    <Trash2 size={14} color={Colors.rojoPeligro} />
                </TouchableOpacity>
            </View>
        </View>
    ), []);

    const renderCategoriaItem = useCallback(({ item }: { item: any }) => (
        <View style={s.card} data-testid={`categoria-card-${item.id_categoria}`}>
            <View style={s.cardTop}>
                <Text style={s.idBadge}>#{item.id_categoria}</Text>
            </View>
            <Text style={s.cardName}>{item.nombre}</Text>
            <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => { setCategoriaEditando(item); setIsModalCategoriaOpen(true); }}>
                    <Pencil size={14} color={Colors.azulMarino} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtnDanger} onPress={() => {
                    setActionModal({
                        isOpen: true, type: 'confirm-delete', title: 'Eliminar Categoria', subtitle: 'Eliminar categoria?',
                        description: 'Esta accion es permanente.',
                        itemName: item.nombre,
                        onConfirm: async () => { await deleteCategoria(item.id_categoria); await cargarCategorias(); },
                    });
                }}>
                    <Trash2 size={14} color={Colors.rojoPeligro} />
                </TouchableOpacity>
            </View>
        </View>
    ), []);

    const renderTamanoItem = useCallback(({ item }: { item: any }) => (
        <View style={s.card} data-testid={`tamano-card-${item.id_tamano}`}>
            <View style={s.cardTop}>
                <Text style={s.idBadge}>#{item.id_tamano}</Text>
            </View>
            <Text style={s.cardName}>{item.descripcion}</Text>
            <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => { setTamanoEditando(item); setIsModalTamanoOpen(true); }}>
                    <Pencil size={14} color={Colors.azulMarino} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtnDanger} onPress={() => {
                    setActionModal({
                        isOpen: true, type: 'confirm-delete', title: 'Eliminar Tamano', subtitle: 'Eliminar tamano?',
                        description: 'Esta accion es permanente.',
                        itemName: item.descripcion,
                        onConfirm: async () => { await deleteTamano(item.id_tamano); await cargarTamanos(); },
                    });
                }}>
                    <Trash2 size={14} color={Colors.rojoPeligro} />
                </TouchableOpacity>
            </View>
        </View>
    ), []);

    const renderItem = tabActiva === 'productos' ? renderProductoItem : tabActiva === 'categorias' ? renderCategoriaItem : renderTamanoItem;
    const keyExtractor = (item: any) => String(tabActiva === 'productos' ? item.id_producto : tabActiva === 'categorias' ? item.id_categoria : item.id_tamano);

    const renderEmpty = () => (
        <View style={s.emptyWrap}>
            <TabIcon name={tabActual.iconName} size={40} color="rgba(26,0,96,0.15)" />
            <Text style={s.emptyTitle}>{search ? 'Sin resultados' : 'Sin registros todavia'}</Text>
            <Text style={s.emptySub}>
                {search ? `No se encontraron ${tabActual.label.toLowerCase()} con "${search}".` : `No hay ${tabActual.label.toLowerCase()} registrados.`}
            </Text>
            {!search && (
                <TouchableOpacity style={s.emptyCta} onPress={() => openAddForTab(tabActiva)}>
                    <Plus size={14} color={Colors.blanco} /><Text style={s.emptyCtaText}>Agregar {tabActual.label.toLowerCase()}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={s.root} data-testid="inventario-screen">
            <TopBar title="Inventario" />

            <View style={s.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={s.pageTitle}>Inventario</Text>
                    <Text style={s.pageSub}>Productos, categorias y tamanos.</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={() => setAddOpen(true)} data-testid="inventario-add-btn" activeOpacity={0.8}>
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
                        data-testid="inventario-search"
                    />
                    {search !== '' && (
                        <TouchableOpacity onPress={() => setSearch('')}><X size={14} color="rgba(26,0,96,0.3)" /></TouchableOpacity>
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
                    data-testid="inventario-list"
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

            {/* Modales */}
            <ModalCategoria isOpen={isModalCategoriaOpen} onClose={() => { setIsModalCategoriaOpen(false); setCategoriaEditando(null); }} onSave={handleGuardarCategoria} categoriaAEditar={categoriaEditando} />
            <ModalProducto isOpen={isModalProductoOpen} onClose={() => { setIsModalProductoOpen(false); setProductoEditando(null); }} onSave={handleGuardarProducto} productoAEditar={productoEditando} />
            <ModalTamano isOpen={isModalTamanoOpen} onClose={() => { setIsModalTamanoOpen(false); setTamanoEditando(null); }} onSave={handleGuardarTamano} tamanoAEditar={tamanoEditando} />

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
    skuBadge: { fontWeight: '700', fontSize: 12, color: Colors.moradoAccento, letterSpacing: 0.5 },
    precioBadge: { fontWeight: '700', fontSize: 14, color: Colors.verdeExito },
    idBadge: { fontWeight: '700', fontSize: 12, color: 'rgba(26,0,96,0.4)' },
    cardName: { fontWeight: '800', fontSize: 16, color: Colors.azulMarino, marginBottom: 8 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    catBadge: { backgroundColor: Colors.azulMarino, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    catBadgeText: { fontWeight: '800', fontSize: 10, color: Colors.amarilloAccento },
    metaText: { fontWeight: '500', fontSize: 12, color: 'rgba(26,0,96,0.5)' },
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
