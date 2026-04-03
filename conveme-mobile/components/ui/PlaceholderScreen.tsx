import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Construction } from 'lucide-react-native';
import TopBar from '@/components/ui/TopBar';
import { Colors } from '@/constants/Colors';

interface Props {
    topTitle: string;
    screenName: string;
    fase: string;
}

export default function PlaceholderScreen({ topTitle, screenName, fase }: Props) {
    return (
        <SafeAreaView style={s.root} edges={['top']}>
            <TopBar title={topTitle} />
            <View style={s.content}>
                <View style={s.card}>
                    <Construction size={36} color={Colors.moradoAccento} />
                    <Text style={s.title}>{screenName}</Text>
                    <Text style={s.sub}>
                        Esta pantalla sera migrada en {fase}. La estructura de navegacion ya esta lista.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#ede9fe' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    card: {
        backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(26,0,96,0.15)',
        borderRadius: 20, padding: 32, alignItems: 'center', gap: 14, width: '100%', maxWidth: 340,
    },
    title: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino, textAlign: 'center' },
    sub: { fontWeight: '500', fontSize: 13, color: 'rgba(26,0,96,0.50)', textAlign: 'center', lineHeight: 20 },
});
