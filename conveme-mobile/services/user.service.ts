import { convemeApi } from '../api/convemeApi';

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
    const { data } = await convemeApi.post('', { query, variables: { username, password_raw, rol_id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createUsuario;
};

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
    const { data } = await convemeApi.post('', { query, variables: { id: id_usuario } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.usuario;
};

export const updateUserService = async (id_usuario: number, username?: string, password_raw?: string, rol_id?: number) => {
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
    const input: any = { id_usuario };
    if (username) input.username = username;
    if (password_raw) input.password_raw = password_raw;
    if (rol_id) input.rol_id = rol_id;
    const { data } = await convemeApi.post('', { query, variables: { updateUsuarioInput: input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateUsuario;
};
