import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useSession } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function UserGreeting() {
    const { username } = useSession();
    const slideAnim = useRef(new Animated.Value(-30)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1, tension: 200, friction: 15, delay: 100, useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0, duration: 400, delay: 180, useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1, duration: 400, delay: 180, useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={s.wrap}>
            {/* Avatar */}
            <Animated.View style={[s.avatar, { transform: [{ scale: scaleAnim }] }]}>
                <ShieldCheck size={24} color={Colors.moradoAccento} />
                <View style={s.pulseRing} />
            </Animated.View>

            {/* Badge */}
            <Animated.View style={[s.badge, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
                <View style={s.badgeText}>
                    <Text style={s.label}>Bienvenido de vuelta</Text>
                    <Text style={s.name} numberOfLines={1}>Hola, {username || 'NoMancherito'}!</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    wrap: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 52, height: 52, borderRadius: 26,
        borderWidth: 3, borderColor: Colors.azulMarino,
        backgroundColor: Colors.blanco,
        justifyContent: 'center', alignItems: 'center',
        zIndex: 2,
        elevation: 5,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    pulseRing: {
        position: 'absolute', top: -5, left: -5, right: -5, bottom: -5,
        borderRadius: 30, borderWidth: 2.5,
        borderColor: 'rgba(204,85,255,0.3)',
    },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: Colors.amarilloAccento,
        borderWidth: 3, borderColor: Colors.azulMarino,
        borderLeftWidth: 0,
        borderTopRightRadius: 16, borderBottomRightRadius: 16,
        paddingVertical: 10, paddingHorizontal: 20, paddingLeft: 16,
        marginLeft: -6, zIndex: 1,
        elevation: 5,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    badgeText: { gap: 1 },
    label: {
        fontWeight: '600', fontSize: 10, letterSpacing: 1.5,
        textTransform: 'uppercase', color: 'rgba(26,0,96,0.5)',
    },
    name: {
        fontWeight: '900', fontSize: 18, color: Colors.azulMarino,
        maxWidth: 220,
    },
});
