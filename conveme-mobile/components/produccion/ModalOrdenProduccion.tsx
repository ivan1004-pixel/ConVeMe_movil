import React, { useState, useEffect, useMemo } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, ScrollView,
} from 'react-native';
import {
    X, Save, Scissors, Box, User, Search, Plus, Minus, AlertTriangle,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { getProductos } from '@/services/producto.service';
import { getEmpleados } from '@/services/empleado.service';
import { getInsumos } from '@/services/insumo.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export default function ModalOrdenProduccion({ isOpen, onClose, onSave }: Props) {
    const [productoId, setProductoId] = useState<number | null>(null);
    const [empleadoId, setEmpleadoId] = useState<number | null>(null);
    const [cantidadAProducir, setCantidadAProducir] = useState('');
    const [detalles, setDetalles] = useState<{ insumo_id: number | null; cantidad_consumida: string }[]>([{ insumo_id: null, cantidad_consumida: '' }]);

    const [productos, setProductos] = useState<any[]>([]);
    const [empleados, setEmpleados] = useState<any[]>([]);
    const [insumos, setInsumos] = useState<any[]>([]);

    const [showProductoPicker, setShowProductoPicker] = useState(false);
    const [showEmpleadoPicker, setShowEmpleadoPicker] = useState(false);
    const [insumoPicker, setInsumoPicker] = useState<number | null>(null);
    const [searchProd, setSearchProd] = useState('');
    const [searchEmp, setSearchEmp] = useState('');
    const [searchIns, setSearchIns] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('form'); setErrors({});
            setProductoId(null); setEmpleadoId(null);
            setCantidadAProducir('');
            setDetalles([{ insumo_id: null, cantidad_consumida: '' }]);
            cargarCatalogos();
        }
    }, [isOpen]);

    const cargarCatalogos = async () => {
        const [p, e, i] = await Promise.all([getProductos().catch(() => []), getEmpleados().catch(() => []), getInsumos().catch(() => [])]);
        setProductos(p); setEmpleados(e); setInsumos(i);
    };

    const prodSelected = productos.find(p => p.id_producto === productoId);
    const empSelected = empleados.find(e => e.id_empleado === empleadoId);

    const prodFiltrados = useMemo(() => productos.filter(p => p.nombre.toLowerCase().includes(searchProd.toLowerCase()) || p.sku.toLowerCase().includes(searchProd.toLowerCase())), [productos, searchProd]);
    const empFiltrados = useMemo(() => empleados.filter(e => e.nombre_completo.toLowerCase().includes(searchEmp.toLowerCase())), [empleados, searchEmp]);
    const insFiltrados = useMemo(() => insumos.filter(i => i.nombre.toLowerCase().includes(searchIns.toLowerCase())), [insumos, searchIns]);

    const addDetalle = () => setDetalles([...detalles, { insumo_id: null, cantidad_consumida: '' }]);
    const removeDetalle = (idx: number) => { const n = detalles.filter((_, i) => i !== idx); setDetalles(n.length ? n : [{ insumo_id: null, cantidad_consumida: '' }]); };
    const updateDetalle = (idx: number, field: string, value: any) => { const n = [...detalles]; (n[idx] as any)[field] = value; setDetalles(n); };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!productoId) errs.producto = 'Selecciona producto';
        if (!empleadoId) errs.empleado = 'Selecciona empleado';
        if (!cantidadAProducir || Number(cantidadAProducir) <= 0) errs.cantidad = 'Cantidad > 0';
        const ok = detalles.every(d => d.insumo_id && Number(d.cantidad_consumida) > 0);
        if (!ok) errs.detalles = 'Completa todos los insumos';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await onSave({
                producto_id: productoId,
                empleado_id: empleadoId,
                cantidad_a_producir: Number(cantidadAProducir),
                detalles: detalles.map(d => ({ insumo_id: d.insumo_id!, cantidad_consumida: Number(d.cantidad_consumida) })),
            });
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al procesar orden' });
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <View style={s.modal}>
                    <View style={s.header}>
                        <View style={s.headerIcon}><Scissors size={20} color={Colors.verdeExito} /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.headerTitle}>{step === 'success' ? 'Orden Creada!' : 'Nueva Orden'}</Text>
                            <Text style={s.headerSub}>{step === 'success' ? 'Produccion registrada' : 'Registra un nuevo lote de fabricacion'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn} data-testid="modal-orden-close"><X size={16} color="rgba(26,0,96,0.5)" /></TouchableOpacity>
                    </View>

                    {step === 'form' ? (
                        <ScrollView style={s.body} contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
                            {/* Producto picker */}
                            <View style={s.section}>
                                <View style={s.labelRow}><Box size={13} color={Colors.moradoAccento} /><Text style={s.label}>Producto a Fabricar</Text></View>
                                <TouchableOpacity style={s.pickerBtn} onPress={() => setShowProductoPicker(true)} data-testid="orden-producto-picker">
                                    <Text style={s.pickerBtnText}>{prodSelected ? `[${prodSelected.sku}] ${prodSelected.nombre}` : 'Selecciona producto...'}</Text>
                                </TouchableOpacity>
                                {errors.producto && <Text style={s.errorText}>{errors.producto}</Text>}

                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={s.labelRow}><Scissors size={13} color={Colors.moradoAccento} /><Text style={s.label}>Cantidad</Text></View>
                                        <TextInput style={[s.input, errors.cantidad ? s.inputError : null]} value={cantidadAProducir} onChangeText={setCantidadAProducir} placeholder="100" placeholderTextColor="rgba(26,0,96,0.3)" keyboardType="number-pad" editable={!loading} data-testid="orden-cantidad" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={s.labelRow}><User size={13} color={Colors.moradoAccento} /><Text style={s.label}>Artesano</Text></View>
                                        <TouchableOpacity style={s.pickerBtn} onPress={() => setShowEmpleadoPicker(true)} data-testid="orden-empleado-picker">
                                            <Text style={s.pickerBtnText} numberOfLines={1}>{empSelected?.nombre_completo || 'Asignar...'}</Text>
                                        </TouchableOpacity>
                                        {errors.empleado && <Text style={s.errorText}>{errors.empleado}</Text>}
                                    </View>
                                </View>
                            </View>

                            {/* Insumos */}
                            <View style={s.section}>
                                <View style={s.labelRow}><Scissors size={13} color={Colors.verdeExito} /><Text style={[s.label, { color: Colors.verdeExito }]}>Insumos Consumidos</Text></View>
                                {detalles.map((det, idx) => {
                                    const ins = insumos.find(i => i.id_insumo === det.insumo_id);
                                    return (
                                        <View key={idx} style={s.detalleRow}>
                                            <TouchableOpacity style={[s.pickerBtn, { flex: 2 }]} onPress={() => setInsumoPicker(idx)}>
                                                <Text style={s.pickerBtnText} numberOfLines={1}>{ins?.nombre || 'Insumo...'}</Text>
                                            </TouchableOpacity>
                                            <TextInput style={[s.input, { flex: 1 }]} value={det.cantidad_consumida} onChangeText={v => updateDetalle(idx, 'cantidad_consumida', v)} placeholder="Cant." placeholderTextColor="rgba(26,0,96,0.3)" keyboardType="decimal-pad" editable={!loading} />
                                            <TouchableOpacity style={s.removeBtn} onPress={() => removeDetalle(idx)}><Minus size={14} color={Colors.rojoPeligro} /></TouchableOpacity>
                                        </View>
                                    );
                                })}
                                {errors.detalles && <Text style={s.errorText}>{errors.detalles}</Text>}
                                <TouchableOpacity style={s.addDetalleBtn} onPress={addDetalle}><Plus size={14} color={Colors.verdeExito} /><Text style={s.addDetalleBtnText}>Agregar insumo</Text></TouchableOpacity>
                            </View>

                            {errors.submit && <View style={s.submitError}><AlertTriangle size={14} color="#c1002b" /><Text style={s.submitErrorText}>{errors.submit}</Text></View>}

                            <TouchableOpacity style={s.saveBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8} data-testid="orden-save-btn">
                                {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : <><Save size={16} color={Colors.amarilloAccento} /><Text style={s.saveBtnText}>Guardar Orden</Text></>}
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={s.successWrap}><View style={s.successIcon}><Scissors size={34} color={Colors.verdeExito} /></View><Text style={s.successTitle}>Orden Creada!</Text><Text style={s.successSub}>Insumos descontados del almacen.</Text></View>
                    )}
                </View>
            </View>

            {/* Picker modals */}
            <Modal transparent visible={showProductoPicker} animationType="fade" onRequestClose={() => setShowProductoPicker(false)}>
                <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setShowProductoPicker(false)}>
                    <View style={s.pickerModal}>
                        <Text style={s.pickerModalTitle}>Seleccionar Producto</Text>
                        <View style={s.pickerSearch}><Search size={14} color="rgba(26,0,96,0.3)" /><TextInput style={s.pickerSearchInput} placeholder="Buscar..." placeholderTextColor="rgba(26,0,96,0.3)" value={searchProd} onChangeText={setSearchProd} /></View>
                        <FlatList data={prodFiltrados} keyExtractor={i => String(i.id_producto)} renderItem={({ item }) => (
                            <TouchableOpacity style={[s.pickerItem, productoId === item.id_producto && s.pickerItemActive]} onPress={() => { setProductoId(item.id_producto); setShowProductoPicker(false); setSearchProd(''); }}>
                                <Text style={s.pickerItemText}>[{item.sku}] {item.nombre}</Text>
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal transparent visible={showEmpleadoPicker} animationType="fade" onRequestClose={() => setShowEmpleadoPicker(false)}>
                <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setShowEmpleadoPicker(false)}>
                    <View style={s.pickerModal}>
                        <Text style={s.pickerModalTitle}>Seleccionar Empleado</Text>
                        <View style={s.pickerSearch}><Search size={14} color="rgba(26,0,96,0.3)" /><TextInput style={s.pickerSearchInput} placeholder="Buscar..." placeholderTextColor="rgba(26,0,96,0.3)" value={searchEmp} onChangeText={setSearchEmp} /></View>
                        <FlatList data={empFiltrados} keyExtractor={i => String(i.id_empleado)} renderItem={({ item }) => (
                            <TouchableOpacity style={[s.pickerItem, empleadoId === item.id_empleado && s.pickerItemActive]} onPress={() => { setEmpleadoId(item.id_empleado); setShowEmpleadoPicker(false); setSearchEmp(''); }}>
                                <Text style={s.pickerItemText}>{item.nombre_completo}</Text>
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal transparent visible={insumoPicker !== null} animationType="fade" onRequestClose={() => setInsumoPicker(null)}>
                <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setInsumoPicker(null)}>
                    <View style={s.pickerModal}>
                        <Text style={s.pickerModalTitle}>Seleccionar Insumo</Text>
                        <View style={s.pickerSearch}><Search size={14} color="rgba(26,0,96,0.3)" /><TextInput style={s.pickerSearchInput} placeholder="Buscar..." placeholderTextColor="rgba(26,0,96,0.3)" value={searchIns} onChangeText={setSearchIns} /></View>
                        <FlatList data={insFiltrados} keyExtractor={i => String(i.id_insumo)} renderItem={({ item }) => (
                            <TouchableOpacity style={[s.pickerItem, insumoPicker !== null && detalles[insumoPicker]?.insumo_id === item.id_insumo && s.pickerItemActive]} onPress={() => { if (insumoPicker !== null) updateDetalle(insumoPicker, 'insumo_id', item.id_insumo); setInsumoPicker(null); setSearchIns(''); }}>
                                <Text style={s.pickerItemText}>{item.nombre} ({item.stock_actual} disp)</Text>
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.4)', justifyContent: 'center', alignItems: 'center', padding: 12 },
    modal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 22, width: '100%', maxHeight: '90%', elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.3, shadowRadius: 0 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.1)', backgroundColor: 'rgba(237,233,254,0.6)', borderTopLeftRadius: 19, borderTopRightRadius: 19 },
    headerIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.verdeFondo, borderWidth: 1.5, borderColor: 'rgba(6,214,160,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { fontSize: 10, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 1 },
    closeBtn: { width: 32, height: 32, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)', backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
    body: { padding: 16 },
    section: { backgroundColor: 'rgba(237,233,254,0.3)', borderWidth: 1.5, borderColor: 'rgba(26,0,96,0.08)', borderRadius: 14, padding: 14, gap: 8 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
    label: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: Colors.azulMarino },
    pickerBtn: { backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(212,184,240,0.6)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
    pickerBtnText: { fontWeight: '600', fontSize: 13, color: Colors.azulMarino },
    input: { backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(212,184,240,0.6)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
    inputError: { borderColor: '#ff4d6d' },
    errorText: { fontSize: 11, fontWeight: '600', color: '#ff4d6d' },
    detalleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    removeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ffe5e8', borderWidth: 1.5, borderColor: '#ff4d6d', justifyContent: 'center', alignItems: 'center' },
    addDetalleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 2, borderColor: Colors.verdeExito, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 10, marginTop: 4 },
    addDetalleBtnText: { fontWeight: '800', fontSize: 11, color: Colors.verdeExito, textTransform: 'uppercase' },
    submitError: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffe5e8', borderWidth: 2, borderColor: '#ff4d6d', borderRadius: 12, padding: 10 },
    submitErrorText: { fontSize: 12, fontWeight: '600', color: '#c1002b', flex: 1 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.azulMarino, borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 14, paddingVertical: 14, elevation: 4, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 0 },
    saveBtnText: { fontWeight: '900', fontSize: 14, color: Colors.amarilloAccento, textTransform: 'uppercase', letterSpacing: 0.8 },
    successWrap: { alignItems: 'center', paddingVertical: 50, gap: 14 },
    successIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.verdeFondo, borderWidth: 2, borderColor: 'rgba(6,214,160,0.25)', justifyContent: 'center', alignItems: 'center' },
    successTitle: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino },
    successSub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.5)' },
    // Picker modals
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.25)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    pickerModal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 20, width: '100%', maxWidth: 340, maxHeight: '70%', padding: 12, elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.3, shadowRadius: 0 },
    pickerModalTitle: { fontWeight: '800', fontSize: 11, color: 'rgba(26,0,96,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
    pickerSearch: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderColor: 'rgba(212,184,240,0.5)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8 },
    pickerSearchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    pickerItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.06)', borderRadius: 10 },
    pickerItemActive: { backgroundColor: Colors.amarilloAccento },
    pickerItemText: { fontWeight: '600', fontSize: 13, color: Colors.azulMarino },
});
