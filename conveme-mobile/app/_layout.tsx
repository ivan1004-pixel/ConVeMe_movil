import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useFonts, Galada_400Regular } from '@expo-google-fonts/galada';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
    const [fontsLoaded] = useFonts({ Galada_400Regular });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f5ff' }}>
                <ActivityIndicator size="large" color="#1a0060" />
            </View>
        );
    }

    return (
        <NotificationProvider>
            <AuthProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="login" />
                    <Stack.Screen name="(dashboard)" />
                    <Stack.Screen name="index" />
                </Stack>
            </AuthProvider>
        </NotificationProvider>
    );
}
