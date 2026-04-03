import { convemeApi } from '../api/convemeApi';

export const createVenta = async (input: any) => {
    const query = `
    mutation CreateVenta($input: CreateVentaInput!) {
        createVenta(createVentaInput: $input) {
            id_venta
            monto_total
            estado
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createVenta;
};

export const getVentas = async () => {
    const query = `
    query {
        ventas {
            id_venta
            fecha_venta
            monto_total
            metodo_pago
            estado
            vendedor { nombre_completo }
            detalles {
                cantidad
                precio_unitario
                producto { nombre sku }
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.ventas;
};

export const deleteVenta = async (id: number) => {
    const query = `mutation RemoveVenta($id: Int!) { removeVenta(id_venta: $id) }`;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeVenta;
};

export const updateVenta = async (input: any) => {
    const query = `
    mutation UpdateVenta($input: UpdateVentaInput!) {
        updateVenta(updateVentaInput: $input) {
            id_venta
            metodo_pago
            estado
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateVenta;
};
