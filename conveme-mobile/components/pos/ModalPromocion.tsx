import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView, Switch,
} from 'react-native';
import { X, Save, Tag, Percent, Calendar, AlignLeft } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    promocionAEditar?: any | null;
}

type Step = 'form' | 'success';

const formatToInputDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function ModalPromocion({ isOpen, onClose, onSave, promocionAEditar }: Props) {
    const esEdicion = Boolean(promocionAEditar);

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipoPromocion, setTipoPromocion] = useState('Porcentaje');
    const [valorDescuento, setValorDescuento] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [activa, setActiva] = useState(true);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState<Step>('form');
    const [loading, setLoading] = useState(false);

    const [showTipoPicker, setShowTipoPicker] = useState(false);
    const tipos = ['Porcentaje', 'Monto Fijo', 'NxM'];

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setErrors({});
            setShowTipoPicker(false);
            if (promocionAEditar) {
                setNombre(promocionAEditar.nombre || '');
                setDescripcion(promocionAEditar.descripcion || '');
                setTipoPromocion(promocionAEditar.tipo_promocion || 'Porcentaje');
                setValorDescuento(String(promocionAEditar.valor_descuento || ''));
                setFechaInicio(formatToInputDate(promocionAEditar.fecha_inicio));
                setFechaFin(formatToInputDate(promocionAEditar.fecha_fin));
                setActiva(promocionAEditar.activa ?? true);
            } else {
                setNombre(''); setDescripcion(''); setTipoPromocion('Porcentaje');
                setValorDescuento(''); setFechaInicio(''); setFechaFin(''); setActiva(true);
            }
        }
    }, [isOpen, promocionAEditar]);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!nombre.trim()) errs.nombre = 'El nombre es obligatorio';
        if (!fechaInicio) errs.fechaInicio = 'Fija un inicio';
        if (!fechaFin) errs.fechaFin = 'Fija un fin';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const payload: any = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || undefined,
                tipo_promocion: tipoPromocion,
                valor_descuento: valorDescuento ? Number(valorDescuento) : undefined,
                fecha_inicio: new Date(fechaInicio).toISOString(),
                fecha_fin: new Date(fechaFin).toISOString(),
                activa,
            };
            await onSave(payload);
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2000);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Error al guardar promocion' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <View style={s.modal}>
                    {/* Header */}
                    <View style={s.header}>
                        <View style={s.headerIcon}><Tag size={20} color="#00b4d8" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.headerTitle}>{step === 'success' ? 'Guardada!' : esEdicion ? 'Editar Promocion' : 'Nueva Promocion'}</Text>
                            <Text style={s.headerSub}>{step === 'success' ? 'Operacion completada' : 'Crea descuentos para el punto de venta'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn} data-testid="modal-promo-close"><X size={16} color="rgba(26,0,96,0.5)" /></TouchableOpacity>
                    </View>

                    {step === 'form' ? (
                        <ScrollView style={s.body} contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
                            <View style={s.section}>
                                <View style={s.fieldWrap}>
                                    <View style={s.labelRow}><Tag size={13} color="#00b4d8" /><Text style={s.label}>Nombre</Text></View>
                                    <TextInput style={[s.input, errors.nombre ? s.inputError : null]} value={nombre} onChangeText={setNombre} placeholder="Ej. Buen Fin 2026" placeholderTextColor="rgba(26,0,96,0.3)" editable={!loading} data-testid="promo-nombre" />
                                    {errors.nombre && <Text style={s.errorText}>{errors.nombre}</Text>}
                                </View>

                                {/* Tipo Promocion picker */}
                                <View style={s.fieldWrap}>
                                    <View style={s.labelRow}><AlignLeft size={13} color="#00b4d8" /><Text style={s.label}>Tipo de Promocion</Text></View>
                                    <TouchableOpacity style={s.pickerBtn} onPress={() => setShowTipoPicker(!showTipoPicker)} data-testid="promo-tipo-picker">
                                        <Text style={s.pickerBtnText}>{tipoPromocion}</Text>
                                    </TouchableOpacity>
                                    {showTipoPicker && (
                                        <View style={s.pickerList}>
                                            {tipos.map(t => (
                                                <TouchableOpacity key={t} style={[s.pickerItem, tipoPromocion === t && s.pickerItemActive]} onPress={() => { setTipoPromocion(t); setShowTipoPicker(false); }}>
                                                    <Text style={[s.pickerItemText, tipoPromocion === t && s.pickerItemTextActive]}>{t}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View style={s.fieldWrap}>
                                    <View style={s.labelRow}><Percent size={13} color="#00b4d8" /><Text style={s.label}>Valor del Descuento</Text></View>
                                    <TextInput style={s.input} value={valorDescuento} onChangeText={setValorDescuento} placeholder={tipoPromocion === 'Porcentaje' ? 'Ej. 15' : 'Ej. 50.00'} placeholderTextColor="rgba(26,0,96,0.3)" keyboardType="decimal-pad" editable={!loading && tipoPromocion !== 'NxM'} data-testid="promo-valor" />
                                </View>

                                <View style={s.fieldWrap}>
                                    <View style={s.labelRow}><Calendar size={13} color="#00b4d8" /><Text style={s.label}>Fecha Inicio (YYYY-MM-DD)</Text></View>
                                    <TextInput style={[s.input, errors.fechaInicio ? s.inputError : null]} value={fechaInicio} onChangeText={setFechaInicio} placeholder="2026-03-01" placeholderTextColor="rgba(26,0,96,0.3)" editable={!loading} data-testid="promo-fecha-inicio" />
                                    {errors.fechaInicio && <Text style={s.errorText}>{errors.fechaInicio}</Text>}
                                </View>

                                <View style={s.fieldWrap}>
                                    <View style={s.labelRow}><Calendar size={13} color="#00b4d8" /><Text style={s.label}>Fecha Fin (YYYY-MM-DD)</Text></View>
                                    <TextInput style={[s.input, errors.fechaFin ? s.inputError : null]} value={fechaFin} onChangeText={setFechaFin} placeholder="2026-03-31" placeholderTextColor="rgba(26,0,96,0.3)" editable={!loading} data-testid="promo-fecha-fin" />
                                    {errors.fechaFin && <Text style={s.errorText}>{errors.fechaFin}</Text>}
                                </View>

                                <View style={s.switchRow}>
                                    <Text style={[s.switchLabel, { color: activa ? Colors.verdeExito : 'rgba(26,0,96,0.4)' }]}>
                                        {activa ? 'Promocion Activa' : 'Promocion Pausada'}
                                    </Text>
                                    <Switch
                                        value={activa}
                                        onValueChange={setActiva}
                                        trackColor={{ false: Colors.gris300, true: Colors.verdeExito }}
                                        thumbColor={Colors.blanco}
                                        disabled={loading}
                                    />
                                </View>
                            </View>

                            {errors.submit && <View style={s.submitError}><Text style={s.submitErrorText}>{errors.submit}</Text></View>}

                            <TouchableOpacity style={s.saveBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8} data-testid="promo-save-btn">
                                {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : <><Save size={16} color={Colors.amarilloAccento} /><Text style={s.saveBtnText}>{esEdicion ? 'Actualizar' : 'Guardar'} Promocion</Text></>}
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={s.successWrap}>
                            <View style={s.successIcon}><Tag size={34} color="#00b4d8" /></View>
                            <Text style={s.successTitle}>Guardada!</Text>
                        </View>
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
    headerIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(0,180,216,0.12)', borderWidth: 1.5, borderColor: 'rgba(0,180,216,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { fontSize: 10, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 1 },
    closeBtn: { width: 32, height: 32, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)', backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
    body: { padding: 16 },
    section: { backgroundColor: 'rgba(237,233,254,0.3)', borderWidth: 1.5, borderColor: 'rgba(26,0,96,0.08)', borderRadius: 14, padding: 14, gap: 12 },
    fieldWrap: { gap: 4 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
    label: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: Colors.azulMarino },
    input: { backgroundColor: 'rgba(240,251,255,1)', borderWidth: 2, borderColor: 'rgba(144,224,239,0.6)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
    inputError: { borderColor: '#ff4d6d' },
    errorText: { fontSize: 11, fontWeight: '600', color: '#ff4d6d' },
    pickerBtn: { backgroundColor: 'rgba(240,251,255,1)', borderWidth: 2, borderColor: 'rgba(144,224,239,0.6)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
    pickerBtnText: { fontWeight: '600', fontSize: 13, color: Colors.azulMarino },
    pickerList: { borderWidth: 2, borderColor: Colors.azulMarino, borderRadius: 12, overflow: 'hidden', marginTop: 4 },
    pickerItem: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.06)' },
    pickerItemActive: { backgroundColor: Colors.amarilloAccento },
    pickerItemText: { fontWeight: '500', fontSize: 13, color: Colors.azulMarino },
    pickerItemTextActive: { fontWeight: '700' },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    switchLabel: { fontWeight: '800', fontSize: 13 },
    submitError: { backgroundColor: '#ffe5e8', borderWidth: 2, borderColor: '#ff4d6d', borderRadius: 12, padding: 10 },
    submitErrorText: { fontSize: 12, fontWeight: '600', color: '#c1002b' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.azulMarino, borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 14, paddingVertical: 14, elevation: 4, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 0 },
    saveBtnText: { fontWeight: '900', fontSize: 14, color: Colors.amarilloAccento, textTransform: 'uppercase', letterSpacing: 0.8 },
    successWrap: { alignItems: 'center', paddingVertical: 50, gap: 14 },
    successIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(0,180,216,0.12)', borderWidth: 2, borderColor: 'rgba(0,180,216,0.25)', justifyContent: 'center', alignItems: 'center' },
    successTitle: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino },
});
