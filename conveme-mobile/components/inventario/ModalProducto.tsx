import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView, FlatList,
} from 'react-native';
import { X, Save, Package, DollarSign, ListFilter, Check } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { getCategorias } from '@/services/categoria.service';
import { getTamanos } from '@/services/tamano.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    productoAEditar?: any | null;
}

type Step = 'form' | 'success';

export default function ModalProducto({ isOpen, onClose, onSave, productoAEditar }: Props) {
    const [sku, setSku] = useState('');
    const [nombre, setNombre] = useState('');
    const [categoriaId, setCategoriaId] = useState<number | null>(null);
    const [tamanoId, setTamanoId] = useState<number | null>(null);
    const [precioUnitario, setPrecioUnitario] = useState('');
    const [precioMayoreo, setPrecioMayoreo] = useState('');
    const [cantidadMinima, setCantidadMinima] = useState('12');
    const [costoProduccion, setCostoProduccion] = useState('');

    const [categorias, setCategorias] = useState<any[]>([]);
    const [tamanos, setTamanos] = useState<any[]>([]);

    const [showCatPicker, setShowCatPicker] = useState(false);
    const [showTamPicker, setShowTamPicker] = useState(false);

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('form');
    const esEdicion = Boolean(productoAEditar);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            cargarListas();
            if (productoAEditar) {
                setSku(productoAEditar.sku || '');
                setNombre(productoAEditar.nombre || '');
                setCategoriaId(productoAEditar.categoria?.id_categoria || null);
                setTamanoId(productoAEditar.tamano?.id_tamano || null);
                setPrecioUnitario(String(productoAEditar.precio_unitario || ''));
                setPrecioMayoreo(productoAEditar.precio_mayoreo ? String(productoAEditar.precio_mayoreo) : '');
                setCantidadMinima(String(productoAEditar.cantidad_minima_mayoreo || 12));
                setCostoProduccion(productoAEditar.costo_produccion ? String(productoAEditar.costo_produccion) : '');
            } else {
                limpiar();
            }
        }
    }, [isOpen, productoAEditar]);

    const cargarListas = async () => {
        try {
            const [dataCat, dataTam] = await Promise.all([getCategorias(), getTamanos()]);
            setCategorias(dataCat);
            setTamanos(dataTam);
        } catch (e) { console.error(e); }
    };

    const limpiar = () => {
        setSku(''); setNombre(''); setCategoriaId(null); setTamanoId(null);
        setPrecioUnitario(''); setPrecioMayoreo(''); setCantidadMinima('12'); setCostoProduccion('');
    };

    const handleSubmit = async () => {
        if (!categoriaId || !tamanoId || !sku || !nombre) return;
        setLoading(true);
        try {
            await onSave({
                sku: sku.trim(),
                nombre: nombre.trim(),
                categoria_id: categoriaId,
                tamano_id: tamanoId,
                precio_unitario: Number(precioUnitario),
                precio_mayoreo: precioMayoreo ? Number(precioMayoreo) : undefined,
                cantidad_minima_mayoreo: Number(cantidadMinima),
                costo_produccion: costoProduccion ? Number(costoProduccion) : undefined,
            });
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const catNombre = categorias.find(c => c.id_categoria === categoriaId)?.nombre;
    const tamDescripcion = tamanos.find(t => t.id_tamano === tamanoId)?.descripcion;

    const renderPickerModal = (visible: boolean, onCloseP: () => void, data: any[], selectedId: number | null, onSelect: (id: number) => void, keyField: string, labelField: string, title: string) => (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onCloseP}>
            <View style={s.pickerOverlay}>
                <View style={s.pickerModal}>
                    <View style={s.pickerHeader}>
                        <Text style={s.pickerTitle}>{title}</Text>
                        <TouchableOpacity onPress={onCloseP}><X size={20} color={Colors.azulMarino} /></TouchableOpacity>
                    </View>
                    <FlatList
                        data={data}
                        keyExtractor={item => String(item[keyField])}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[s.pickerItem, item[keyField] === selectedId && s.pickerItemActive]}
                                onPress={() => { onSelect(item[keyField]); onCloseP(); }}
                            >
                                <Text style={[s.pickerItemText, item[keyField] === selectedId && s.pickerItemTextActive]}>{item[labelField]}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={s.pickerEmpty}>Sin datos disponibles</Text>}
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={step === 'form' ? onClose : undefined} />
                <View style={s.modal}>
                    <View style={s.header}>
                        <View style={s.headerLeft}>
                            <View style={[s.headerIcon, { backgroundColor: esEdicion ? 'rgba(204,85,255,0.12)' : Colors.verdeFondo, borderColor: esEdicion ? 'rgba(204,85,255,0.2)' : 'rgba(6,214,160,0.2)' }]}>
                                <Package size={20} color={esEdicion ? Colors.moradoAccento : Colors.verdeExito} />
                            </View>
                            <View>
                                <Text style={s.headerTitle}>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</Text>
                                <Text style={s.headerSub}>{esEdicion ? 'Modifica datos y precios' : 'Registra un nuevo articulo'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}><X size={16} color={Colors.gris400} /></TouchableOpacity>
                    </View>

                    {step === 'form' ? (
                        <>
                            <ScrollView style={s.body} contentContainerStyle={{ gap: 16 }}>
                                {/* Ficha */}
                                <View style={s.section}>
                                    <View style={s.sectionHeader}><ListFilter size={14} color={Colors.moradoAccento} /><Text style={[s.sectionTitle, { color: Colors.moradoAccento }]}>Ficha del Producto</Text></View>
                                    <View style={s.grid}>
                                        <View style={s.gridItem}>
                                            <Text style={s.label}>Codigo / SKU</Text>
                                            <TextInput style={s.input} placeholder="Ej. PIN-AJO-01" placeholderTextColor="#b9a0d4" value={sku} onChangeText={t => setSku(t.toUpperCase())} editable={!loading} autoCapitalize="characters" />
                                        </View>
                                        <View style={s.gridItem}>
                                            <Text style={s.label}>Nombre</Text>
                                            <TextInput style={s.input} placeholder="Ej. Pin de Ajolote" placeholderTextColor="#b9a0d4" value={nombre} onChangeText={setNombre} editable={!loading} />
                                        </View>
                                    </View>
                                    <View style={s.grid}>
                                        <View style={s.gridItem}>
                                            <Text style={s.label}>Categoria</Text>
                                            <TouchableOpacity style={s.selectBtn} onPress={() => setShowCatPicker(true)} disabled={loading}>
                                                <Text style={catNombre ? s.selectText : s.selectPlaceholder}>{catNombre || 'Seleccione...'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={s.gridItem}>
                                            <Text style={s.label}>Tamano</Text>
                                            <TouchableOpacity style={s.selectBtn} onPress={() => setShowTamPicker(true)} disabled={loading}>
                                                <Text style={tamDescripcion ? s.selectText : s.selectPlaceholder}>{tamDescripcion || 'Seleccione...'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Precios */}
                                <View style={s.section}>
                                    <View style={s.sectionHeader}><DollarSign size={14} color={Colors.verdeExito} /><Text style={[s.sectionTitle, { color: Colors.verdeExito }]}>Precios y Costos</Text></View>
                                    <View style={s.grid}>
                                        <View style={s.gridItem}>
                                            <Text style={s.label}>Precio Unitario ($)</Text>
                                            <TextInput style={s.input} keyboardType="decimal-pad" value={precioUnitario} onChangeText={setPrecioUnitario} editable={!loading} />
                                        </View>
                                        <View style={s.gridItem}>
                                            <Text style={s.label}>Costo Produccion ($)</Text>
                                            <TextInput style={s.input} keyboardType="decimal-pad" placeholder="Opcional" placeholderTextColor="#b9a0d4" value={costoProduccion} onChangeText={setCostoProduccion} editable={!loading} />
                                        </View>
                                    </View>
                                    <View style={s.grid}>
                                        <View style={s.gridItem}>
                                            <Text style={s.label}>Precio Mayoreo ($)</Text>
                                            <TextInput style={s.input} keyboardType="decimal-pad" placeholder="Opcional" placeholderTextColor="#b9a0d4" value={precioMayoreo} onChangeText={setPrecioMayoreo} editable={!loading} />
                                        </View>
                                        <View style={s.gridItem}>
                                            <Text style={s.label}>Min. Mayoreo (Pzs)</Text>
                                            <TextInput style={s.input} keyboardType="number-pad" value={cantidadMinima} onChangeText={setCantidadMinima} editable={!loading} />
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={s.footer}>
                                <TouchableOpacity
                                    style={[s.saveBtn, esEdicion && s.saveBtnEdit]}
                                    onPress={handleSubmit} disabled={loading || !sku || !nombre}
                                    activeOpacity={0.8}
                                >
                                    {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : (
                                        <><Save size={16} color={esEdicion ? Colors.blanco : Colors.amarilloAccento} /><Text style={[s.saveBtnText, esEdicion && { color: Colors.blanco }]}>{esEdicion ? 'Actualizar' : 'Guardar'} producto</Text></>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={s.successWrap}>
                            <View style={[s.successIcon, { backgroundColor: Colors.verdeFondo, borderColor: 'rgba(6,214,160,0.25)' }]}>
                                <Check size={36} color={Colors.verdeExito} />
                            </View>
                            <Text style={s.successTitle}>{esEdicion ? 'Producto actualizado!' : 'Producto registrado!'}</Text>
                            <Text style={s.successSub}>{sku} guardado correctamente.</Text>
                        </View>
                    )}
                </View>
            </View>

            {renderPickerModal(showCatPicker, () => setShowCatPicker(false), categorias, categoriaId, setCategoriaId, 'id_categoria', 'nombre', 'Seleccionar Categoria')}
            {renderPickerModal(showTamPicker, () => setShowTamPicker(false), tamanos, tamanoId, setTamanoId, 'id_tamano', 'descripcion', 'Seleccionar Tamano')}
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.30)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 28, width: '100%', maxWidth: 600, maxHeight: '90%', elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.3, shadowRadius: 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 2.5, borderBottomColor: 'rgba(26,0,96,0.10)', backgroundColor: Colors.fondoMoradoClaro, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    headerIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
    headerTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { fontSize: 11, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 2 },
    closeBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)', backgroundColor: Colors.blanco, justifyContent: 'center', alignItems: 'center' },
    body: { padding: 20, flex: 1 },
    section: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    sectionTitle: { fontWeight: '900', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
    grid: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    gridItem: { flex: 1 },
    label: { fontWeight: '700', fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: Colors.azulMarino, marginBottom: 5 },
    input: { backgroundColor: '#faf5ff', borderWidth: 2.5, borderColor: '#d4b8f0', borderRadius: 12, padding: 10, paddingHorizontal: 14, fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
    selectBtn: { backgroundColor: '#faf5ff', borderWidth: 2.5, borderColor: '#d4b8f0', borderRadius: 12, padding: 12, paddingHorizontal: 14 },
    selectText: { fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
    selectPlaceholder: { fontSize: 13, fontWeight: '400', color: '#b9a0d4' },
    footer: { padding: 16, borderTopWidth: 2.5, borderTopColor: 'rgba(26,0,96,0.1)', backgroundColor: Colors.blanco, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.azulMarino, borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 14, padding: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 0 },
    saveBtnEdit: { backgroundColor: Colors.moradoAccento },
    saveBtnText: { fontWeight: '900', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', color: Colors.amarilloAccento },
    successWrap: { padding: 48, paddingHorizontal: 24, alignItems: 'center', gap: 14 },
    successIcon: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    successTitle: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino, textAlign: 'center' },
    successSub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.5)', textAlign: 'center' },
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    pickerModal: { backgroundColor: Colors.blanco, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '50%', borderWidth: 3, borderColor: Colors.azulMarino },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.1)' },
    pickerTitle: { fontWeight: '900', fontSize: 16, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 1 },
    pickerItem: { padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.05)' },
    pickerItemActive: { backgroundColor: Colors.amarilloAccento },
    pickerItemText: { fontSize: 14, fontWeight: '500', color: Colors.azulMarino },
    pickerItemTextActive: { fontWeight: '800' },
    pickerEmpty: { padding: 24, textAlign: 'center', color: Colors.gris400, fontWeight: '600' },
});
