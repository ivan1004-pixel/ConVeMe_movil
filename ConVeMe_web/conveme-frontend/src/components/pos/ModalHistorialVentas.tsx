import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
    X, Receipt, Trash2, Search, Loader2,
    TrendingUp, ShoppingBag, CreditCard, Banknote,
    GripHorizontal, AlertTriangle, RefreshCw, Check,
    ChevronDown, Filter, User, Pencil, Save
} from 'lucide-react';
import { getVentas, deleteVenta, updateVenta } from '../../services/venta.service';

// ── IMPORTACIÓN DE IMÁGENES (Ajusta la extensión si es .svg o .jpeg) ──
import mascotaImg from '../../assets/mascota.jpg';
import logoImg from '../../assets/logob.png';

interface ModalHistorialProps {
    isOpen:  boolean;
    onClose: () => void;
}

type DeleteStep = 'idle' | 'confirming' | 'deleting' | 'done';

/* ── payment method label + style ── */
const METODO_STYLES: Record<string, { bg: string; color: string; icon: JSX.Element; label: string }> = {
    efectivo:    { bg: 'rgba(6,214,160,0.12)',  color: '#05b589', icon: <Banknote   size={11} />, label: 'Efectivo'    },
    tarjeta:     { bg: 'rgba(204,85,255,0.12)', color: '#9b30cc', icon: <CreditCard size={11} />, label: 'Tarjeta'     },
    transferencia:{ bg: 'rgba(3,1,255,0.1)',    color: '#0301ff', icon: <TrendingUp size={11} />, label: 'Transferencia'},
};
const metodoStyle = (m: string) =>
METODO_STYLES[m?.toLowerCase()] ?? { bg: 'rgba(26,0,96,0.07)', color: '#1a0060', icon: <Receipt size={11} />, label: m ?? '—' };

export default function ModalHistorialVentas({ isOpen, onClose }: ModalHistorialProps) {
    const dragControls = useDragControls();

    const [ventas,     setVentas]     = useState<any[]>([]);
    const [loading,    setLoading]    = useState(false);
    const [search,     setSearch]     = useState('');
    const [filterMetodo, setFilterMetodo] = useState('todos');
    const [showFilter,   setShowFilter]   = useState(false);

    /* ── Ticket Seleccionado (Flujo de Detalles/Edición) ── */
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [editMetodo, setEditMetodo] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    /* delete flow */
    const [deleteStep,   setDeleteStep]   = useState<DeleteStep>('idle');

    useEffect(() => {
        if (isOpen) { cargarVentas(); setSearch(''); setFilterMetodo('todos'); setSelectedTicket(null); }
    }, [isOpen]);

    const cargarVentas = async () => {
        setLoading(true);
        try {
            const data = await getVentas();
            setVentas(data.sort((a: any, b: any) => b.id_venta - a.id_venta));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleTicketClick = (venta: any) => {
        setSelectedTicket(venta);
        setEditMetodo(venta.metodo_pago || 'Efectivo');
        setDeleteStep('idle');
    };

    const closeTicketView = () => {
        setSelectedTicket(null);
        setDeleteStep('idle');
    };

    const handleSaveEdit = async () => {
        if (!selectedTicket) return;
        setSavingEdit(true);
        try {
            await updateVenta({ id_venta: selectedTicket.id_venta, metodo_pago: editMetodo });
            await cargarVentas();
            setSelectedTicket({ ...selectedTicket, metodo_pago: editMetodo });
        } catch (e) { console.error(e); }
        finally { setSavingEdit(false); }
    };

    const handleConfirmDelete = async () => {
        if (!selectedTicket) return;
        setDeleteStep('deleting');
        try {
            await deleteVenta(selectedTicket.id_venta);
            await cargarVentas();
            setDeleteStep('done');
            setTimeout(() => { closeTicketView(); }, 1500); // Se cierra solo después de borrar
        } catch (e) { console.error(e); setDeleteStep('idle'); }
    };

    const formatFecha = (s: string) => {
        if (!s) return '—';
        return new Date(s).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    /* ── Stats ── */
    const stats = useMemo(() => {
        const total   = ventas.reduce((s, v) => s + Number(v.monto_total || 0), 0);
        const byMetodo: Record<string, number> = {};
        ventas.forEach(v => { const m = (v.metodo_pago || 'otro').toLowerCase(); byMetodo[m] = (byMetodo[m] || 0) + 1; });
        return { total, count: ventas.length, byMetodo };
    }, [ventas]);

    /* ── Filtered ventas ── */
    const metodos = useMemo(() => ['todos', ...Array.from(new Set(ventas.map(v => (v.metodo_pago || '').toLowerCase())))], [ventas]);

    const ventasFiltradas = useMemo(() =>
    ventas.filter(v => {
        const matchSearch  = String(v.id_venta).includes(search) || (v.vendedor?.nombre_completo || '').toLowerCase().includes(search.toLowerCase()) || (v.cliente?.nombre_completo || '').toLowerCase().includes(search.toLowerCase());
        const matchMetodo  = filterMetodo === 'todos' || (v.metodo_pago || '').toLowerCase() === filterMetodo;
        return matchSearch && matchMetodo;
    }),
    [ventas, search, filterMetodo]
    );

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

            .mhv-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-start; justify-content: center; padding: 20px 12px; font-family: 'DM Sans', sans-serif; overflow-y: auto; }
            .mhv-backdrop { position: fixed; inset: 0; background: rgba(26,0,96,0.45); backdrop-filter: blur(6px); }
            .mhv-modal { position: relative; z-index: 2; background: #fff; border: 3px solid #1a0060; border-radius: 22px; width: 100%; max-width: 1000px; box-shadow: 6px 6px 0px #1a0060; display: flex; flex-direction: column; max-height: calc(100dvh - 40px); margin: 0 auto; overflow: hidden; }

            .mhv-drag { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-bottom: 2px solid rgba(26,0,96,0.1); background: rgba(237,233,254,0.6); cursor: grab; flex-shrink: 0; user-select: none; }
            .mhv-drag:active { cursor: grabbing; }
            .mhv-drag-left   { display: flex; align-items: center; gap: 10px; pointer-events: none; }
            .mhv-drag-icon   { width: 36px; height: 36px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(204,85,255,0.12); border: 1.5px solid rgba(204,85,255,0.2); color: #cc55ff; }
            .mhv-drag-title  { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px; color: #1a0060; text-transform: uppercase; letter-spacing: .05em; line-height: 1.1; }
            .mhv-drag-sub    { font-size: 10px; font-weight: 500; color: rgba(26,0,96,0.45); display: block; margin-top: 1px; }
            .mhv-drag-right  { display: flex; align-items: center; gap: 6px; }
            .mhv-close-btn { width: 32px; height: 32px; border-radius: 9px; border: 2px solid rgba(26,0,96,0.15); background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(26,0,96,0.5); pointer-events: auto; transition: background .18s, color .18s, border-color .18s; }
            .mhv-close-btn:hover { background: #ff5050; color: #fff; border-color: #ff5050; }

            .mhv-stats { display: flex; gap: 0; border-bottom: 2px solid rgba(26,0,96,0.08); flex-shrink: 0; overflow-x: auto; scrollbar-width: none; }
            .mhv-stat { flex: 1; min-width: 120px; display: flex; flex-direction: column; padding: 12px 18px; border-right: 1.5px solid rgba(26,0,96,0.07); }
            .mhv-stat:last-child { border-right: none; }
            .mhv-stat-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: rgba(26,0,96,0.38); margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }
            .mhv-stat-value { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 20px; color: #1a0060; line-height: 1; }
            .mhv-stat-value.green  { color: #06d6a0; }
            .mhv-stat-value.purple { color: #cc55ff; }

            .mhv-toolbar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 2px solid rgba(26,0,96,0.07); background: rgba(237,233,254,0.25); flex-shrink: 0; flex-wrap: wrap; }
            .mhv-search-wrap { flex: 1; min-width: 180px; display: flex; align-items: center; gap: 8px; background: #fff; border: 2px solid #d4b8f0; border-radius: 10px; padding: 7px 12px; transition: border-color .18s, box-shadow .18s; }
            .mhv-search-wrap:focus-within { border-color: #cc55ff; box-shadow: 0 0 0 3px rgba(204,85,255,0.12); }
            .mhv-search-wrap svg { color: rgba(26,0,96,0.3); flex-shrink: 0; }
            .mhv-search-input { flex: 1; border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #1a0060; }
            .mhv-search-input::placeholder { color: rgba(26,0,96,0.3); }

            .mhv-filter-wrap { position: relative; }
            .mhv-filter-btn { display: flex; align-items: center; gap: 7px; background: #fff; border: 2px solid #d4b8f0; border-radius: 10px; padding: 7px 14px; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: rgba(26,0,96,0.6); transition: border-color .18s, box-shadow .18s; white-space: nowrap; }
            .mhv-filter-btn:hover, .mhv-filter-btn.open { border-color: #cc55ff; box-shadow: 0 0 0 3px rgba(204,85,255,0.1); color: #1a0060; }

            .mhv-refresh-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: #1a0060; color: #ffe144; border: 2px solid #1a0060; border-radius: 10px; padding: 7px 14px; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; text-transform: uppercase; transition: transform .12s, box-shadow .12s; }
            .mhv-refresh-btn:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0px rgba(26,0,96,0.3); }

            .mhv-filter-dropdown { position: absolute; top: calc(100% + 6px); right: 0; min-width: 180px; background: #fff; border: 2.5px solid #1a0060; border-radius: 14px; box-shadow: 5px 5px 0px #1a0060; overflow: hidden; z-index: 10; }
            .mhv-filter-item { display: flex; align-items: center; gap: 8px; padding: 10px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: rgba(26,0,96,0.75); border-bottom: 1px solid rgba(26,0,96,0.05); transition: background .13s; }
            .mhv-filter-item:hover { background: rgba(204,85,255,0.07); }
            .mhv-filter-item.active { background: #ffe144; font-weight: 700; color: #1a0060; }
            .mhv-count { background: rgba(204,85,255,0.1); border: 1.5px solid rgba(204,85,255,0.2); border-radius: 8px; padding: 3px 10px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; color: #cc55ff; white-space: nowrap; }

            .mhv-body { flex: 1; overflow-y: auto; padding: 16px 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 18px; scrollbar-width: thin; scrollbar-color: rgba(204,85,255,0.3) transparent; background: rgba(237,233,254,0.2); align-content: flex-start; }
            .mhv-body::-webkit-scrollbar        { width: 8px; }
            .mhv-body::-webkit-scrollbar-thumb { background: rgba(204,85,255,0.4); border-radius: 6px; }

            .mhv-ticket { background: #fff; border: 3px solid #1a0060; border-radius: 20px; overflow: hidden; transition: all .2s; display: flex; flex-direction: column; box-shadow: 4px 4px 0px rgba(26,0,96,0.15); cursor: pointer; }
            .mhv-ticket:hover { border-color: #cc55ff; box-shadow: 6px 6px 0px #cc55ff; transform: translate(-2px, -2px); }

            .mhv-ticket-top { display: flex; justify-content: space-between; padding: 14px 18px; background: #faf5ff; border-bottom: 2px solid rgba(26,0,96,0.08); gap: 10px; }
            .mhv-ticket-info { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }
            .mhv-ticket-id { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 18px; color: #1a0060; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
            .mhv-ticket-id-num { font-size: 14px; font-weight: 800; color: rgba(26,0,96,0.4); font-family: 'DM Sans', sans-serif; }
            .mhv-metodo-chip { display: inline-flex; align-items: center; gap: 5px; border-radius: 8px; padding: 4px 10px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; border: 1.5px solid transparent; }

            .mhv-people { font-size: 12.5px; font-weight: 600; color: rgba(26,0,96,0.7); display: flex; flex-direction: column; gap: 3px; }
            .mhv-people .highlight { color: #cc55ff; font-weight: 800; }
            .mhv-people .client-highlight { color: #00b4d8; font-weight: 800; }

            .mhv-money { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; justify-content: center; }
            .mhv-total-label { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: rgba(26,0,96,0.4); text-align: right; margin-bottom: 2px; }
            .mhv-total-value { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 26px; color: #06d6a0; line-height: 1; text-shadow: 1px 1px 0px rgba(0,0,0,0.1); }

            .mhv-products { padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto; scrollbar-width: thin; background: #fff; border-bottom: 2px solid rgba(26,0,96,0.08); }
            .mhv-product-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 10px; background: rgba(237,233,254,0.3); border: 1.5px solid rgba(26,0,96,0.05); font-size: 13px; }
            .mhv-product-name { font-weight: 700; color: rgba(26,0,96,0.85); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 10px; }
            .mhv-product-qty  { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 12px; color: #cc55ff; background: rgba(204,85,255,0.15); border-radius: 6px; padding: 3px 8px; margin-right: 10px; border: 1px solid rgba(204,85,255,0.2); }
            .mhv-product-price{ font-family: 'Syne', sans-serif; font-weight: 900; font-size: 14px; color: #1a0060; }

            .mhv-ticket-bottom { padding: 10px 18px; background: #fff; text-align: center; display: flex; justify-content: space-between; align-items: center;}
            .mhv-date { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: rgba(26,0,96,0.4); }
            .mhv-open-btn { font-size: 10px; font-weight: 800; color: #fff; background: #1a0060; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: .05em; }

            .mhv-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; gap: 12px; text-align: center; grid-column: 1 / -1; }
            .mhv-empty-icon { width: 64px; height: 64px; border-radius: 20px; background: rgba(204,85,255,0.07); border: 2px solid rgba(204,85,255,0.12); display: flex; align-items: center; justify-content: center; color: rgba(204,85,255,0.5); margin-bottom: 4px; }
            .mhv-empty-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 18px; color: #1a0060; }
            .mhv-empty-sub   { font-size: 14px; font-weight: 500; color: rgba(26,0,96,0.5); max-width: 280px; line-height: 1.5; }

            @keyframes mhv-spin { to { transform: rotate(360deg); } }
            .mhv-spinner { animation: mhv-spin 1s linear infinite; }

            /* ── MINI-MODAL DESLIZABLE DE DETALLE DE TICKET ── */
            .mhv-detail-overlay { position: fixed; inset: 0; background: rgba(26,0,96,0.5); backdrop-filter: blur(5px); z-index: 150; display: flex; align-items: flex-end; justify-content: center; padding: 0; }

            /* AQUÍ ESTÁ LA MAGIA DEL POSITION RELATIVE PARA EL MODAL DESLIZABLE */
            .mhv-detail-card { position: relative; background: #f3f0ff; border: 3px solid #1a0060; border-bottom: none; border-radius: 30px 30px 0 0; width: 100%; max-width: 450px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0px -10px 40px rgba(0,0,0,0.2); max-height: 90vh; }

            .mhv-detail-drag-handle { width: 100%; display: flex; justify-content: center; padding: 12px 0; background: #fff; cursor: grab; border-bottom: 2px dashed rgba(26,0,96,0.1); }
            .mhv-detail-drag-handle:active { cursor: grabbing; }
            .mhv-pill { width: 50px; height: 6px; background: rgba(26,0,96,0.2); border-radius: 10px; }

            .mhv-detail-scroll { overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; scrollbar-width: none; }

            /* TICKET REALISTA */
            .mhv-real-ticket { background: #fff; padding: 24px; border-radius: 12px; border: 2px dashed #d4b8f0; position: relative; display: flex; flex-direction: column; box-shadow: inset 0 0 20px rgba(204,85,255,0.05); }
            .mhv-real-ticket::before, .mhv-real-ticket::after { content: ''; position: absolute; left: -10px; top: 50%; width: 20px; height: 20px; background: #f3f0ff; border-radius: 50%; border-right: 2px solid #d4b8f0; transform: translateY(-50%); }
            .mhv-real-ticket::after { left: auto; right: -10px; border-right: none; border-left: 2px solid #d4b8f0; }

            .mhv-rt-logo { width: 120px; margin: 0 auto 15px; display: block; filter: drop-shadow(0px 2px 0px rgba(0,0,0,0.1)); }
            .mhv-rt-header { text-align: center; border-bottom: 2px dashed rgba(26,0,96,0.15); padding-bottom: 15px; margin-bottom: 15px; }
            .mhv-rt-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 16px; color: #1a0060; letter-spacing: .05em; margin-bottom: 5px; }
            .mhv-rt-date { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; color: rgba(26,0,96,0.5); text-transform: uppercase; }

            .mhv-rt-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; border-bottom: 2px dashed rgba(26,0,96,0.15); padding-bottom: 15px; }
            .mhv-rt-item { display: flex; justify-content: space-between; font-family: 'DM Sans', monospace; font-size: 13px; font-weight: 600; color: #1a0060; }

            .mhv-rt-total { display: flex; justify-content: space-between; align-items: center; font-family: 'Syne', sans-serif; color: #1a0060; margin-bottom: 20px; }
            .mhv-rt-total-lbl { font-weight: 800; font-size: 14px; text-transform: uppercase; }
            .mhv-rt-total-val { font-weight: 900; font-size: 28px; }

            .mhv-rt-info { background: rgba(237,233,254,0.4); padding: 12px; border-radius: 8px; font-size: 11px; font-weight: 700; color: rgba(26,0,96,0.6); display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px; }
            .mhv-rt-info span { display: flex; justify-content: space-between; }
            .mhv-rt-info strong { color: #1a0060; }

            .mhv-rt-mascot { width: 70px; height: 70px; border-radius: 50%; border: 3px solid #cc55ff; margin: 0 auto 10px; display: block; object-fit: cover; }
            .mhv-rt-thanks { text-align: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: #cc55ff; text-transform: uppercase; }

            /* Acciones en Mini-modal */
            .mhv-edit-select { width: 100%; background: #fff; border: 2.5px solid #d4b8f0; border-radius: 12px; padding: 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; color: #1a0060; outline: none; cursor: pointer; transition: border-color .2s; margin-bottom: 10px;}
            .mhv-edit-select:focus { border-color: #cc55ff; box-shadow: 0 0 0 3px rgba(204,85,255,0.15); }

            .mhv-btn-save-edit { width: 100%; background: #06d6a0; border: 2.5px solid #1a0060; border-radius: 12px; padding: 14px; font-family: 'Syne', sans-serif; font-weight: 900; font-size: 13px; text-transform: uppercase; color: #1a0060; cursor: pointer; box-shadow: 3px 3px 0px #1a0060; transition: transform .12s, box-shadow .12s; display: flex; align-items: center; justify-content: center; gap: 8px; }
            .mhv-btn-save-edit:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 5px 5px 0px #1a0060; }

            .mhv-btn-delete-zone { width: 100%; background: #fff; border: 2.5px dashed rgba(255,80,80,0.4); border-radius: 12px; padding: 14px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; text-transform: uppercase; color: #ff5050; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; }
            .mhv-btn-delete-zone:hover { background: #ff5050; color: #fff; border-style: solid; border-color: #1a0060; box-shadow: 3px 3px 0px #1a0060; }

            /* Pantalla de confirmación de borrado (AHORA SI RESTRINGIDA AL PADRE) */
            .mhv-confirm-screen { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; padding: 40px 24px; z-index: 60; border-radius: 28px 28px 0 0; }
            .mhv-screen-icon { width: 72px; height: 72px; border-radius: 22px; display: flex; align-items: center; justify-content: center; }
            .mhv-screen-title { font-family: 'Syne', sans-serif; font-weight: 900; font-size: 20px; color: #1a0060; }
            .mhv-screen-sub   { font-size: 13px; font-weight: 500; color: rgba(26,0,96,0.6); max-width: 280px; line-height: 1.55; }
            .mhv-confirm-btns { display: flex; gap: 10px; width: 100%; max-width: 320px; margin-top: 4px; box-sizing: border-box;}
            .mhv-btn-cancel { flex: 1; background: #fff; border: 2.5px solid rgba(26,0,96,0.18); border-radius: 12px; padding: 12px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; text-transform: uppercase; color: rgba(26,0,96,0.5); cursor: pointer; transition: background .18s, color .18s; }
            .mhv-btn-cancel:hover { background: rgba(26,0,96,0.05); color: #1a0060; }
            .mhv-btn-delete-confirm { flex: 1; background: #ff5050; border: 2.5px solid #1a0060; border-radius: 12px; padding: 12px; font-family: 'Syne', sans-serif; font-weight: 900; font-size: 12px; text-transform: uppercase; color: #fff; cursor: pointer; box-shadow: 3px 3px 0px #1a0060; transition: transform .12s, box-shadow .12s; display: flex; align-items: center; justify-content: center; gap: 6px; }
            .mhv-btn-delete-confirm:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 5px 5px 0px #1a0060; }
            `}</style>

            <AnimatePresence>
            {isOpen && (
                <div className="mhv-overlay">
                <motion.div className="mhv-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

                <motion.div className="mhv-modal" drag dragControls={dragControls} dragListener={false} dragMomentum={false} initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 24 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}>

                {/* ── Drag handle / header ── */}
                <div className="mhv-drag" onPointerDown={e => dragControls.start(e)} style={{ touchAction: 'none' }}>
                <div className="mhv-drag-left">
                <div className="mhv-drag-icon"><Receipt size={18} /></div>
                <div><p className="mhv-drag-title">Historial de Ventas</p><span className="mhv-drag-sub">Haz clic en un ticket para ver los detalles</span></div>
                </div>
                <div className="mhv-drag-right">
                <GripHorizontal size={16} style={{ color: 'rgba(26,0,96,0.25)' }} />
                <button className="mhv-close-btn" onClick={onClose} onPointerDown={e => e.stopPropagation()} type="button"><X size={16} /></button>
                </div>
                </div>

                {/* ── Stats strip ── */}
                {!loading && ventas.length > 0 && (
                    <motion.div className="mhv-stats" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="mhv-stat"><span className="mhv-stat-label"><ShoppingBag size={10} /> Total ventas</span><span className="mhv-stat-value purple">{ventas.length}</span></div>
                    <div className="mhv-stat"><span className="mhv-stat-label"><TrendingUp size={10} /> Monto total</span><span className="mhv-stat-value green">${stats.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    {Object.entries(stats.byMetodo).slice(0, 3).map(([m, cnt]) => {
                        const s = metodoStyle(m);
                        return <div key={m} className="mhv-stat"><span className="mhv-stat-label" style={{ color: s.color }}>{s.icon} {s.label}</span><span className="mhv-stat-value" style={{ color: s.color }}>{cnt as number}</span></div>
                    })}
                    </motion.div>
                )}

                {/* ── Toolbar ── */}
                <div className="mhv-toolbar">
                <div className="mhv-search-wrap"><Search size={14} /><input className="mhv-search-input" placeholder="Buscar por ID, vendedor o cliente..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <div className="mhv-filter-wrap">
                <button className={`mhv-filter-btn${showFilter ? ' open' : ''}`} onClick={() => setShowFilter(v => !v)}>
                <Filter size={13} /> {filterMetodo === 'todos' ? 'Método' : filterMetodo} <ChevronDown size={12} style={{ transition: 'transform .2s', transform: showFilter ? 'rotate(180deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                {showFilter && (
                    <motion.div className="mhv-filter-dropdown" initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: .16 }}>
                    {metodos.map(m => {
                        const s = m === 'todos' ? null : metodoStyle(m);
                        return <div key={m} className={`mhv-filter-item${filterMetodo === m ? ' active' : ''}`} onClick={() => { setFilterMetodo(m); setShowFilter(false); }}>
                        {s ? <span style={{ color: s.color, display: 'flex' }}>{s.icon}</span> : <Receipt size={11} />} {m === 'todos' ? 'Todos los métodos' : s?.label ?? m} {filterMetodo === m && <Check size={12} style={{ marginLeft: 'auto' }} />}
                        </div>
                    })}
                    </motion.div>
                )}
                </AnimatePresence>
                </div>
                {/* Botón de Actualizar Lista */}
                <button className="mhv-refresh-btn" onClick={cargarVentas} disabled={loading}>
                <RefreshCw size={13} className={loading ? 'mhv-spinner' : ''} />
                Actualizar
                </button>
                <span className="mhv-count" style={{ marginLeft: 'auto' }}>{ventasFiltradas.length} resultados</span>
                </div>

                {/* ── List body ── */}
                <div className="mhv-body">
                {loading ? (
                    <div className="mhv-empty"><Loader2 size={32} className="mhv-spinner" style={{ color: '#cc55ff' }} /><p className="mhv-empty-title">Cargando historial...</p></div>
                ) : ventasFiltradas.length === 0 ? (
                    <div className="mhv-empty"><div className="mhv-empty-icon"><Receipt size={28} /></div><p className="mhv-empty-title">{search || filterMetodo !== 'todos' ? 'Sin resultados' : 'Sin ventas aún'}</p><p className="mhv-empty-sub">{search || filterMetodo !== 'todos' ? 'Intenta cambiar los filtros de búsqueda.' : 'Aquí aparecerán los tickets una vez que se registren ventas.'}</p></div>
                ) : (
                    ventasFiltradas.map((venta, i) => {
                        const ms = metodoStyle(venta.metodo_pago);
                        return (
                            <motion.div key={venta.id_venta} className="mhv-ticket" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => handleTicketClick(venta)}>

                            {/* PISO 1: Info General y Totales */}
                            <div className="mhv-ticket-top">
                            <div className="mhv-ticket-info">
                            <div className="mhv-ticket-id">
                            Ticket <span className="mhv-ticket-id-num">#{venta.id_venta}</span>
                            <span className="mhv-metodo-chip" style={{ background: ms.bg, color: ms.color, borderColor: ms.color }}>{ms.icon} {ms.label}</span>
                            </div>
                            <div className="mhv-people">
                            <span><span className="highlight">Vendió:</span> {venta.vendedor?.nombre_completo || 'N/A'}</span>
                            <span><span className="client-highlight">Cliente:</span> {venta.cliente?.nombre_completo || 'Público General'}</span>
                            </div>
                            </div>
                            <div className="mhv-money">
                            <span className="mhv-total-label">Total</span>
                            <span className="mhv-total-value">${Number(venta.monto_total).toFixed(2)}</span>
                            </div>
                            </div>

                            {/* PISO 2: Footer */}
                            <div className="mhv-ticket-bottom">
                            <span className="mhv-date">{formatFecha(venta.fecha_venta)}</span>
                            <span className="mhv-open-btn">Abrir</span>
                            </div>

                            </motion.div>
                        );
                    })
                )}
                </div>
                </motion.div>
                </div>
            )}
            </AnimatePresence>

            {/* ── MINI-MODAL DESLIZABLE DE DETALLE DE TICKET ── */}
            <AnimatePresence>
            {selectedTicket && (
                <motion.div className="mhv-detail-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeTicketView}>
                <motion.div
                className="mhv-detail-card"
                onClick={e => e.stopPropagation()}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                    if (info.offset.y > 100) closeTicketView();
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                {/* Pill para deslizar */}
                <div className="mhv-detail-drag-handle"><div className="mhv-pill"></div></div>

                <div className="mhv-detail-scroll">

                {/* ── TICKET REALISTA ── */}
                <div className="mhv-real-ticket">
                <img src={logoImg} alt="Logo" className="mhv-rt-logo" onError={(e) => e.currentTarget.style.display = 'none'} />

                <div className="mhv-rt-header">
                <h3 className="mhv-rt-title">COMPROBANTE DE VENTA</h3>
                <p className="mhv-rt-date">TICKET #{selectedTicket.id_venta} • {formatFecha(selectedTicket.fecha_venta)}</p>
                </div>

                <div className="mhv-rt-items">
                {selectedTicket.detalles?.map((d: any, idx: number) => (
                    <div key={idx} className="mhv-rt-item">
                    <span>{d.cantidad}x {d.producto?.nombre}</span>
                    <span>${Number(d.precio_unitario * d.cantidad).toFixed(2)}</span>
                    </div>
                ))}
                </div>

                <div className="mhv-rt-total">
                <span className="mhv-rt-total-lbl">Total</span>
                <span className="mhv-rt-total-val">${Number(selectedTicket.monto_total).toFixed(2)}</span>
                </div>

                <div className="mhv-rt-info">
                <span>Método de Pago: <strong>{selectedTicket.metodo_pago || 'N/A'}</strong></span>
                <span>Le atendió: <strong>{selectedTicket.vendedor?.nombre_completo || 'N/A'}</strong></span>
                <span>Cliente: <strong>{selectedTicket.cliente?.nombre_completo || 'Mostrador'}</strong></span>
                </div>

                <img src={mascotaImg} alt="Mascota" className="mhv-rt-mascot" onError={(e) => e.currentTarget.style.display = 'none'} />
                <p className="mhv-rt-thanks">¡Gracias por tu compra!</p>
                </div>

                {/* ── FORMULARIO DE EDICIÓN RÁPIDA ── */}
                <div style={{ background: '#fff', border: '2px solid rgba(26,0,96,0.1)', borderRadius: '16px', padding: '16px' }}>
                <label style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '11px', color: '#1a0060', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Cambiar Método de Pago</label>
                <select className="mhv-edit-select" value={editMetodo} onChange={(e) => setEditMetodo(e.target.value)} disabled={savingEdit}>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                </select>
                <button className="mhv-btn-save-edit" onClick={handleSaveEdit} disabled={savingEdit || editMetodo === selectedTicket.metodo_pago}>
                {savingEdit ? <><RefreshCw size={16} className="mhv-spinner" /> Guardando...</> : <><Save size={16} /> Guardar Cambios</>}
                </button>
                </div>

                <button className="mhv-btn-delete-zone" onClick={() => setDeleteStep('confirming')}><Trash2 size={16}/> Eliminar este ticket</button>
                </div>

                {/* Pantalla de Confirmación de Borrado */}
                <AnimatePresence>
                {(deleteStep === 'confirming' || deleteStep === 'deleting' || deleteStep === 'done') && (
                    <motion.div className="mhv-confirm-screen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    {deleteStep !== 'done' ? (
                        <>
                        <div className="mhv-screen-icon" style={{ background: 'rgba(255,80,80,0.1)', border: '2px solid rgba(255,80,80,0.25)', color: '#ff5050' }}><AlertTriangle size={34} /></div>
                        <p className="mhv-screen-title">¿Seguro que deseas eliminarlo?</p>
                        <p className="mhv-screen-sub">Esta acción destruirá el registro de los productos vendidos y el monto cobrado.</p>
                        <div className="mhv-confirm-btns">
                        <button className="mhv-btn-cancel" onClick={() => setDeleteStep('idle')}>Cancelar</button>
                        <button className="mhv-btn-delete-confirm" onClick={handleConfirmDelete} disabled={deleteStep === 'deleting'}>{deleteStep === 'deleting' ? <><RefreshCw size={14} className="mhv-spinner" /> Borrando...</> : 'Sí, eliminar'}</button>
                        </div>
                        </>
                    ) : (
                        <>
                        <div className="mhv-screen-icon" style={{ background: 'rgba(6,214,160,0.12)', border: '2px solid rgba(6,214,160,0.25)', color: '#06d6a0' }}><Check size={34} /></div>
                        <p className="mhv-screen-title">Ticket eliminado</p>
                        </>
                    )}
                    </motion.div>
                )}
                </AnimatePresence>

                </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
            </>
    );
}
