import { useState, useEffect } from "react";
import { TrendingUp, PackageOpen, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { convemeApi } from "../api/convemeApi";
import { PREDICCION_VENTAS, PREDICCION_DEMANDA_PRODUCTOS } from "../services/prediccionesERP";

export default function DashboardPredicciones() {
    const [ventas, setVentas] = useState<any>(null);
    const [demanda, setDemanda] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarPredicciones();
    }, []);

    const cargarPredicciones = async () => {
        setLoading(true);
        try {
            // 1. Pedir predicción de Ventas (Laplace s=0.10)
            const resVentas = await convemeApi.post('', {
                query: PREDICCION_VENTAS,
                variables: { mesesHistorico: 6, factorS: 0.10 }
            });

            // 2. Pedir predicción de Demanda de Productos (Laplace s=0.15)
            const resDemanda = await convemeApi.post('', {
                query: PREDICCION_DEMANDA_PRODUCTOS,
                variables: { factorS: 0.15 }
            });

            setVentas(resVentas.data.data.prediccionVentasProximoMes);
            setDemanda(resDemanda.data.data.prediccionDemandaInventario);
        } catch (error) {
            console.error("Error al cargar predicciones", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#1a0060]" size={40} /></div>;
    }

    return (
        <div className="p-6 space-y-6">
        <h2 className="text-2xl font-black text-[#1a0060] flex items-center gap-2">
        <TrendingUp /> Predicciones del Negocio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* TARJETA 1: PREDICCIÓN DE VENTAS */}
        <div className="bg-white border-[3px] border-[#1a0060] rounded-2xl p-6 shadow-[6px_6px_0_0_#1a0060]">
        <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-4">Ingresos Próximo Mes</h3>
        {ventas && (
            <div>
            <p className="text-5xl font-black text-[#06d6a0]">${ventas.ventas_esperadas}</p>
            <p className="text-sm font-bold text-gray-400 mt-2">
            Crecimiento esperado: {ventas.crecimiento_pct}%
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-500">
             Factor Laplace (s=0.10) → α={ventas.factor_alpha} <br/>
            Confianza del algoritmo: {ventas.confianza_pct}%
            </div>
            </div>
        )}
        </div>

        {/* TARJETA 2: GRÁFICA DE INVENTARIO */}
        <div className="bg-white border-[3px] border-[#1a0060] rounded-2xl p-6 shadow-[6px_6px_0_0_#1a0060]">
        <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
        <PackageOpen size={16}/> Productos a Fabricar/Comprar
        </h3>

        <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={demanda}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="producto" tick={{fontSize: 10, fill: '#1a0060', fontWeight: 'bold'}} />
        <YAxis tick={{fontSize: 10}} />
        <Tooltip cursor={{fill: 'rgba(204,85,255,0.1)'}} contentStyle={{borderRadius: 10, border: '2px solid #1a0060', fontWeight: 'bold'}} />
        <Bar dataKey="piezas_necesarias" fill="#cc55ff" radius={[4, 4, 0, 0]} name="Piezas" />
        </BarChart>
        </ResponsiveContainer>
        </div>
        </div>

        </div>
        </div>
    );
}
