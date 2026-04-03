import { convemeApi } from '../api/convemeApi';

export const getClientes = async () => {
    const query = `
    query {
        clientes {
            id_cliente
            nombre_completo
            email
            telefono
            direccion_envio
            fecha_registro
            usuario {
                id_usuario
                username
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.clientes;
};

export const createCliente = async (input: any) => {
    const query = `
    mutation CreateCliente($input: CreateClienteInput!) {
        createCliente(createClienteInput: $input) {
            id_cliente
            nombre_completo
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createCliente;
};

export const updateCliente = async (input: any) => {
    const query = `
    mutation UpdateCliente($input: UpdateClienteInput!) {
        updateCliente(updateClienteInput: $input) {
            id_cliente
            nombre_completo
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateCliente;
};

export const deleteCliente = async (id_cliente: number) => {
    const query = `
    mutation RemoveCliente($id_cliente: Int!) {
        removeCliente(id_cliente: $id_cliente)
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { id_cliente } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeCliente;
};
