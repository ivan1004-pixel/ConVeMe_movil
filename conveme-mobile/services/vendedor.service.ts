import { convemeApi } from '../api/convemeApi';

export const getVendedores = async (search: string = '') => {
    const query = `
    query GetVendedores($search: String) {
        vendedores(search: $search) {
            id_vendedor
            nombre_completo
            email
            telefono
            instagram_handle
            comision_fija_menudeo
            comision_fija_mayoreo
            meta_ventas_mensual
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
    const { data } = await convemeApi.post('', { query, variables: { search } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.vendedores;
};

export const createVendedor = async (input: any) => {
    const query = `
    mutation CreateVendedor($input: CreateVendedorInput!) {
        createVendedor(createVendedorInput: $input) {
            id_vendedor
            nombre_completo
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.createVendedor;
};

export const updateVendedor = async (input: any) => {
    const query = `
    mutation UpdateVendedor($input: UpdateVendedorInput!) {
        updateVendedor(updateVendedorInput: $input) {
            id_vendedor
            nombre_completo
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { input } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.updateVendedor;
};

export const deleteVendedor = async (id: number) => {
    const query = `
    mutation RemoveVendedor($id: Int!) {
        removeVendedor(id_vendedor: $id) {
            id_vendedor
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.removeVendedor;
};

export const getUsuariosParaSelect = async () => {
    const query = `
    query {
        usuarios {
            id_usuario
            username
        }
    }
    `;
    const { data } = await convemeApi.post('', { query });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.usuarios;
};

export const getVendedorByUsuarioId = async (usuario_id: number) => {
    const query = `
    query VendedorByUsuario($usuario_id: Int!) {
        vendedorByUsuario(usuario_id: $usuario_id) {
            id_vendedor
            nombre_completo
            email
            telefono
            instagram_handle
            comision_fija_menudeo
            comision_fija_mayoreo
            meta_ventas_mensual
            escuela {
                nombre
            }
            municipio {
                nombre
                estado {
                    nombre
                }
            }
        }
    }
    `;
    const { data } = await convemeApi.post('', { query, variables: { usuario_id } });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data.vendedorByUsuario;
};
