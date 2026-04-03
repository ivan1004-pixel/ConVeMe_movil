import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView, FlatList, Alert,
} from 'react-native';
import { X, Save, Calendar, MapPin, School, DollarSign, AlignLeft, Check, Search } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { getEstados, getMunicipiosPorEstado } from '@/services/ubicacion.service';
import { getEscuelas } from '@/services/escuela.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    eventoAEditar?: any | null;
}

type Step = 'form' | 'success';

export default function ModalEvento({ isOpen, onClose, onSave, eventoAEditar }: Props) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [escuelaId, setEscuelaId] = useState<number | null>(null);
    const [estadoId, setEstadoId] = useState<number | null>(null);
    const [municipioId, setMunicipioId] = useState<number | null>(null);
    const [costoStand, setCostoStand] = useState('');

    const [estados, setEstados] = useState<any[]>([]);
    const [municipios, setMunicipios] = useState<any[]>([]);
    const [escuelas, setEscuelas] = useState<any[]>([]);

    const [showEstadoPicker, setShowEstadoPicker] = useState(false);
    const [showMunPicker, setShowMunPicker] = useState(false);
    const [showEscuelaPicker, setShowEscuelaPicker] = useState(false);
    const [searchPicker, setSearchPicker] = useState('');

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('form');
    const esEdicion = Boolean(eventoAEditar);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            cargarCatalogos();
            if (eventoAEditar) {
                setNombre(String(eventoAEditar.nombre || ''));
                setDescripcion(String(eventoAEditar.descripcion || ''));
                setFechaInicio(eventoAEditar.fecha_inicio ? eventoAEditar.fecha_inicio.slice(0, 16) : '');
                setFechaFin(eventoAEditar.fecha_fin ? eventoAEditar.fecha_fin.slice(0, 16) : '');
                setCostoStand(eventoAEditar.costo_stand ? String(eventoAEditar.costo_stand) : '');
                setEscuelaId(eventoAEditar.escuela?.id_escuela || null);
                const idEst = eventoAEditar.municipio?.estado?.id_estado;
                const idMun = eventoAEditar.municipio?.id_municipio;
                if (idEst) {
                    setEstadoId(idEst);
                    cargarMunicipios(idEst).then(() => { if (idMun) setMunicipioId(idMun); });
                }
            } else { limpiar(); }
        } else { limpiar(); }
    }, [isOpen, eventoAEditar]);

    useEffect(() => {
        if (estadoId && (!eventoAEditar || eventoAEditar.municipio?.estado?.id_estado !== estadoId)) {
            cargarMunicipios(estadoId);
            setMunicipioId(null);
        }
    }, [estadoId]);

    const limpiar = () => {
        setNombre(''); setDescripcion(''); setFechaInicio(''); setFechaFin('');
        setEstadoId(null); setMunicipioId(null); setEscuelaId(null); setCostoStand('');
        setMunicipios([]);
    };

    const cargarCatalogos = async () => {
        try {
            const [dataEst, dataEsc] = await Promise.all([getEstados(), getEscuelas()]);
            setEstados(dataEst); setEscuelas(dataEsc);
        } catch (e) { console.error(e); }
    };
    const cargarMunicipios = async (id: number) => { try { setMunicipios(await getMunicipiosPorEstado(id)); } catch (e) { console.error(e); } };

    const handleSubmit = async () => {
        if (!nombre.trim() || !fechaInicio || !fechaFin) return Alert.alert('Error', 'Completa nombre y fechas.');
        if (new Date(fechaInicio) >= new Date(fechaFin)) return Alert.alert('Error', 'La fecha de termino debe ser posterior.');
        if (!escuelaId) return Alert.alert('Error', 'Asigna una escuela.');
        if (!municipioId) return Alert.alert('Error', 'Selecciona un municipio.');
        setLoading(true);
        try {
            await onSave({
                nombre: nombre.trim(), descripcion: descripcion.trim() || undefined,
                fecha_inicio: new Date(fechaInicio).toISOString(), fecha_fin: new Date(fechaFin).toISOString(),
                escuela_id: escuelaId, municipio_id: municipioId,
                costo_stand: costoStand ? Number(costoStand) : undefined,
            });
            setStep('success');
            setTimeout(() => { onClose(); }, 1500);
        } catch (err: any) { Alert.alert('Error', err.message || 'Error al procesar.'); }
        finally { setLoading(false); }
    };

    const estadoNombre = estados.find(e => e.id_estado === estadoId)?.nombre;
    const munNombre = municipios.find(m => m.id_municipio === municipioId)?.nombre;
    const escuelaNombre = escuelas.find(e => e.id_escuela === escuelaId)?.nombre;

    const renderPickerModal = (visible: boolean, onCloseP: () => void, data: any[], keyField: string, labelFn: (item: any) => string, selectedId: any, onSelect: (id: any) => void, title: string) => (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onCloseP}>
            <View style={s.pickerOverlay}>
                <View style={s.pickerModal}>
                    <View style={s.pickerHeader}>
                        <Text style={s.pickerTitle}>{title}</Text>
                        <TouchableOpacity onPress={onCloseP}><X size={20} color={Colors.azulMarino} /></TouchableOpacity>
                    </View>
                    <View style={s.pickerSearch}>
                        <Search size={14} color="rgba(26,0,96,0.35)" />
                        <TextInput style={s.pickerSearchInput} placeholder="Buscar..." placeholderTextColor="rgba(26,0,96,0.35)" value={searchPicker} onChangeText={setSearchPicker} autoFocus />
                    </View>
                    <FlatList
                        data={data.filter(d => labelFn(d).toLowerCase().includes(searchPicker.toLowerCase()))}
                        keyExtractor={item => String(item[keyField])}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={[s.pickerItem, item[keyField] === selectedId && s.pickerItemActive]} onPress={() => { onSelect(item[keyField]); onCloseP(); setSearchPicker(''); }}>
                                <Text style={[s.pickerItemText, item[keyField] === selectedId && s.pickerItemTextActive]}>{labelFn(item)}</Text>
                                {item[keyField] === selectedId && <Check size={14} color={Colors.azulMarino} />}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={s.pickerEmpty}>Sin resultados</Text>}
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
                    <View style={[s.header, { backgroundColor: Colors.amarilloAccento }]}>
                        <View style={s.headerLeft}>
                            <View style={s.headerIconBox}><Calendar size={18} color={Colors.azulMarino} /></View>
                            <View>
                                <Text style={s.headerTitle}>{esEdicion ? 'Editar Evento' : 'Nuevo Evento'}</Text>
                                <Text style={s.headerSub}>{esEdicion ? 'Modifica el evento' : 'Registra un evento'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}><X size={16} color={Colors.azulMarino} /></TouchableOpacity>
                    </View>

                    {step === 'form' ? (
                        <>
                            <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }}>
                                {/* Detalles */}
                                <View style={s.section}>
                                    <View style={s.sectionHead}><AlignLeft size={11} color={Colors.moradoAccento} /><Text style={[s.sectionLabel, { color: Colors.moradoAccento }]}>Detalles del Evento</Text></View>
                                    <View><Text style={s.label}>Nombre</Text><TextInput style={s.input} placeholder="Ej. Fotos Grad. 2026" placeholderTextColor="#b9a0d4" value={nombre} onChangeText={setNombre} editable={!loading} /></View>
                                    <View><Text style={s.label}>Descripcion (Opcional)</Text><TextInput style={[s.input, { minHeight: 60, textAlignVertical: 'top' }]} placeholder="Detalles adicionales..." placeholderTextColor="#b9a0d4" value={descripcion} onChangeText={setDescripcion} editable={!loading} multiline /></View>
                                    <View style={s.grid}>
                                        <View style={s.gridItem}><Text style={s.label}>Fecha Inicio</Text><TextInput style={s.input} placeholder="2026-03-01T10:00" placeholderTextColor="#b9a0d4" value={fechaInicio} onChangeText={setFechaInicio} editable={!loading} /></View>
                                        <View style={s.gridItem}><Text style={s.label}>Fecha Fin</Text><TextInput style={s.input} placeholder="2026-03-05T18:00" placeholderTextColor="#b9a0d4" value={fechaFin} onChangeText={setFechaFin} editable={!loading} /></View>
                                    </View>
                                </View>

                                {/* Sede */}
                                <View style={s.section}>
                                    <View style={s.sectionHead}><School size={11} color={Colors.verdeExito} /><Text style={[s.sectionLabel, { color: Colors.verdeExito }]}>Sede</Text></View>
                                    <View><Text style={s.label}>Escuela Anfitriona</Text>
                                        <TouchableOpacity style={s.selectBtn} onPress={() => { setShowEscuelaPicker(true); setSearchPicker(''); }}>
                                            <Text style={escuelaNombre ? s.selectText : s.selectPlaceholder}>{escuelaNombre || 'Seleccione...'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={s.grid}>
                                        <View style={s.gridItem}><Text style={s.label}>Estado</Text>
                                            <TouchableOpacity style={s.selectBtn} onPress={() => { setShowEstadoPicker(true); setSearchPicker(''); }}>
                                                <Text style={estadoNombre ? s.selectText : s.selectPlaceholder}>{estadoNombre || 'Seleccione...'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={s.gridItem}><Text style={s.label}>Municipio</Text>
                                            <TouchableOpacity style={s.selectBtn} onPress={() => { setShowMunPicker(true); setSearchPicker(''); }} disabled={!estadoId}>
                                                <Text style={munNombre ? s.selectText : s.selectPlaceholder}>{munNombre || 'Seleccione...'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Finanzas */}
                                <View style={s.section}>
                                    <View style={s.sectionHead}><DollarSign size={11} color="#f59e0b" /><Text style={[s.sectionLabel, { color: '#b45309' }]}>Finanzas (Opcional)</Text></View>
                                    <View style={{ width: '50%' }}><Text style={s.label}>Costo del Stand ($)</Text><TextInput style={s.input} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#b9a0d4" value={costoStand} onChangeText={setCostoStand} editable={!loading} /></View>
                                </View>
                            </ScrollView>
                            <View style={s.footer}>
                                <TouchableOpacity style={s.saveBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
                                    {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : (
                                        <><Save size={16} color={Colors.amarilloAccento} /><Text style={s.saveBtnText}>{esEdicion ? 'Actualizar' : 'Guardar'} evento</Text></>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={s.successWrap}>
                            <View style={[s.successIcon, { backgroundColor: Colors.verdeFondo, borderColor: 'rgba(6,214,160,0.25)' }]}><Check size={36} color={Colors.verdeExito} /></View>
                            <Text style={s.successTitle}>Evento {esEdicion ? 'Actualizado' : 'Guardado'}!</Text>
                        </View>
                    )}
                </View>
            </View>

            {renderPickerModal(showEstadoPicker, () => setShowEstadoPicker(false), estados, 'id_estado', i => i.nombre, estadoId, setEstadoId, 'Estado')}
            {renderPickerModal(showMunPicker, () => setShowMunPicker(false), municipios, 'id_municipio', i => i.nombre, municipioId, setMunicipioId, 'Municipio')}
            {renderPickerModal(showEscuelaPicker, () => setShowEscuelaPicker(false), escuelas, 'id_escuela', i => i.nombre, escuelaId, setEscuelaId, 'Escuela')}
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.30)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modal: { backgroundColor: Colors.blanco, borderWidth: 3.5, borderColor: Colors.azulMarino, borderRadius: 24, width: '100%', maxWidth: 640, maxHeight: '92%', elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 7, height: 7 }, shadowOpacity: 0.3, shadowRadius: 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 3.5, borderBottomColor: Colors.azulMarino, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    headerIconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.blanco, borderWidth: 2, borderColor: Colors.azulMarino, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontWeight: '900', fontSize: 15, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.8 },
    headerSub: { fontSize: 10, fontWeight: '500', color: 'rgba(26,0,96,0.55)', marginTop: 1 },
    closeBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    body: { padding: 16, flex: 1 },
    section: { backgroundColor: '#f8f9fa', borderWidth: 2, borderColor: 'rgba(26,0,96,0.08)', borderRadius: 16, padding: 14, gap: 10 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    sectionLabel: { fontWeight: '900', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
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
    pickerSearch: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1.5, borderBottomColor: 'rgba(26,0,96,0.08)', backgroundColor: Colors.fondoMoradoClaro },
    pickerSearchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.05)' },
    pickerItemActive: { backgroundColor: Colors.amarilloAccento },
    pickerItemText: { fontSize: 14, fontWeight: '500', color: Colors.azulMarino },
    pickerItemTextActive: { fontWeight: '800' },
    pickerEmpty: { padding: 24, textAlign: 'center', color: Colors.gris400, fontWeight: '600' },
});
