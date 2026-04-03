import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { registrarPushToken } from '@/services/notification.service';

interface NotificationContextType {
    pushToken: string | null;
    lastNotification: Notifications.Notification | null;
}

const NotificationContext = createContext<NotificationContextType>({
    pushToken: null,
    lastNotification: null,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        // Registrar push token al montar
        registrarPushToken().then(token => {
            if (token) {
                setPushToken(token);
                console.log('Push token registrado:', token);
            }
        });

        // Listener: notificacion recibida en foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setLastNotification(notification);
        });

        // Listener: usuario toco la notificacion
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log('Notificacion tocada:', data);
            // Aqui se puede navegar a la pantalla correspondiente segun data.tipo
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ pushToken, lastNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => useContext(NotificationContext);
