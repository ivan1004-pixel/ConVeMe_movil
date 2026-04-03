import React, { useState } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react-native';
import { convemeApi } from '@/api/convemeApi';
import { Colors } from '@/constants/Colors';

interface ModalAutorizacionProps {
    isOpen: boolean;
    esFaltante: boolean;
    monto: string;
    vendedor: string;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export default function ModalAutorizacion({
    isOpen, esFaltante, monto, vendedor, onConfirm, onClose,
}: ModalAutorizacionProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        if (!password) {
            setError('Debes ingresar tu contrasena de administrador.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const idUsuarioStr = await SecureStore.getItemAsync('id_usuario');

            if (!idUsuarioStr) {
                throw new Error('No se encontro tu sesion. Por favor cierra sesion y vuelve a entrar.');
            }

            const idUsuario = parseInt(idUsuarioStr, 10);

            const query = `
            query ValidarPassword($id: Int!, $pass: String!) {
                validarPasswordAdmin(id_usuario: $id, password: $pass)
            }
            `;

            const { data } = await convemeApi.post('', {
                query,
                variables: { id: idUsuario, pass: password },
            });

            if (data.errors) {
                throw new Error(data.errors[0].message || 'Error de validacion en el servidor.');
            }

            if (!data.data.validarPasswordAdmin) {
                throw new Error('Contrasena de administrador incorrecta.');
            }

            await onConfirm();
            setPassword('');
        } catch (e: any) {
            const mensajeReal = e.response?.data?.errors?.[0]?.message || e.message;
            setError(mensajeReal || 'Error al validar autorizacion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <View style={s.modal}>
                    {/* Header */}
                    <View style={[s.header, esFaltante ? s.headerRed : s.headerAmber]}>
                        <View style={s.headerLeft}>
                            <View style={[s.headerIcon, esFaltante ? s.iconRed : s.iconAmber]}>
                                <AlertTriangle size={24} color={esFaltante ? '#ef4444' : '#f59e0b'} />
                            </View>
                            <View>
                                <Text style={[s.headerTitle, esFaltante ? s.titleRed : s.titleAmber]}>
                                    {esFaltante ? 'Faltante Detectado' : 'Sobrante Detectado'}
                                </Text>
                                <Text style={s.headerSub}>Requiere Autorizacion</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <X size={20} color={Colors.gris400} />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <View style={s.body}>
                        <Text style={s.amountTitle}>
                            {esFaltante ? 'Faltan ' : 'Sobran '}
                            <Text style={esFaltante ? s.amountRed : s.amountAmber}>${monto}</Text>
                            {' para cuadrar.'}
                        </Text>
                        <Text style={s.amountSub}>
                            El vendedor entrego {esFaltante ? 'menos' : 'mas'} dinero del esperado.
                        </Text>

                        <View style={[s.vendorBadge, esFaltante ? s.badgeRed : s.badgeAmber]}>
                            <Text style={[s.vendorBadgeText, esFaltante ? s.badgeTextRed : s.badgeTextAmber]}>
                                Vendedor: {vendedor}
                            </Text>
                        </View>

                        {/* Password */}
                        <View style={s.passwordSection}>
                            <View style={s.passwordLabel}>
                                <ShieldAlert size={14} color={Colors.moradoAccento} />
                                <Text style={s.passwordLabelText}>Contrasena de Administrador</Text>
                            </View>
                            <TextInput
                                secureTextEntry
                                placeholder="••••••••"
                                placeholderTextColor={Colors.gris400}
                                value={password}
                                onChangeText={setPassword}
                                style={s.passwordInput}
                            />
                            {error !== '' && (
                                <View style={s.errorRow}>
                                    <AlertTriangle size={12} color={Colors.rojoPeligro} />
                                    <Text style={s.errorText}>{error}</Text>
                                </View>
                            )}
                        </View>

                        {/* Buttons */}
                        <View style={s.buttonsRow}>
                            <TouchableOpacity style={s.cancelBtn} onPress={onClose} disabled={loading}>
                                <Text style={s.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.confirmBtn, esFaltante ? s.confirmRed : s.confirmAmber]}
                                onPress={handleConfirm}
                                disabled={loading}
                            >
                                {loading
                                    ? <ActivityIndicator size="small" color={Colors.blanco} />
                                    : <Text style={[s.confirmBtnText, !esFaltante && { color: Colors.azulMarino }]}>
                                        Si, Autorizar
                                    </Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(26,0,96,0.50)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modal: {
        backgroundColor: Colors.blanco,
        borderRadius: 24,
        width: '100%',
        maxWidth: 380,
        borderWidth: 3,
        borderColor: Colors.azulMarino,
        elevation: 10,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 3,
    },
    headerRed: { backgroundColor: '#fff1f2', borderBottomColor: '#fecdd3' },
    headerAmber: { backgroundColor: '#fefce8', borderBottomColor: '#fde047' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerIcon: { padding: 8, borderRadius: 12, borderWidth: 2 },
    iconRed: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
    iconAmber: { backgroundColor: '#fef3c7', borderColor: '#fde68a' },
    headerTitle: { fontWeight: '900', fontSize: 18, textTransform: 'uppercase', letterSpacing: 0.5 },
    titleRed: { color: '#dc2626' },
    titleAmber: { color: '#d97706' },
    headerSub: { fontSize: 10, fontWeight: '700', color: Colors.gris500, textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 },
    body: { padding: 24, alignItems: 'center' },
    amountTitle: { fontWeight: '900', fontSize: 22, color: Colors.azulMarino, textAlign: 'center', marginBottom: 8 },
    amountRed: { color: '#ef4444' },
    amountAmber: { color: '#f59e0b' },
    amountSub: { fontSize: 14, fontWeight: '600', color: Colors.gris500, textAlign: 'center', marginBottom: 20, paddingHorizontal: 16 },
    vendorBadge: { padding: 12, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', marginBottom: 24, width: '100%' },
    badgeRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    badgeAmber: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
    vendorBadgeText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
    badgeTextRed: { color: '#b91c1c' },
    badgeTextAmber: { color: '#92400e' },
    passwordSection: { width: '100%', marginBottom: 24 },
    passwordLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    passwordLabelText: { fontSize: 10, fontWeight: '900', color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 2 },
    passwordInput: {
        width: '100%',
        backgroundColor: '#f8f9fc',
        borderWidth: 3,
        borderColor: Colors.gris200,
        borderRadius: 12,
        padding: 12,
        fontWeight: '700',
        color: Colors.azulMarino,
        textAlign: 'center',
        letterSpacing: 4,
        fontSize: 16,
    },
    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'center' },
    errorText: { color: Colors.rojoPeligro, fontSize: 12, fontWeight: '700' },
    buttonsRow: { flexDirection: 'row', gap: 12, width: '100%' },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    cancelBtnText: { fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: Colors.gris500 },
    confirmBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 3,
        alignItems: 'center', justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
    },
    confirmRed: { backgroundColor: '#ef4444', borderColor: '#b91c1c' },
    confirmAmber: { backgroundColor: '#fbbf24', borderColor: '#d97706' },
    confirmBtnText: { fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: Colors.blanco },
});
