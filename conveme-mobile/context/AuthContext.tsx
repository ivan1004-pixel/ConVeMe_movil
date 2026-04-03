import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
    token: string | null;
    rolId: number | null;
    idUsuario: number | null;
    username: string | null;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    guardarSesion: (token: string, rolId: number, idUsuario: number, username: string) => Promise<void>;
    cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        token: null,
        rolId: null,
        idUsuario: null,
        username: null,
        isLoading: true,
    });

    useEffect(() => {
        cargarSesion();
    }, []);

    const cargarSesion = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            const rolId = await SecureStore.getItemAsync('rol_id');
            const idUsuario = await SecureStore.getItemAsync('id_usuario');
            const username = await SecureStore.getItemAsync('username');

            setState({
                token,
                rolId: rolId ? Number(rolId) : null,
                idUsuario: idUsuario ? Number(idUsuario) : null,
                username,
                isLoading: false,
            });
        } catch {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const guardarSesion = async (token: string, rolId: number, idUsuario: number, username: string) => {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('rol_id', rolId.toString());
        await SecureStore.setItemAsync('id_usuario', idUsuario.toString());
        await SecureStore.setItemAsync('username', username);

        setState({ token, rolId, idUsuario, username, isLoading: false });
    };

    const cerrarSesion = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('rol_id');
        await SecureStore.deleteItemAsync('id_usuario');
        await SecureStore.deleteItemAsync('username');

        setState({ token: null, rolId: null, idUsuario: null, username: null, isLoading: false });
    };

    return (
        <AuthContext.Provider value={{ ...state, guardarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useSession = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useSession debe usarse dentro de AuthProvider');
    return context;
};
