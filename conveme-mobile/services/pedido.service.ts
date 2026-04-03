import { convemeApi } from '../api/convemeApi';

export const getPedidos = async () => {
    const query = `
    query {
        pedidos {
            id_pedido
            fecha_pedido
            fecha_entrega_estimada
            monto_total
            anticipo
            estado
            vendedor {
                id_vendedor
                nombre_completo
            }
            cliente {
                id_cliente
                nombre_completo
            }
            detalles {
                cantidad
                precio_unitario
                producto {
                    id_producto
                    nombre
                    sku
                }
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.pedidos;
};

export const createPedido = async (input: any) => {
    const query = `
    mutation CreatePedido($input: CreatePedidoInput!) {
        createPedido(createPedidoInput: $input) {
            id_pedido
            estado
            monto_total
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createPedido;
};

export const updateEstadoPedido = async (id_pedido: number, estado: string) => {
    const query = `
    mutation UpdatePedido($input: UpdatePedidoInput!) {
        updatePedido(updatePedidoInput: $input) {
            id_pedido
            estado
        }
    }
    `;
    const variables = { input: { id_pedido, estado } };
    const { data } = await convemeApi.post('', { query, variables });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updatePedido;
};

export const deletePedido = async (id: number) => {
    const query = `mutation RemovePedido($id: Int!) { removePedido(id_pedido: $id) }`;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removePedido;
};
