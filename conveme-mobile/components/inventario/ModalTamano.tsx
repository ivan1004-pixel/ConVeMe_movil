import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView, FlatList,
} from 'react-native';
import { X, Save, Ruler, Check } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { descripcion: string }) => Promise<void>;
    tamanoAEditar?: any | null;
}

type Step = 'form' | 'success';

export default function ModalTamano({ isOpen, onClose, onSave, tamanoAEditar }: Props) {
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('form');
    const esEdicion = Boolean(tamanoAEditar);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setDescripcion(tamanoAEditar?.descripcion || '');
        } else {
            setDescripcion('');
        }
    }, [isOpen, tamanoAEditar]);

    const handleSubmit = async () => {
        if (!descripcion.trim()) return;
        setLoading(true);
        try {
            await onSave({ descripcion: descripcion.trim() });
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={step === 'form' ? onClose : undefined} />
                <View style={s.modal}>
                    <View style={s.header}>
                        <View style={s.headerLeft}>
                            <View style={[s.headerIcon, { backgroundColor: esEdicion ? 'rgba(204,85,255,0.12)' : Colors.verdeFondo, borderColor: esEdicion ? 'rgba(204,85,255,0.2)' : 'rgba(6,214,160,0.2)' }]}>
                                <Ruler size={20} color={esEdicion ? Colors.moradoAccento : Colors.verdeExito} />
                            </View>
                            <View>
                                <Text style={s.headerTitle}>{esEdicion ? 'Editar tamano' : 'Nuevo tamano'}</Text>
                                <Text style={s.headerSub}>{esEdicion ? 'Modifica la descripcion' : 'Registra un tamano'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}><X size={16} color={Colors.gris400} /></TouchableOpacity>
                    </View>

                    {step === 'form' ? (
                        <ScrollView style={s.body} contentContainerStyle={{ gap: 18 }}>
                            <View>
                                <View style={s.labelRow}><Ruler size={13} color={Colors.moradoAccento} /><Text style={s.label}>Descripcion</Text></View>
                                <TextInput
                                    style={s.input} placeholder="Ej. Chico, Mediano, Grande, 5cm..."
                                    placeholderTextColor="#b9a0d4" value={descripcion}
                                    onChangeText={setDescripcion} editable={!loading}
                                    data-testid="modal-tamano-descripcion"
                                />
                            </View>
                            <TouchableOpacity
                                style={[s.saveBtn, esEdicion && s.saveBtnEdit]}
                                onPress={handleSubmit} disabled={loading || !descripcion.trim()}
                                activeOpacity={0.8} data-testid="modal-tamano-guardar"
                            >
                                {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : (
                                    <><Save size={16} color={esEdicion ? Colors.blanco : Colors.amarilloAccento} /><Text style={[s.saveBtnText, esEdicion && { color: Colors.blanco }]}>{esEdicion ? 'Actualizar' : 'Guardar'} tamano</Text></>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={s.successWrap}>
                            <View style={[s.successIcon, { backgroundColor: Colors.verdeFondo, borderColor: 'rgba(6,214,160,0.25)' }]}>
                                <Check size={36} color={Colors.verdeExito} />
                            </View>
                            <Text style={s.successTitle}>{esEdicion ? 'Tamano actualizado!' : 'Tamano registrado!'}</Text>
                            <Text style={s.successSub}>"{descripcion}" se guardo correctamente.</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.30)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 28, width: '100%', maxWidth: 420, elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.3, shadowRadius: 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 2.5, borderBottomColor: 'rgba(26,0,96,0.10)', backgroundColor: Colors.fondoMoradoClaro, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    headerIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
    headerTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { fontSize: 11, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 2 },
    closeBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)', backgroundColor: Colors.blanco, justifyContent: 'center', alignItems: 'center' },
    body: { padding: 24 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 7 },
    label: { fontWeight: '700', fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: Colors.azulMarino },
    input: { backgroundColor: '#faf5ff', borderWidth: 2.5, borderColor: '#d4b8f0', borderRadius: 12, padding: 12, paddingHorizontal: 16, fontSize: 14, fontWeight: '500', color: Colors.azulMarino },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.azulMarino, borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 14, padding: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.3, shadowRadius: 0, marginTop: 4 },
    saveBtnEdit: { backgroundColor: Colors.moradoAccento },
    saveBtnText: { fontWeight: '900', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', color: Colors.amarilloAccento },
    successWrap: { padding: 48, paddingHorizontal: 24, alignItems: 'center', gap: 14 },
    successIcon: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    successTitle: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino, textAlign: 'center' },
    successSub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.5)', textAlign: 'center' },
});
