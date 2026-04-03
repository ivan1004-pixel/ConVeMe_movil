import { convemeApi } from '../api/convemeApi';

// 1. Obtener todas las cuentas activas
export const getCuentasBancarias = async () => {
    const query = `
    query {
        cuentasBancarias {
            id_cuenta
            banco
            titular_cuenta
            numero_cuenta
            clabe_interbancaria
            vendedor {
                id_vendedor
                nombre_completo
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.cuentasBancarias;
};

// 2. Crear cuenta
export const createCuentaBancaria = async (input: any) => {
    const query = `
    mutation CreateCuentaBancaria($input: CreateCuentaBancariaInput!) {
        createCuentaBancaria(createCuentaBancariaInput: $input) {
            id_cuenta
            banco
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createCuentaBancaria;
};

// 3. Editar cuenta
export const updateCuentaBancaria = async (input: any) => {
    const query = `
    mutation UpdateCuentaBancaria($input: UpdateCuentaBancariaInput!) {
        updateCuentaBancaria(updateCuentaBancariaInput: $input) {
            id_cuenta
            banco
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateCuentaBancaria;
};

// 4. Borrar cuenta (Soft Delete)
export const deleteCuentaBancaria = async (id: number) => {
    const query = `
    mutation RemoveCuentaBancaria($id: Int!) {
        removeCuentaBancaria(id_cuenta: $id) {
            id_cuenta
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeCuentaBancaria;
};
