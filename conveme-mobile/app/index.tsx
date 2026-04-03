import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function Index() {
    const { token, rolId, isLoading } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!token) {
            router.replace('/login');
        } else {
            router.replace('/(dashboard)/dashboard');
        }
    }, [isLoading, token]);

    return (
        <View style={s.root}>
            <ActivityIndicator size="large" color={Colors.moradoAccento} />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.fondoMoradoClaro },
});
