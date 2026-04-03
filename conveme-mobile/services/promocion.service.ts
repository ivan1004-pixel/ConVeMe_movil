import { convemeApi } from '../api/convemeApi';

export const getPromociones = async () => {
    const query = `
    query {
        promociones {
            id_promocion
            nombre
            descripcion
            tipo_promocion
            valor_descuento
            fecha_inicio
            fecha_fin
            activa
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.promociones;
};

export const createPromocion = async (input: any) => {
    const query = `
    mutation CreatePromocion($input: CreatePromocionInput!) {
        createPromocion(createPromocionInput: $input) {
            id_promocion
            nombre
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createPromocion;
};

export const updatePromocion = async (input: any) => {
    const query = `
    mutation UpdatePromocion($input: UpdatePromocionInput!) {
        updatePromocion(updatePromocionInput: $input) {
            id_promocion
            nombre
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updatePromocion;
};

export const deletePromocion = async (id_promocion: number) => {
    const query = `
    mutation RemovePromocion($id_promocion: Int!) {
        removePromocion(id_promocion: $id_promocion)
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { id_promocion } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removePromocion;
};
