import { convemeApi } from '../api/convemeApi';

export const getProductos = async () => {
    const query = `
    query {
        productos {
            id_producto
            sku
            nombre
            precio_unitario
            precio_mayoreo
            cantidad_minima_mayoreo
            costo_produccion
            activo
            categoria { id_categoria nombre }
            tamano { id_tamano descripcion }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.productos;
};

export const createProducto = async (input: any) => {
    const query = `mutation CreateProducto($input: CreateProductoInput!) { createProducto(createProductoInput: $input) { id_producto nombre sku } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createProducto;
};

export const updateProducto = async (input: any) => {
    const query = `mutation UpdateProducto($input: UpdateProductoInput!) { updateProducto(updateProductoInput: $input) { id_producto nombre sku } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateProducto;
};

export const deleteProducto = async (id: number) => {
    const query = `mutation RemoveProducto($id: Int!) { removeProducto(id_producto: $id) { id_producto } }`;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeProducto;
};
