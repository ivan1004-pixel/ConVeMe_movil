import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView,
} from 'react-native';
import { X, Save, Box, Droplets, AlertTriangle } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    insumoAEditar?: any | null;
}

export default function ModalInsumo({ isOpen, onClose, onSave, insumoAEditar }: Props) {
    const esEdicion = Boolean(insumoAEditar);
    const [nombre, setNombre] = useState('');
    const [unidadMedida, setUnidadMedida] = useState('');
    const [stockMinimo, setStockMinimo] = useState('5');
    const [stockActual, setStockActual] = useState('0');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('form'); setErrors({});
            if (insumoAEditar) {
                setNombre(insumoAEditar.nombre || '');
                setUnidadMedida(insumoAEditar.unidad_medida || '');
                setStockMinimo(String(insumoAEditar.stock_minimo_alerta || ''));
                setStockActual(String(insumoAEditar.stock_actual || ''));
            } else { setNombre(''); setUnidadMedida(''); setStockMinimo('5'); setStockActual('0'); }
        }
    }, [isOpen, insumoAEditar]);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!nombre.trim()) errs.nombre = 'El nombre es obligatorio';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const payload: any = {
                nombre: nombre.trim(),
                unidad_medida: unidadMedida.trim() || undefined,
                stock_minimo_alerta: stockMinimo ? Number(stockMinimo) : undefined,
            };
            if (esEdicion && stockActual) payload.stock_actual = Number(stockActual);
            await onSave(payload);
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2000);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al guardar insumo' });
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <View style={s.modal}>
                    <View style={s.header}>
                        <View style={s.headerIcon}><Box size={20} color={Colors.moradoAccento} /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.headerTitle}>{step === 'success' ? 'Guardado!' : esEdicion ? 'Editar Insumo' : 'Nuevo Insumo'}</Text>
                            <Text style={s.headerSub}>{step === 'success' ? 'Catalogo de insumos actualizado' : 'Registra materia prima para el taller'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn} data-testid="modal-insumo-close"><X size={16} color="rgba(26,0,96,0.5)" /></TouchableOpacity>
                    </View>
                    {step === 'form' ? (
                        <ScrollView style={s.body} contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
                            <View style={s.section}>
                                <View style={s.fieldWrap}>
                                    <View style={s.labelRow}><Box size={13} color={Colors.moradoAccento} /><Text style={s.label}>Nombre del Insumo</Text></View>
                                    <TextInput style={[s.input, errors.nombre ? s.inputError : null]} value={nombre} onChangeText={setNombre} placeholder="Ej. Bases Metalicas 3cm" placeholderTextColor="rgba(26,0,96,0.3)" editable={!loading} data-testid="insumo-nombre" />
                                    {errors.nombre && <Text style={s.errorText}>{errors.nombre}</Text>}
                                </View>
                                <View style={s.fieldWrap}>
                                    <View style={s.labelRow}><Droplets size={13} color={Colors.moradoAccento} /><Text style={s.label}>Unidad de Medida</Text></View>
                                    <TextInput style={s.input} value={unidadMedida} onChangeText={setUnidadMedida} placeholder="Ej. Piezas, Litros" placeholderTextColor="rgba(26,0,96,0.3)" editable={!loading} data-testid="insumo-unidad" />
                                </View>
                                <View style={s.fieldWrap}>
                                    <View style={s.labelRow}><AlertTriangle size={13} color={Colors.rojoPeligro} /><Text style={s.label}>Alerta Stock Minimo</Text></View>
                                    <TextInput style={s.input} value={stockMinimo} onChangeText={setStockMinimo} placeholder="Ej. 10" placeholderTextColor="rgba(26,0,96,0.3)" keyboardType="decimal-pad" editable={!loading} data-testid="insumo-stock-min" />
                                </View>
                                {esEdicion && (
                                    <View style={s.fieldWrap}>
                                        <View style={s.labelRow}><Box size={13} color={Colors.verdeExito} /><Text style={s.label}>Ajustar Stock Actual</Text></View>
                                        <TextInput style={s.input} value={stockActual} onChangeText={setStockActual} placeholder="Cantidad actual" placeholderTextColor="rgba(26,0,96,0.3)" keyboardType="decimal-pad" editable={!loading} data-testid="insumo-stock-actual" />
                                    </View>
                                )}
                            </View>
                            {errors.submit && <View style={s.submitError}><Text style={s.submitErrorText}>{errors.submit}</Text></View>}
                            <TouchableOpacity style={s.saveBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8} data-testid="insumo-save-btn">
                                {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : <><Save size={16} color={Colors.amarilloAccento} /><Text style={s.saveBtnText}>{esEdicion ? 'Actualizar' : 'Guardar'} Insumo</Text></>}
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={s.successWrap}><View style={s.successIcon}><Box size={34} color={Colors.verdeExito} /></View><Text style={s.successTitle}>Guardado!</Text></View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 22, width: '100%', maxWidth: 420, maxHeight: '85%', elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.3, shadowRadius: 0 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.1)', backgroundColor: 'rgba(237,233,254,0.6)', borderTopLeftRadius: 19, borderTopRightRadius: 19 },
    headerIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(204,85,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(204,85,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { fontSize: 10, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 1 },
    closeBtn: { width: 32, height: 32, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)', backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
    body: { padding: 16 },
    section: { backgroundColor: 'rgba(237,233,254,0.3)', borderWidth: 1.5, borderColor: 'rgba(26,0,96,0.08)', borderRadius: 14, padding: 14, gap: 12 },
    fieldWrap: { gap: 4 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
    label: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: Colors.azulMarino },
    input: { backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(212,184,240,0.6)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
    inputError: { borderColor: '#ff4d6d' },
    errorText: { fontSize: 11, fontWeight: '600', color: '#ff4d6d' },
    submitError: { backgroundColor: '#ffe5e8', borderWidth: 2, borderColor: '#ff4d6d', borderRadius: 12, padding: 10 },
    submitErrorText: { fontSize: 12, fontWeight: '600', color: '#c1002b' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.azulMarino, borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 14, paddingVertical: 14, elevation: 4, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 0 },
    saveBtnText: { fontWeight: '900', fontSize: 14, color: Colors.amarilloAccento, textTransform: 'uppercase', letterSpacing: 0.8 },
    successWrap: { alignItems: 'center', paddingVertical: 50, gap: 14 },
    successIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.verdeFondo, borderWidth: 2, borderColor: 'rgba(6,214,160,0.25)', justifyContent: 'center', alignItems: 'center' },
    successTitle: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino },
});
