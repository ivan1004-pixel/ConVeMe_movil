import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView, FlatList,
} from 'react-native';
import { X, Save, UserCheck, MapPin, School, DollarSign, AtSign, Check, Search, Mail, Phone, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { getEstados, getMunicipiosPorEstado } from '@/services/ubicacion.service';
import { getEscuelas } from '@/services/escuela.service';
import { getUsuariosParaSelect } from '@/services/vendedor.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    vendedorAEditar?: any | null;
}

type Step = 'form' | 'success';

export default function ModalVendedor({ isOpen, onClose, onSave, vendedorAEditar }: Props) {
    const esEdicion = Boolean(vendedorAEditar);

    const [nombreCompleto, setNombreCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [instagram, setInstagram] = useState('');
    const [usuarioId, setUsuarioId] = useState<number | null>(null);
    const [estadoId, setEstadoId] = useState<number | null>(null);
    const [municipioId, setMunicipioId] = useState<number | null>(null);
    const [escuelaId, setEscuelaId] = useState<number | null>(null);
    const [comisionMenudeo, setComisionMenudeo] = useState('10');
    const [comisionMayoreo, setComisionMayoreo] = useState('5');
    const [metaVentas, setMetaVentas] = useState('0');

    const [estados, setEstados] = useState<any[]>([]);
    const [municipios, setMunicipios] = useState<any[]>([]);
    const [escuelas, setEscuelas] = useState<any[]>([]);
    const [usuariosLista, setUsuariosLista] = useState<any[]>([]);

    const [showEstadoPicker, setShowEstadoPicker] = useState(false);
    const [showMunPicker, setShowMunPicker] = useState(false);
    const [showEscuelaPicker, setShowEscuelaPicker] = useState(false);
    const [showUsuarioPicker, setShowUsuarioPicker] = useState(false);
    const [searchPicker, setSearchPicker] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState<Step>('form');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('form'); setErrors({});
            cargarCatalogosBase();
            if (vendedorAEditar) {
                setNombreCompleto(vendedorAEditar.nombre_completo || '');
                setEmail(vendedorAEditar.email || '');
                setTelefono(vendedorAEditar.telefono || '');
                setInstagram(vendedorAEditar.instagram_handle || '');
                setComisionMenudeo(String(vendedorAEditar.comision_fija_menudeo || 10));
                setComisionMayoreo(String(vendedorAEditar.comision_fija_mayoreo || 5));
                setMetaVentas(String(vendedorAEditar.meta_ventas_mensual || 0));
                setEscuelaId(vendedorAEditar.escuela?.id_escuela || null);
                const idEst = vendedorAEditar.municipio?.estado?.id_estado;
                const idMun = vendedorAEditar.municipio?.id_municipio;
                if (idEst) {
                    setEstadoId(idEst);
                    cargarMunicipios(idEst).then(() => { if (idMun) setMunicipioId(idMun); });
                }
            } else { resetForm(); }
        } else { resetForm(); }
    }, [isOpen, vendedorAEditar]);

    useEffect(() => {
        if (estadoId && (!vendedorAEditar || vendedorAEditar.municipio?.estado?.id_estado !== estadoId)) {
            cargarMunicipios(estadoId);
            setMunicipioId(null);
        }
    }, [estadoId]);

    const resetForm = () => {
        setNombreCompleto(''); setEmail(''); setTelefono(''); setInstagram('');
        setEstadoId(null); setMunicipioId(null); setEscuelaId(null); setUsuarioId(null);
        setComisionMenudeo('10'); setComisionMayoreo('5'); setMetaVentas('0');
        setMunicipios([]); setErrors({});
    };

    const cargarCatalogosBase = async () => {
        try {
            const [dataEst, dataEsc, dataUsr] = await Promise.all([getEstados(), getEscuelas(), getUsuariosParaSelect()]);
            setEstados(dataEst); setEscuelas(dataEsc); setUsuariosLista(dataUsr);
        } catch (err) { console.error(err); }
    };
    const cargarMunicipios = async (id: number) => { try { setMunicipios(await getMunicipiosPorEstado(id)); } catch (e) { console.error(e); } };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!nombreCompleto.trim()) errs.nombre = 'Requerido';
        if (!email.trim()) errs.email = 'Requerido';
        if (!municipioId) errs.municipio = 'Selecciona municipio';
        if (!escuelaId) errs.escuela = 'Selecciona escuela';
        if (!usuarioId && !esEdicion) errs.usuario = 'Enlaza un usuario';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const payload: any = {
                nombre_completo: nombreCompleto.trim(), email: email.trim(),
                telefono: telefono.trim() || undefined, instagram_handle: instagram.trim() || undefined,
                municipio_id: municipioId, escuela_id: escuelaId,
            };
            if (esEdicion) {
                payload.comision_fija_menudeo = Number(comisionMenudeo);
                payload.comision_fija_mayoreo = Number(comisionMayoreo);
                payload.meta_ventas_mensual = Number(metaVentas);
            } else { payload.usuario_id = usuarioId; }
            await onSave(payload);
            setStep('success');
            setTimeout(() => { onClose(); setStep('form'); }, 2200);
        } catch (err: any) { setErrors({ submit: err.message || 'Error' }); }
        finally { setLoading(false); }
    };

    const estadoNombre = estados.find(e => e.id_estado === estadoId)?.nombre;
    const munNombre = municipios.find(m => m.id_municipio === municipioId)?.nombre;
    const escuelaNombre = escuelas.find(e => e.id_escuela === escuelaId)?.nombre;
    const usuarioNombre = usuariosLista.find(u => u.id_usuario === usuarioId);

    const renderPickerModal = (visible: boolean, onCloseP: () => void, data: any[], keyField: string, labelFn: (item: any) => string, selectedId: any, onSelect: (id: any) => void, title: string, withSearch?: boolean) => (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onCloseP}>
            <View style={s.pickerOverlay}>
                <View style={s.pickerModal}>
                    <View style={s.pickerHeader}>
                        <Text style={s.pickerTitle}>{title}</Text>
                        <TouchableOpacity onPress={onCloseP}><X size={20} color={Colors.azulMarino} /></TouchableOpacity>
                    </View>
                    {withSearch && (
                        <View style={s.pickerSearch}>
                            <Search size={14} color="rgba(26,0,96,0.35)" />
                            <TextInput style={s.pickerSearchInput} placeholder="Buscar..." placeholderTextColor="rgba(26,0,96,0.35)" value={searchPicker} onChangeText={setSearchPicker} autoFocus />
                        </View>
                    )}
                    <FlatList
                        data={withSearch ? data.filter(d => labelFn(d).toLowerCase().includes(searchPicker.toLowerCase())) : data}
                        keyExtractor={item => String(item[keyField])}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[s.pickerItem, item[keyField] === selectedId && s.pickerItemActive]}
                                onPress={() => { onSelect(item[keyField]); onCloseP(); setSearchPicker(''); }}
                            >
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
                    <View style={s.header}>
                        <View style={s.headerLeft}>
                            <View style={[s.headerIcon, { backgroundColor: esEdicion ? 'rgba(204,85,255,0.12)' : Colors.verdeFondo, borderColor: esEdicion ? 'rgba(204,85,255,0.2)' : 'rgba(6,214,160,0.2)' }]}>
                                <UserCheck size={20} color={esEdicion ? Colors.moradoAccento : Colors.verdeExito} />
                            </View>
                            <View>
                                <Text style={s.headerTitle}>{esEdicion ? 'Editar vendedor' : 'Nuevo vendedor'}</Text>
                                <Text style={s.headerSub}>{esEdicion ? 'Modifica los datos' : 'Registra un nuevo vendedor'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}><X size={16} color={Colors.gris400} /></TouchableOpacity>
                    </View>

                    {step === 'form' ? (
                        <>
                            <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }}>
                                {/* Seccion: Datos personales */}
                                <View style={s.section}>
                                    <View style={s.sectionHeader}><AtSign size={13} color={Colors.moradoAccento} /><Text style={[s.sectionTitle, { color: Colors.moradoAccento }]}>Datos personales</Text></View>
                                    <View style={s.fieldWrap}>
                                        <View style={s.labelRow}><User size={11} color={Colors.moradoAccento} /><Text style={s.label}>Nombre completo</Text></View>
                                        <TextInput style={s.input} placeholder="Ej. Maria Garcia" placeholderTextColor="#b9a0d4" value={nombreCompleto} onChangeText={setNombreCompleto} editable={!loading} />
                                        {errors.nombre && <Text style={s.errorText}>{errors.nombre}</Text>}
                                    </View>
                                    <View style={s.grid}>
                                        <View style={s.gridItem}>
                                            <View style={s.labelRow}><Mail size={11} color={Colors.moradoAccento} /><Text style={s.label}>Email</Text></View>
                                            <TextInput style={s.input} placeholder="email@gmail.com" placeholderTextColor="#b9a0d4" value={email} onChangeText={setEmail} editable={!loading} keyboardType="email-address" autoCapitalize="none" />
                                            {errors.email && <Text style={s.errorText}>{errors.email}</Text>}
                                        </View>
                                        <View style={s.gridItem}>
                                            <View style={s.labelRow}><Phone size={11} color={Colors.moradoAccento} /><Text style={s.label}>Telefono</Text></View>
                                            <TextInput style={s.input} placeholder="10 digitos" placeholderTextColor="#b9a0d4" value={telefono} onChangeText={setTelefono} editable={!loading} keyboardType="phone-pad" maxLength={10} />
                                        </View>
                                    </View>
                                    <View style={s.fieldWrap}>
                                        <View style={s.labelRow}><AtSign size={11} color={Colors.moradoAccento} /><Text style={s.label}>Instagram (@)</Text></View>
                                        <TextInput style={s.input} placeholder="usuario_ig" placeholderTextColor="#b9a0d4" value={instagram} onChangeText={setInstagram} editable={!loading} autoCapitalize="none" />
                                    </View>
                                    {!esEdicion && (
                                        <View style={s.fieldWrap}>
                                            <View style={s.labelRow}><User size={11} color={Colors.moradoAccento} /><Text style={s.label}>Usuario del sistema</Text></View>
                                            <TouchableOpacity style={s.selectBtn} onPress={() => { setShowUsuarioPicker(true); setSearchPicker(''); }}>
                                                <Text style={usuarioNombre ? s.selectText : s.selectPlaceholder}>{usuarioNombre ? `ID:${usuarioNombre.id_usuario} - ${usuarioNombre.username}` : 'Selecciona...'}</Text>
                                            </TouchableOpacity>
                                            {errors.usuario && <Text style={s.errorText}>{errors.usuario}</Text>}
                                        </View>
                                    )}
                                    <View style={s.grid}>
                                        <View style={s.gridItem}>
                                            <View style={s.labelRow}><MapPin size={11} color={Colors.moradoAccento} /><Text style={s.label}>Estado</Text></View>
                                            <TouchableOpacity style={s.selectBtn} onPress={() => setShowEstadoPicker(true)} disabled={loading}>
                                                <Text style={estadoNombre ? s.selectText : s.selectPlaceholder}>{estadoNombre || 'Selecciona...'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={s.gridItem}>
                                            <View style={s.labelRow}><MapPin size={11} color={Colors.moradoAccento} /><Text style={s.label}>Municipio</Text></View>
                                            <TouchableOpacity style={s.selectBtn} onPress={() => { setShowMunPicker(true); setSearchPicker(''); }} disabled={!estadoId}>
                                                <Text style={munNombre ? s.selectText : s.selectPlaceholder}>{munNombre || 'Selecciona...'}</Text>
                                            </TouchableOpacity>
                                            {errors.municipio && <Text style={s.errorText}>{errors.municipio}</Text>}
                                        </View>
                                    </View>
                                </View>

                                {/* Seccion: Escuela */}
                                <View style={s.section}>
                                    <View style={s.sectionHeader}><School size={13} color={Colors.verdeExito} /><Text style={[s.sectionTitle, { color: Colors.verdeExito }]}>Escuela asignada</Text></View>
                                    <TouchableOpacity style={s.selectBtn} onPress={() => { setShowEscuelaPicker(true); setSearchPicker(''); }}>
                                        <Text style={escuelaNombre ? s.selectText : s.selectPlaceholder}>{escuelaNombre || 'Selecciona escuela...'}</Text>
                                    </TouchableOpacity>
                                    {errors.escuela && <Text style={s.errorText}>{errors.escuela}</Text>}
                                </View>

                                {/* Seccion: Comisiones */}
                                <View style={s.section}>
                                    <View style={s.sectionHeader}><DollarSign size={13} color={Colors.azulMarino} /><Text style={[s.sectionTitle, { color: Colors.azulMarino }]}>Comisiones y metas</Text></View>
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.label}>% Menudeo</Text>
                                            <TextInput style={[s.input, { textAlign: 'center' }]} keyboardType="decimal-pad" value={comisionMenudeo} onChangeText={setComisionMenudeo} editable={!loading} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.label}>% Mayoreo</Text>
                                            <TextInput style={[s.input, { textAlign: 'center' }]} keyboardType="decimal-pad" value={comisionMayoreo} onChangeText={setComisionMayoreo} editable={!loading} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.label}>Meta ($)</Text>
                                            <TextInput style={[s.input, { textAlign: 'center' }]} keyboardType="decimal-pad" value={metaVentas} onChangeText={setMetaVentas} editable={!loading} />
                                        </View>
                                    </View>
                                </View>
                                {errors.submit && <View style={s.submitError}><Text style={s.submitErrorText}>{errors.submit}</Text></View>}
                            </ScrollView>
                            <View style={s.footer}>
                                <TouchableOpacity style={[s.saveBtn, esEdicion && s.saveBtnEdit]} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
                                    {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : (
                                        <><Save size={16} color={esEdicion ? Colors.blanco : Colors.amarilloAccento} /><Text style={[s.saveBtnText, esEdicion && { color: Colors.blanco }]}>{esEdicion ? 'Actualizar' : 'Guardar'} vendedor</Text></>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={s.successWrap}>
                            <View style={[s.successIcon, { backgroundColor: Colors.verdeFondo, borderColor: 'rgba(6,214,160,0.25)' }]}><Check size={36} color={Colors.verdeExito} /></View>
                            <Text style={s.successTitle}>{esEdicion ? 'Vendedor actualizado!' : 'Vendedor registrado!'}</Text>
                            <Text style={s.successSub}>{nombreCompleto} se guardo correctamente.</Text>
                        </View>
                    )}
                </View>
            </View>

            {renderPickerModal(showEstadoPicker, () => setShowEstadoPicker(false), estados, 'id_estado', i => i.nombre, estadoId, setEstadoId, 'Estado', true)}
            {renderPickerModal(showMunPicker, () => setShowMunPicker(false), municipios, 'id_municipio', i => i.nombre, municipioId, setMunicipioId, 'Municipio', true)}
            {renderPickerModal(showEscuelaPicker, () => setShowEscuelaPicker(false), escuelas, 'id_escuela', i => i.nombre, escuelaId, setEscuelaId, 'Escuela', true)}
            {renderPickerModal(showUsuarioPicker, () => setShowUsuarioPicker(false), usuariosLista, 'id_usuario', i => `ID:${i.id_usuario} - ${i.username}`, usuarioId, setUsuarioId, 'Usuario', true)}
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.30)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 22, width: '100%', maxWidth: 600, maxHeight: '92%', elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.3, shadowRadius: 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.10)', backgroundColor: Colors.fondoMoradoClaro, borderTopLeftRadius: 19, borderTopRightRadius: 19 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    headerIcon: { width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
    headerTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { fontSize: 10, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 1 },
    closeBtn: { width: 32, height: 32, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)', backgroundColor: Colors.blanco, justifyContent: 'center', alignItems: 'center' },
    body: { padding: 14, flex: 1 },
    section: { backgroundColor: 'rgba(237,233,254,0.3)', borderWidth: 1.5, borderColor: 'rgba(26,0,96,0.08)', borderRadius: 14, padding: 14, gap: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
    sectionTitle: { fontWeight: '800', fontSize: 9.5, letterSpacing: 1.4, textTransform: 'uppercase' },
    fieldWrap: { gap: 2 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
    label: { fontWeight: '700', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: Colors.azulMarino },
    input: { backgroundColor: '#faf5ff', borderWidth: 2, borderColor: '#d4b8f0', borderRadius: 10, padding: 8, paddingHorizontal: 12, fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
    grid: { flexDirection: 'row', gap: 10 },
    gridItem: { flex: 1 },
    selectBtn: { backgroundColor: '#faf5ff', borderWidth: 2, borderColor: '#d4b8f0', borderRadius: 10, padding: 10, paddingHorizontal: 12 },
    selectText: { fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
    selectPlaceholder: { fontSize: 13, fontWeight: '400', color: '#b9a0d4' },
    errorText: { fontSize: 10, fontWeight: '600', color: '#ff4d6d', marginTop: 3 },
    submitError: { backgroundColor: '#ffe5e8', borderWidth: 2, borderColor: '#ff4d6d', borderRadius: 12, padding: 10 },
    submitErrorText: { fontSize: 12, fontWeight: '600', color: '#c1002b' },
    footer: { padding: 12, borderTopWidth: 2, borderTopColor: 'rgba(26,0,96,0.08)', backgroundColor: Colors.fondoMoradoClaro, borderBottomLeftRadius: 19, borderBottomRightRadius: 19 },
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
