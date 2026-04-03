import { Navigate, Outlet } from 'react-router-dom';

// 🔒 Bloquea a todos los que NO sean Administrador (rol_id: 1)
export const AdminRoute = () => {
    const token = localStorage.getItem('token');
    const rolId = localStorage.getItem('rol_id');

    if (!token || rolId !== '1') {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

// 🔒 Bloquea a los que NO sean Vendedor (rol_id: 2) ni Administrador (rol_id: 1)
export const VendedorRoute = () => {
    const token = localStorage.getItem('token');
    const rolId = localStorage.getItem('rol_id');

    if (!token || (rolId !== '2' && rolId !== '1')) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
