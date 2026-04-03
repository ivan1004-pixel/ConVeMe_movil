import { convemeApi } from '../api/convemeApi';

// 1. Obtener todos los eventos activos
export const getEventos = async () => {
    const query = `
    query {
        eventos {
            id_evento
            nombre
            descripcion
            fecha_inicio
            fecha_fin
            costo_stand
            escuela {
                id_escuela
                nombre
            }
            municipio {
                id_municipio
                nombre
                estado {
                    id_estado
                    nombre
                }
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.eventos;
};

// 2. Crear evento
export const createEvento = async (input: any) => {
    const query = `
    mutation CreateEvento($input: CreateEventoInput!) {
        createEvento(createEventoInput: $input) {
            id_evento
            nombre
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createEvento;
};

// 3. Editar evento
export const updateEvento = async (input: any) => {
    const query = `
    mutation UpdateEvento($input: UpdateEventoInput!) {
        updateEvento(updateEventoInput: $input) {
            id_evento
            nombre
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateEvento;
};

// 4. Borrar evento (Soft Delete)
export const deleteEvento = async (id: number) => {
    const query = `
    mutation RemoveEvento($id: Int!) {
        removeEvento(id_evento: $id) {
            id_evento
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeEvento;
};
