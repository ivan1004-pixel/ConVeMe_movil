export interface LoginResponse {
    data: {
        login: {
            token: string;
            usuario: {
                id_usuario: number;
                rol_id: number;
            };
        };
    };
}
