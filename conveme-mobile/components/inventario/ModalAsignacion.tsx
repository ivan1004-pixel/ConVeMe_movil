import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    FlatList, ActivityIndicator, ScrollView, StyleSheet, Alert,
} from 'react-native';
import {
    X, PackagePlus, Loader2, Trash2, Users, Package, Check,
    RefreshCw, AlertTriangle, Search, ChevronDown, Pencil,
} from 'lucide-react-native';
import { convemeApi } from '@/api/convemeApi';
import { createAsignacion, updateAsignacion } from '@/services/asignacion.service';
import { notificarAsignacion } from '@/services/notification.service';
import { Colors } from '@/constants/Colors';

interface ModalAsignacionProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    asigAEditar?: any | null;
}

type Step = 'form' | 'success' | 'error';

export default function ModalAsignacion({ isOpen, onClose, onSuccess, asigAEditar }: ModalAsignacionProps) {
    const [vendedores, setVendedores] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [step, setStep] = useState<Step>('form');
    const [errorMsg, setErrorMsg] = useState('');

    /* form state */
    const [vendedorId, setVendedorId] = useState<number | ''>('');
    const [detalles, setDetalles] = useState<any[]>([]);

    /* dropdowns */
    const [showVendDrop, setShowVendDrop] = useState(false);
    const [showProdDrop, setShowProdDrop] = useState(false);
    const [searchVend, setSearchVend] = useState('');
    const [searchProd, setSearchProd] = useState('');

    useEffect(() => {
        if (isOpen) {
            cargarCatalogos();
            setStep('form');
            setErrorMsg('');

            if (asigAEditar) {
                setVendedorId(asigAEditar.vendedor?.id_vendedor || asigAEditar.vendedor_id);
                setDetalles(asigAEditar.detalles.map((d: any) => ({
                    id_det_asignacion: d.id_det_asignacion,
                    producto_id: d.producto?.id_producto || d.producto_id,
                    nombre: d.producto?.nombre || 'Producto',
                    sku: d.producto?.sku || '',
                    precio_unitario: Number(d.producto?.precio_unitario) || 0,
                    cantidad_asignada: d.cantidad_asignada,
                })));
            } else {
                resetForm();
            }
        } else {
            resetForm();
        }
    }, [isOpen, asigAEditar]);

    const resetForm = () => {
        setVendedorId('');
        setDetalles([]);
        setSearchVend('');
        setSearchProd('');
        setShowVendDrop(false);
        setShowProdDrop(false);
    };

    const cargarCatalogos = async () => {
        setLoadingData(true);
        try {
            const query = `query { vendedores { id_vendedor nombre_completo } productos { id_producto nombre sku precio_unitario activo } }`;
            const { data } = await convemeApi.post('', { query });
            setVendedores(data.data.vendedores || []);
            setProductos((data.data.productos || []).filter((p: any) => p.activo));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingData(false);
        }
    };

    const handleAddProducto = (prod: any) => {
        if (detalles.find(d => d.producto_id === prod.id_producto)) return;
        setDetalles(prev => [
            ...prev,
            { producto_id: prod.id_producto, nombre: prod.nombre, sku: prod.sku, precio_unitario: prod.precio_unitario, cantidad_asignada: 1 },
        ]);
        setShowProdDrop(false);
        setSearchProd('');
    };

    const updateCantidad = (idx: number, val: number) => {
        setDetalles(prev => prev.map((d, i) => (i === idx ? { ...d, cantidad_asignada: Math.max(1, val) } : d)));
    };

    const removeProducto = (idx: number) => setDetalles(prev => prev.filter((_, i) => i !== idx));

    const totalPiezas = detalles.reduce((s, d) => s + d.cantidad_asignada, 0);
    const totalValor = detalles.reduce((s, d) => s + d.cantidad_asignada * Number(d.precio_unitario), 0);

    const handleGuardar = async () => {
        if (!vendedorId || detalles.length === 0) return;
        setGuardando(true);
        setErrorMsg('');
        try {
            const payload = {
                ...(asigAEditar && { id_asignacion: asigAEditar.id_asignacion }),
                vendedor_id: Number(vendedorId),
                estado: 'Activa',
                detalles: detalles.map(d => ({
                    ...(asigAEditar && { asignacion_id: asigAEditar.id_asignacion }),
                    ...(d.id_det_asignacion && { id_det_asignacion: d.id_det_asignacion }),
                    producto_id: d.producto_id,
                    cantidad_asignada: d.cantidad_asignada,
                })),
            };

            if (asigAEditar) {
                await updateAsignacion(payload);
            } else {
                await createAsignacion(payload);
            }

            // Notificar asignacion
            const vendNombre = vendedores.find((v: any) => v.id_vendedor === vendedorId)?.nombre_completo || 'Vendedor';
            notificarAsignacion(vendNombre, detalles.length);

            setStep('success');
            setTimeout(() => {
                onSuccess();
                onClose();
                resetForm();
                setStep('form');
            }, 2200);
        } catch (e: any) {
            setErrorMsg(e.message.replace('GraphQL error: ', '') || 'Error al procesar la asignacion');
        } finally {
            setGuardando(false);
        }
    };

    /* filtered lists */
    const vendedoresFiltrados = vendedores.filter(v =>
        v.nombre_completo.toLowerCase().includes(searchVend.toLowerCase()),
    );
    const productosFiltrados = productos
        .filter(p => !detalles.find(d => d.producto_id === p.id_producto))
        .filter(p => `${p.sku} ${p.nombre}`.toLowerCase().includes(searchProd.toLowerCase()));

    const vendedorSelected = vendedores.find(v => v.id_vendedor === vendedorId) || (asigAEditar ? asigAEditar.vendedor : null);

    return (
        <Modal transparent visible={isOpen} animationType="slide" onRequestClose={onClose}>
            <View style={s.overlay}>
                <View style={s.modal}>
                    {/* ── Header ── */}
                    <View style={s.dragBar}>
                        <View style={s.dragLeft}>
                            <View style={s.dragIcon}>
                                {asigAEditar ? <Pencil size={18} color={Colors.verdeExito} /> : <PackagePlus size={18} color={Colors.verdeExito} />}
                            </View>
                            <View>
                                <Text style={s.dragTitle}>
                                    {step === 'success' ? 'Listo!' : asigAEditar ? 'Editar Asignacion' : 'Entregar mercancia'}
                                </Text>
                                <Text style={s.dragSub}>
                                    {step === 'success'
                                        ? (asigAEditar ? 'Asignacion actualizada' : 'Asignacion creada correctamente')
                                        : asigAEditar ? 'Modificar cantidades del folio' : 'Crear nueva asignacion de productos'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                            <X size={16} color="rgba(26,0,96,0.5)" />
                        </TouchableOpacity>
                    </View>

                    {/* ── Content ── */}
                    {loadingData ? (
                        <View style={s.centered}>
                            <ActivityIndicator size="large" color={Colors.moradoAccento} />
                            <Text style={s.centeredTitle}>Cargando catalogos...</Text>
                        </View>
                    ) : step === 'success' ? (
                        <View style={s.centered}>
                            <View style={s.successIcon}>
                                <Check size={36} color={Colors.verdeExito} />
                            </View>
                            <Text style={s.centeredTitle}>
                                {asigAEditar ? 'Mercancia actualizada!' : 'Mercancia entregada!'}
                            </Text>
                            <Text style={s.centeredSub}>
                                La asignacion de {totalPiezas} piezas por valor de ${totalValor.toLocaleString('es-MX', { minimumFractionDigits: 2 })} fue {asigAEditar ? 'actualizada' : 'registrada'} correctamente para {vendedorSelected?.nombre_completo}.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <ScrollView style={s.body} contentContainerStyle={s.bodyContent} keyboardShouldPersistTaps="handled">
                                {/* ── Seccion 1: Vendedor ── */}
                                <View style={s.section}>
                                    <View style={s.sectionHead}>
                                        <Users size={13} color={Colors.moradoAccento} />
                                        <Text style={[s.sectionHeadText, { color: Colors.moradoAccento }]}>
                                            {asigAEditar ? 'Vendedor Asignado' : 'Seleccionar vendedor'}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[s.dropTrigger, showVendDrop && s.dropTriggerActive]}
                                        onPress={() => { setShowVendDrop(v => !v); setShowProdDrop(false); }}
                                        disabled={!!asigAEditar}
                                    >
                                        <Text style={vendedorSelected ? s.dropTriggerText : s.dropTriggerPlaceholder}>
                                            {vendedorSelected?.nombre_completo ?? 'Selecciona un vendedor...'}
                                        </Text>
                                        <ChevronDown size={15} color="rgba(26,0,96,0.35)" />
                                    </TouchableOpacity>

                                    {showVendDrop && (
                                        <View style={s.dropPanel}>
                                            <View style={s.dropSearch}>
                                                <Search size={13} color="rgba(26,0,96,0.35)" />
                                                <TextInput
                                                    autoFocus
                                                    value={searchVend}
                                                    onChangeText={setSearchVend}
                                                    placeholder="Buscar vendedor..."
                                                    placeholderTextColor="rgba(26,0,96,0.35)"
                                                    style={s.dropSearchInput}
                                                />
                                            </View>
                                            <FlatList
                                                data={vendedoresFiltrados}
                                                keyExtractor={item => String(item.id_vendedor)}
                                                style={s.dropList}
                                                keyboardShouldPersistTaps="handled"
                                                ListEmptyComponent={<Text style={s.dropEmpty}>Sin resultados</Text>}
                                                renderItem={({ item }) => {
                                                    const selected = vendedorId === item.id_vendedor;
                                                    return (
                                                        <TouchableOpacity
                                                            style={[s.dropItem, selected && s.dropItemSelected]}
                                                            onPress={() => { setVendedorId(item.id_vendedor); setShowVendDrop(false); setSearchVend(''); }}
                                                        >
                                                            <Text style={[s.dropItemText, selected && s.dropItemTextSelected]}>
                                                                {item.nombre_completo}
                                                            </Text>
                                                            {selected && <Check size={13} color={Colors.azulMarino} />}
                                                        </TouchableOpacity>
                                                    );
                                                }}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* ── Seccion 2: Productos ── */}
                                <View style={s.section}>
                                    <View style={s.sectionHead}>
                                        <Package size={13} color={Colors.verdeExito} />
                                        <Text style={[s.sectionHeadText, { color: Colors.verdeExito }]}>Anadir productos</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[s.dropTrigger, showProdDrop && s.dropTriggerActive]}
                                        onPress={() => { setShowProdDrop(v => !v); setShowVendDrop(false); }}
                                    >
                                        <Text style={s.dropTriggerPlaceholder}>
                                            {productosFiltrados.length === 0 ? 'Todos los productos anadidos' : 'Selecciona un producto...'}
                                        </Text>
                                        <ChevronDown size={15} color="rgba(26,0,96,0.35)" />
                                    </TouchableOpacity>

                                    {showProdDrop && (
                                        <View style={s.dropPanel}>
                                            <View style={s.dropSearch}>
                                                <Search size={13} color="rgba(26,0,96,0.35)" />
                                                <TextInput
                                                    autoFocus
                                                    value={searchProd}
                                                    onChangeText={setSearchProd}
                                                    placeholder="Buscar por nombre o SKU..."
                                                    placeholderTextColor="rgba(26,0,96,0.35)"
                                                    style={s.dropSearchInput}
                                                />
                                            </View>
                                            <FlatList
                                                data={productosFiltrados}
                                                keyExtractor={item => String(item.id_producto)}
                                                style={s.dropList}
                                                keyboardShouldPersistTaps="handled"
                                                ListEmptyComponent={<Text style={s.dropEmpty}>Sin resultados</Text>}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity style={s.dropItem} onPress={() => handleAddProducto(item)}>
                                                        <View>
                                                            <View style={s.prodItemRow}>
                                                                <Text style={s.prodSku}>{item.sku}</Text>
                                                                <Text style={s.prodName}>{item.nombre}</Text>
                                                            </View>
                                                        </View>
                                                        <Text style={s.prodPrice}>${item.precio_unitario}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        </View>
                                    )}

                                    {/* ── Product list ── */}
                                    {detalles.length > 0 && (
                                        <View style={s.productTable}>
                                            {/* Table Header */}
                                            <View style={s.tableHeader}>
                                                <Text style={[s.tableHeaderText, { flex: 1, color: Colors.amarilloAccento }]}>Producto</Text>
                                                <Text style={[s.tableHeaderText, { width: 80, textAlign: 'center' }]}>Cantidad</Text>
                                                <Text style={[s.tableHeaderText, { width: 70, textAlign: 'center' }]}>Precio u.</Text>
                                                <Text style={[s.tableHeaderText, { width: 40, textAlign: 'center' }]}> </Text>
                                            </View>

                                            {/* Table Rows */}
                                            <FlatList
                                                data={detalles}
                                                keyExtractor={(item, idx) => String(item.producto_id)}
                                                scrollEnabled={false}
                                                renderItem={({ item, index }) => (
                                                    <View style={[s.tableRow, index % 2 === 1 && s.tableRowEven]}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={s.tableCellName}>{item.nombre}</Text>
                                                            {item.sku ? <Text style={s.skuBadge}>{item.sku}</Text> : null}
                                                        </View>
                                                        <View style={{ width: 80, alignItems: 'center' }}>
                                                            <TextInput
                                                                keyboardType="number-pad"
                                                                value={String(item.cantidad_asignada)}
                                                                onChangeText={t => updateCantidad(index, parseInt(t) || 1)}
                                                                style={s.qtyInput}
                                                            />
                                                        </View>
                                                        <View style={{ width: 70, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={s.priceCell}>${Number(item.precio_unitario).toFixed(2)}</Text>
                                                        </View>
                                                        <TouchableOpacity style={s.removeBtn} onPress={() => removeProducto(index)}>
                                                            <Trash2 size={13} color={Colors.rojoPeligro} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            />

                                            {/* Summary strip */}
                                            <View style={s.summaryStrip}>
                                                <View style={s.summaryCell}>
                                                    <Text style={s.summaryLabel}>Productos</Text>
                                                    <Text style={s.summaryValue}>{detalles.length}</Text>
                                                </View>
                                                <View style={s.summaryCell}>
                                                    <Text style={s.summaryLabel}>Total piezas</Text>
                                                    <Text style={s.summaryValue}>{totalPiezas}</Text>
                                                </View>
                                                <View style={[s.summaryCell, { borderRightWidth: 0 }]}>
                                                    <Text style={s.summaryLabel}>Valor total</Text>
                                                    <Text style={[s.summaryValue, { color: Colors.verdeExito }]}>
                                                        ${totalValor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>

                            {/* ── Footer ── */}
                            <View style={s.footer}>
                                {errorMsg !== '' && (
                                    <View style={s.errorBanner}>
                                        <AlertTriangle size={15} color="#c1002b" />
                                        <Text style={s.errorBannerText}>{errorMsg}</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={[s.saveBtn, (!vendedorId || detalles.length === 0 || guardando) && s.saveBtnDisabled]}
                                    disabled={guardando || !vendedorId || detalles.length === 0}
                                    onPress={handleGuardar}
                                    activeOpacity={0.8}
                                >
                                    {guardando ? (
                                        <View style={s.saveBtnContent}>
                                            <RefreshCw size={16} color={Colors.azulMarino} />
                                            <Text style={s.saveBtnText}>Guardando...</Text>
                                        </View>
                                    ) : (
                                        <View style={s.saveBtnContent}>
                                            {asigAEditar
                                                ? <><Pencil size={16} color={Colors.azulMarino} /><Text style={s.saveBtnText}>Guardar cambios</Text></>
                                                : <><PackagePlus size={16} color={Colors.azulMarino} /><Text style={s.saveBtnText}>Confirmar entrega de mercancia</Text></>
                                            }
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(26,0,96,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    modal: {
        backgroundColor: Colors.blanco,
        borderWidth: 3,
        borderColor: Colors.azulMarino,
        borderRadius: 22,
        width: '100%',
        maxWidth: 640,
        maxHeight: '95%',
        elevation: 10,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        overflow: 'hidden',
    },
    dragBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(26,0,96,0.1)',
        backgroundColor: 'rgba(237,233,254,0.6)',
    },
    dragLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    dragIcon: {
        width: 36, height: 36, borderRadius: 11,
        backgroundColor: 'rgba(6,214,160,0.12)',
        borderWidth: 1.5, borderColor: 'rgba(6,214,160,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    dragTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.8 },
    dragSub: { fontSize: 10, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 1 },
    closeBtn: {
        width: 32, height: 32, borderRadius: 9,
        borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)',
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center', alignItems: 'center',
    },
    centered: { padding: 48, alignItems: 'center', gap: 14 },
    centeredTitle: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino, textAlign: 'center' },
    centeredSub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.5)', textAlign: 'center', maxWidth: 280, lineHeight: 20 },
    successIcon: {
        width: 72, height: 72, borderRadius: 22,
        backgroundColor: 'rgba(6,214,160,0.12)',
        borderWidth: 2, borderColor: 'rgba(6,214,160,0.25)',
        justifyContent: 'center', alignItems: 'center',
    },
    body: { flex: 1 },
    bodyContent: { padding: 14, gap: 12 },
    section: {
        backgroundColor: 'rgba(237,233,254,0.3)',
        borderWidth: 1.5, borderColor: 'rgba(26,0,96,0.08)',
        borderRadius: 14, padding: 14,
    },
    sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
    sectionHeadText: { fontWeight: '800', fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase' },
    dropTrigger: {
        width: '100%', backgroundColor: '#faf5ff',
        borderWidth: 2, borderColor: '#d4b8f0', borderRadius: 10,
        padding: 10, paddingHorizontal: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    dropTriggerActive: {
        borderColor: Colors.moradoAccento,
        elevation: 4,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    dropTriggerText: { fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
    dropTriggerPlaceholder: { fontSize: 13, fontWeight: '500', color: '#b9a0d4' },
    dropPanel: {
        marginTop: 6, backgroundColor: Colors.blanco,
        borderWidth: 2.5, borderColor: Colors.azulMarino,
        borderRadius: 14, overflow: 'hidden',
        elevation: 8,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    dropSearch: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 14, paddingVertical: 10,
        borderBottomWidth: 1.5, borderBottomColor: 'rgba(26,0,96,0.08)',
        backgroundColor: 'rgba(237,233,254,0.5)',
    },
    dropSearchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    dropList: { maxHeight: 160 },
    dropEmpty: { padding: 16, textAlign: 'center', fontSize: 12, fontWeight: '600', color: 'rgba(26,0,96,0.35)' },
    dropItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.05)',
    },
    dropItemSelected: { backgroundColor: Colors.amarilloAccento },
    dropItemText: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.75)' },
    dropItemTextSelected: { fontWeight: '700', color: Colors.azulMarino },
    prodItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    prodSku: { fontWeight: '800', fontSize: 10, color: Colors.moradoAccento },
    prodName: { fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
    prodPrice: { fontWeight: '800', fontSize: 12, color: Colors.verdeExito },
    productTable: {
        marginTop: 12, borderWidth: 2.5, borderColor: Colors.azulMarino,
        borderRadius: 14, overflow: 'hidden',
        elevation: 4,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    tableHeader: {
        flexDirection: 'row', backgroundColor: Colors.azulMarino,
        paddingVertical: 10, paddingHorizontal: 14,
    },
    tableHeaderText: {
        fontWeight: '800', fontSize: 9.5, letterSpacing: 1.5,
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
    },
    tableRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, paddingHorizontal: 14,
        borderBottomWidth: 1.5, borderBottomColor: 'rgba(26,0,96,0.06)',
        backgroundColor: Colors.blanco,
    },
    tableRowEven: { backgroundColor: 'rgba(237,233,254,0.25)' },
    tableCellName: { fontWeight: '600', fontSize: 13, color: Colors.azulMarino },
    skuBadge: {
        fontWeight: '700', fontSize: 9.5, letterSpacing: 1,
        textTransform: 'uppercase', color: Colors.moradoAccento,
        backgroundColor: 'rgba(204,85,255,0.1)', borderRadius: 5,
        paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 3,
    },
    qtyInput: {
        width: 60, textAlign: 'center', backgroundColor: '#faf5ff',
        borderWidth: 2, borderColor: '#d4b8f0', borderRadius: 8,
        paddingVertical: 5, paddingHorizontal: 8,
        fontWeight: '800', fontSize: 14, color: Colors.azulMarino,
    },
    priceCell: { fontWeight: '800', fontSize: 13, color: Colors.verdeExito },
    removeBtn: {
        width: 28, height: 28, borderRadius: 8,
        borderWidth: 1.5, borderColor: 'rgba(255,80,80,0.2)',
        backgroundColor: 'rgba(255,80,80,0.06)',
        justifyContent: 'center', alignItems: 'center',
        marginLeft: 4,
    },
    summaryStrip: {
        flexDirection: 'row', backgroundColor: Colors.azulMarino,
    },
    summaryCell: {
        flex: 1, paddingVertical: 10, paddingHorizontal: 14,
        borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)',
    },
    summaryLabel: {
        fontWeight: '700', fontSize: 8.5, letterSpacing: 1.5,
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 2,
    },
    summaryValue: { fontWeight: '900', fontSize: 17, color: Colors.amarilloAccento },
    footer: {
        paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: 2, borderTopColor: 'rgba(26,0,96,0.08)',
        backgroundColor: 'rgba(237,233,254,0.4)',
        gap: 8,
    },
    errorBanner: {
        backgroundColor: '#ffe5e8', borderWidth: 2, borderColor: '#ff4d6d',
        borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    errorBannerText: { color: '#c1002b', fontSize: 12, fontWeight: '600', flex: 1 },
    saveBtn: {
        width: '100%', backgroundColor: Colors.verdeExito,
        borderWidth: 2.5, borderColor: Colors.azulMarino,
        borderRadius: 14, paddingVertical: 15,
        elevation: 4,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    saveBtnDisabled: { opacity: 0.55 },
    saveBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    saveBtnText: { fontWeight: '900', fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.azulMarino },
});
