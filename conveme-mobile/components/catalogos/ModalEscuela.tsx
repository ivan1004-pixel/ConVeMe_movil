import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView, FlatList,
} from 'react-native';
import { X, Save, Building2, MapPin, Check, Search } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { getEstados, getMunicipiosPorEstado } from '@/services/ubicacion.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { nombre: string; siglas: string; municipio_id: number }) => Promise<void>;
    escuelaAEditar?: any | null;
}

type Step = 'form' | 'success';

export default function ModalEscuela({ isOpen, onClose, onSave, escuelaAEditar }: Props) {
    const [nombre, setNombre] = useState('');
    const [siglas, setSiglas] = useState('');
    const [estadoId, setEstadoId] = useState<number | null>(null);
    const [municipioId, setMunicipioId] = useState<number | null>(null);

    const [estados, setEstados] = useState<any[]>([]);
    const [municipios, setMunicipios] = useState<any[]>([]);

    const [showEstadoPicker, setShowEstadoPicker] = useState(false);
    const [showMunPicker, setShowMunPicker] = useState(false);
    const [searchMun, setSearchMun] = useState('');

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('form');
    const esEdicion = Boolean(escuelaAEditar);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            cargarEstados();
            if (escuelaAEditar) {
                setNombre(escuelaAEditar.nombre || '');
                setSiglas(escuelaAEditar.siglas || '');
                const idEst = escuelaAEditar.municipio?.estado?.id_estado;
                const idMun = escuelaAEditar.municipio?.id_municipio;
                if (idEst) {
                    setEstadoId(idEst);
                    cargarMunicipios(idEst).then(() => { if (idMun) setMunicipioId(idMun); });
                }
            } else {
                resetForm();
            }
        } else {
            resetForm();
        }
    }, [isOpen, escuelaAEditar]);

    useEffect(() => {
        if (estadoId && (!escuelaAEditar || escuelaAEditar.municipio?.estado?.id_estado !== estadoId)) {
            cargarMunicipios(estadoId);
            setMunicipioId(null);
            setSearchMun('');
        }
    }, [estadoId]);

    const resetForm = () => {
        setNombre(''); setSiglas(''); setEstadoId(null); setMunicipioId(null);
        setSearchMun(''); setMunicipios([]);
    };

    const cargarEstados = async () => { try { setEstados(await getEstados()); } catch (e) { console.error(e); } };
    const cargarMunicipios = async (id: number) => { try { setMunicipios(await getMunicipiosPorEstado(id)); } catch (e) { console.error(e); } };

    const handleSubmit = async () => {
        if (!nombre.trim() || !siglas.trim() || !municipioId) return;
        setLoading(true);
        try {
            await onSave({ nombre: nombre.trim(), siglas: siglas.trim(), municipio_id: municipioId });
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const estadoNombre = estados.find(e => e.id_estado === estadoId)?.nombre;
    const municipioNombre = municipios.find(m => m.id_municipio === municipioId)?.nombre;
    const munFiltrados = municipios.filter(m => m.nombre.toLowerCase().includes(searchMun.toLowerCase()));

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={step === 'form' ? onClose : undefined} />
                <View style={s.modal}>
                    <View style={s.header}>
                        <View style={s.headerLeft}>
                            <View style={[s.headerIcon, { backgroundColor: esEdicion ? 'rgba(204,85,255,0.12)' : Colors.verdeFondo, borderColor: esEdicion ? 'rgba(204,85,255,0.2)' : 'rgba(6,214,160,0.2)' }]}>
                                <Building2 size={20} color={esEdicion ? Colors.moradoAccento : Colors.verdeExito} />
                            </View>
                            <View>
                                <Text style={s.headerTitle}>{esEdicion ? 'Editar escuela' : 'Nueva escuela'}</Text>
                                <Text style={s.headerSub}>{esEdicion ? 'Modifica los datos' : 'Registra una institucion'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}><X size={16} color={Colors.gris400} /></TouchableOpacity>
                    </View>

                    {step === 'form' ? (
                        <>
                            <ScrollView style={s.body} contentContainerStyle={{ gap: 16 }}>
                                <View>
                                    <View style={s.labelRow}><Building2 size={13} color={Colors.moradoAccento} /><Text style={s.label}>Nombre de la institucion</Text></View>
                                    <TextInput style={s.input} placeholder="Ej. Facultad de Arquitectura" placeholderTextColor="#b9a0d4" value={nombre} onChangeText={setNombre} editable={!loading} />
                                </View>
                                <View>
                                    <View style={s.labelRow}><Building2 size={13} color={Colors.moradoAccento} /><Text style={s.label}>Siglas</Text></View>
                                    <TextInput style={s.input} placeholder="Ej. FARQ" placeholderTextColor="#b9a0d4" value={siglas} onChangeText={t => setSiglas(t.toUpperCase())} editable={!loading} maxLength={10} autoCapitalize="characters" />
                                </View>
                                <View style={s.divider} />
                                <View style={s.grid}>
                                    <View style={s.gridItem}>
                                        <View style={s.labelRow}><MapPin size={13} color={Colors.moradoAccento} /><Text style={s.label}>Estado</Text></View>
                                        <TouchableOpacity style={s.selectBtn} onPress={() => setShowEstadoPicker(true)} disabled={loading || estados.length === 0}>
                                            <Text style={estadoNombre ? s.selectText : s.selectPlaceholder}>{estadoNombre || 'Selecciona...'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={s.gridItem}>
                                        <View style={s.labelRow}><MapPin size={13} color={Colors.moradoAccento} /><Text style={s.label}>Municipio</Text></View>
                                        <TouchableOpacity style={s.selectBtn} onPress={() => { setShowMunPicker(true); setSearchMun(''); }} disabled={loading || !estadoId || municipios.length === 0}>
                                            <Text style={municipioNombre ? s.selectText : s.selectPlaceholder}>{municipioNombre || 'Selecciona...'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                            <View style={s.footer}>
                                <TouchableOpacity
                                    style={[s.saveBtn, esEdicion && s.saveBtnEdit]}
                                    onPress={handleSubmit} disabled={loading || !nombre.trim() || !municipioId}
                                    activeOpacity={0.8}
                                >
                                    {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : (
                                        <><Save size={16} color={esEdicion ? Colors.blanco : Colors.amarilloAccento} /><Text style={[s.saveBtnText, esEdicion && { color: Colors.blanco }]}>{esEdicion ? 'Actualizar' : 'Guardar'} escuela</Text></>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={s.successWrap}>
                            <View style={[s.successIcon, { backgroundColor: Colors.verdeFondo, borderColor: 'rgba(6,214,160,0.25)' }]}>
                                <Check size={36} color={Colors.verdeExito} />
                            </View>
                            <Text style={s.successTitle}>{esEdicion ? 'Escuela actualizada!' : 'Escuela registrada!'}</Text>
                            <Text style={s.successSub}>{nombre} se guardo correctamente.</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Estado Picker */}
            <Modal transparent visible={showEstadoPicker} animationType="slide" onRequestClose={() => setShowEstadoPicker(false)}>
                <View style={s.pickerOverlay}>
                    <View style={s.pickerModal}>
                        <View style={s.pickerHeader}>
                            <Text style={s.pickerTitle}>Seleccionar Estado</Text>
                            <TouchableOpacity onPress={() => setShowEstadoPicker(false)}><X size={20} color={Colors.azulMarino} /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={estados}
                            keyExtractor={item => String(item.id_estado)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[s.pickerItem, item.id_estado === estadoId && s.pickerItemActive]}
                                    onPress={() => { setEstadoId(item.id_estado); setShowEstadoPicker(false); }}
                                >
                                    <Text style={[s.pickerItemText, item.id_estado === estadoId && s.pickerItemTextActive]}>{item.nombre}</Text>
                                    {item.id_estado === estadoId && <Check size={14} color={Colors.azulMarino} />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Municipio Picker con busqueda */}
            <Modal transparent visible={showMunPicker} animationType="slide" onRequestClose={() => setShowMunPicker(false)}>
                <View style={s.pickerOverlay}>
                    <View style={s.pickerModal}>
                        <View style={s.pickerHeader}>
                            <Text style={s.pickerTitle}>Seleccionar Municipio</Text>
                            <TouchableOpacity onPress={() => setShowMunPicker(false)}><X size={20} color={Colors.azulMarino} /></TouchableOpacity>
                        </View>
                        <View style={s.pickerSearch}>
                            <Search size={14} color="rgba(26,0,96,0.35)" />
                            <TextInput
                                style={s.pickerSearchInput} placeholder="Buscar municipio..."
                                placeholderTextColor="rgba(26,0,96,0.35)"
                                value={searchMun} onChangeText={setSearchMun} autoFocus
                            />
                        </View>
                        <FlatList
                            data={munFiltrados}
                            keyExtractor={item => String(item.id_municipio)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[s.pickerItem, item.id_municipio === municipioId && s.pickerItemActive]}
                                    onPress={() => { setMunicipioId(item.id_municipio); setShowMunPicker(false); setSearchMun(''); }}
                                >
                                    <Text style={[s.pickerItemText, item.id_municipio === municipioId && s.pickerItemTextActive]}>{item.nombre}</Text>
                                    {item.id_municipio === municipioId && <Check size={14} color={Colors.azulMarino} />}
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
    modal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 28, width: '100%', maxWidth: 480, maxHeight: '90%', elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.3, shadowRadius: 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 2.5, borderBottomColor: 'rgba(26,0,96,0.10)', backgroundColor: Colors.fondoMoradoClaro, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    headerIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
    headerTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { fontSize: 11, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 2 },
    closeBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)', backgroundColor: Colors.blanco, justifyContent: 'center', alignItems: 'center' },
    body: { padding: 24, flex: 1 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 7 },
    label: { fontWeight: '700', fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: Colors.azulMarino },
    input: { backgroundColor: '#faf5ff', borderWidth: 2.5, borderColor: '#d4b8f0', borderRadius: 12, padding: 12, paddingHorizontal: 16, fontSize: 14, fontWeight: '500', color: Colors.azulMarino },
    divider: { height: 1.5, backgroundColor: 'rgba(26,0,96,0.07)', borderRadius: 2 },
    grid: { flexDirection: 'row', gap: 12 },
    gridItem: { flex: 1 },
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
    pickerModal: { backgroundColor: Colors.blanco, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '55%', borderWidth: 3, borderColor: Colors.azulMarino },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.1)' },
    pickerTitle: { fontWeight: '900', fontSize: 16, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 1 },
    pickerSearch: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1.5, borderBottomColor: 'rgba(26,0,96,0.08)', backgroundColor: Colors.fondoMoradoClaro },
    pickerSearchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.05)' },
    pickerItemActive: { backgroundColor: Colors.amarilloAccento },
    pickerItemText: { fontSize: 14, fontWeight: '500', color: Colors.azulMarino },
    pickerItemTextActive: { fontWeight: '800' },
    pickerEmpty: { padding: 24, textAlign: 'center', color: Colors.gris400, fontWeight: '600' },
});
