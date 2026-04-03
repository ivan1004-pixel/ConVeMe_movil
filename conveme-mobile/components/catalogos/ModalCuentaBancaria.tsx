import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView, FlatList, Alert,
} from 'react-native';
import { X, Save, CreditCard, Check, Search } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { getVendedores } from '@/services/vendedor.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    cuentaAEditar?: any | null;
}

type Step = 'form' | 'success';

export default function ModalCuentaBancaria({ isOpen, onClose, onSave, cuentaAEditar }: Props) {
    const [vendedorId, setVendedorId] = useState<number | null>(null);
    const [banco, setBanco] = useState('');
    const [titularCuenta, setTitularCuenta] = useState('');
    const [numeroCuenta, setNumeroCuenta] = useState('');
    const [clabe, setClabe] = useState('');

    const [vendedoresLista, setVendedoresLista] = useState<any[]>([]);
    const [showVendedorPicker, setShowVendedorPicker] = useState(false);
    const [searchVendedor, setSearchVendedor] = useState('');

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('form');
    const esEdicion = Boolean(cuentaAEditar);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            cargarVendedores();
            if (cuentaAEditar) {
                setVendedorId(cuentaAEditar.vendedor?.id_vendedor || null);
                setBanco(String(cuentaAEditar.banco || ''));
                setTitularCuenta(String(cuentaAEditar.titular_cuenta || ''));
                setNumeroCuenta(String(cuentaAEditar.numero_cuenta || ''));
                setClabe(String(cuentaAEditar.clabe_interbancaria || ''));
            } else { limpiar(); }
        } else { limpiar(); }
    }, [isOpen, cuentaAEditar]);

    const cargarVendedores = async () => { try { setVendedoresLista(await getVendedores()); } catch (e) { console.error(e); } };
    const limpiar = () => { setVendedorId(null); setBanco(''); setTitularCuenta(''); setNumeroCuenta(''); setClabe(''); setSearchVendedor(''); };

    const handleSubmit = async () => {
        if (!vendedorId) return Alert.alert('Error', 'Enlaza esta cuenta con un vendedor.');
        if (clabe && !/^\d{18}$/.test(clabe)) return Alert.alert('Error', 'La CLABE debe tener 18 digitos.');
        if (!/^\d+$/.test(numeroCuenta)) return Alert.alert('Error', 'El numero de cuenta solo debe contener numeros.');
        setLoading(true);
        try {
            await onSave({
                vendedor_id: vendedorId, banco: banco.trim(), titular_cuenta: titularCuenta.trim(),
                numero_cuenta: numeroCuenta.trim(), clabe_interbancaria: clabe ? clabe.trim() : undefined,
            });
            setStep('success');
            setTimeout(() => { onClose(); }, 1500);
        } catch (err: any) { Alert.alert('Error', err.message || 'Error al procesar.'); }
        finally { setLoading(false); }
    };

    const vendedorSel = vendedoresLista.find(v => v.id_vendedor === vendedorId);
    const vendedoresFiltrados = vendedoresLista.filter(v =>
        v.nombre_completo.toLowerCase().includes(searchVendedor.toLowerCase()) || String(v.id_vendedor).includes(searchVendedor)
    );

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={step === 'form' ? onClose : undefined} />
                <View style={s.modal}>
                    <View style={[s.header, { backgroundColor: Colors.amarilloAccento }]}>
                        <View style={s.headerLeft}>
                            <View style={s.headerIconBox}><CreditCard size={18} color={Colors.azulMarino} /></View>
                            <View>
                                <Text style={s.headerTitle}>{esEdicion ? 'Editar Cuenta' : 'Nueva Cuenta'}</Text>
                                <Text style={s.headerSub}>{esEdicion ? 'Modifica datos bancarios' : 'Registra una cuenta bancaria'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}><X size={16} color={Colors.azulMarino} /></TouchableOpacity>
                    </View>

                    {step === 'form' ? (
                        <>
                            <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }}>
                                {/* Vendedor */}
                                <View style={s.section}>
                                    <Text style={[s.sectionLabel, { color: Colors.moradoAccento }]}>Propietario de la cuenta</Text>
                                    <TouchableOpacity style={s.selectBtn} onPress={() => { setShowVendedorPicker(true); setSearchVendedor(''); }}>
                                        <Text style={vendedorSel ? s.selectText : s.selectPlaceholder}>
                                            {vendedorSel ? `ID:${vendedorSel.id_vendedor} - ${vendedorSel.nombre_completo}` : 'Seleccione vendedor...'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Datos bancarios */}
                                <View style={s.section}>
                                    <Text style={[s.sectionLabel, { color: Colors.verdeExito }]}>Datos Bancarios</Text>
                                    <View style={{ gap: 10 }}>
                                        <View><Text style={s.label}>Banco</Text><TextInput style={s.input} placeholder="Ej. BBVA, Santander..." placeholderTextColor="#b9a0d4" value={banco} onChangeText={setBanco} editable={!loading} /></View>
                                        <View><Text style={s.label}>Titular de la cuenta</Text><TextInput style={s.input} placeholder="Nombre en la tarjeta" placeholderTextColor="#b9a0d4" value={titularCuenta} onChangeText={setTitularCuenta} editable={!loading} /></View>
                                        <View style={s.grid}>
                                            <View style={s.gridItem}><Text style={s.label}>N. de Cuenta</Text><TextInput style={s.input} keyboardType="number-pad" placeholder="Solo numeros" placeholderTextColor="#b9a0d4" value={numeroCuenta} onChangeText={t => setNumeroCuenta(t.replace(/\D/g, ''))} maxLength={20} editable={!loading} /></View>
                                            <View style={s.gridItem}><Text style={s.label}>CLABE (Opcional)</Text><TextInput style={s.input} keyboardType="number-pad" placeholder="18 digitos" placeholderTextColor="#b9a0d4" value={clabe} onChangeText={t => setClabe(t.replace(/\D/g, ''))} maxLength={18} editable={!loading} /></View>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>
                            <View style={s.footer}>
                                <TouchableOpacity style={s.saveBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
                                    {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : (
                                        <><Save size={16} color={Colors.amarilloAccento} /><Text style={s.saveBtnText}>{esEdicion ? 'Actualizar' : 'Guardar'} cuenta</Text></>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={s.successWrap}>
                            <View style={[s.successIcon, { backgroundColor: Colors.verdeFondo, borderColor: 'rgba(6,214,160,0.25)' }]}><Check size={36} color={Colors.verdeExito} /></View>
                            <Text style={s.successTitle}>Cuenta {esEdicion ? 'Actualizada' : 'Guardada'}!</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Vendedor Picker */}
            <Modal transparent visible={showVendedorPicker} animationType="slide" onRequestClose={() => setShowVendedorPicker(false)}>
                <View style={s.pickerOverlay}>
                    <View style={s.pickerModal}>
                        <View style={s.pickerHeader}>
                            <Text style={s.pickerTitle}>Vendedor</Text>
                            <TouchableOpacity onPress={() => setShowVendedorPicker(false)}><X size={20} color={Colors.azulMarino} /></TouchableOpacity>
                        </View>
                        <View style={s.pickerSearch}>
                            <Search size={14} color="rgba(26,0,96,0.35)" />
                            <TextInput style={s.pickerSearchInput} placeholder="Buscar por nombre o ID..." placeholderTextColor="rgba(26,0,96,0.35)" value={searchVendedor} onChangeText={setSearchVendedor} autoFocus />
                        </View>
                        <FlatList
                            data={vendedoresFiltrados}
                            keyExtractor={item => String(item.id_vendedor)}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[s.pickerItem, item.id_vendedor === vendedorId && s.pickerItemActive]} onPress={() => { setVendedorId(item.id_vendedor); setShowVendedorPicker(false); setSearchVendedor(''); }}>
                                    <Text style={s.pickerItemText}><Text style={{ color: Colors.moradoAccento, fontWeight: '900', fontSize: 10 }}>ID:{item.id_vendedor} </Text>{item.nombre_completo}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={s.pickerEmpty}>Sin resultados</Text>}
                        />
                    </View>
                </View>
            </Modal>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.30)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modal: { backgroundColor: Colors.blanco, borderWidth: 3.5, borderColor: Colors.azulMarino, borderRadius: 24, width: '100%', maxWidth: 480, maxHeight: '90%', elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 7, height: 7 }, shadowOpacity: 0.3, shadowRadius: 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 3.5, borderBottomColor: Colors.azulMarino, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    headerIconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.blanco, borderWidth: 2, borderColor: Colors.azulMarino, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontWeight: '900', fontSize: 15, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.8 },
    headerSub: { fontSize: 10, fontWeight: '500', color: 'rgba(26,0,96,0.55)', marginTop: 1 },
    closeBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    body: { padding: 16, flex: 1 },
    section: { gap: 8 },
    sectionLabel: { fontWeight: '900', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
    label: { fontWeight: '800', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: Colors.azulMarino, marginBottom: 6 },
    input: { backgroundColor: Colors.blanco, borderWidth: 2, borderColor: Colors.azulMarino, borderRadius: 12, padding: 10, paddingHorizontal: 12, fontSize: 13, fontWeight: '600', color: Colors.azulMarino },
    grid: { flexDirection: 'row', gap: 10 },
    gridItem: { flex: 1 },
    selectBtn: { backgroundColor: Colors.blanco, borderWidth: 2, borderColor: Colors.azulMarino, borderRadius: 12, padding: 10, paddingHorizontal: 12 },
    selectText: { fontSize: 13, fontWeight: '600', color: Colors.azulMarino },
    selectPlaceholder: { fontSize: 13, fontWeight: '400', color: 'rgba(26,0,96,0.4)' },
    footer: { padding: 14, borderTopWidth: 3.5, borderTopColor: Colors.azulMarino, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.azulMarino, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 14, padding: 14, elevation: 4, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.22, shadowRadius: 0 },
    saveBtnText: { fontWeight: '900', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.amarilloAccento },
    successWrap: { padding: 40, alignItems: 'center', gap: 14 },
    successIcon: { width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    successTitle: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino, textAlign: 'center' },
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    pickerModal: { backgroundColor: Colors.blanco, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '55%', borderWidth: 3, borderColor: Colors.azulMarino },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.1)' },
    pickerTitle: { fontWeight: '900', fontSize: 16, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 1 },
    pickerSearch: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1.5, borderBottomColor: 'rgba(26,0,96,0.08)', backgroundColor: '#f3e8ff' },
    pickerSearchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    pickerItem: { padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.05)' },
    pickerItemActive: { backgroundColor: Colors.amarilloAccento },
    pickerItemText: { fontSize: 13, fontWeight: '700', color: Colors.azulMarino },
    pickerEmpty: { padding: 24, textAlign: 'center', color: Colors.gris400, fontWeight: '600' },
});
