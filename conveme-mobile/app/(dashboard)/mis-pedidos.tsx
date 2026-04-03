import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, ScrollView, Alert,
} from 'react-native';
import {
    ClipboardList, PackagePlus, Plus, Minus, Search, PackageOpen,
    ChevronLeft, Send, X as XIcon,
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import ActionModal from '@/components/ui/ActionModal';
import type { ActionType } from '@/components/ui/ActionModal';
import { getProductos } from '@/services/producto.service';
import { getPedidos, createPedido } from '@/services/pedido.service';

interface CartItem { producto: any; cantidad: number }

const formatearFecha = (s: string) => s ? new Date(s).toLocaleDateString('es-MX') : '—';

const getEstadoStyle = (estado: string) => {
    if (estado === 'Pendiente') return { bg: Colors.amarilloAccento, color: Colors.azulMarino };
    if (estado === 'Entregado') return { bg: Colors.verdeExito, color: Colors.blanco };
    if (estado === 'Cancelado') return { bg: Colors.rojoPeligro, color: Colors.blanco };
    return { bg: Colors.gris200, color: Colors.gris800 };
};

export default function MisPedidos() {
    const [vendedorId, setVendedorId] = useState<number>(0);
    const [vista, setVista] = useState<'lista' | 'crear'>('lista');
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [carrito, setCarrito] = useState<CartItem[]>([]);
    const [anticipo, setAnticipo] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: any; title: string; subtitle: string }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        SecureStore.getItemAsync('id_vendedor').then(v => { if (v) setVendedorId(Number(v)); });
    }, []);

    useEffect(() => {
        if (vista === 'lista' && vendedorId) cargarPedidos();
        if (vista === 'crear') cargarProductos();
    }, [vista, vendedorId]);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await getPedidos();
            const mis = data.filter((p: any) => p.vendedor?.id_vendedor === vendedorId);
            setPedidos(mis.sort((a: any, b: any) => b.id_pedido - a.id_pedido));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const cargarProductos = async () => {
        if (productos.length > 0) return;
        setLoading(true);
        try { setProductos(await getProductos()); } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const agregarAlCarrito = (producto: any) => {
        setCarrito(prev => {
            const existe = prev.find(i => i.producto.id_producto === producto.id_producto);
            if (existe) return prev.map(i => i.producto.id_producto === producto.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i);
            return [...prev, { producto, cantidad: 1 }];
        });
    };
    const modificarCantidad = (id: number, d: number) => setCarrito(prev => prev.map(i => i.producto.id_producto === id ? { ...i, cantidad: Math.max(1, i.cantidad + d) } : i));
    const quitarDelCarrito = (id: number) => setCarrito(prev => prev.filter(i => i.producto.id_producto !== id));
    const totalMonto = carrito.reduce((s, i) => s + (i.cantidad * i.producto.precio_unitario), 0);

    const enviarPedido = async () => {
        if (carrito.length === 0) return Alert.alert('Vacio', 'Agrega productos');
        setProcesando(true);
        try {
            await createPedido({
                vendedor_id: vendedorId, monto_total: Number(totalMonto.toFixed(2)),
                anticipo: Number(anticipo) || 0, estado: 'Pendiente',
                detalles: carrito.map(i => ({ producto_id: i.producto.id_producto, cantidad: i.cantidad, precio_unitario: Number(i.producto.precio_unitario) })),
            });
            setActionModal({ isOpen: true, type: 'success', title: 'Solicitud Enviada!', subtitle: 'El admin revisara tu pedido.' });
            setCarrito([]); setAnticipo('');
            setTimeout(() => { setActionModal(prev => ({ ...prev, isOpen: false })); setVista('lista'); }, 2000);
        } catch (e: any) { Alert.alert('Error', e.message); }
        finally { setProcesando(false); }
    };

    const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

    const renderPedidoCard = useCallback(({ item }: { item: any }) => {
        const es = getEstadoStyle(item.estado);
        return (
            <View style={s.pCard} data-testid={`mp-pedido-${item.id_pedido}`}>
                <View style={s.pCardHeader}>
                    <View><Text style={s.pCardTitle}>Solicitud #{item.id_pedido}</Text><Text style={s.pCardDate}>{formatearFecha(item.fecha_pedido)}</Text></View>
                    <View style={[s.pEstadoBadge, { backgroundColor: es.bg }]}><Text style={[s.pEstadoText, { color: es.color }]}>{item.estado}</Text></View>
                </View>
                <View style={s.pProdsWrap}>
                    {item.detalles?.map((d: any, i: number) => (
                        <View key={i} style={s.pProdRow}><Text style={s.pProdName} numberOfLines={1}>{d.cantidad}x {d.producto?.nombre}</Text><Text style={s.pProdPrice}>${(d.precio_unitario * d.cantidad).toFixed(2)}</Text></View>
                    ))}
                </View>
                <View style={s.pTotal}><Text style={s.pTotalLabel}>Valor del Pedido</Text><Text style={s.pTotalValue}>${Number(item.monto_total).toFixed(2)}</Text></View>
            </View>
        );
    }, []);

    const renderProductoCard = useCallback(({ item }: { item: any }) => (
        <TouchableOpacity style={s.prodCard} onPress={() => agregarAlCarrito(item)} activeOpacity={0.7} data-testid={`mp-prod-${item.id_producto}`}>
            <Text style={s.prodSku}>{item.sku}</Text>
            <Text style={s.prodName} numberOfLines={2}>{item.nombre}</Text>
            <Text style={s.prodPrice}>${item.precio_unitario}</Text>
        </TouchableOpacity>
    ), []);

    return (
        <View style={s.root} data-testid="mis-pedidos-screen">
            <TopBar title="Mis Pedidos" />
            <View style={s.headerRow}>
                <Text style={s.pageTitle}>Mis Solicitudes</Text>
                {vista === 'lista' ? (
                    <TouchableOpacity style={s.nuevoPedidoBtn} onPress={() => setVista('crear')} data-testid="mp-nuevo"><PackagePlus size={16} color={Colors.blanco} /><Text style={s.nuevoPedidoBtnText}>Nuevo</Text></TouchableOpacity>
                ) : (
                    <TouchableOpacity style={s.backBtn} onPress={() => setVista('lista')} data-testid="mp-back"><ChevronLeft size={16} color={Colors.azulMarino} /><Text style={s.backBtnText}>Lista</Text></TouchableOpacity>
                )}
            </View>

            {vista === 'lista' ? (
                loading ? <View style={s.loadingWrap}><ActivityIndicator size="large" color={Colors.moradoAccento} /></View> :
                <FlatList data={pedidos} renderItem={renderPedidoCard} keyExtractor={i => String(i.id_pedido)} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
                    ListEmptyComponent={<View style={s.emptyWrap}><PackagePlus size={40} color="rgba(26,0,96,0.15)" /><Text style={s.emptyTitle}>Sin solicitudes</Text><Text style={s.emptySub}>Solicita mercancia al administrador</Text></View>} />
            ) : (
                <View style={{ flex: 1 }}>
                    {/* Catalogo */}
                    <View style={s.catHeader}><PackageOpen size={16} color={Colors.moradoAccento} /><Text style={s.catTitle}>Catalogo</Text>
                        <View style={s.catSearchWrap}><Search size={14} color="rgba(26,0,96,0.3)" /><TextInput style={s.catSearchInput} placeholder="Buscar..." placeholderTextColor="rgba(26,0,96,0.3)" value={search} onChangeText={setSearch} data-testid="mp-search" /></View>
                    </View>
                    {loading ? <View style={s.loadingWrap}><ActivityIndicator size="large" color={Colors.moradoAccento} /></View> : (
                        <FlatList data={productosFiltrados} renderItem={renderProductoCard} keyExtractor={i => String(i.id_producto)} numColumns={2} columnWrapperStyle={{ gap: 10 }}
                            contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: carrito.length > 0 ? 300 : 60 }} />
                    )}

                    {/* Cart */}
                    {carrito.length > 0 && (
                        <View style={s.cartDrawer}>
                            <View style={s.cartHeaderRow}><Text style={s.cartHeaderTitle}>Mi Solicitud</Text><View style={s.cartCount}><Text style={s.cartCountText}>{carrito.length}</Text></View></View>
                            <ScrollView style={{ maxHeight: 100 }}>
                                {carrito.map(item => (
                                    <View key={item.producto.id_producto} style={s.cartItem}>
                                        <View style={{ flex: 1 }}><Text style={s.cartItemName} numberOfLines={1}>{item.producto.nombre}</Text></View>
                                        <View style={s.qtyWrap}>
                                            <TouchableOpacity style={s.qtyBtn} onPress={() => modificarCantidad(item.producto.id_producto, -1)}><Minus size={12} color={Colors.azulMarino} /></TouchableOpacity>
                                            <Text style={s.qtyText}>{item.cantidad}</Text>
                                            <TouchableOpacity style={s.qtyBtn} onPress={() => modificarCantidad(item.producto.id_producto, 1)}><Plus size={12} color={Colors.moradoAccento} /></TouchableOpacity>
                                        </View>
                                        <TouchableOpacity onPress={() => quitarDelCarrito(item.producto.id_producto)}><XIcon size={14} color={Colors.rojoPeligro} /></TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                            <View style={s.anticipoRow}><Text style={s.anticipoLabel}>Anticipo (Opcional)</Text><TextInput style={s.anticipoInput} value={anticipo} onChangeText={setAnticipo} placeholder="$0.00" placeholderTextColor="rgba(26,0,96,0.3)" keyboardType="decimal-pad" data-testid="mp-anticipo" /></View>
                            <View style={s.totalRow}><Text style={s.totalLabel}>Valor Total</Text><Text style={s.totalValue}>${totalMonto.toFixed(2)}</Text></View>
                            <TouchableOpacity style={s.enviarBtn} onPress={enviarPedido} disabled={procesando} activeOpacity={0.8} data-testid="mp-enviar">
                                {procesando ? <ActivityIndicator color={Colors.blanco} /> : <><Send size={16} color={Colors.blanco} /><Text style={s.enviarBtnText}>Enviar Solicitud</Text></>}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
            <ActionModal isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle} onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))} />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.fondoMoradoClaro },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
    pageTitle: { fontWeight: '900', fontSize: 22, color: Colors.azulMarino },
    nuevoPedidoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.moradoAccento, borderWidth: 2.5, borderColor: Colors.azulMarino, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, elevation: 3, shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.15, shadowRadius: 0 },
    nuevoPedidoBtnText: { fontWeight: '900', fontSize: 11, color: Colors.blanco, textTransform: 'uppercase' },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: Colors.azulMarino, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
    backBtnText: { fontWeight: '900', fontSize: 11, color: Colors.azulMarino, textTransform: 'uppercase' },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyTitle: { fontWeight: '800', fontSize: 18, color: Colors.azulMarino },
    emptySub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.45)', textAlign: 'center', maxWidth: 260 },
    pCard: { backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 20, padding: 16, elevation: 2, shadowColor: Colors.azulMarino, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.08, shadowRadius: 0 },
    pCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    pCardTitle: { fontWeight: '900', fontSize: 16, color: Colors.azulMarino },
    pCardDate: { fontWeight: '700', fontSize: 10, color: 'rgba(26,0,96,0.4)', marginTop: 2 },
    pEstadoBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    pEstadoText: { fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
    pProdsWrap: { backgroundColor: 'rgba(248,249,250,1)', borderRadius: 12, padding: 10, marginBottom: 12 },
    pProdRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    pProdName: { fontWeight: '500', fontSize: 12, color: Colors.azulMarino, flex: 1 },
    pProdPrice: { fontWeight: '900', fontSize: 12, color: Colors.moradoAccento },
    pTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 2, borderTopColor: 'rgba(26,0,96,0.06)', borderStyle: 'dashed', paddingTop: 10 },
    pTotalLabel: { fontWeight: '800', fontSize: 9, textTransform: 'uppercase', color: 'rgba(26,0,96,0.5)' },
    pTotalValue: { fontWeight: '900', fontSize: 18, color: Colors.verdeExito },
    catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(248,245,255,1)', borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.06)' },
    catTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase' },
    catSearchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(212,184,240,0.4)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    catSearchInput: { flex: 1, fontSize: 12, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    prodCard: { flex: 1, backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 16, padding: 12, justifyContent: 'space-between', minHeight: 110 },
    prodSku: { fontWeight: '900', fontSize: 9, textTransform: 'uppercase', color: 'rgba(26,0,96,0.5)' },
    prodName: { fontWeight: '700', fontSize: 12, color: Colors.azulMarino, marginVertical: 4 },
    prodPrice: { fontWeight: '900', fontSize: 14, color: Colors.verdeExito },
    cartDrawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.blanco, borderTopWidth: 3, borderTopColor: Colors.azulMarino, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 20, elevation: 20 },
    cartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cartHeaderTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase' },
    cartCount: { backgroundColor: Colors.amarilloAccento, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    cartCountText: { fontWeight: '900', fontSize: 10, color: Colors.azulMarino },
    cartItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.06)' },
    cartItemName: { fontWeight: '700', fontSize: 12, color: Colors.azulMarino },
    qtyWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(248,245,255,1)', borderRadius: 8, padding: 2 },
    qtyBtn: { width: 22, height: 22, borderRadius: 6, backgroundColor: Colors.blanco, justifyContent: 'center', alignItems: 'center' },
    qtyText: { fontWeight: '900', fontSize: 12, color: Colors.azulMarino, width: 24, textAlign: 'center' },
    anticipoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    anticipoLabel: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', color: 'rgba(26,0,96,0.5)' },
    anticipoInput: { backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(212,184,240,0.5)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, width: 100, fontSize: 13, fontWeight: '700', color: Colors.azulMarino, textAlign: 'right' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginVertical: 8 },
    totalLabel: { fontWeight: '800', fontSize: 10, textTransform: 'uppercase', color: 'rgba(26,0,96,0.5)' },
    totalValue: { fontWeight: '900', fontSize: 22, color: Colors.azulMarino },
    enviarBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.moradoAccento, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 14, paddingVertical: 14, elevation: 4, shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, shadowRadius: 0 },
    enviarBtnText: { fontWeight: '900', fontSize: 14, color: Colors.blanco, textTransform: 'uppercase', letterSpacing: 0.8 },
});
