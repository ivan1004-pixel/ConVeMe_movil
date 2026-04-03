import { convemeApi } from '../api/convemeApi';

export const getEstados = async () => {
    const query = `query { estados { id_estado nombre } }`;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.estados;
};

export const getMunicipiosPorEstado = async (estado_id: number) => {
    const query = `
    query GetMunicipios($estado_id: Int!) {
        municipiosPorEstado(estado_id: $estado_id) {
            id_municipio
            nombre
        }
    }`;
    const { data } = await convemeApi.post('', { query, variables: { estado_id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.municipiosPorEstado;
};
