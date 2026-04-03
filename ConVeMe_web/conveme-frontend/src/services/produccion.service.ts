import { convemeApi } from '../api/convemeApi'; // Ajusta la ruta si es necesario

// 1. LEER TODAS LAS ÓRDENES
export const getOrdenesProduccion = async () => {
    const query = `
    query {
        ordenesProduccion {
            id_orden_produccion
            cantidad_a_producir
            fecha_orden
            estado
            producto {
                id_producto
                nombre
                sku
            }
            empleado {
                id_empleado
                nombre_completo
            }
            detalles {
                id_det_orden
                cantidad_consumida
                insumo {
                    id_insumo
                    nombre
                    unidad_medida
                }
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.ordenesProduccion;
};

// 2. CREAR NUEVA ORDEN
export const createOrdenProduccion = async (input: any) => {
    const query = `
    mutation CreateOrdenProduccion($input: CreateOrdenProduccionInput!) {
        createOrdenProduccion(createOrdenProduccionInput: $input) {
            id_orden_produccion
            estado
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createOrdenProduccion;
};

// 3. ACTUALIZAR ESTADO (Aquí es donde se suma al inventario si es "Finalizada")
export const updateOrdenProduccion = async (input: any) => {
    const query = `
    mutation UpdateOrdenProduccion($input: UpdateOrdenProduccionInput!) {
        updateOrdenProduccion(updateOrdenProduccionInput: $input) {
            id_orden_produccion
            estado
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateOrdenProduccion;
};
