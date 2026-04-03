import { convemeApi } from '../api/convemeApi';

// 1. Obtener todas las escuelas
export const getEscuelas = async () => {
    const query = `
    query {
        escuelas {
            id_escuela
            nombre
            siglas
            activa
            municipio {
                id_municipio  # <-- Agregamos esto
                nombre
                estado {
                    id_estado   # <-- Y esto para el modo edición
                    nombre
                }
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.escuelas;
};

// 2. Crear escuela
export const createEscuela = async (input: { nombre: string; siglas: string; municipio_id: number }) => {
    const query = `
    mutation CreateEscuela($input: CreateEscuelaInput!) {
        createEscuela(createEscuelaInput: $input) {
            id_escuela
            nombre
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createEscuela;
};

// 3. Editar escuela
export const updateEscuela = async (input: { id_escuela: number; nombre?: string; siglas?: string; municipio_id?: number }) => {
    const query = `
    mutation UpdateEscuela($input: UpdateEscuelaInput!) {
        updateEscuela(updateEscuelaInput: $input) {
            id_escuela
            nombre
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateEscuela;
};

// 4. Borrar escuela
export const deleteEscuela = async (id: number) => {
    const query = `
    mutation RemoveEscuela($id: Int!) {
        removeEscuela(id_escuela: $id) {
            id_escuela
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeEscuela;
};
