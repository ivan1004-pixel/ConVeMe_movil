import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Menu, ChevronRight, Shield, Star, Truck, Users } from 'lucide-react-native';
import { useSession } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

interface TopBarProps {
    title: string;
}

const rolInfo: Record<number, { label: string; color: string; Icon: any }> = {
    1: { label: 'Admin',      color: Colors.amarilloAccento, Icon: Shield },
    2: { label: 'Vendedor',   color: Colors.moradoAccento,   Icon: Star },
    3: { label: 'Produccion', color: Colors.verdeExito,      Icon: Truck },
};

export default function TopBar({ title }: TopBarProps) {
    const navigation = useNavigation();
    const { rolId } = useSession();
    const rol = rolInfo[rolId ?? 0] ?? { label: '?', color: '#aaa', Icon: Users };

    return (
        <View style={s.topbar}>
            <View style={s.left}>
                <TouchableOpacity
                    style={s.hamburger}
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                >
                    <Menu size={20} color={Colors.azulMarino} />
                </TouchableOpacity>
                <View style={s.breadcrumb}>
                    <Text style={s.breadHome}>ConVeMe</Text>
                    <ChevronRight size={14} color="rgba(26,0,96,0.25)" />
                    <Text style={s.breadCurrent}>{title}</Text>
                </View>
            </View>
            <View style={[s.chip, { borderColor: `${rol.color}40` }]}>
                <rol.Icon size={12} color={rol.color} />
                <Text style={s.chipText}>{rol.label}</Text>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    topbar: {
        height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, backgroundColor: 'rgba(237,233,254,0.9)',
        borderBottomWidth: 2.5, borderBottomColor: 'rgba(26,0,96,0.1)',
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    hamburger: {
        width: 38, height: 38, borderRadius: 10,
        borderWidth: 2, borderColor: 'rgba(26,0,96,0.18)',
        justifyContent: 'center', alignItems: 'center',
    },
    breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    breadHome: {
        fontWeight: '700', fontSize: 11, color: 'rgba(26,0,96,0.4)',
        textTransform: 'uppercase', letterSpacing: 0.8,
    },
    breadCurrent: {
        fontWeight: '800', fontSize: 12, color: Colors.azulMarino,
        textTransform: 'uppercase', letterSpacing: 0.8,
    },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderWidth: 2, borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 5,
    },
    chipText: {
        fontWeight: '700', fontSize: 11, color: Colors.azulMarino,
    },
});
