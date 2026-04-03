import { useState } from 'react';
import { createUserService } from '../services/user.service';

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
            if (err.response?.data?.errors) {
                alert(" EL BACKEND DICE:\n" + err.response.data.errors[0].message);
            } else if (err.message) {
                alert(" EL BACKEND DICE:\n" + err.message);
            }
            setError('Error al crear el usuario. Revisa la consola.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, exito, crearUsuario, setExito };
};
