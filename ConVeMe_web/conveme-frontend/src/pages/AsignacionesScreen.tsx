import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import ModalAsignacion from '../ModalAsignacion';

// Definimos la Query basada en tu Resolver
const GET_ASIGNACIONES = gql`
query GetAsignaciones {
    asignacionesVendedor {
        id_asignacion
        fecha_asignacion
        estado
        vendedor {
            nombre
        }
        detalles {
            cantidad_asignada
            producto {
                nombre
            }
        }
    }
}
`;

export const AsignacionesScreen = () => {
    const { loading, error, data } = useQuery(GET_ASIGNACIONES);
    const [showModal, setShowModal] = useState(false);

    if (loading) return <p className="p-6 text-gray-500">Cargando asignaciones...</p>;
    if (error) return <p className="p-6 text-red-500">Error al cargar datos.</p>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Control de Asignaciones</h1>
        <button
        onClick={() => setShowModal(true)}
        className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow"
        >
        + Nueva Asignación
        </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
        <thead className="bg-gray-100">
        <tr>
        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Folio</th>
        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Vendedor</th>
        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Fecha</th>
        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Total Productos</th>
        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Estado</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
        {data.asignacionesVendedor.map((asig: any) => {
            // Calculamos el total de piezas sumando las cantidades de los detalles
            const totalPiezas = asig.detalles.reduce((sum: number, det: any) => sum + det.cantidad_asignada, 0);

            return (
                <tr key={asig.id_asignacion} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-800">#{asig.id_asignacion}</td>
                <td className="px-6 py-4 text-gray-700">{asig.vendedor?.nombre || 'Desconocido'}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(asig.fecha_asignacion).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-600">{totalPiezas} piezas</td>
                <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${asig.estado === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {asig.estado}
                </span>
                </td>
                </tr>
            );
        })}
        </tbody>
        </table>
        </div>

        {showModal && <ModalAsignacion onClose={() => setShowModal(false)} />}
        </div>
    );
};
