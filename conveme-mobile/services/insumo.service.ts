import { convemeApi } from '../api/convemeApi';

export const getInsumos = async () => {
    const query = `
    query {
        insumos {
            id_insumo
            nombre
            unidad_medida
            stock_actual
            stock_minimo_alerta
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.insumos;
};

export const createInsumo = async (input: any) => {
    const query = `
    mutation CreateInsumo($input: CreateInsumoInput!) {
        createInsumo(createInsumoInput: $input) { id_insumo nombre }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createInsumo;
};

export const updateInsumo = async (input: any) => {
    const query = `
    mutation UpdateInsumo($input: UpdateInsumoInput!) {
        updateInsumo(updateInsumoInput: $input) { id_insumo nombre }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateInsumo;
};

export const deleteInsumo = async (id_insumo: number) => {
    const query = `mutation RemoveInsumo($id_insumo: Int!) { removeInsumo(id_insumo: $id_insumo) }`;
    const { data } = await convemeApi.post('', { query, variables: { id_insumo } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeInsumo;
};
