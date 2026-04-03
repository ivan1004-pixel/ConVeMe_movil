import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView,
} from 'react-native';
import {
    User, Shield, Star, Truck, Mail, Phone, Briefcase, MapPin,
    AtSign, School, DollarSign, Edit2, Save, X, CheckCircle,
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import { getEmpleadoPorUsuario, updateEmpleado } from '@/services/empleado.service';
import { getVendedorByUsuarioId } from '@/services/vendedor.service';

const rolMap: Record<number, { label: string; color: string; bg: string; IconComp: any }> = {
    1: { label: 'Administrador', color: Colors.azulMarino, bg: Colors.amarilloAccento, IconComp: Shield },
    2: { label: 'Vendedor', color: Colors.blanco, bg: Colors.moradoAccento, IconComp: Star },
    3: { label: 'Produccion', color: Colors.azulMarino, bg: Colors.verdeExito, IconComp: Truck },
};

export default function Perfil() {
    const [userId, setUserId] = useState(0);
    const [miRol, setMiRol] = useState(1);
    const [usernameLogueado, setUsernameLogueado] = useState('Usuario');
    const [datosPersonales, setDatosPersonales] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ nombre_completo: '', correo: '', telefono: '', puesto: '', calle_numero: '', colonia: '', codigo_postal: '' });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [savedOk, setSavedOk] = useState(false);

    useEffect(() => {
        (async () => {
            const uid = Number(await SecureStore.getItemAsync('id_usuario')) || 0;
            const rol = Number(await SecureStore.getItemAsync('rol_id')) || 1;
            const uname = (await SecureStore.getItemAsync('username')) || 'Usuario';
            setUserId(uid); setMiRol(rol); setUsernameLogueado(uname);
            if (uid) cargarDatos(uid, rol);
            else setLoading(false);
        })();
    }, []);

    const cargarDatos = async (uid: number, rol: number) => {
        try {
            if (rol === 2) {
                const data = await getVendedorByUsuarioId(uid);
                if (data) setDatosPersonales(data);
            } else {
                const data = await getEmpleadoPorUsuario(uid);
                if (data) {
                    setDatosPersonales(data);
                    setForm({ nombre_completo: data.nombre_completo || '', correo: data.correo || '', telefono: data.telefono || '', puesto: data.puesto || '', calle_numero: data.calle_numero || '', colonia: data.colonia || '', codigo_postal: data.codigo_postal || '' });
                }
            }
        } catch (e: any) {
            setErrorMsg('No se encontraron datos personales asociados a esta cuenta.');
        } finally { setLoading(false); }
    };

    const handleGuardar = async () => {
        if (!datosPersonales) return;
        setSaving(true); setErrorMsg(null);
        try {
            await updateEmpleado({ id_empleado: datosPersonales.id_empleado, ...form });
            await cargarDatos(userId, miRol);
            setIsEditing(false); setSavedOk(true);
            setTimeout(() => setSavedOk(false), 3000);
        } catch (err: any) { setErrorMsg(err.message || 'Error al actualizar'); }
        finally { setSaving(false); }
    };

    const rolInfo = rolMap[miRol] ?? rolMap[1];

    if (loading) return <View style={s.root}><TopBar title="Perfil" /><View style={s.loadingWrap}><ActivityIndicator size="large" color={Colors.moradoAccento} /><Text style={s.loadingText}>Cargando datos personales...</Text></View></View>;

    return (
        <View style={s.root} data-testid="perfil-screen">
            <TopBar title="Perfil" />
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
                {/* Hero */}
                <View style={s.hero}>
                    <View style={s.avatarWrap}><User size={40} color={Colors.moradoAccento} /></View>
                    <View style={[s.rolBadge, { backgroundColor: rolInfo.bg }]}><rolInfo.IconComp size={12} color={rolInfo.color} /><Text style={[s.rolBadgeText, { color: rolInfo.color }]}>{rolInfo.label}</Text></View>
                    <Text style={s.heroName}>{datosPersonales?.nombre_completo || usernameLogueado}</Text>
                    <Text style={s.heroSub}>
                        {miRol === 2 ? (datosPersonales?.escuela?.nombre || 'Sin escuela') : (datosPersonales?.puesto || 'Sin puesto')}
                    </Text>
                    {miRol === 1 && (
                        <TouchableOpacity style={[s.editToggle, isEditing && s.editToggleCancel]} onPress={() => { setIsEditing(!isEditing); setErrorMsg(null); }} data-testid="perfil-edit-toggle">
                            {isEditing ? <><X size={14} color={Colors.rojoPeligro} /><Text style={[s.editToggleText, { color: Colors.rojoPeligro }]}>Cancelar</Text></> : <><Edit2 size={14} color={Colors.moradoAccento} /><Text style={s.editToggleText}>Editar datos</Text></>}
                        </TouchableOpacity>
                    )}
                </View>

                {savedOk && <View style={s.toastOk}><CheckCircle size={16} color={Colors.verdeExito} /><Text style={s.toastOkText}>Datos actualizados correctamente</Text></View>}

                {!isEditing ? (
                    /* READ VIEW */
                    <View style={s.infoCard}>
                        <View style={s.infoHeader}><User size={16} color={Colors.moradoAccento} /><Text style={s.infoHeaderTitle}>Informacion Personal</Text></View>
                        <View style={s.infoBody}>
                            <InfoBlock icon={<User size={16} color={Colors.azulMarino} />} label="Nombre Completo" value={datosPersonales?.nombre_completo} />
                            <InfoBlock icon={<Mail size={16} color={Colors.azulMarino} />} label="Correo" value={datosPersonales?.email || datosPersonales?.correo || 'No registrado'} />
                            <InfoBlock icon={<Phone size={16} color={Colors.azulMarino} />} label="Telefono" value={datosPersonales?.telefono || 'No registrado'} />
                            {miRol === 2 && (<>
                                <InfoBlock icon={<AtSign size={16} color={Colors.moradoAccento} />} label="Instagram" value={datosPersonales?.instagram_handle ? `@${datosPersonales.instagram_handle}` : 'No registrado'} />
                                <InfoBlock icon={<MapPin size={16} color={Colors.verdeExito} />} label="Zona de venta" value={datosPersonales?.municipio ? `${datosPersonales.municipio.nombre}, ${datosPersonales.municipio.estado.nombre}` : 'No registrada'} />
                                <View style={s.comisionBlock}><DollarSign size={16} color={Colors.amarilloAccento} /><Text style={s.comisionText}>Menudeo: {datosPersonales?.comision_fija_menudeo}%  -  Mayoreo: {datosPersonales?.comision_fija_mayoreo}%</Text></View>
                            </>)}
                            {miRol !== 2 && (<>
                                <InfoBlock icon={<Briefcase size={16} color={Colors.azulMarino} />} label="Puesto" value={datosPersonales?.puesto} />
                                <InfoBlock icon={<MapPin size={16} color={Colors.azulMarino} />} label="Direccion" value={datosPersonales?.calle_numero ? `${datosPersonales.calle_numero}, ${datosPersonales.colonia}. CP: ${datosPersonales.codigo_postal}` : 'No registrada'} />
                            </>)}
                        </View>
                    </View>
                ) : (
                    /* EDIT VIEW */
                    <View style={s.editCard}>
                        <View style={s.infoHeader}><Edit2 size={16} color={Colors.amarilloAccento} /><Text style={s.infoHeaderTitle}>Actualizar datos</Text></View>
                        {errorMsg && <View style={s.errorWrap}><Text style={s.errorText}>{errorMsg}</Text></View>}
                        <View style={s.editBody}>
                            <EditField label="Nombre completo" value={form.nombre_completo} onChange={(v: string) => setForm({ ...form, nombre_completo: v })} disabled={saving} testId="perfil-nombre" />
                            <EditField label="Correo" value={form.correo} onChange={(v: string) => setForm({ ...form, correo: v })} disabled={saving} keyboardType="email-address" testId="perfil-correo" />
                            <EditField label="Telefono" value={form.telefono} onChange={(v: string) => setForm({ ...form, telefono: v })} disabled={saving} keyboardType="phone-pad" testId="perfil-telefono" />
                            <EditField label="Puesto" value={form.puesto} onChange={(v: string) => setForm({ ...form, puesto: v })} disabled={saving} testId="perfil-puesto" />
                            <EditField label="Calle y numero" value={form.calle_numero} onChange={(v: string) => setForm({ ...form, calle_numero: v })} disabled={saving} testId="perfil-calle" />
                            <EditField label="Colonia" value={form.colonia} onChange={(v: string) => setForm({ ...form, colonia: v })} disabled={saving} testId="perfil-colonia" />
                            <EditField label="Codigo Postal" value={form.codigo_postal} onChange={(v: string) => setForm({ ...form, codigo_postal: v })} disabled={saving} testId="perfil-cp" />
                        </View>
                        <TouchableOpacity style={s.saveBtn} onPress={handleGuardar} disabled={saving} activeOpacity={0.8} data-testid="perfil-save">
                            {saving ? <ActivityIndicator color={Colors.blanco} /> : <><Save size={16} color={Colors.blanco} /><Text style={s.saveBtnText}>Actualizar datos</Text></>}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function InfoBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
    return (
        <View style={ib.wrap}>{icon}<View style={ib.textWrap}><Text style={ib.label}>{label}</Text><Text style={ib.value}>{value || '—'}</Text></View></View>
    );
}
const ib = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.05)' },
    textWrap: { flex: 1 },
    label: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(26,0,96,0.45)' },
    value: { fontWeight: '600', fontSize: 14, color: Colors.azulMarino, marginTop: 2 },
});

function EditField({ label, value, onChange, disabled, keyboardType, testId }: any) {
    return (
        <View style={{ gap: 4 }}><Text style={ef.label}>{label}</Text><TextInput style={ef.input} value={value} onChangeText={onChange} editable={!disabled} keyboardType={keyboardType || 'default'} placeholderTextColor="rgba(26,0,96,0.3)" data-testid={testId} /></View>
    );
}
const ef = StyleSheet.create({
    label: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: Colors.azulMarino },
    input: { backgroundColor: 'rgba(248,245,255,1)', borderWidth: 2, borderColor: 'rgba(212,184,240,0.6)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, fontWeight: '500', color: Colors.azulMarino },
});

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.fondoMoradoClaro },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontWeight: '700', fontSize: 13, color: 'rgba(26,0,96,0.4)' },
    hero: { alignItems: 'center', gap: 8, paddingVertical: 20, backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 24, elevation: 2, shadowColor: Colors.azulMarino, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.08, shadowRadius: 0 },
    avatarWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(204,85,255,0.1)', borderWidth: 2.5, borderColor: 'rgba(204,85,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    rolBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    rolBadgeText: { fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
    heroName: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino },
    heroSub: { fontWeight: '500', fontSize: 13, color: 'rgba(26,0,96,0.5)' },
    editToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 2, borderColor: 'rgba(204,85,255,0.3)', borderRadius: 12 },
    editToggleCancel: { borderColor: 'rgba(255,80,80,0.3)' },
    editToggleText: { fontWeight: '800', fontSize: 11, color: Colors.moradoAccento, textTransform: 'uppercase' },
    toastOk: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.verdeFondo, borderWidth: 1.5, borderColor: 'rgba(6,214,160,0.3)', borderRadius: 14, padding: 12 },
    toastOkText: { fontWeight: '700', fontSize: 13, color: Colors.verdeExito },
    infoCard: { backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 20, overflow: 'hidden' },
    infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.08)' },
    infoHeaderTitle: { fontWeight: '900', fontSize: 12, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    infoBody: { padding: 16 },
    comisionBlock: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.fondoMoradoClaro, borderRadius: 12, padding: 12, marginTop: 8 },
    comisionText: { fontWeight: '700', fontSize: 12, color: Colors.azulMarino },
    editCard: { backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 20, overflow: 'hidden' },
    editBody: { padding: 16, gap: 12 },
    errorWrap: { backgroundColor: 'rgba(255,80,80,0.1)', borderWidth: 1, borderColor: 'rgba(255,80,80,0.2)', borderRadius: 12, padding: 10, margin: 12, marginBottom: 0 },
    errorText: { fontSize: 12, fontWeight: '600', color: Colors.rojoPeligro },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.moradoAccento, borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 14, paddingVertical: 14, margin: 16, elevation: 4, shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, shadowRadius: 0 },
    saveBtnText: { fontWeight: '900', fontSize: 14, color: Colors.blanco, textTransform: 'uppercase', letterSpacing: 0.8 },
});
