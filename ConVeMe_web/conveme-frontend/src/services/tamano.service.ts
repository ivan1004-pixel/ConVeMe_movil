import { convemeApi } from '../api/convemeApi';

export const getTamanos = async () => {
    const query = `query { tamanos { id_tamano descripcion } }`;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.tamanos;
};

export const createTamano = async (input: any) => {
    const query = `mutation CreateTamano($input: CreateTamanoInput!) { createTamano(createTamanoInput: $input) { id_tamano descripcion } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createTamano;
};

export const updateTamano = async (input: any) => {
    const query = `mutation UpdateTamano($input: UpdateTamanoInput!) { updateTamano(updateTamanoInput: $input) { id_tamano descripcion } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateTamano;
};

export const deleteTamano = async (id: number) => {
    const query = `mutation RemoveTamano($id: Int!) { removeTamano(id_tamano: $id) { id_tamano } }`;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeTamano;
};
