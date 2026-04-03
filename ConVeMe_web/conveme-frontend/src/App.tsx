import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateUser from './pages/CreateUser';
import DashboardHome from './pages/DashboardHome';
import Profile from './pages/Profile';
import Catalogos from './pages/Catalogos';
import Inventario from './pages/Inventario';
import POS from './pages/POS';
import AsignacionesAdmin from './pages/AsignacionesAdmin';
import PedidosAdmin from './pages/PedidosAdmin';
import CortesAdmin from './pages/CortesAdmin';
import Produccion from './pages/Produccion';

// Vendedor
import DashboardVendedor from './pages/DashboardVendedor';
import MisPedidos from './pages/MisPedidos';
import MisFinanzas from './pages/MisFinanzas'; // Ajusta la ruta si es necesario

import DashboardLayout from './components/ui/DashboardLayout';
// 👇 ¡Un solo import para las reglas de seguridad!
import { AdminRoute, VendedorRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
    {/* 🌍 RUTAS PÚBLICAS */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />

    {/* 🏗️ LAYOUT COMPARTIDO (Todo lo de adentro tiene el Sidebar) */}
    <Route element={<DashboardLayout />}>

    {/* 🛡️ ZONA EXCLUSIVA DEL ADMINISTRADOR (Rol 1) */}
    <Route element={<AdminRoute />}>
    <Route path="/dashboard" element={<DashboardHome />} />
    <Route path="/crear-usuario" element={<CreateUser />} />
    <Route path="/pedidos-admin" element={<PedidosAdmin />} />
    <Route path="/cortes-admin" element={<CortesAdmin />} />
    <Route path="/asignaciones-admin" element={<AsignacionesAdmin />} />
    <Route path="/produccion" element={<Produccion />} />
    <Route path="/catalogos" element={<Catalogos />} />
    <Route path="/inventario" element={<Inventario />} />
    </Route>

    {/* ZONA DEL VENDEDOR (Y ADMIN) (Roles 1 y 2) */}
    <Route element={<VendedorRoute />}>
    <Route path="/dashboard-vendedor" element={<DashboardVendedor />} />
    {/* Aquí pondremos las demás del vendedor después: /mis-pedidos, /mis-finanzas, etc. */}
    {/* 👈 AGREGA LA RUTA AQUÍ */}
    <Route path="/mis-pedidos" element={<MisPedidos />} />
    {/* El Punto de Venta lo ponemos aquí para que AMBOS puedan vender */}
    <Route path="/pos" element={<POS />} />
    <Route path="/mis-finanzas" element={<MisFinanzas />} />
    <Route path="/perfil" element={<Profile />} />
    </Route>

    {/* Si escriben una URL rara, los mandamos a login para que el sistema decida a dónde van */}
    <Route path="*" element={<Navigate to="/login" replace />} />
    </Route>

    </Routes>
  );
}

export default App;
