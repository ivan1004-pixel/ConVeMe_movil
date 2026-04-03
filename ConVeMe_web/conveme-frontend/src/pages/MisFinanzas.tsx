import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';
import { getCortesPorVendedor } from '../services/corte.service';
import { Wallet, Receipt, Loader2, Calculator } from 'lucide-react';
import '../styles/Catalogos.css';

export default function MisFinanzas() {
    const vendedorId = Number(localStorage.getItem('id_vendedor'));

    const [comprobantes, setComprobantes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (vendedorId) cargarHistorial();
        else setLoading(false);
    }, [vendedorId]);

        const cargarHistorial = async () => {
            setLoading(true);
            try {
                const data = await getCortesPorVendedor(vendedorId);
                setComprobantes(data);
            } catch (error) {
                console.error("Error al cargar historial de finanzas:", error);
            } finally {
                setLoading(false);
            }
        };

        // ── MAGIA MATEMÁTICA EN EL FRONTEND ──
        // Calcula la comisión de un solo ticket leyendo sus detalles
        const calcularComision = (detalles: any[] = []) => {
            return detalles.reduce((total, det) => {
                const nombreProducto = (det.producto?.nombre || '').toLowerCase();
                const vendidas = Number(det.cantidad_vendida) || 0;

                if (nombreProducto.includes('pin')) {
                    return total + (vendidas * 6.50); // $6.50 por Pin
                }
                if (nombreProducto.includes('sticker')) {
                    return total + (vendidas * 2.00); // $2.00 por Sticker
                }
                return total;
            }, 0);
        };

        // Cálculos globales rápidos para el vendedor
        const deudaTotal = comprobantes.reduce((sum, c) => sum + Number(c.diferencia_corte), 0);
        const ventasHistoricas = comprobantes.reduce((sum, c) => sum + Number(c.dinero_esperado), 0);

        // Sumamos la comisión calculada de cada ticket para el total global
        const comisionesHistoricas = comprobantes.reduce((sum, c) => sum + calcularComision(c.detalles), 0);

        return (
            <div className="cat-root">
            <UserGreeting />

            {/* ENCABEZADO */}
            <div className="cat-header mb-6">
            <div className="cat-header-text">
            <h1>Mis Finanzas y Comprobantes</h1>
            <p>Revisa el historial de tus cortes de caja y liquidaciones.</p>
            </div>
            </div>

            {/* TARJETAS DE RESUMEN GLOBAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border-[3px] border-[#1a0060] rounded-2xl p-4 flex items-center gap-4 shadow-[4px_4px_0px_#1a0060]">
            <div className="w-12 h-12 rounded-xl bg-[#cc55ff]/10 flex items-center justify-center text-[#cc55ff]">
            <Calculator size={24} />
            </div>
            <div>
            <p className="text-[10px] font-syne font-bold uppercase text-[#1a0060]/50 tracking-wider">Ventas Acumuladas</p>
            <p className="font-black text-xl text-[#1a0060]">${ventasHistoricas.toFixed(2)}</p>
            </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border-[3px] border-[#1a0060] rounded-2xl p-4 flex items-center gap-4 shadow-[4px_4px_0px_#1a0060]">
            <div className="w-12 h-12 rounded-xl bg-[#06d6a0]/10 flex items-center justify-center text-[#06d6a0]">
            <Wallet size={24} />
            </div>
            <div>
            <p className="text-[10px] font-syne font-bold uppercase text-[#1a0060]/50 tracking-wider">Tus Comisiones</p>
            <p className="font-black text-xl text-[#1a0060]">${comisionesHistoricas.toFixed(2)}</p>
            </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`bg-white border-[3px] rounded-2xl p-4 flex items-center gap-4 shadow-[4px_4px_0px] ${deudaTotal > 0 ? 'border-[#ff5050] shadow-[#ff5050]' : 'border-[#1a0060] shadow-[#1a0060]'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${deudaTotal > 0 ? 'bg-[#ff5050]/10 text-[#ff5050]' : 'bg-[#1a0060]/10 text-[#1a0060]'}`}>
            <Receipt size={24} />
            </div>
            <div>
            <p className={`text-[10px] font-syne font-bold uppercase tracking-wider ${deudaTotal > 0 ? 'text-[#ff5050]/60' : 'text-[#1a0060]/50'}`}>Adeudo Actual</p>
            <p className={`font-black text-xl ${deudaTotal > 0 ? 'text-[#ff5050]' : 'text-[#1a0060]'}`}>${deudaTotal.toFixed(2)}</p>
            </div>
            </motion.div>
            </div>

            {/* TABLA DE HISTORIAL DE CORTES */}
            <motion.div className="cat-card flex-1 min-h-0 flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="cat-card-header shrink-0">
            <div className="cat-card-header-left">
            <span className="cat-card-title uppercase font-black text-[#1a0060] tracking-widest text-sm flex items-center gap-2">
            <Receipt size={16}/> Historial de Comprobantes
            </span>
            <span className="cat-count-badge font-bold">{comprobantes.length} Tickets</span>
            </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {loading ? (
                <div className="h-full flex flex-col justify-center items-center text-[#1a0060]/40">
                <Loader2 className="animate-spin mb-2" size={32}/> Cargando tu información...
                </div>
            ) : !vendedorId ? (
                <div className="h-full flex flex-col justify-center items-center text-[#ff5050] font-syne font-bold text-center">
                🚨 Error: No se encontró tu perfil de vendedor vinculado.
                </div>
            ) : comprobantes.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-[#1a0060]/40 font-syne font-bold text-center py-10">
                <Wallet size={48} className="mb-4 opacity-20"/>
                Aún no tienes cortes registrados en el sistema.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comprobantes.map(c => {
                    // Calculamos la comisión solo para esta tarjeta
                    const miComision = calcularComision(c.detalles);

                    return (
                        <div key={c.id_corte} className={`bg-white border-2 rounded-2xl p-4 shadow-sm transition-all ${c.diferencia_corte > 0 ? 'border-[#ff5050]/20 hover:border-[#ff5050]' : 'border-[#1a0060]/10 hover:border-[#cc55ff]'}`}>
                        <div className="flex justify-between items-start mb-4 border-b border-dashed border-[#1a0060]/10 pb-3">
                        <div>
                        <h4 className="font-syne font-black text-sm text-[#1a0060]">Folio #C-{c.id_corte}</h4>
                        <span className="text-[10px] font-bold text-[#1a0060]/40">{new Date(c.fecha_corte).toLocaleString('es-MX')}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-md font-black uppercase ${c.diferencia_corte > 0 ? 'bg-[#ff5050]/10 text-[#ff5050]' : 'bg-[#06d6a0]/10 text-[#06d6a0]'}`}>
                        {c.diferencia_corte > 0 ? 'Adeudo Restante' : 'Liquidado'}
                        </span>
                        </div>

                        <div className="space-y-2 text-xs font-medium">
                        <div className="flex justify-between items-center">
                        <span className="text-[#1a0060]/60">Total Vendido</span>
                        <span className="font-bold text-[#1a0060]">${Number(c.dinero_esperado).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-[#1a0060]/60">Tu Comisión</span>
                        {/* 👇 Aquí imprimimos el cálculo mágico */}
                        <span className="font-bold text-[#00b4d8]">${miComision.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-[#1a0060]/60">Entregaste</span>
                        <span className="font-bold text-[#06d6a0]">${Number(c.dinero_total_entregado).toFixed(2)}</span>
                        </div>
                        </div>

                        {c.diferencia_corte > 0 && (
                            <div className="mt-3 bg-[#ff5050]/5 border border-[#ff5050]/20 rounded-xl p-2 flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase text-[#ff5050]/70">Por liquidar</span>
                            <span className="font-black text-sm text-[#ff5050]">${Number(c.diferencia_corte).toFixed(2)}</span>
                            </div>
                        )}

                        {c.observaciones && (
                            <div className="mt-3 pt-3 border-t border-[#1a0060]/5 text-[10px] text-[#1a0060]/50 italic">
                            📝 {c.observaciones}
                            </div>
                        )}
                        </div>
                    );
                })}
                </div>
            )}
            </div>
            </motion.div>
            </div>
        );
}
