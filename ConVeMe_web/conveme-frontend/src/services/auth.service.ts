import { convemeApi } from '../api/convemeApi';
import type { LoginResponse } from '../interfaces/auth.interface';

export const loginService = async (username: string, password_raw: string) => {
    const query = `
    mutation Login($username: String!, $password_raw: String!) {
        login(loginInput: { username: $username, password_raw: $password_raw }) {
            token
            usuario {
                id_usuario
                rol_id
                username
            }
        }
    }
    `;

    const { data } = await convemeApi.post<LoginResponse>('', {
        query,
        variables: { username, password_raw },
    });

    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.login;
};
