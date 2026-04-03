import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserGreeting from '../components/ui/UserGreeting';
import ActionModal from '../components/ui/ActionModal';
import type { ActionType } from '../components/ui/ActionModal';
import { getPedidos, updateEstadoPedido, deletePedido } from '../services/pedido.service';
import {
    Search, ClipboardList, Check, X as XIcon, Trash2, Loader2, PackageOpen, CalendarClock
} from 'lucide-react';
import '../styles/Catalogos.css';

export default function PedidosAdmin() {
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [actionModal, setActionModal] = useState<{
        isOpen: boolean; type: ActionType; title: string; subtitle: string; description?: string; itemName?: string; onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        setLoading(true);
        try {
            const data = await getPedidos();
            setPedidos(data.sort((a: any, b: any) => b.id_pedido - a.id_pedido));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarEntregado = (pedido: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete',
            title: 'Entregar Pedido', subtitle: `¿Marcar pedido #${pedido.id_pedido} como entregado?`,
            description: `Asegúrate de haber cobrado el restante de $${(pedido.monto_total - pedido.anticipo).toFixed(2)}.`,
                       itemName: `Cliente: ${pedido.cliente?.nombre || 'General'}`,
                       onConfirm: async () => {
                           await updateEstadoPedido(pedido.id_pedido, 'Entregado');
                           await cargarPedidos();
                           setActionModal({ isOpen: true, type: 'success', title: '¡Entregado!', subtitle: 'El pedido ha sido completado.' });
                           setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
                       }
        });
    };

    const handleCancelar = (pedido: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete',
            title: 'Cancelar Pedido', subtitle: `¿Cancelar el pedido #${pedido.id_pedido}?`,
            description: 'El pedido será marcado como Cancelado. Esta acción no se puede deshacer.',
            itemName: `Cliente: ${pedido.cliente?.nombre || 'General'}`,
            onConfirm: async () => {
                await updateEstadoPedido(pedido.id_pedido, 'Cancelado');
                await cargarPedidos();
                setActionModal({ isOpen: true, type: 'success-delete', title: 'Pedido Cancelado', subtitle: 'El pedido fue cancelado correctamente.' });
                setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
            }
        });
    };

    const handleDelete = (pedido: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete',
            title: 'Eliminar Pedido', subtitle: '¿Eliminar este registro?',
            description: 'Se borrará por completo de la base de datos.',
            itemName: `Pedido #${pedido.id_pedido}`,
            onConfirm: async () => {
                await deletePedido(pedido.id_pedido);
                await cargarPedidos();
                setActionModal({ isOpen: true, type: 'success-delete', title: 'Eliminado', subtitle: 'El pedido fue borrado del sistema.' });
                setTimeout(() => setActionModal(prev => ({ ...prev, isOpen: false })), 2000);
            }
        });
    };

    const pedidosFiltrados = pedidos.filter(p =>
    String(p.id_pedido).includes(search) ||
    (p.cliente?.nombre_completo || '').toLowerCase().includes(search.toLowerCase()) ||
    p.estado.toLowerCase().includes(search.toLowerCase())
    );

    const getEstadoColor = (estado: string) => {
        if (estado === 'Pendiente') return 'bg-[#ffe144] text-[#1a0060]';
        if (estado === 'Entregado') return 'bg-[#06d6a0] text-white';
        if (estado === 'Cancelado') return 'bg-[#ff5050] text-white';
        return 'bg-gray-200 text-gray-700';
    };

    return (
        <div className="cat-root">
        <UserGreeting />

        <div className="cat-header">
        <div className="cat-header-text">
        <h1>Pedidos (Apartados)</h1>
        <p>Gestiona los pedidos de los clientes, sus anticipos y fechas de entrega.</p>
        </div>
        </div>

        <motion.div className="cat-card mt-6" initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}>
        <div className="cat-card-header">
        <div className="cat-card-header-left">
        <span className="cat-card-title-icon"><ClipboardList size={16} /></span>
        <span className="cat-card-title">Lista de Pedidos</span>
        <span className="cat-count-badge">{pedidosFiltrados.length} registros</span>
        </div>

        <div className="cat-card-header-right">
        <div className="cat-search-wrap">
        <Search size={13} />
        <input className="cat-search-input" placeholder="Buscar por cliente, ID o estado..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} className="bg-transparent border-none cursor-pointer text-[#1a0060]/30"><XIcon size={12} /></button>}
        </div>
        </div>
        </div>

        <div className="cat-table-scroll p-4">
        {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#1a0060]/40 font-syne font-bold gap-3">
            <Loader2 size={32} className="animate-spin" /> Cargando pedidos...
            </div>
        ) : pedidosFiltrados.length === 0 ? (
            <div className="py-12 text-center text-[#1a0060]/50 font-syne font-bold">No hay pedidos para mostrar.</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {pedidosFiltrados.map(pedido => {
                const restante = Number(pedido.monto_total) - Number(pedido.anticipo);

                return (
                    <div key={pedido.id_pedido} className="bg-white border-2 border-[#1a0060]/10 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-[4px_4px_0px_rgba(26,0,96,0.1)] transition-all">
                    <div>
                    <div className="flex justify-between items-start mb-3">
                    <div>
                    <h3 className="font-syne font-black text-lg text-[#1a0060]">Pedido #{pedido.id_pedido}</h3>
                    <p className="text-xs font-bold text-[#1a0060]/50">{new Date(pedido.fecha_pedido).toLocaleDateString('es-MX')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-syne font-black uppercase tracking-wider ${getEstadoColor(pedido.estado)}`}>
                    {pedido.estado}
                    </span>
                    </div>

                    <p className="text-sm font-bold text-[#cc55ff] mb-2 flex items-center gap-2">
                     {
                        pedido.cliente?.nombre_completo ? `Cliente: ${pedido.cliente.nombre}` :
                        pedido.vendedor?.nombre_completo ? `Vendedor: ${pedido.vendedor.nombre_completo}` :
                        'Mostrador'
                    }
                    </p>
                    {pedido.fecha_entrega_estimada && (
                        <p className="text-xs font-bold text-[#06d6a0] mb-4 flex items-center gap-1 bg-[#06d6a0]/10 w-fit px-2 py-1 rounded-md">
                        <CalendarClock size={14}/> Entrega: {new Date(pedido.fecha_entrega_estimada).toLocaleDateString('es-MX')}
                        </p>
                    )}

                    {/* Finanzas del Pedido */}
                    <div className="flex justify-between items-center bg-[#faf5ff] border border-[#d4b8f0] rounded-xl p-3 mb-4">
                    <div className="text-center">
                    <span className="block text-[9px] uppercase font-bold text-[#1a0060]/50">Total</span>
                    <span className="font-syne font-black text-sm text-[#1a0060]">${Number(pedido.monto_total).toFixed(2)}</span>
                    </div>
                    <div className="w-px h-6 bg-[#d4b8f0]"></div>
                    <div className="text-center">
                    <span className="block text-[9px] uppercase font-bold text-[#1a0060]/50">Anticipo</span>
                    <span className="font-syne font-black text-sm text-[#06d6a0]">${Number(pedido.anticipo).toFixed(2)}</span>
                    </div>
                    <div className="w-px h-6 bg-[#d4b8f0]"></div>
                    <div className="text-center">
                    <span className="block text-[9px] uppercase font-bold text-[#1a0060]/50">Resta</span>
                    <span className="font-syne font-black text-sm text-[#ff5050]">${restante.toFixed(2)}</span>
                    </div>
                    </div>

                    {/* Lista de productos */}
                    <div className="bg-[#f8f9fa] rounded-xl p-3 mb-4 max-h-[100px] overflow-y-auto scrollbar-thin">
                    <h4 className="text-[10px] font-syne font-bold uppercase text-[#1a0060]/60 mb-2 flex items-center gap-1"><PackageOpen size={12}/> Productos</h4>
                    {pedido.detalles.map((det: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs font-medium text-[#1a0060] border-b border-[#1a0060]/5 py-1.5 last:border-0">
                        <span className="truncate pr-2">{det.producto?.nombre}</span>
                        <div className="flex items-center gap-2">
                        <span className="text-[#1a0060]/50">${det.precio_unitario}</span>
                        <span className="font-black shrink-0 text-[#cc55ff]">x{det.cantidad}</span>
                        </div>
                        </div>
                    ))}
                    </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 mt-auto pt-2 border-t border-[#1a0060]/10">
                    {pedido.estado === 'Pendiente' && (
                        <>
                        <button onClick={() => handleMarcarEntregado(pedido)} className="flex-1 bg-[#06d6a0]/10 text-[#06d6a0] hover:bg-[#06d6a0] hover:text-white border border-[#06d6a0]/20 rounded-xl py-2 flex justify-center items-center gap-1 transition-colors text-xs font-bold">
                        <Check size={14}/> Entregado
                        </button>
                        <button onClick={() => handleCancelar(pedido)} className="flex-1 bg-[#ff5050]/10 text-[#ff5050] hover:bg-[#ff5050] hover:text-white border border-[#ff5050]/20 rounded-xl py-2 flex justify-center items-center gap-1 transition-colors text-xs font-bold">
                        <XIcon size={14}/> Cancelar
                        </button>
                        </>
                    )}
                    <button onClick={() => handleDelete(pedido)} className="bg-[#FFEAEF] text-[#ff5050] hover:bg-[#ff5050] hover:text-white border border-[#ff5050]/20 rounded-xl px-3 py-2 flex justify-center items-center transition-colors ml-auto">
                    <Trash2 size={14}/>
                    </button>
                    </div>
                    </div>
                )})}
                </div>
        )}
        </div>
        </motion.div>

        <ActionModal
        isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle} description={actionModal.description} itemName={actionModal.itemName} onClose={() => setActionModal({ ...actionModal, isOpen: false })} onConfirm={actionModal.onConfirm}
        />
        </div>
    );
}
