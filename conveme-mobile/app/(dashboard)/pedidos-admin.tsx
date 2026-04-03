import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import {
    Search, ClipboardList, Check, X as XIcon, Trash2,
    CalendarClock, PackageOpen,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import ActionModal from '@/components/ui/ActionModal';
import type { ActionType } from '@/components/ui/ActionModal';
import { getPedidos, updateEstadoPedido, deletePedido } from '@/services/pedido.service';
import { notificarPedidoEntregado, notificarPedidoCancelado } from '@/services/notification.service';

const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '—';
    return new Date(fechaStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getEstadoStyle = (estado: string) => {
    if (estado === 'Pendiente') return { bg: Colors.amarilloAccento, color: Colors.azulMarino };
    if (estado === 'Entregado') return { bg: Colors.verdeExito, color: Colors.blanco };
    if (estado === 'Cancelado') return { bg: Colors.rojoPeligro, color: Colors.blanco };
    return { bg: Colors.gris200, color: Colors.gris800 };
};

export default function PedidosAdmin() {
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [actionModal, setActionModal] = useState<{
        isOpen: boolean; type: ActionType; title: string; subtitle: string;
        description?: string; itemName?: string; onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await getPedidos();
            setPedidos(data.sort((a: any, b: any) => b.id_pedido - a.id_pedido));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarEntregado = (pedido: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete',
            title: 'Entregar Pedido', subtitle: `Marcar pedido #${pedido.id_pedido} como entregado?`,
            description: `Asegurate de haber cobrado el restante de $${(pedido.monto_total - pedido.anticipo).toFixed(2)}.`,
            itemName: `Cliente: ${pedido.cliente?.nombre_completo || 'General'}`,
            onConfirm: async () => {
                await updateEstadoPedido(pedido.id_pedido, 'Entregado');
                await cargarPedidos();
                notificarPedidoEntregado(pedido.id_pedido, pedido.cliente?.nombre_completo || 'General');
                setActionModal({ isOpen: true, type: 'success', title: 'Entregado!', subtitle: 'El pedido ha sido completado.' });
                setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
            }
        });
    };

    const handleCancelar = (pedido: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete',
            title: 'Cancelar Pedido', subtitle: `Cancelar el pedido #${pedido.id_pedido}?`,
            description: 'El pedido sera marcado como Cancelado. Esta accion no se puede deshacer.',
            itemName: `Cliente: ${pedido.cliente?.nombre_completo || 'General'}`,
            onConfirm: async () => {
                await updateEstadoPedido(pedido.id_pedido, 'Cancelado');
                await cargarPedidos();
                notificarPedidoCancelado(pedido.id_pedido);
                setActionModal({ isOpen: true, type: 'success-delete', title: 'Pedido Cancelado', subtitle: 'El pedido fue cancelado correctamente.' });
                setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
            }
        });
    };

    const handleDelete = (pedido: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete',
            title: 'Eliminar Pedido', subtitle: 'Eliminar este registro?',
            description: 'Se borrara por completo de la base de datos.',
            itemName: `Pedido #${pedido.id_pedido}`,
            onConfirm: async () => {
                await deletePedido(pedido.id_pedido);
                await cargarPedidos();
                setActionModal({ isOpen: true, type: 'success-delete', title: 'Eliminado', subtitle: 'El pedido fue borrado del sistema.' });
                setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
            }
        });
    };

    const pedidosFiltrados = pedidos.filter(p =>
        String(p.id_pedido).includes(search) ||
        (p.cliente?.nombre_completo || '').toLowerCase().includes(search.toLowerCase()) ||
        p.estado.toLowerCase().includes(search.toLowerCase())
    );

    const renderPedidoItem = useCallback(({ item }: { item: any }) => {
        const restante = Number(item.monto_total) - Number(item.anticipo);
        const estadoStyle = getEstadoStyle(item.estado);

        return (
            <View style={s.card} data-testid={`pedido-card-${item.id_pedido}`}>
                {/* Header */}
                <View style={s.cardHeader}>
                    <View>
                        <Text style={s.cardTitle}>Pedido #{item.id_pedido}</Text>
                        <Text style={s.cardDate}>{formatearFecha(item.fecha_pedido)}</Text>
                    </View>
                    <View style={[s.estadoBadge, { backgroundColor: estadoStyle.bg }]}>
                        <Text style={[s.estadoText, { color: estadoStyle.color }]}>{item.estado}</Text>
                    </View>
                </View>

                {/* Cliente/Vendedor */}
                <Text style={s.clienteText}>
                    {item.cliente?.nombre_completo ? `Cliente: ${item.cliente.nombre_completo}` :
                     item.vendedor?.nombre_completo ? `Vendedor: ${item.vendedor.nombre_completo}` :
                     'Mostrador'}
                </Text>

                {/* Fecha entrega */}
                {item.fecha_entrega_estimada && (
                    <View style={s.entregaWrap}>
                        <CalendarClock size={13} color={Colors.verdeExito} />
                        <Text style={s.entregaText}>Entrega: {formatearFecha(item.fecha_entrega_estimada)}</Text>
                    </View>
                )}

                {/* Finanzas */}
                <View style={s.finanzasRow}>
                    <View style={s.finanzaItem}>
                        <Text style={s.finanzaLabel}>Total</Text>
                        <Text style={s.finanzaValor}>${Number(item.monto_total).toFixed(2)}</Text>
                    </View>
                    <View style={s.finanzaDivider} />
                    <View style={s.finanzaItem}>
                        <Text style={s.finanzaLabel}>Anticipo</Text>
                        <Text style={[s.finanzaValor, { color: Colors.verdeExito }]}>${Number(item.anticipo).toFixed(2)}</Text>
                    </View>
                    <View style={s.finanzaDivider} />
                    <View style={s.finanzaItem}>
                        <Text style={s.finanzaLabel}>Resta</Text>
                        <Text style={[s.finanzaValor, { color: Colors.rojoPeligro }]}>${restante.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Productos */}
                <View style={s.productosWrap}>
                    <View style={s.productosHeader}>
                        <PackageOpen size={12} color="rgba(26,0,96,0.5)" />
                        <Text style={s.productosTitle}>Productos</Text>
                    </View>
                    {item.detalles?.map((det: any, idx: number) => (
                        <View key={idx} style={s.productoRow}>
                            <Text style={s.productoNombre} numberOfLines={1}>{det.producto?.nombre}</Text>
                            <Text style={s.productoPrecio}>${det.precio_unitario}</Text>
                            <Text style={s.productoCant}>x{det.cantidad}</Text>
                        </View>
                    ))}
                </View>

                {/* Acciones */}
                <View style={s.accionesRow}>
                    {item.estado === 'Pendiente' && (
                        <>
                            <TouchableOpacity style={s.btnEntregado} onPress={() => handleMarcarEntregado(item)} data-testid={`entregar-${item.id_pedido}`}>
                                <Check size={14} color={Colors.verdeExito} />
                                <Text style={s.btnEntregadoText}>Entregado</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.btnCancelar} onPress={() => handleCancelar(item)} data-testid={`cancelar-${item.id_pedido}`}>
                                <XIcon size={14} color={Colors.rojoPeligro} />
                                <Text style={s.btnCancelarText}>Cancelar</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity style={s.btnEliminar} onPress={() => handleDelete(item)} data-testid={`eliminar-${item.id_pedido}`}>
                        <Trash2 size={14} color={Colors.rojoPeligro} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }, []);

    const renderEmpty = () => (
        <View style={s.emptyWrap}>
            <ClipboardList size={40} color="rgba(26,0,96,0.15)" />
            <Text style={s.emptyTitle}>{search ? 'Sin resultados' : 'No hay pedidos'}</Text>
            <Text style={s.emptySub}>
                {search ? `No se encontraron pedidos con "${search}".` : 'Aqui apareceran los pedidos de los clientes.'}
            </Text>
        </View>
    );

    return (
        <View style={s.root} data-testid="pedidos-admin-screen">
            <TopBar title="Pedidos" />

            <View style={s.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={s.pageTitle}>Pedidos (Apartados)</Text>
                    <Text style={s.pageSub}>Anticipos, entregas y cancelaciones.</Text>
                </View>
            </View>

            {/* Search */}
            <View style={s.searchRow}>
                <View style={s.searchWrap}>
                    <Search size={14} color="rgba(26,0,96,0.3)" />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Buscar por cliente, ID o estado..."
                        placeholderTextColor="rgba(26,0,96,0.3)"
                        value={search} onChangeText={setSearch}
                        data-testid="pedidos-search"
                    />
                    {search !== '' && (
                        <TouchableOpacity onPress={() => setSearch('')}><XIcon size={14} color="rgba(26,0,96,0.3)" /></TouchableOpacity>
                    )}
                </View>
                <View style={s.countBadge}><Text style={s.countText}>{pedidosFiltrados.length}</Text></View>
            </View>

            {/* List */}
            {loading ? (
                <View style={s.loadingWrap}>
                    <ActivityIndicator size="large" color={Colors.moradoAccento} />
                    <Text style={s.loadingText}>Cargando pedidos...</Text>
                </View>
            ) : (
                <FlatList
                    data={pedidosFiltrados}
                    renderItem={renderPedidoItem}
                    keyExtractor={(item) => String(item.id_pedido)}
                    contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 100 }}
                    ListEmptyComponent={renderEmpty}
                    data-testid="pedidos-list"
                />
            )}

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
    searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, marginBottom: 4 },
    searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
    searchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    countBadge: { backgroundColor: Colors.azulMarino, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    countText: { fontWeight: '900', fontSize: 12, color: Colors.amarilloAccento },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontWeight: '700', fontSize: 13, color: 'rgba(26,0,96,0.4)' },
    card: { backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 20, padding: 18, elevation: 2, shadowColor: Colors.azulMarino, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.08, shadowRadius: 0 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    cardTitle: { fontWeight: '900', fontSize: 18, color: Colors.azulMarino },
    cardDate: { fontWeight: '700', fontSize: 11, color: 'rgba(26,0,96,0.5)', marginTop: 2 },
    estadoBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    estadoText: { fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
    clienteText: { fontWeight: '700', fontSize: 13, color: Colors.moradoAccento, marginBottom: 8 },
    entregaWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.verdeFondo, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12 },
    entregaText: { fontWeight: '700', fontSize: 12, color: Colors.verdeExito },
    finanzasRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(248,245,255,1)', borderWidth: 1.5, borderColor: 'rgba(212,184,240,0.5)', borderRadius: 14, padding: 12, marginBottom: 12 },
    finanzaItem: { flex: 1, alignItems: 'center' },
    finanzaLabel: { fontWeight: '700', fontSize: 9, textTransform: 'uppercase', color: 'rgba(26,0,96,0.5)', marginBottom: 2 },
    finanzaValor: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino },
    finanzaDivider: { width: 1, height: 24, backgroundColor: 'rgba(212,184,240,0.5)' },
    productosWrap: { backgroundColor: 'rgba(248,249,250,1)', borderRadius: 14, padding: 12, marginBottom: 12 },
    productosHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
    productosTitle: { fontWeight: '800', fontSize: 10, textTransform: 'uppercase', color: 'rgba(26,0,96,0.5)', letterSpacing: 0.5 },
    productoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.05)' },
    productoNombre: { flex: 1, fontWeight: '500', fontSize: 12, color: Colors.azulMarino },
    productoPrecio: { fontWeight: '500', fontSize: 12, color: 'rgba(26,0,96,0.5)', marginRight: 8 },
    productoCant: { fontWeight: '900', fontSize: 12, color: Colors.moradoAccento },
    accionesRow: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(26,0,96,0.08)', paddingTop: 12 },
    btnEntregado: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: Colors.verdeFondo, borderWidth: 1.5, borderColor: 'rgba(6,214,160,0.2)', borderRadius: 12, paddingVertical: 10 },
    btnEntregadoText: { fontWeight: '700', fontSize: 12, color: Colors.verdeExito },
    btnCancelar: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: Colors.rojoFondo, borderWidth: 1.5, borderColor: 'rgba(255,80,80,0.2)', borderRadius: 12, paddingVertical: 10 },
    btnCancelarText: { fontWeight: '700', fontSize: 12, color: Colors.rojoPeligro },
    btnEliminar: { backgroundColor: Colors.rojoFondo, borderWidth: 1.5, borderColor: 'rgba(255,80,80,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
    emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyTitle: { fontWeight: '800', fontSize: 18, color: Colors.azulMarino },
    emptySub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.45)', textAlign: 'center', maxWidth: 260 },
});
