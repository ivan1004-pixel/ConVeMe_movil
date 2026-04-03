import { useState } from 'react';
import { createUserService } from '../services/user.service';
import { Alert } from 'react-native';

export const useUser = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState(false);

    const crearUsuario = async (username: string, password_raw: string, rol_id: number) => {
        setLoading(true);
        setError(null);
        setExito(false);
        try {
            await createUserService(username, password_raw, rol_id);
            setExito(true);
            return true;
        } catch (err: any) {
            Alert.alert('Error del Backend', err.message || 'Error al crear el usuario');
            setError('Error al crear el usuario.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, exito, crearUsuario, setExito };
};
