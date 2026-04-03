import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, ScrollView, Modal,
} from 'react-native';
import {
    User, Lock, Shield, Eye, EyeOff, Pencil, Crown, Tag, Box,
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import { useUser } from '@/hooks/useUser';
import { getEmpleados, updateEmpleado } from '@/services/empleado.service';
import { getVendedores, updateVendedor } from '@/services/vendedor.service';
import ModalEmpleado from '@/components/catalogos/ModalEmpleado';
import ModalVendedor from '@/components/catalogos/ModalVendedor';
import ActionModal from '@/components/ui/ActionModal';
import type { ActionType } from '@/components/ui/ActionModal';

const TABS = [
    { id: 'crear', label: 'Acceso' },
    { id: 'empleados', label: 'Empleados' },
    { id: 'vendedores', label: 'Vendedores' },
];

const ROLES = [
    { id: 1, label: 'Administrador', Icon: Crown },
    { id: 2, label: 'Vendedor', Icon: Tag },
    { id: 3, label: 'Logistica / Inventario', Icon: Box },
];

export default function CrearUsuario() {
    const [activeTab, setActiveTab] = useState('crear');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rolId, setRolId] = useState(1);
    const [showPass, setShowPass] = useState(false);
    const [showRolPicker, setShowRolPicker] = useState(false);

    const [empleados, setEmpleados] = useState<any[]>([]);
    const [vendedores, setVendedores] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    const [modalEmpOpen, setModalEmpOpen] = useState(false);
    const [empAEditar, setEmpAEditar] = useState<any>(null);
    const [modalVendOpen, setModalVendOpen] = useState(false);
    const [vendAEditar, setVendAEditar] = useState<any>(null);

    const { loading, error, exito, crearUsuario, setExito } = useUser();

    const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: ActionType; title: string; subtitle: string }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        if (activeTab === 'empleados') cargarEmpleados();
        if (activeTab === 'vendedores') cargarVendedores();
    }, [activeTab]);

    const cargarEmpleados = async () => { setLoadingData(true); try { setEmpleados(await getEmpleados()); } catch (e) { console.error(e); } setLoadingData(false); };
    const cargarVendedores = async () => { setLoadingData(true); try { setVendedores(await getVendedores()); } catch (e) { console.error(e); } setLoadingData(false); };

    const handleSubmit = async () => {
        if (!username.trim() || !password.trim()) return;
        const ok = await crearUsuario(username, password, rolId);
        if (ok) {
            setActionModal({ isOpen: true, type: 'success', title: 'Usuario Creado!', subtitle: `${username} ya puede acceder al ERP.` });
            setTimeout(() => { setUsername(''); setPassword(''); setRolId(1); setExito(false); setActionModal(prev => ({ ...prev, isOpen: false })); }, 3000);
        }
    };

    const rolActual = ROLES.find(r => r.id === rolId)!;

    const renderEmpleadoItem = useCallback(({ item }: { item: any }) => (
        <View style={s.listItem} data-testid={`cu-emp-${item.id_empleado}`}>
            <View style={{ flex: 1 }}>
                <Text style={s.listItemName}>{item.nombre_completo}</Text>
                <Text style={s.listItemSub}>{item.puesto} - {item.telefono || 'Sin tel.'}</Text>
            </View>
            <TouchableOpacity style={s.editBtn} onPress={() => { setEmpAEditar(item); setModalEmpOpen(true); }} data-testid={`cu-edit-emp-${item.id_empleado}`}>
                <Pencil size={14} color={Colors.moradoAccento} />
            </TouchableOpacity>
        </View>
    ), []);

    const renderVendedorItem = useCallback(({ item }: { item: any }) => (
        <View style={s.listItem} data-testid={`cu-vend-${item.id_vendedor}`}>
            <View style={{ flex: 1 }}>
                <Text style={s.listItemName}>{item.nombre_completo}</Text>
                <Text style={s.listItemSub}>Escuela: {item.escuela?.nombre || 'Ninguna'}</Text>
            </View>
            <TouchableOpacity style={s.editBtn} onPress={() => { setVendAEditar(item); setModalVendOpen(true); }} data-testid={`cu-edit-vend-${item.id_vendedor}`}>
                <Pencil size={14} color={Colors.moradoAccento} />
            </TouchableOpacity>
        </View>
    ), []);

    return (
        <View style={s.root} data-testid="crear-usuario-screen">
            <TopBar title="Usuarios" />
            <View style={s.headerRow}><Text style={s.pageTitle}>Control de Accesos</Text></View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                {TABS.map(tab => (
                    <TouchableOpacity key={tab.id} style={[s.tab, activeTab === tab.id && s.tabActive]} onPress={() => setActiveTab(tab.id)} data-testid={`cu-tab-${tab.id}`}>
                        <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* CREAR */}
            {activeTab === 'crear' && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
                    <View style={s.formCard}>
                        <View style={s.fieldWrap}>
                            <View style={s.labelRow}><User size={14} color={Colors.moradoAccento} /><Text style={s.label}>Nombre de usuario</Text></View>
                            <TextInput style={s.input} value={username} onChangeText={setUsername} placeholder="ej. ivan_admin" placeholderTextColor="rgba(26,0,96,0.3)" autoCapitalize="none" editable={!loading} data-testid="cu-username" />
                        </View>
                        <View style={s.fieldWrap}>
                            <View style={s.labelRow}><Lock size={14} color={Colors.moradoAccento} /><Text style={s.label}>Contrasena</Text></View>
                            <View style={s.passRow}>
                                <TextInput style={[s.input, { flex: 1 }]} value={password} onChangeText={setPassword} placeholder="********" placeholderTextColor="rgba(26,0,96,0.3)" secureTextEntry={!showPass} editable={!loading} data-testid="cu-password" />
                                <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff size={18} color="rgba(26,0,96,0.4)" /> : <Eye size={18} color="rgba(26,0,96,0.4)" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={s.fieldWrap}>
                            <View style={s.labelRow}><Shield size={14} color={Colors.moradoAccento} /><Text style={s.label}>Rol de acceso</Text></View>
                            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowRolPicker(true)} data-testid="cu-rol-picker">
                                <Text style={s.pickerBtnText}>{rolActual.label}</Text>
                            </TouchableOpacity>
                        </View>
                        {error && <Text style={s.errorText}>{error}</Text>}
                        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading || exito} activeOpacity={0.8} data-testid="cu-submit">
                            {loading ? <ActivityIndicator color={Colors.amarilloAccento} /> : <Text style={s.submitBtnText}>{exito ? 'Usuario Listo!' : 'Crear Usuario'}</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* EMPLEADOS */}
            {activeTab === 'empleados' && (
                loadingData ? <View style={s.loadingWrap}><ActivityIndicator size="large" color={Colors.moradoAccento} /></View> :
                <FlatList data={empleados} renderItem={renderEmpleadoItem} keyExtractor={i => String(i.id_empleado)} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }} ListEmptyComponent={<Text style={s.emptyText}>No hay empleados registrados.</Text>} data-testid="cu-empleados-list" />
            )}

            {/* VENDEDORES */}
            {activeTab === 'vendedores' && (
                loadingData ? <View style={s.loadingWrap}><ActivityIndicator size="large" color={Colors.moradoAccento} /></View> :
                <FlatList data={vendedores} renderItem={renderVendedorItem} keyExtractor={i => String(i.id_vendedor)} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }} ListEmptyComponent={<Text style={s.emptyText}>No hay vendedores registrados.</Text>} data-testid="cu-vendedores-list" />
            )}

            {/* Pickers & Modals */}
            <Modal transparent visible={showRolPicker} animationType="fade" onRequestClose={() => setShowRolPicker(false)}>
                <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setShowRolPicker(false)}>
                    <View style={s.pickerModal}>
                        <Text style={s.pickerModalTitle}>Seleccionar Rol</Text>
                        {ROLES.map(r => (
                            <TouchableOpacity key={r.id} style={[s.pickerItem, rolId === r.id && s.pickerItemActive]} onPress={() => { setRolId(r.id); setShowRolPicker(false); }}>
                                <r.Icon size={16} color={Colors.azulMarino} /><Text style={s.pickerItemText}>{r.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <ModalEmpleado isOpen={modalEmpOpen} onClose={() => setModalEmpOpen(false)} empleadoAEditar={empAEditar} onSave={async (data: any) => { await updateEmpleado({ id_empleado: empAEditar.id_empleado, ...data }); cargarEmpleados(); }} />
            <ModalVendedor isOpen={modalVendOpen} onClose={() => setModalVendOpen(false)} vendedorAEditar={vendAEditar} onSave={async (data: any) => { await updateVendedor({ id_vendedor: vendAEditar.id_vendedor, ...data }); cargarVendedores(); }} />
            <ActionModal isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle} onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))} />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.fondoMoradoClaro },
    headerRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    pageTitle: { fontWeight: '900', fontSize: 24, color: Colors.azulMarino, letterSpacing: 0.5 },
    tabRow: { maxHeight: 48, marginBottom: 8 },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(26,0,96,0.12)', backgroundColor: Colors.blanco },
    tabActive: { backgroundColor: Colors.azulMarino, borderColor: Colors.azulMarino },
    tabText: { fontWeight: '700', fontSize: 12, color: Colors.azulMarino, textTransform: 'uppercase' },
    tabTextActive: { color: Colors.amarilloAccento },
    formCard: { backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 20, padding: 20, gap: 16 },
    fieldWrap: { gap: 6 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    label: { fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: Colors.azulMarino },
    input: { backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(212,184,240,0.6)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontWeight: '500', color: Colors.azulMarino },
    passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    eyeBtn: { padding: 8 },
    pickerBtn: { backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(212,184,240,0.6)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
    pickerBtnText: { fontWeight: '600', fontSize: 14, color: Colors.azulMarino },
    errorText: { fontSize: 12, fontWeight: '600', color: Colors.rojoPeligro },
    submitBtn: { backgroundColor: Colors.moradoAccento, borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 14, paddingVertical: 14, alignItems: 'center', elevation: 4, shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, shadowRadius: 0 },
    submitBtnText: { fontWeight: '900', fontSize: 14, color: Colors.blanco, textTransform: 'uppercase', letterSpacing: 1 },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.08)', borderRadius: 16, padding: 14, gap: 10 },
    listItemName: { fontWeight: '800', fontSize: 14, color: Colors.azulMarino },
    listItemSub: { fontWeight: '500', fontSize: 12, color: 'rgba(26,0,96,0.5)', marginTop: 2 },
    editBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(204,85,255,0.2)', backgroundColor: 'rgba(204,85,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', fontWeight: '700', fontSize: 14, color: 'rgba(26,0,96,0.35)', paddingTop: 40 },
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.25)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    pickerModal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 20, width: '100%', maxWidth: 340, padding: 16, elevation: 12 },
    pickerModalTitle: { fontWeight: '800', fontSize: 11, color: 'rgba(26,0,96,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.06)', borderRadius: 10 },
    pickerItemActive: { backgroundColor: Colors.amarilloAccento },
    pickerItemText: { fontWeight: '600', fontSize: 14, color: Colors.azulMarino },
});
