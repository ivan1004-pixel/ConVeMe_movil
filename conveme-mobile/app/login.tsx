import { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Animated,
    StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const { loading, error, exito, iniciarSesion } = useAuth();
    const { rolId } = useSession();
    const router = useRouter();

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();

        Animated.spring(scaleAnim, {
            toValue: 1, tension: 180, friction: 14, delay: 200, useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (exito) {
            Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
            setTimeout(() => {
                router.replace('/(dashboard)/dashboard');
            }, 2000);
        }
    }, [exito]);

    const handleSubmit = async () => {
        if (!username || !password) return;
        await iniciarSesion(username, password);
    };

    return (
        <View style={s.root}>
            {/* Success Overlay */}
            {exito && (
                <Animated.View style={[s.successOverlay, { opacity: successOpacity }]}>
                    <Text style={s.successEmoji}>uwu</Text>
                    <Text style={s.successTitle}>Acceso Concedido!</Text>
                    <Text style={s.successSub}>Cargando ERP...</Text>
                </Animated.View>
            )}

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    {/* ══ PANEL SUPERIOR — Marca ══ */}
                    <View style={s.panelTop}>
                        {/* Decorative blobs */}
                        <View style={[s.blob, s.blob1]} />
                        <View style={[s.blob, s.blob2]} />
                        <View style={[s.blob, s.blob3]} />
                        {/* Dot pattern */}
                        <View style={s.dotPattern} />

                        <Animated.View style={[s.topContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            {/* Logo banner */}
                            <View style={s.logoBanner}>
                                <Text style={s.logoText}>NoManches Mx</Text>
                            </View>

                            {/* Mascot placeholder */}
                            <Animated.View style={[s.mascotWrap, { transform: [{ scale: scaleAnim }] }]}>
                                <View style={s.mascotInner}>
                                    <ShieldCheck size={48} color={Colors.moradoAccento} strokeWidth={2} />
                                </View>
                            </Animated.View>

                            <Text style={s.welcomeHeading}>{'Hola,\nNoMancherito!'}</Text>
                            <Text style={s.welcomeSub}>Tu ERP favorito te espera. Inicia sesion para continuar.</Text>

                            <View style={s.tagPill}>
                                <Text style={s.tagPillText}>2026 NoManches Mx</Text>
                            </View>
                        </Animated.View>
                    </View>

                    {/* ══ PANEL INFERIOR — Formulario ══ */}
                    <View style={s.panelBottom}>
                        <View style={s.dotPatternLight} />

                        <Animated.View style={[s.formCard, { opacity: fadeAnim }]}>
                            <Text style={s.formEyebrow}>Sistema ERP</Text>
                            <Text style={s.formTitle}>{'Iniciar\nsesion'}</Text>
                            <Text style={s.formSubtitle}>
                                Ingresa tus credenciales para acceder al sistema.
                            </Text>
                            <View style={s.formDivider} />

                            {error && (
                                <View style={s.errorMsg}>
                                    <Text style={s.errorText}>{error}</Text>
                                </View>
                            )}

                            {/* Usuario */}
                            <View style={s.fieldGroup}>
                                <Text style={s.fieldLabel}>Usuario</Text>
                                <TextInput
                                    style={s.fieldInput}
                                    placeholder="tu_usuario"
                                    placeholderTextColor="#b9a0d4"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!loading && !exito}
                                />
                            </View>

                            {/* Contrasena */}
                            <View style={s.fieldGroup}>
                                <Text style={s.fieldLabel}>Contrasena</Text>
                                <View style={s.fieldWrap}>
                                    <TextInput
                                        style={[s.fieldInput, { paddingRight: 48 }]}
                                        placeholder="••••••••"
                                        placeholderTextColor="#b9a0d4"
                                        secureTextEntry={!showPass}
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!loading && !exito}
                                    />
                                    <TouchableOpacity
                                        style={s.passToggle}
                                        onPress={() => setShowPass(v => !v)}
                                    >
                                        {showPass
                                            ? <EyeOff size={18} color="#b39dcc" />
                                            : <Eye size={18} color="#b39dcc" />
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Submit */}
                            <TouchableOpacity
                                style={[s.btnLogin, exito && s.btnLoginSuccess]}
                                onPress={handleSubmit}
                                disabled={loading || exito}
                                activeOpacity={0.85}
                            >
                                {loading ? (
                                    <View style={s.btnContent}>
                                        <ActivityIndicator size="small" color={Colors.amarilloAccento} />
                                        <Text style={s.btnText}>Verificando...</Text>
                                    </View>
                                ) : exito ? (
                                    <Text style={[s.btnText, { color: Colors.blanco }]}>Listo!</Text>
                                ) : (
                                    <Text style={s.btnText}>{'Entrar \u2192'}</Text>
                                )}
                            </TouchableOpacity>

                            <Text style={s.formFooter}>
                                Acceso restringido al personal autorizado.
                            </Text>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#ede9fe' },
    scrollContent: { flexGrow: 1 },

    // ── Success Overlay ──
    successOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(237,233,254,0.97)',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 14,
    },
    successEmoji: { fontSize: 60, fontWeight: '900', color: Colors.moradoAccento },
    successTitle: { fontWeight: '900', fontSize: 28, color: Colors.azulMarino },
    successSub: { fontSize: 15, fontWeight: '500', color: 'rgba(26,0,96,0.55)' },

    // ── Panel Superior ──
    panelTop: {
        backgroundColor: Colors.moradoAccento,
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 32,
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    dotPattern: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.25,
    },
    blob: { position: 'absolute', borderRadius: 999 },
    blob1: {
        width: 240, height: 240, backgroundColor: 'rgba(255,255,255,0.12)',
        top: -60, left: -60, borderWidth: 3, borderColor: 'rgba(255,255,255,0.18)',
    },
    blob2: {
        width: 160, height: 160, backgroundColor: 'rgba(26,0,96,0.12)',
        bottom: -40, right: -40, borderWidth: 3, borderColor: 'rgba(26,0,96,0.14)',
    },
    blob3: {
        width: 80, height: 80, backgroundColor: 'rgba(255,225,68,0.18)',
        bottom: 60, left: 30, borderWidth: 2, borderColor: 'rgba(255,225,68,0.28)',
    },
    topContent: { alignItems: 'center', gap: 18, zIndex: 2 },

    logoBanner: {
        backgroundColor: Colors.azulMarino,
        borderRadius: 16, paddingVertical: 12, paddingHorizontal: 28,
        elevation: 6,
        shadowColor: '#000', shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 0,
    },
    logoText: { fontWeight: '900', fontSize: 20, color: Colors.blanco, letterSpacing: 1 },

    mascotWrap: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 3, borderColor: Colors.azulMarino,
        backgroundColor: Colors.blanco,
        elevation: 6,
        shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 0,
        overflow: 'hidden',
    },
    mascotInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    welcomeHeading: {
        fontWeight: '900', fontSize: 30, color: Colors.azulMarino,
        textAlign: 'center', lineHeight: 34,
    },
    welcomeSub: {
        fontSize: 14, fontWeight: '500', color: 'rgba(26,0,96,0.7)',
        textAlign: 'center', maxWidth: 260, lineHeight: 21,
    },
    tagPill: {
        backgroundColor: Colors.amarilloAccento,
        borderWidth: 2, borderColor: Colors.azulMarino,
        borderRadius: 40, paddingVertical: 5, paddingHorizontal: 18,
        elevation: 3,
        shadowColor: Colors.azulMarino, shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3, shadowRadius: 0,
    },
    tagPillText: { fontWeight: '800', fontSize: 11, color: Colors.azulMarino, letterSpacing: 0.8 },

    // ── Panel Inferior ──
    panelBottom: {
        flex: 1, backgroundColor: '#ede9fe',
        paddingHorizontal: 32, paddingTop: 36, paddingBottom: 48,
        overflow: 'hidden', position: 'relative',
    },
    dotPatternLight: { ...StyleSheet.absoluteFillObject, opacity: 0.06 },
    formCard: { zIndex: 2, maxWidth: 400, alignSelf: 'center', width: '100%' },

    formEyebrow: {
        fontWeight: '700', fontSize: 11, letterSpacing: 2,
        textTransform: 'uppercase', color: Colors.moradoAccento, marginBottom: 8,
    },
    formTitle: {
        fontWeight: '900', fontSize: 34, color: Colors.azulMarino,
        lineHeight: 38, marginBottom: 12,
    },
    formSubtitle: {
        fontSize: 14, fontWeight: '400', color: 'rgba(26,0,96,0.55)',
        marginBottom: 18, lineHeight: 22, maxWidth: 300,
    },
    formDivider: {
        width: 48, height: 4, backgroundColor: Colors.moradoAccento,
        borderRadius: 4, marginBottom: 28,
    },

    errorMsg: {
        backgroundColor: '#ffe5e8', borderWidth: 2, borderColor: '#ff4d6d',
        borderRadius: 10, padding: 12, marginBottom: 16,
    },
    errorText: { color: '#c1002b', fontSize: 12, fontWeight: '600', textAlign: 'center' },

    fieldGroup: { marginBottom: 18 },
    fieldLabel: {
        fontWeight: '700', fontSize: 10.5, letterSpacing: 1.5,
        textTransform: 'uppercase', color: Colors.azulMarino, marginBottom: 6,
    },
    fieldWrap: { position: 'relative' },
    fieldInput: {
        width: '100%', backgroundColor: Colors.blanco,
        borderWidth: 2.5, borderColor: '#d4b8f0', borderRadius: 12,
        paddingVertical: 13, paddingHorizontal: 16,
        fontSize: 14, fontWeight: '500', color: Colors.azulMarino,
    },
    passToggle: {
        position: 'absolute', right: 12, top: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
    },

    btnLogin: {
        width: '100%', backgroundColor: Colors.azulMarino,
        borderWidth: 2.5, borderColor: Colors.azulMarino,
        borderRadius: 14, paddingVertical: 16, marginTop: 8,
        elevation: 5,
        shadowColor: '#000', shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 0,
        alignItems: 'center', justifyContent: 'center',
    },
    btnLoginSuccess: { backgroundColor: Colors.verdeExito, borderColor: '#05b589' },
    btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    btnText: {
        fontWeight: '900', fontSize: 15, letterSpacing: 2,
        textTransform: 'uppercase', color: Colors.amarilloAccento,
    },

    formFooter: {
        fontSize: 11, fontWeight: '500', color: 'rgba(26,0,96,0.4)',
        textAlign: 'center', marginTop: 22,
    },
});
