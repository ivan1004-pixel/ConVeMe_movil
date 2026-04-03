import React, { useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, FlatList,
    Animated, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
    Users, Package, ShoppingCart, TrendingUp, ArrowRight,
    Scissors, Star, ClipboardList, Truck, Wallet, CalendarClock,
    PackagePlus, UserCircle, Receipt, DollarSign,
} from 'lucide-react-native';

import TopBar from '@/components/ui/TopBar';
import UserGreeting from '@/components/ui/UserGreeting';
import DailyResumen from '@/components/ui/DailyResumen';
import { useSession } from '@/context/AuthContext';
import { getVendedorByUsuarioId } from '@/services/vendedor.service';
import { Colors } from '@/constants/Colors';

interface DashCard {
    name: string;
    bg: string;
    textCol: string;
    subCol: string;
    tag: string;
    tagBg: string;
    tagCol: string;
    title: string;
    sub: string;
    stat: string;
    Icon: any;
    StatIcon: any;
}

export default function Dashboard() {
    const { rolId, idUsuario } = useSession();
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }).start();
    }, []);

    // Vincular vendedor (logica identica al web)
    useEffect(() => {
        if (rolId !== 2 || !idUsuario) return;
        const vincular = async () => {
            const yaGuardado = await SecureStore.getItemAsync('id_vendedor');
            if (yaGuardado) return;
            try {
                const vendedor = await getVendedorByUsuarioId(idUsuario);
                if (vendedor) {
                    await SecureStore.setItemAsync('id_vendedor', vendedor.id_vendedor.toString());
                }
            } catch (e) { console.error('Error al vincular vendedor', e); }
        };
        vincular();
    }, [rolId, idUsuario]);

    // ── Cards Admin (idénticas al web) ──
    const adminCards: DashCard[] = [
        {
            name: 'catalogos', bg: '#cc55ff', textCol: '#fff', subCol: 'rgba(255,255,255,0.75)',
            tag: 'Gestion', tagBg: 'rgba(255,255,255,0.22)', tagCol: '#fff',
            Icon: Users, title: 'Anadir (Catalogos)',
            sub: 'Escuelas, Empleados, Cuentas, Eventos, Vendedores',
            stat: 'Registra ahora!', StatIcon: Star,
        },
        {
            name: 'pos', bg: '#06d6a0', textCol: '#1a0060', subCol: 'rgba(26,0,96,0.6)',
            tag: 'Venta', tagBg: 'rgba(26,0,96,0.12)', tagCol: '#1a0060',
            Icon: ShoppingCart, title: 'Punto de Venta',
            sub: 'Registra y gestiona nuevas ventas rapidas',
            stat: 'Tiempo real', StatIcon: TrendingUp,
        },
        {
            name: 'pedidos-admin', bg: '#00b4d8', textCol: '#fff', subCol: 'rgba(255,255,255,0.8)',
            tag: 'Pedidos', tagBg: 'rgba(255,255,255,0.2)', tagCol: '#fff',
            Icon: ClipboardList, title: 'Pedidos Clientes',
            sub: 'Gestiona anticipos y entregas programadas',
            stat: 'Pendientes', StatIcon: CalendarClock,
        },
        {
            name: 'cortes-admin', bg: '#1a0060', textCol: '#fff', subCol: 'rgba(255,255,255,0.6)',
            tag: 'Ruta', tagBg: 'rgba(6,214,160,0.2)', tagCol: '#06d6a0',
            Icon: Truck, title: 'Asignaciones',
            sub: 'Entrega mercancia a vendedores externos',
            stat: 'En ruta', StatIcon: Package,
        },
        {
            name: 'cortes-admin', bg: '#ffbe0b', textCol: '#1a0060', subCol: 'rgba(26,0,96,0.6)',
            tag: 'Cierre', tagBg: 'rgba(26,0,96,0.1)', tagCol: '#1a0060',
            Icon: Wallet, title: 'Realizar Corte',
            sub: 'Conciliacion de mercancia y cobranza',
            stat: 'Liquidar', StatIcon: TrendingUp,
        },
        {
            name: 'inventario', bg: '#ffe144', textCol: '#1a0060', subCol: 'rgba(26,0,96,0.6)',
            tag: 'Logistica', tagBg: 'rgba(26,0,96,0.1)', tagCol: '#1a0060',
            Icon: Package, title: 'Inventario',
            sub: 'Control de stock de pines y stickers',
            stat: 'En vivo', StatIcon: Package,
        },
        {
            name: 'produccion', bg: '#000', textCol: '#fff', subCol: 'rgba(255,255,255,0.55)',
            tag: 'Proceso', tagBg: 'rgba(204,85,255,0.18)', tagCol: '#cc55ff',
            Icon: Scissors, title: 'Taller',
            sub: 'Seguimiento de impresion y armado',
            stat: 'Fabricando', StatIcon: Scissors,
        },
    ];

    // ── Cards Vendedor (idénticas al web) ──
    const vendedorCards: DashCard[] = [
        {
            name: 'pos', bg: '#06d6a0', textCol: '#1a0060', subCol: 'rgba(26,0,96,0.6)',
            tag: 'Venta', tagBg: 'rgba(26,0,96,0.12)', tagCol: '#1a0060',
            Icon: ShoppingCart, title: 'Punto de Venta',
            sub: 'Registra tus ventas y cobra a los clientes al instante.',
            stat: 'Nueva Venta', StatIcon: TrendingUp,
        },
        {
            name: 'mis-pedidos', bg: '#00b4d8', textCol: '#fff', subCol: 'rgba(255,255,255,0.8)',
            tag: 'Pedidos', tagBg: 'rgba(255,255,255,0.2)', tagCol: '#fff',
            Icon: PackagePlus, title: 'Solicitar Mercancia',
            sub: 'Haz un pedido al administrador para surtir tu inventario.',
            stat: 'Ver Estatus', StatIcon: Star,
        },
        {
            name: 'mis-finanzas', bg: '#ffbe0b', textCol: '#1a0060', subCol: 'rgba(26,0,96,0.6)',
            tag: 'Cuentas', tagBg: 'rgba(26,0,96,0.1)', tagCol: '#1a0060',
            Icon: Wallet, title: 'Finanzas & Comprobantes',
            sub: 'Revisa tu historial de ventas, pagos recibidos y recibos.',
            stat: 'Ver Detalles', StatIcon: Receipt,
        },
    ];

    // ── Cards Produccion ──
    const produccionCards: DashCard[] = [
        adminCards[5], // Inventario
        adminCards[6], // Taller
    ];

    const isAdmin = rolId === 1;
    const isVendedor = rolId === 2;
    const cards = isAdmin ? adminCards : isVendedor ? vendedorCards : produccionCards;
    const sectionTitle = isAdmin ? 'Panel de Control' : isVendedor ? 'Tu Espacio de Trabajo' : 'Panel de Produccion';
    const rolLabel = isAdmin ? 'Admin' : isVendedor ? 'Ventas' : 'Prod.';

    const renderCard = ({ item, index }: { item: DashCard; index: number }) => {
        const Icon = item.Icon;
        const StatIcon = item.StatIcon;

        return (
            <TouchableOpacity
                style={[s.card, { backgroundColor: item.bg }]}
                activeOpacity={0.88}
                onPress={() => router.push(`/(dashboard)/${item.name}` as any)}
            >
                {/* Tag */}
                <View style={[s.cardTag, { backgroundColor: item.tagBg }]}>
                    <Text style={[s.cardTagText, { color: item.tagCol }]}>{item.tag}</Text>
                </View>

                {/* Icon */}
                <View style={s.cardIconWrap}>
                    <Icon size={28} color={item.textCol} />
                </View>

                {/* Text */}
                <Text style={[s.cardTitle, { color: item.textCol }]}>{item.title}</Text>
                <Text style={[s.cardSub, { color: item.subCol }]}>{item.sub}</Text>

                {/* Footer */}
                <View style={s.cardFooter}>
                    <View style={s.cardStatRow}>
                        <StatIcon size={14} color={item.textCol} />
                        <Text style={[s.cardStatText, { color: item.textCol }]}>{item.stat}</Text>
                    </View>
                    <View style={[s.cardArrow, { borderColor: `${item.textCol}25` }]}>
                        <ArrowRight size={15} color={item.textCol} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={s.root} edges={['top']}>
            <TopBar title="Inicio" />

            <FlatList
                data={cards}
                keyExtractor={(item, i) => `${item.name}-${i}`}
                numColumns={2}
                columnWrapperStyle={s.gridRow}
                contentContainerStyle={s.listContent}
                renderItem={renderCard}
                ListHeaderComponent={
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* UserGreeting */}
                        <View style={s.greetingWrap}>
                            <UserGreeting />
                        </View>

                        {/* Info strip */}
                        <View style={s.strip}>
                            <View style={s.stripChip}>
                                <View style={s.stripIcon}>
                                    <TrendingUp size={16} color={Colors.azulMarino} />
                                </View>
                                <View>
                                    <Text style={s.stripNum}>Hoy</Text>
                                    <Text style={s.stripLabel}>{isVendedor ? 'Tus Ventas' : 'Actividad'}</Text>
                                </View>
                            </View>
                            <View style={s.stripChip}>
                                <View style={s.stripIcon}>
                                    <UserCircle size={16} color={Colors.azulMarino} />
                                </View>
                                <View>
                                    <Text style={s.stripNum}>{rolLabel}</Text>
                                    <Text style={s.stripLabel}>{isVendedor ? 'Rol Actual' : 'Tu rol'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Daily Summary Widget (Admin & Vendedor) */}
                        {(isAdmin || isVendedor) && <DailyResumen rolId={rolId} />}

                        {/* Section header */}
                        <View style={s.sectionHead}>
                            <Text style={s.sectionTitle}>{sectionTitle}</Text>
                            <View style={s.sectionCount}>
                                <Text style={s.sectionCountText}>{cards.length} modulos activos</Text>
                            </View>
                        </View>
                    </Animated.View>
                }
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#ede9fe' },
    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    greetingWrap: { paddingTop: 16, paddingHorizontal: 4 },

    // Strip
    strip: {
        flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 16, paddingHorizontal: 4,
    },
    stripChip: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(26,0,96,0.1)',
        borderRadius: 14, padding: 12,
        elevation: 3,
        shadowColor: Colors.azulMarino, shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.08, shadowRadius: 0,
    },
    stripIcon: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: 'rgba(204,85,255,0.08)', borderWidth: 2, borderColor: 'rgba(204,85,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    stripNum: { fontWeight: '900', fontSize: 15, color: Colors.azulMarino },
    stripLabel: { fontWeight: '600', fontSize: 10, color: 'rgba(26,0,96,0.4)', textTransform: 'uppercase', letterSpacing: 1 },

    // Section head
    sectionHead: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 4, marginBottom: 14,
    },
    sectionTitle: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino },
    sectionCount: {
        backgroundColor: 'rgba(26,0,96,0.08)', borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)',
        borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5,
    },
    sectionCountText: { fontWeight: '800', fontSize: 10, color: 'rgba(26,0,96,0.55)', letterSpacing: 0.5 },

    // Grid
    gridRow: { gap: 10, marginBottom: 10 },

    // Card
    card: {
        flex: 1, borderRadius: 20, padding: 16,
        borderWidth: 2.5, borderColor: Colors.azulMarino,
        minHeight: 190,
        elevation: 5,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    cardTag: {
        alignSelf: 'flex-start', borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
    },
    cardTagText: { fontWeight: '800', fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase' },
    cardIconWrap: { marginBottom: 10 },
    cardTitle: { fontWeight: '900', fontSize: 17, marginBottom: 4 },
    cardSub: { fontWeight: '500', fontSize: 11, lineHeight: 16, marginBottom: 12, flex: 1 },
    cardFooter: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: 2, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 10,
    },
    cardStatRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cardStatText: { fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
    cardArrow: {
        width: 28, height: 28, borderRadius: 8,
        borderWidth: 2, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
});
