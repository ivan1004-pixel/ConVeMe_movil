import { convemeApi } from '../api/convemeApi';

export const getAsignaciones = async (search: string = '') => {
    const query = `
    query GetAsignaciones($search: String) {
        asignacionesVendedor(search: $search) {
            id_asignacion
            fecha_asignacion
            estado
            vendedor {
                id_vendedor
                nombre_completo
            }
            detalles {
                id_det_asignacion
                cantidad_asignada
                producto {
                    id_producto
                    nombre
                    sku
                    precio_unitario
                }
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { search } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.asignacionesVendedor;
};

export const createAsignacion = async (input: any) => {
    const query = `
    mutation CreateAsignacionVendedor($input: CreateAsignacionVendedorInput!) {
        createAsignacionVendedor(createAsignacionVendedorInput: $input) {
            id_asignacion
            estado
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createAsignacionVendedor;
};

export const updateAsignacion = async (input: any) => {
    const query = `
    mutation UpdateAsignacionVendedor($input: UpdateAsignacionVendedorInput!) {
        updateAsignacionVendedor(updateAsignacionVendedorInput: $input) {
            id_asignacion
            estado
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateAsignacionVendedor;
};

export const deleteAsignacion = async (id: number) => {
    const query = `
    mutation RemoveAsignacionVendedor($id: Int!) {
        removeAsignacionVendedor(id_asignacion: $id)
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeAsignacionVendedor;
};
