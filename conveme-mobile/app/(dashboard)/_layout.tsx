import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import {
    Home, Package, ShoppingCart, Users, Settings,
    LogOut, Scissors, Shield, Star, Truck, Wallet,
    UserCircle, ClipboardList, DollarSign,
} from 'lucide-react-native';
import { useSession } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

// Mapa de items de menu (identico al web)
const menuItems = [
    { name: 'dashboard',       label: 'Inicio',           icon: Home,          roles: [1, 2, 3], section: 'General' },
    { name: 'perfil',          label: 'Mi Perfil',        icon: UserCircle,    roles: [1, 2, 3], section: 'General' },
    { name: 'pos',             label: 'Punto de Venta',   icon: ShoppingCart,  roles: [1, 2],    section: 'Ventas' },
    { name: 'pedidos-admin',   label: 'Mis Clientes',     icon: Users,         roles: [1],       section: 'Ventas' },
    { name: 'cortes-admin',    label: 'Operaciones',      icon: Wallet,        roles: [1],       section: 'Ventas' },
    { name: 'inventario',      label: 'Inventario',       icon: Package,       roles: [1, 3],    section: 'Logistica' },
    { name: 'produccion',      label: 'Produccion',       icon: Scissors,      roles: [1, 3],    section: 'Logistica' },
    { name: 'catalogos',       label: 'Catalogos',        icon: Settings,      roles: [1],       section: 'Admin' },
    { name: 'crear-usuario',   label: 'Crear usuario',    icon: Shield,        roles: [1],       section: 'Admin' },
    { name: 'mis-pedidos',     label: 'Mis pedidos',      icon: ClipboardList, roles: [2],       section: 'Pedidos' },
    { name: 'mis-finanzas',    label: 'Mis finanzas',     icon: DollarSign,    roles: [2],       section: 'Vendedor' },
];

const rolInfo: Record<number, { label: string; color: string; Icon: any }> = {
    1: { label: 'Administrador', color: Colors.amarilloAccento, Icon: Shield },
    2: { label: 'Vendedor',      color: Colors.moradoAccento,   Icon: Star },
    3: { label: 'Produccion',    color: Colors.verdeExito,      Icon: Truck },
};

function CustomDrawerContent(props: DrawerContentComponentProps) {
    const { rolId, username, cerrarSesion, token } = useSession();
    const router = useRouter();
    const rol = rolInfo[rolId ?? 0] ?? { label: 'Invitado', color: '#aaa', Icon: Users };

    useEffect(() => {
        if (!token) router.replace('/login');
    }, [token]);

    const filteredItems = menuItems.filter(item => item.roles.includes(rolId ?? 0));
    const sections = Array.from(new Set(filteredItems.map(m => m.section)));

    const currentRoute = props.state.routes[props.state.index]?.name;

    const handleLogout = async () => {
        await cerrarSesion();
        router.replace('/login');
    };

    return (
        <View style={s.drawerRoot}>
            {/* Dot pattern decorative */}
            <View style={s.drawerDotPattern} />

            {/* Header / Logo */}
            <View style={s.drawerHeader}>
                <Text style={s.drawerLogo}>NoManches Mx</Text>
            </View>

            {/* User card */}
            <View style={s.userCard}>
                <View style={s.avatar}>
                    <Shield size={20} color={Colors.moradoAccento} />
                </View>
                <View style={s.userInfo}>
                    <Text style={s.userName} numberOfLines={1}>{username ?? 'Usuario'}</Text>
                    <View style={[s.roleBadge, { backgroundColor: rol.color }]}>
                        <rol.Icon size={10} color={Colors.azulMarino} />
                        <Text style={s.roleBadgeText}>{rol.label}</Text>
                    </View>
                </View>
            </View>

            {/* Navigation */}
            <DrawerContentScrollView {...props} contentContainerStyle={s.navScroll}>
                {sections.map(section => (
                    <View key={section}>
                        <Text style={s.sectionLabel}>{section}</Text>
                        {filteredItems
                            .filter(m => m.section === section)
                            .map(item => {
                                const active = currentRoute === item.name;
                                const Icon = item.icon;
                                return (
                                    <TouchableOpacity
                                        key={item.name}
                                        style={[s.navLink, active && s.navLinkActive]}
                                        onPress={() => router.push(`/(dashboard)/${item.name}` as any)}
                                        activeOpacity={0.8}
                                    >
                                        <Icon size={18} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} />
                                        <Text style={[s.navLabel, active && s.navLabelActive]}>
                                            {item.label}
                                        </Text>
                                        {active && <View style={s.activeDot} />}
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </View>
                ))}
            </DrawerContentScrollView>

            {/* Logout */}
            <View style={s.drawerFooter}>
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <LogOut size={16} color="rgba(255,130,130,0.9)" />
                    <Text style={s.logoutText}>Cerrar sesion</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function DashboardLayout() {
    const { token, isLoading } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/login');
        }
    }, [isLoading, token]);

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'slide',
                drawerStyle: { width: 260, backgroundColor: 'transparent' },
                overlayColor: 'rgba(0,0,0,0.55)',
                swipeEdgeWidth: 60,
            }}
        >
            {/* Definimos todas las screens del drawer */}
            <Drawer.Screen name="dashboard" options={{ title: 'Inicio' }} />
            <Drawer.Screen name="perfil" options={{ title: 'Mi Perfil' }} />
            <Drawer.Screen name="pos" options={{ title: 'Punto de Venta' }} />
            <Drawer.Screen name="pedidos-admin" options={{ title: 'Mis Clientes' }} />
            <Drawer.Screen name="cortes-admin" options={{ title: 'Operaciones' }} />
            <Drawer.Screen name="inventario" options={{ title: 'Inventario' }} />
            <Drawer.Screen name="produccion" options={{ title: 'Produccion' }} />
            <Drawer.Screen name="catalogos" options={{ title: 'Catalogos' }} />
            <Drawer.Screen name="crear-usuario" options={{ title: 'Crear Usuario' }} />
            <Drawer.Screen name="mis-pedidos" options={{ title: 'Mis Pedidos' }} />
            <Drawer.Screen name="mis-finanzas" options={{ title: 'Mis Finanzas' }} />
        </Drawer>
    );
}

const s = StyleSheet.create({
    drawerRoot: {
        flex: 1,
        backgroundColor: Colors.azulMarino,
        overflow: 'hidden',
    },
    drawerDotPattern: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.18,
    },
    drawerHeader: {
        paddingTop: 52,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(204,85,255,0.2)',
    },
    drawerLogo: {
        fontWeight: '900', fontSize: 16, color: Colors.blanco,
        letterSpacing: 1, textTransform: 'uppercase',
    },
    userCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 2, borderBottomColor: 'rgba(204,85,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    avatar: {
        width: 40, height: 40, borderRadius: 20,
        borderWidth: 2.5, borderColor: Colors.moradoAccento,
        backgroundColor: 'rgba(204,85,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
        elevation: 3,
        shadowColor: '#000', shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.35, shadowRadius: 0,
    },
    userInfo: { flex: 1 },
    userName: { fontWeight: '800', fontSize: 13, color: Colors.blanco },
    roleBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
        alignSelf: 'flex-start', marginTop: 3,
    },
    roleBadgeText: {
        fontWeight: '700', fontSize: 9.5, letterSpacing: 0.8,
        textTransform: 'uppercase', color: Colors.azulMarino,
    },
    navScroll: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 20 },
    sectionLabel: {
        fontWeight: '700', fontSize: 9, letterSpacing: 2.5,
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10, paddingTop: 14, paddingBottom: 6,
    },
    navLink: {
        flexDirection: 'row', alignItems: 'center', gap: 11,
        paddingVertical: 10, paddingHorizontal: 12,
        borderRadius: 12, borderWidth: 1.5, borderColor: 'transparent',
        marginBottom: 2, position: 'relative',
    },
    navLinkActive: {
        backgroundColor: Colors.moradoAccento,
        borderColor: 'rgba(255,255,255,0.2)',
        elevation: 4,
        shadowColor: '#000', shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.35, shadowRadius: 0,
    },
    navLabel: {
        fontWeight: '600', fontSize: 13.5, color: 'rgba(255,255,255,0.55)',
    },
    navLabelActive: { fontWeight: '700', color: Colors.blanco },
    activeDot: {
        position: 'absolute', right: 12,
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    drawerFooter: {
        paddingHorizontal: 10, paddingVertical: 12,
        borderTopWidth: 2, borderTopColor: 'rgba(204,85,255,0.15)',
    },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingVertical: 10, paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1.5, borderColor: 'rgba(255,88,88,0.35)',
        backgroundColor: 'rgba(255,88,88,0.1)',
    },
    logoutText: {
        fontWeight: '800', fontSize: 12, letterSpacing: 0.8,
        textTransform: 'uppercase', color: 'rgba(255,130,130,0.9)',
    },
});
