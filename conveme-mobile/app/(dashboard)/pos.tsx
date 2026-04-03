import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, Modal, ScrollView, Alert,
} from 'react-native';
import {
    Search, ShoppingCart, Plus, Minus, Trash2,
    Banknote, PackageOpen, History, UserPlus, Tag, User,
    ChevronRight, Settings2, X,
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import ActionModal from '@/components/ui/ActionModal';
import type { ActionType } from '@/components/ui/ActionModal';
import ModalHistorialVentas from '@/components/pos/ModalHistorialVentas';
import ModalCliente from '@/components/pos/ModalCliente';
import ModalPromocion from '@/components/pos/ModalPromocion';
import { getProductos } from '@/services/producto.service';
import { getVendedores } from '@/services/vendedor.service';
import { getClientes, createCliente } from '@/services/cliente.service';
import { getPromociones, createPromocion } from '@/services/promocion.service';
import { createVenta } from '@/services/venta.service';

interface CartItem {
    producto: any;
    cantidad: number;
}

export default function POS() {
    const [productos, setProductos] = useState<any[]>([]);
    const [vendedores, setVendedores] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);
    const [promociones, setPromociones] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [ordenIniciada, setOrdenIniciada] = useState(false);
    const [carrito, setCarrito] = useState<CartItem[]>([]);
    const [vendedorId, setVendedorId] = useState<number | null>(null);
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [promocionId, setPromocionId] = useState<number | null>(null);
    const [metodoPago, setMetodoPago] = useState('Efectivo');

    const [procesando, setProcesando] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
    const [isPromocionModalOpen, setIsPromocionModalOpen] = useState(false);

    // Pickers
    const [showVendedorPicker, setShowVendedorPicker] = useState(false);
    const [showClientePicker, setShowClientePicker] = useState(false);
    const [showPromoPicker, setShowPromoPicker] = useState(false);
    const [showMetodoPicker, setShowMetodoPicker] = useState(false);

    const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: ActionType; title: string; subtitle: string }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    const [rolId, setRolId] = useState<string | null>(null);

    useEffect(() => {
        cargarDatos();
        autoDetectVendedor();
    }, []);

    const autoDetectVendedor = async () => {
        const rol = await SecureStore.getItemAsync('rol_id');
        const idV = await SecureStore.getItemAsync('id_vendedor');
        setRolId(rol);
        if (rol === '2' && idV) {
            setVendedorId(Number(idV));
        }
    };

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [prods, vends, clis, promos] = await Promise.all([
                getProductos().catch(() => []),
                getVendedores().catch(() => []),
                getClientes().catch(() => []),
                getPromociones().catch(() => []),
            ]);
            setProductos(prods);
            setVendedores(vends);
            setClientes(clis);
            setPromociones(promos.filter((p: any) => p.activa));
        } catch (error) {
            console.error('Error cargando catalogos POS', error);
        } finally {
            setLoading(false);
        }
    };

    // Cart logic
    const agregarAlCarrito = (producto: any) => {
        setCarrito(prev => {
            const existe = prev.find(item => item.producto.id_producto === producto.id_producto);
            if (existe) return prev.map(item => item.producto.id_producto === producto.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item);
            return [...prev, { producto, cantidad: 1 }];
        });
    };

    const modificarCantidad = (idProducto: number, delta: number) => {
        setCarrito(prev => prev.map(item => {
            if (item.producto.id_producto === idProducto) {
                const nuevaCat = item.cantidad + delta;
                return { ...item, cantidad: nuevaCat > 0 ? nuevaCat : 1 };
            }
            return item;
        }));
    };

    const quitarDelCarrito = (idProducto: number) => {
        setCarrito(prev => prev.filter(item => item.producto.id_producto !== idProducto));
    };

    const vaciarCarrito = async () => {
        setCarrito([]);
        setClienteId(null);
        setPromocionId(null);
        const rol = await SecureStore.getItemAsync('rol_id');
        if (rol !== '2') { setVendedorId(null); }
        setOrdenIniciada(false);
    };

    // Financial calcs
    const subtotal = carrito.reduce((sum, item) => sum + (item.cantidad * item.producto.precio_unitario), 0);

    let descuentoTotal = 0;
    const promoAplicada = promociones.find(p => p.id_promocion === promocionId);

    if (promoAplicada && subtotal > 0) {
        if (promoAplicada.tipo_promocion === 'Porcentaje') {
            descuentoTotal = subtotal * (promoAplicada.valor_descuento / 100);
        } else if (promoAplicada.tipo_promocion === 'Monto Fijo') {
            descuentoTotal = Math.min(subtotal, promoAplicada.valor_descuento);
        }
    }

    const totalFinal = subtotal - descuentoTotal;

    // Checkout
    const handleCobrar = async () => {
        if (carrito.length === 0) return Alert.alert('Carrito vacio', 'Agrega productos al carrito');
        if (!vendedorId) return Alert.alert('Sin vendedor', 'Selecciona el vendedor que esta cobrando');

        setProcesando(true);
        try {
            const payload: any = {
                vendedor_id: vendedorId,
                ...(clienteId ? { cliente_id: clienteId } : {}),
                monto_total: Number(totalFinal.toFixed(2)),
                metodo_pago: metodoPago,
                estado: 'Completada',
                detalles: carrito.map(item => ({
                    producto_id: item.producto.id_producto,
                    cantidad: item.cantidad,
                    precio_unitario: Number(item.producto.precio_unitario),
                })),
            };

            await createVenta(payload);
            setActionModal({ isOpen: true, type: 'success', title: 'Venta Exitosa!', subtitle: `Total cobrado: $${totalFinal.toFixed(2)}` });
            vaciarCarrito();
            setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2500);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al procesar la venta');
        } finally {
            setProcesando(false);
        }
    };

    const handleGuardarClienteNuevo = async (data: any) => {
        const nuevo = await createCliente(data);
        await cargarDatos();
        setClienteId(nuevo.id_cliente);
    };

    const handleGuardarPromocionNueva = async (data: any) => {
        const nueva = await createPromocion(data);
        await cargarDatos();
        setPromocionId(nueva.id_promocion);
    };

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    );

    const clienteAplicado = clientes.find(c => c.id_cliente === clienteId);
    const vendedorSeleccionado = vendedores.find(v => v.id_vendedor === vendedorId);

    const renderProductoGrid = useCallback(({ item }: { item: any }) => (
        <TouchableOpacity style={s.prodCard} onPress={() => agregarAlCarrito(item)} activeOpacity={0.7} data-testid={`pos-producto-${item.id_producto}`}>
            <Text style={s.prodSku}>{item.sku}</Text>
            <Text style={s.prodName} numberOfLines={3}>{item.nombre}</Text>
            <View style={s.prodBottom}>
                <Text style={s.prodCat}>{item.categoria?.nombre || 'Gral'}</Text>
                <Text style={s.prodPrice}>${item.precio_unitario}</Text>
            </View>
        </TouchableOpacity>
    ), []);

    return (
        <View style={s.root} data-testid="pos-screen">
            <TopBar title="Punto de Venta" />

            {/* Header */}
            <View style={s.headerRow}>
                <Text style={s.pageTitle}>Punto de Venta</Text>
                <TouchableOpacity style={s.historyBtn} onPress={() => setIsHistoryOpen(true)} data-testid="pos-history-btn" activeOpacity={0.8}>
                    <History size={16} color={Colors.azulMarino} /><Text style={s.historyBtnText}>Historial</Text>
                </TouchableOpacity>
            </View>

            {!ordenIniciada ? (
                /* SETUP PHASE */
                <ScrollView style={s.setupScroll} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
                    <View style={s.setupHeader}>
                        <View style={s.setupIconWrap}><ShoppingCart size={32} color={Colors.moradoAccento} /></View>
                        <Text style={s.setupTitle}>Paso 1: Setup</Text>
                        <Text style={s.setupSub}>Configura la orden antes de armar el ticket.</Text>
                    </View>

                    <View style={s.setupCard}>
                        {/* Vendedor */}
                        <View style={s.fieldWrap}>
                            <View style={s.labelRow}><User size={14} color={Colors.moradoAccento} /><Text style={s.label}>Vendedor</Text></View>
                            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowVendedorPicker(true)} disabled={rolId === '2'} data-testid="pos-vendedor-picker">
                                <Text style={s.pickerBtnText}>{vendedorSeleccionado?.nombre_completo || 'Seleccione vendedor...'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Cliente */}
                        <View style={s.fieldWrap}>
                            <View style={s.labelRow}><User size={14} color={Colors.moradoAccento} /><Text style={s.label}>Cliente</Text></View>
                            <View style={s.rowGap}>
                                <TouchableOpacity style={[s.pickerBtn, { flex: 1 }]} onPress={() => setShowClientePicker(true)} data-testid="pos-cliente-picker">
                                    <Text style={s.pickerBtnText}>{clienteAplicado?.nombre_completo || 'Publico General'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.addSmallBtn} onPress={() => setIsClienteModalOpen(true)} data-testid="pos-add-cliente">
                                    <UserPlus size={18} color={Colors.moradoAccento} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Promocion */}
                        <View style={s.fieldWrap}>
                            <View style={s.labelRow}><Tag size={14} color="#00b4d8" /><Text style={s.label}>Promocion</Text></View>
                            <View style={s.rowGap}>
                                <TouchableOpacity style={[s.pickerBtn, { flex: 1 }]} onPress={() => setShowPromoPicker(true)} data-testid="pos-promo-picker">
                                    <Text style={s.pickerBtnText}>{promoAplicada?.nombre || 'Sin promocion'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.addSmallBtn} onPress={() => setIsPromocionModalOpen(true)} data-testid="pos-add-promo">
                                    <Plus size={18} color="#00b4d8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={s.openOrderBtn} onPress={() => setOrdenIniciada(true)} activeOpacity={0.8} data-testid="pos-open-order">
                        <Text style={s.openOrderBtnText}>Abrir Orden</Text><ChevronRight size={18} color={Colors.azulMarino} />
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                /* CART PHASE */
                <View style={{ flex: 1 }}>
                    {/* Ticket header */}
                    <View style={s.ticketHeader}>
                        <View style={s.ticketHeaderLeft}>
                            <ShoppingCart size={18} color={Colors.amarilloAccento} /><Text style={s.ticketHeaderTitle}>Ticket</Text>
                        </View>
                        <Text style={s.ticketItemCount}>{carrito.length} Items</Text>
                        <TouchableOpacity onPress={() => setOrdenIniciada(false)} style={s.modifyBtn}><Text style={s.modifyBtnText}>Modificar</Text></TouchableOpacity>
                    </View>

                    {/* Setup summary */}
                    <View style={s.setupSummary}>
                        <Text style={s.summaryText}><Text style={{ color: Colors.moradoAccento, fontWeight: '800' }}>Cliente: </Text>{clienteAplicado?.nombre_completo || 'Publico General'}</Text>
                        {promoAplicada && <Text style={s.summaryText}><Text style={{ color: '#00b4d8', fontWeight: '800' }}>Promo: </Text>{promoAplicada.nombre}</Text>}
                    </View>

                    {/* Search products */}
                    <View style={s.prodSearchRow}>
                        <View style={s.prodSearchWrap}>
                            <PackageOpen size={16} color={Colors.moradoAccento} />
                            <Text style={s.prodSearchLabel}>Catalogo</Text>
                        </View>
                        <View style={s.prodSearchInputWrap}>
                            <Search size={14} color="rgba(26,0,96,0.3)" />
                            <TextInput style={s.prodSearchInput} placeholder="Buscar SKU o nombre..." placeholderTextColor="rgba(26,0,96,0.3)" value={search} onChangeText={setSearch} data-testid="pos-search" />
                        </View>
                    </View>

                    {/* Product grid */}
                    {loading ? (
                        <View style={s.loadingWrap}><ActivityIndicator size="large" color={Colors.moradoAccento} /></View>
                    ) : (
                        <FlatList
                            data={productosFiltrados}
                            renderItem={renderProductoGrid}
                            keyExtractor={item => String(item.id_producto)}
                            numColumns={2}
                            columnWrapperStyle={{ gap: 10 }}
                            contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: carrito.length > 0 ? 340 : 100 }}
                            data-testid="pos-productos-list"
                        />
                    )}

                    {/* Cart drawer (bottom) */}
                    {carrito.length > 0 && (
                        <View style={s.cartDrawer}>
                            <ScrollView style={{ maxHeight: 120 }} showsVerticalScrollIndicator={false}>
                                {carrito.map(item => (
                                    <View key={item.producto.id_producto} style={s.cartItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.cartItemName} numberOfLines={1}>{item.producto.nombre}</Text>
                                            <Text style={s.cartItemPrice}>${item.producto.precio_unitario} c/u</Text>
                                        </View>
                                        <View style={s.qtyWrap}>
                                            <TouchableOpacity style={s.qtyBtn} onPress={() => modificarCantidad(item.producto.id_producto, -1)}><Minus size={12} color={Colors.azulMarino} /></TouchableOpacity>
                                            <Text style={s.qtyText}>{item.cantidad}</Text>
                                            <TouchableOpacity style={s.qtyBtn} onPress={() => modificarCantidad(item.producto.id_producto, 1)}><Plus size={12} color={Colors.azulMarino} /></TouchableOpacity>
                                        </View>
                                        <Text style={s.cartItemTotal}>${(item.cantidad * item.producto.precio_unitario).toFixed(2)}</Text>
                                        <TouchableOpacity onPress={() => quitarDelCarrito(item.producto.id_producto)}><X size={16} color={Colors.rojoPeligro} /></TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>

                            {/* Vendedor + Metodo */}
                            <View style={s.checkoutRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.checkoutLabel}>Vendedor</Text>
                                    <Text style={s.checkoutValue} numberOfLines={1}>{vendedorSeleccionado?.nombre_completo || '—'}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.checkoutLabel}>Metodo</Text>
                                    <TouchableOpacity style={s.metodoPicker} onPress={() => setShowMetodoPicker(true)} data-testid="pos-metodo-picker">
                                        <Text style={s.metodoPickerText}>{metodoPago}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Totals */}
                            {descuentoTotal > 0 && (
                                <View style={s.discountRow}>
                                    <Text style={s.discountLabel}>Subtotal</Text><Text style={s.discountValue}>${subtotal.toFixed(2)}</Text>
                                </View>
                            )}
                            {descuentoTotal > 0 && (
                                <View style={s.discountRow}>
                                    <Text style={[s.discountLabel, { color: '#00b4d8' }]}>Descuento</Text><Text style={[s.discountValue, { color: '#00b4d8' }]}>-${descuentoTotal.toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={s.totalRow}>
                                <Text style={s.totalLabel}>Total</Text>
                                <Text style={s.totalValue}>${totalFinal.toFixed(2)}</Text>
                            </View>

                            {/* Buttons */}
                            <View style={s.checkoutBtns}>
                                <TouchableOpacity style={s.cancelBtn} onPress={vaciarCarrito} disabled={procesando}><Text style={s.cancelBtnText}>Cancelar</Text></TouchableOpacity>
                                <TouchableOpacity style={s.cobrarBtn} onPress={handleCobrar} disabled={procesando} activeOpacity={0.8} data-testid="pos-cobrar-btn">
                                    {procesando ? <ActivityIndicator color={Colors.azulMarino} /> : <><Banknote size={18} color={Colors.azulMarino} /><Text style={s.cobrarBtnText}>Cobrar</Text></>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* ══ PICKERS (Modals) ══ */}
            {/* Vendedor Picker */}
            <Modal transparent visible={showVendedorPicker} animationType="fade" onRequestClose={() => setShowVendedorPicker(false)}>
                <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setShowVendedorPicker(false)}>
                    <View style={s.pickerModal}>
                        <Text style={s.pickerModalTitle}>Seleccionar Vendedor</Text>
                        <FlatList data={vendedores} keyExtractor={i => String(i.id_vendedor)} renderItem={({ item }) => (
                            <TouchableOpacity style={[s.pickerModalItem, vendedorId === item.id_vendedor && s.pickerModalItemActive]} onPress={() => { setVendedorId(item.id_vendedor); setShowVendedorPicker(false); }}>
                                <Text style={s.pickerModalItemText}>{item.nombre_completo}</Text>
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Cliente Picker */}
            <Modal transparent visible={showClientePicker} animationType="fade" onRequestClose={() => setShowClientePicker(false)}>
                <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setShowClientePicker(false)}>
                    <View style={s.pickerModal}>
                        <Text style={s.pickerModalTitle}>Seleccionar Cliente</Text>
                        <TouchableOpacity style={[s.pickerModalItem, clienteId === null && s.pickerModalItemActive]} onPress={() => { setClienteId(null); setShowClientePicker(false); }}>
                            <Text style={s.pickerModalItemText}>Publico General (Mostrador)</Text>
                        </TouchableOpacity>
                        <FlatList data={clientes} keyExtractor={i => String(i.id_cliente)} renderItem={({ item }) => (
                            <TouchableOpacity style={[s.pickerModalItem, clienteId === item.id_cliente && s.pickerModalItemActive]} onPress={() => { setClienteId(item.id_cliente); setShowClientePicker(false); }}>
                                <Text style={s.pickerModalItemText}>{item.nombre_completo}</Text>
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Promo Picker */}
            <Modal transparent visible={showPromoPicker} animationType="fade" onRequestClose={() => setShowPromoPicker(false)}>
                <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setShowPromoPicker(false)}>
                    <View style={s.pickerModal}>
                        <Text style={s.pickerModalTitle}>Seleccionar Promocion</Text>
                        <TouchableOpacity style={[s.pickerModalItem, promocionId === null && s.pickerModalItemActive]} onPress={() => { setPromocionId(null); setShowPromoPicker(false); }}>
                            <Text style={s.pickerModalItemText}>Sin promocion (Precio normal)</Text>
                        </TouchableOpacity>
                        <FlatList data={promociones} keyExtractor={i => String(i.id_promocion)} renderItem={({ item }) => (
                            <TouchableOpacity style={[s.pickerModalItem, promocionId === item.id_promocion && s.pickerModalItemActive]} onPress={() => { setPromocionId(item.id_promocion); setShowPromoPicker(false); }}>
                                <Text style={s.pickerModalItemText}>{item.nombre} ({item.tipo_promocion})</Text>
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Metodo Pago Picker */}
            <Modal transparent visible={showMetodoPicker} animationType="fade" onRequestClose={() => setShowMetodoPicker(false)}>
                <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setShowMetodoPicker(false)}>
                    <View style={s.pickerModal}>
                        <Text style={s.pickerModalTitle}>Metodo de Pago</Text>
                        {['Efectivo', 'Tarjeta', 'Transferencia'].map(m => (
                            <TouchableOpacity key={m} style={[s.pickerModalItem, metodoPago === m && s.pickerModalItemActive]} onPress={() => { setMetodoPago(m); setShowMetodoPicker(false); }}>
                                <Text style={s.pickerModalItemText}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Secondary modals */}
            <ActionModal isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle} onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))} />
            <ModalHistorialVentas isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
            <ModalCliente isOpen={isClienteModalOpen} onClose={() => setIsClienteModalOpen(false)} onSave={handleGuardarClienteNuevo} />
            <ModalPromocion isOpen={isPromocionModalOpen} onClose={() => setIsPromocionModalOpen(false)} onSave={handleGuardarPromocionNueva} />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.fondoMoradoClaro },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
    pageTitle: { fontWeight: '900', fontSize: 22, color: Colors.azulMarino, letterSpacing: 0.5 },
    historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: Colors.azulMarino, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, elevation: 3, shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.15, shadowRadius: 0 },
    historyBtnText: { fontWeight: '900', fontSize: 11, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.8 },
    // Setup
    setupScroll: { flex: 1 },
    setupHeader: { alignItems: 'center', gap: 8, marginBottom: 4 },
    setupIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(204,85,255,0.1)', borderWidth: 2, borderColor: 'rgba(204,85,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    setupTitle: { fontWeight: '900', fontSize: 22, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    setupSub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.5)', textAlign: 'center' },
    setupCard: { backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 20, padding: 18, gap: 16 },
    fieldWrap: { gap: 6 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    label: { fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: Colors.azulMarino },
    pickerBtn: { backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(212,184,240,0.6)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
    pickerBtnText: { fontWeight: '600', fontSize: 13, color: Colors.azulMarino },
    rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addSmallBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(204,85,255,0.3)', backgroundColor: 'rgba(204,85,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    openOrderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.verdeExito, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 14, paddingVertical: 16, elevation: 4, shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, shadowRadius: 0 },
    openOrderBtnText: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 1 },
    // Ticket header
    ticketHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.azulMarino, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    ticketHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    ticketHeaderTitle: { fontWeight: '900', fontSize: 16, color: Colors.blanco, textTransform: 'uppercase', letterSpacing: 0.5 },
    ticketItemCount: { fontWeight: '800', fontSize: 11, color: Colors.azulMarino, backgroundColor: Colors.amarilloAccento, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
    modifyBtn: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(204,85,255,0.3)', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
    modifyBtnText: { fontWeight: '800', fontSize: 10, color: Colors.moradoAccento, textTransform: 'uppercase', letterSpacing: 0.5 },
    setupSummary: { backgroundColor: 'rgba(248,245,255,1)', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.1)' },
    summaryText: { fontSize: 12, fontWeight: '700', color: Colors.azulMarino },
    // Product search
    prodSearchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, gap: 8, borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.06)', backgroundColor: 'rgba(248,245,255,1)' },
    prodSearchWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    prodSearchLabel: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase' },
    prodSearchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(212,184,240,0.4)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    prodSearchInput: { flex: 1, fontSize: 12, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // Product card
    prodCard: { flex: 1, backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 16, padding: 12, justifyContent: 'space-between', minHeight: 130 },
    prodSku: { fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(26,0,96,0.5)', marginBottom: 4 },
    prodName: { fontWeight: '700', fontSize: 13, color: Colors.azulMarino, lineHeight: 17, marginBottom: 8 },
    prodBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    prodCat: { fontWeight: '700', fontSize: 10, color: Colors.moradoAccento, backgroundColor: 'rgba(248,245,255,1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
    prodPrice: { fontWeight: '900', fontSize: 16, color: Colors.verdeExito },
    // Cart drawer
    cartDrawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.blanco, borderTopWidth: 3, borderTopColor: Colors.azulMarino, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 20, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.15, shadowRadius: 10 },
    cartItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.blanco, borderWidth: 1.5, borderColor: 'rgba(26,0,96,0.08)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 6 },
    cartItemName: { fontWeight: '700', fontSize: 13, color: Colors.azulMarino },
    cartItemPrice: { fontWeight: '700', fontSize: 11, color: Colors.verdeExito },
    qtyWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(248,245,255,1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(26,0,96,0.08)', padding: 2 },
    qtyBtn: { width: 24, height: 24, borderRadius: 6, backgroundColor: Colors.blanco, justifyContent: 'center', alignItems: 'center' },
    qtyText: { fontWeight: '900', fontSize: 13, color: Colors.azulMarino, width: 26, textAlign: 'center' },
    cartItemTotal: { fontWeight: '900', fontSize: 13, color: Colors.azulMarino, width: 56, textAlign: 'right' },
    checkoutRow: { flexDirection: 'row', gap: 10, marginVertical: 8 },
    checkoutLabel: { fontWeight: '800', fontSize: 9, textTransform: 'uppercase', color: Colors.azulMarino, marginBottom: 2 },
    checkoutValue: { fontWeight: '600', fontSize: 12, color: Colors.azulMarino },
    metodoPicker: { backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(212,184,240,0.5)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    metodoPickerText: { fontWeight: '600', fontSize: 12, color: Colors.azulMarino },
    discountRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
    discountLabel: { fontWeight: '700', fontSize: 11, color: 'rgba(26,0,96,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 },
    discountValue: { fontWeight: '700', fontSize: 11, color: 'rgba(26,0,96,0.5)' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(204,85,255,0.3)', borderRadius: 14, padding: 12, marginVertical: 6 },
    totalLabel: { fontWeight: '800', fontSize: 12, color: 'rgba(26,0,96,0.6)', textTransform: 'uppercase', letterSpacing: 1 },
    totalValue: { fontWeight: '900', fontSize: 26, color: Colors.azulMarino },
    checkoutBtns: { flexDirection: 'row', gap: 8 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 12, borderWidth: 2.5, borderColor: 'rgba(26,0,96,0.2)', borderRadius: 12 },
    cancelBtnText: { fontWeight: '800', fontSize: 11, color: 'rgba(26,0,96,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 },
    cobrarBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.verdeExito, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 12, paddingVertical: 12, elevation: 4, shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, shadowRadius: 0 },
    cobrarBtnText: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 1 },
    // Picker modals
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.25)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    pickerModal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 20, width: '100%', maxWidth: 340, maxHeight: '70%', padding: 16, elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.3, shadowRadius: 0 },
    pickerModalTitle: { fontWeight: '800', fontSize: 11, color: 'rgba(26,0,96,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    pickerModalItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.06)', borderRadius: 10 },
    pickerModalItemActive: { backgroundColor: Colors.amarilloAccento },
    pickerModalItemText: { fontWeight: '600', fontSize: 14, color: Colors.azulMarino },
});
