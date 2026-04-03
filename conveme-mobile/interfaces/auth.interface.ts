export interface LoginResponse {
    data: {
        login: {
            token: string;
            usuario: {
                id_usuario: number;
                rol_id: number;
                username: string;
            };
        };
    };
    errors?: { message: string }[];
}
