import { convemeApi } from '../api/convemeApi';

export const getEscuelas = async () => {
    const query = `
    query {
        escuelas {
            id_escuela
            nombre
            siglas
            activa
            municipio {
                id_municipio
                nombre
                estado { id_estado nombre }
            }
        }
    }`;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.escuelas;
};

export const createEscuela = async (input: { nombre: string; siglas: string; municipio_id: number }) => {
    const query = `mutation CreateEscuela($input: CreateEscuelaInput!) { createEscuela(createEscuelaInput: $input) { id_escuela nombre } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createEscuela;
};

export const updateEscuela = async (input: any) => {
    const query = `mutation UpdateEscuela($input: UpdateEscuelaInput!) { updateEscuela(updateEscuelaInput: $input) { id_escuela nombre } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateEscuela;
};

export const deleteEscuela = async (id: number) => {
    const query = `mutation RemoveEscuela($id: Int!) { removeEscuela(id_escuela: $id) { id_escuela } }`;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeEscuela;
};
