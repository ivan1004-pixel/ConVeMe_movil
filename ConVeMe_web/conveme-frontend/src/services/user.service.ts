import { convemeApi } from '../api/convemeApi';

// 🏠 CASA 1: Función para CREAR usuarios
export const createUserService = async (username: string, password_raw: string, rol_id: number) => {
    const query = `
    mutation CreateUsuario($username: String!, $password_raw: String!, $rol_id: Int!) {
        createUsuario(createUsuarioInput: {
            username: $username,
            password_raw: $password_raw,
            rol_id: $rol_id
        }) {
            id_usuario
            username
        }
    }
    `;

    const { data } = await convemeApi.post('', {
        query,
        variables: { username, password_raw, rol_id },
    });

    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createUsuario;
};

// 🏠 CASA 2: Función para LEER el perfil del usuario logueado
export const getUsuarioPerfil = async (id_usuario: number) => {
    const query = `
    query GetPerfil($id: Int!) {
        usuario(id_usuario: $id) {
            id_usuario
            username
            rol_id
            activo
            created_at
        }
    }
    `;

    const { data } = await convemeApi.post('', {
        query,
        variables: { id: id_usuario },
    });

    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.usuario;
};

// 🏠 CASA 3: Función para ACTUALIZAR el perfil
export const updateUserService = async (
    id_usuario: number,
    username?: string,
    password_raw?: string,
    rol_id?: number
) => {
    const query = `
    mutation UpdateUsuario($updateUsuarioInput: UpdateUsuarioInput!) {
        updateUsuario(updateUsuarioInput: $updateUsuarioInput) {
            id_usuario
            username
            rol_id
            activo
        }
    }
    `;

    // Construimos el "paquete" dinámicamente:
    // Siempre mandamos el ID, pero solo agregamos los demás si escribieron algo nuevo
    const input: any = { id_usuario };
    if (username) input.username = username;
    if (password_raw) input.password_raw = password_raw;
    if (rol_id) input.rol_id = rol_id;

    const { data } = await convemeApi.post('', {
        query,
        variables: { updateUsuarioInput: input },
    });

    // Si NestJS se queja de algo (ej. nombre duplicado), atrapamos el error
    if (data.errors) throw new Error(data.errors[0].message);

    return data.data.updateUsuario;
};
