import { convemeApi } from '../api/convemeApi';

export const getComprobantes = async () => {
    const query = `
    query {
        comprobantes {
            id_comprobante
            total_vendido
            comision_vendedor
            monto_entregado
            saldo_pendiente
            fecha_corte
            notas
            vendedor {
                id_vendedor
                nombre_completo
            }
            admin {
                id_usuario
                username
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.comprobantes;
};

export const createComprobante = async (input: any) => {
    const query = `
    mutation CreateComprobante($input: CreateComprobanteInput!) {
        createComprobante(createComprobanteInput: $input) {
            id_comprobante
            fecha_corte
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createComprobante;
};

export const updateComprobante = async (input: any) => {
    const query = `
    mutation UpdateComprobante($input: UpdateComprobanteInput!) {
        updateComprobante(updateComprobanteInput: $input) {
            id_comprobante
            saldo_pendiente
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateComprobante;
};

export const deleteComprobante = async (id: number) => {
    const query = `
    mutation RemoveComprobante($id: Int!) {
        removeComprobante(id: $id)
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeComprobante;
};


