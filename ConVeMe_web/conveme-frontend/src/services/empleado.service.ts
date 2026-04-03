import { convemeApi } from '../api/convemeApi';

// 1. Obtener todos los empleados activos
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
            usuario {
                id_usuario
                username
                rol {
                    nombre
                }
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
    return data.data.empleados;
};

// 2. Crear empleado
export const createEmpleado = async (input: any) => {
    const query = `
    mutation CreateEmpleado($input: CreateEmpleadoInput!) {
        createEmpleado(createEmpleadoInput: $input) {
            id_empleado
            nombre_completo
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createEmpleado;
};

// 3. Editar empleado
export const updateEmpleado = async (input: any) => {
    const query = `
    mutation UpdateEmpleado($input: UpdateEmpleadoInput!) {
        updateEmpleado(updateEmpleadoInput: $input) {
            id_empleado
            nombre_completo
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateEmpleado;
};

// 4. Borrar empleado (Soft Delete)
export const deleteEmpleado = async (id: number) => {
    const query = `
    mutation RemoveEmpleado($id: Int!) {
        removeEmpleado(id_empleado: $id) {
            id_empleado
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeEmpleado;
};

// 5. Obtener empleado por ID de usuario (Para el Perfil)
export const getEmpleadoPorUsuario = async (id_usuario: number) => {
    const query = `
    query {
        empleados {
            id_empleado
            nombre_completo
            email
            telefono
            puesto
            usuario {
                id_usuario
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);

    // Filtramos para encontrar el empleado que coincida con el usuario logueado
    const empleado = data.data.empleados.find((emp: any) => emp.usuario?.id_usuario === id_usuario);
    return empleado;
};
