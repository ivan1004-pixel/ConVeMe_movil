import { convemeApi } from '../api/convemeApi';

export const getCategorias = async () => {
    const query = `query { categorias { id_categoria nombre } }`;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.categorias;
};

export const createCategoria = async (input: any) => {
    const query = `mutation CreateCategoria($input: CreateCategoriaInput!) { createCategoria(createCategoriaInput: $input) { id_categoria nombre } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createCategoria;
};

export const updateCategoria = async (input: any) => {
    const query = `mutation UpdateCategoria($input: UpdateCategoriaInput!) { updateCategoria(updateCategoriaInput: $input) { id_categoria nombre } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateCategoria;
};

export const deleteCategoria = async (id: number) => {
    const query = `mutation RemoveCategoria($id: Int!) { removeCategoria(id_categoria: $id) { id_categoria } }`;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeCategoria;
};
