import { convemeApi } from '../api/convemeApi';

export const getEmpleados = async () => {
    const query = `
    query {
        empleados {
            id_empleado
            nombre_completo
            email
            telefono
            puesto
            calle_y_numero
            colonia
            codigo_postal
            usuario { id_usuario username rol { nombre } }
            municipio { id_municipio nombre estado { id_estado nombre } }
        }
    }`;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.empleados;
};

export const createEmpleado = async (input: any) => {
    const query = `mutation CreateEmpleado($input: CreateEmpleadoInput!) { createEmpleado(createEmpleadoInput: $input) { id_empleado nombre_completo } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createEmpleado;
};

export const updateEmpleado = async (input: any) => {
    const query = `mutation UpdateEmpleado($input: UpdateEmpleadoInput!) { updateEmpleado(updateEmpleadoInput: $input) { id_empleado nombre_completo } }`;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateEmpleado;
};

export const deleteEmpleado = async (id: number) => {
    const query = `mutation RemoveEmpleado($id: Int!) { removeEmpleado(id_empleado: $id) { id_empleado } }`;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeEmpleado;
};


export const getEmpleadoPorUsuario = async (id_usuario: number) => {
    const query = `
    query EmpleadoPorUsuario($id_usuario: Int!) {
        empleadoPorUsuario(id_usuario: $id_usuario) {
            id_empleado
            nombre_completo
            correo
            telefono
            puesto
            calle_numero
            colonia
            codigo_postal
        }
    }`;
    const { data } = await convemeApi.post('', { query, variables: { id_usuario } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.empleadoPorUsuario;
};
