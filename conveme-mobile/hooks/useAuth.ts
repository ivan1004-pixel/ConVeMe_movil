import { useState } from 'react';
import { loginService } from '../services/auth.service';
import { useSession } from '../context/AuthContext';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState(false);
    const { guardarSesion } = useSession();

    const iniciarSesion = async (username: string, password_raw: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await loginService(username, password_raw);
            await guardarSesion(
                response.token,
                response.usuario.rol_id,
                response.usuario.id_usuario,
                response.usuario.username,
            );
            setExito(true);
            return true;
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setError(err.response.data.errors[0].message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Credenciales incorrectas');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, exito, iniciarSesion };
};
