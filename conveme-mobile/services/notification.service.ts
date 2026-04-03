import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar como se muestran las notificaciones cuando la app esta en primer plano
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Solicitar permisos y obtener el Expo Push Token.
 * Retorna el token string o null si no se pudo obtener.
 */
export const registrarPushToken = async (): Promise<string | null> => {
    if (!Device.isDevice) {
        console.log('Push notifications requieren dispositivo fisico');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permiso de notificaciones denegado');
        return null;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'ConVeMe',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#cc55ff',
        });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'conveme-mobile',
    });

    return tokenData.data;
};

/**
 * Enviar notificacion local inmediata (funciona sin backend).
 * Ideal para confirmar acciones del admin.
 */
export const notificacionLocal = async (
    titulo: string,
    cuerpo: string,
    data?: Record<string, unknown>,
) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: titulo,
            body: cuerpo,
            data: data || {},
            sound: 'default',
        },
        trigger: null, // Inmediata
    });
};

/**
 * Enviar push notification a otro dispositivo via Expo Push API.
 * Requiere el pushToken del destinatario (almacenado en backend).
 * 
 * NOTA: Para que funcione cross-device, el backend debe exponer:
 *   - Mutation: guardarPushToken(usuario_id, token)
 *   - Query: getPushTokenByUsuarioId(usuario_id) 
 */
export const enviarPushAUsuario = async (
    pushToken: string,
    titulo: string,
    cuerpo: string,
    data?: Record<string, unknown>,
) => {
    const message = {
        to: pushToken,
        sound: 'default',
        title: titulo,
        body: cuerpo,
        data: data || {},
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
};

// Helpers para acciones especificas del negocio
export const notificarAsignacion = (vendedorNombre: string, cantProductos: number) =>
    notificacionLocal(
        'Mercancia Asignada',
        `Se entregaron ${cantProductos} producto(s) a ${vendedorNombre}.`,
        { tipo: 'asignacion' },
    );

export const notificarPedidoEntregado = (pedidoId: number, clienteNombre: string) =>
    notificacionLocal(
        'Pedido Entregado',
        `Pedido #${pedidoId} entregado a ${clienteNombre}.`,
        { tipo: 'pedido_entregado', pedidoId },
    );

export const notificarPedidoCancelado = (pedidoId: number) =>
    notificacionLocal(
        'Pedido Cancelado',
        `Pedido #${pedidoId} fue cancelado.`,
        { tipo: 'pedido_cancelado', pedidoId },
    );
