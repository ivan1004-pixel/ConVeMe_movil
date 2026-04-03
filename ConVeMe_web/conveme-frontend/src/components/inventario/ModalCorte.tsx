import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Wallet, PackageOpen, X, GripHorizontal, RefreshCw, AlertTriangle, AlertCircle, Pencil } from 'lucide-react';
import ActionModal from '../ui/ActionModal';
import type { ActionType } from '../ui/ActionModal';
import ModalAutorizacion from '../ui/ModalAutorizacion';
import { createCorte, updateCorte } from '../../services/corte.service';
import { getAsignaciones, updateAsignacion } from '../../services/asignacion.service';

interface ModalCorteProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    corteAEditar?: any | null;
}

export default function ModalCorte({ isOpen, onClose, onSuccess, corteAEditar }: ModalCorteProps) {
    const dragControls = useDragControls();

    const [asignacionesActivas, setAsignacionesActivas] = useState<any[]>([]);
    const [asigSel, setAsigSel] = useState<any>(null);
    const [dineroEntregado, setDineroEntregado] = useState<number | ''>('');
    const [observaciones, setObservaciones] = useState('');
    const [detallesInventario, setDetallesInventario] = useState<any[]>([]);
    const [guardandoCorte, setGuardandoCorte] = useState(false);
    const [showAsigDrop, setShowAsigDrop] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const [actionModal, setActionModal] = useState<{
        isOpen: boolean; type: ActionType; title: string; subtitle: string; description?: string; onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        if (isOpen) {
            cargarAsignaciones();
            if (corteAEditar) {
                setDineroEntregado(corteAEditar.dinero_total_entregado);
                setObservaciones(corteAEditar.observaciones || '');
                setAsigSel({
                    id_asignacion: corteAEditar.asignacion?.id_asignacion,
                    vendedor: corteAEditar.vendedor
                });

                const detallesEdit = corteAEditar.detalles.map((d: any) => ({
                    id_det_corte: d.id_det_corte, // <-- Vital para que el backend lo actualice
                    producto_id: d.producto.id_producto,
                    nombre: d.producto.nombre,
                    precio_unitario: Number(d.producto.precio_unitario) || 0,
                                                                            cantidad_vendida: d.cantidad_vendida,
                                                                            cantidad_devuelta: d.cantidad_devuelta,
                                                                            merma_reportada: d.merma_reportada,
                                                                            cantidad_asignada: d.cantidad_vendida + d.cantidad_devuelta + d.merma_reportada
                }));
                setDetallesInventario(detallesEdit);
            }
        } else {
            resetCorteForm();
        }
    }, [isOpen, corteAEditar]);

    const cargarAsignaciones = async () => {
        try {
            const asigs = await getAsignaciones();
            setAsignacionesActivas(asigs.filter((a: any) => a.estado === 'Activa'));
        } catch (error) { console.error(error); }
    };

    const handleSeleccionarAsignacion = (asig: any) => {
        setAsigSel(asig);
        setShowAsigDrop(false);
        setErrorMsg('');
        if (asig) {
            setDetallesInventario(asig.detalles.map((d: any) => ({
                producto_id:       d.producto.id_producto || d.producto_id,
                nombre:            d.producto.nombre,
                precio_unitario:   Number(d.producto.precio_unitario) || 0,
                                                                 cantidad_asignada: d.cantidad_asignada,
                                                                 cantidad_vendida:  0,
                                                                 cantidad_devuelta: d.cantidad_asignada, // Todo devuelto por defecto
                                                                 merma_reportada:   0,
            })));
        } else {
            setDetallesInventario([]);
        }
        setDineroEntregado('');
    };

    const actualizarDetalle = (index: number, campo: string, valorStr: string) => {
        const nuevos = [...detallesInventario];
        setErrorMsg('');

        let val = valorStr === '' ? 0 : parseInt(valorStr);
        if (isNaN(val) || val < 0) val = 0;

        const asig = nuevos[index].cantidad_asignada;
        let vend = campo === 'cantidad_vendida' ? val : (Number(nuevos[index].cantidad_vendida) || 0);
        let dev = campo === 'cantidad_devuelta' ? val : (Number(nuevos[index].cantidad_devuelta) || 0);

        if (vend + dev > asig) {
            if (campo === 'cantidad_vendida') {
                dev = asig - vend;
                if (dev < 0) { vend = asig; dev = 0; }
            } else if (campo === 'cantidad_devuelta') {
                vend = asig - dev;
                if (vend < 0) { dev = asig; vend = 0; }
            }
        }

        nuevos[index][campo] = valorStr === '' ? '' : val;
        if (campo === 'cantidad_vendida') nuevos[index].cantidad_devuelta = dev;
        if (campo === 'cantidad_devuelta') nuevos[index].cantidad_vendida = vend;

        const vendReal = valorStr === '' && campo === 'cantidad_vendida' ? 0 : vend;
        const devReal = valorStr === '' && campo === 'cantidad_devuelta' ? 0 : dev;
        nuevos[index].merma_reportada = asig - vendReal - devReal;

        setDetallesInventario(nuevos);
    };

    const calculosFinancieros = detallesInventario.reduce((acc, det) => {
        const vendidas = Number(det.cantidad_vendida) || 0;
        const ventaBruta = vendidas * det.precio_unitario;
        const esSticker = det.nombre.toLowerCase().includes('sticker');
        const comisionUnitaria = esSticker ? 2 : 6.5;
        const comisionTotal = vendidas * comisionUnitaria;
        return { bruto: acc.bruto + ventaBruta, comision: acc.comision + comisionTotal };
    }, { bruto: 0, comision: 0 });

    const dineroEsperadoNeto = calculosFinancieros.bruto - calculosFinancieros.comision;
    const diferencia = dineroEntregado !== '' ? Number(dineroEntregado) - dineroEsperadoNeto : null;
    const hayDiferencia = diferencia !== null && Math.abs(diferencia) > 0.009;
    const puedeGuardar = asigSel && dineroEntregado !== '';

    const ejecutarGuardarCorte = async () => {
        setGuardandoCorte(true);
        setErrorMsg('');
        try {
            const payload = {
                // Si estamos editando, agregamos el id_corte en la raíz
                ...(corteAEditar && { id_corte: corteAEditar.id_corte }),
                vendedor_id:            asigSel.vendedor.id_vendedor,
                asignacion_id:          asigSel.id_asignacion,
                dinero_esperado:        Number(dineroEsperadoNeto.toFixed(2)),
                dinero_total_entregado: Number(dineroEntregado),
                diferencia_corte:       Number((Number(dineroEntregado) - dineroEsperadoNeto).toFixed(2)),
                observaciones,
                detalles: detallesInventario.map(d => ({
                    // 👇 AQUÍ ESTÁ LA SOLUCIÓN: FORZAMOS EL CORTE_ID EN CADA DETALLE 👇
                    ...(corteAEditar && { corte_id: corteAEditar.id_corte }),
                                                       ...(d.id_det_corte && { id_det_corte: d.id_det_corte }),
                                                       producto_id:       d.producto_id,
                                                       cantidad_vendida:  Number(d.cantidad_vendida || 0),
                                                       cantidad_devuelta: Number(d.cantidad_devuelta || 0),
                                                       merma_reportada:   Number(d.merma_reportada || 0),
                })),
            };

            if (corteAEditar) {
                await updateCorte(payload);
            } else {
                await createCorte(payload);
                await updateAsignacion({ id_asignacion: asigSel.id_asignacion, estado: 'Finalizado' });
            }

            onSuccess();
            resetCorteForm();
            onClose();
        } catch (e: any) {
            setErrorMsg(e.message.replace('GraphQL error: ', '') || "Error al conectar con la base de datos.");
        } finally {
            setGuardandoCorte(false);
            setAuthModalOpen(false); // Nos aseguramos de cerrar el modal de auth
        }
    };

    const handleGuardarCorteClick = () => {
        setErrorMsg('');
        if (!puedeGuardar) {
            setErrorMsg("Debes ingresar el Efectivo Recibido para poder continuar.");
            return;
        }

        if (hayDiferencia) {
            setAuthModalOpen(true); // Abrimos el modal con contraseña
        } else {
            ejecutarGuardarCorte();
        }
    };

    const resetCorteForm = () => {
        setAsigSel(null); setDineroEntregado(''); setObservaciones('');
        setDetallesInventario([]); setShowAsigDrop(false); setErrorMsg(''); setAuthModalOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="corte-overlay">
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
            .corte-overlay  { position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:10px 12px;font-family:'DM Sans',sans-serif;overflow-y:auto; }
            .corte-backdrop { position:fixed;inset:0;background:rgba(26,0,96,0.45);backdrop-filter:blur(6px); }
            .corte-modal    { position:relative;z-index:2;background:#fff;border:3px solid #1a0060;border-radius:22px;width:100%;max-width:700px;box-shadow:6px 6px 0px #1a0060;display:flex;flex-direction:column;max-height:calc(100dvh - 20px);margin:0 auto; }
            .corte-drag       { display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:2px solid rgba(26,0,96,0.1);background:rgba(237,233,254,0.6);border-radius:19px 19px 0 0;cursor:grab;flex-shrink:0;user-select:none; }
            .corte-drag:active{ cursor:grabbing; }
            .corte-drag-icon  { width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(26,0,96,0.1);border:1.5px solid rgba(26,0,96,0.15);color:#1a0060; }
            .corte-drag-title { font-family:'Syne',sans-serif;font-weight:900;font-size:14px;color:#1a0060;text-transform:uppercase;letter-spacing:.05em;line-height:1.1; }
            .corte-drag-sub   { font-size:10px;font-weight:500;color:rgba(26,0,96,0.45);display:block;margin-top:1px; }
            .corte-close-btn  { width:32px;height:32px;border-radius:9px;border:2px solid rgba(26,0,96,0.15);background:rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(26,0,96,0.5);transition:background .18s,color .18s,border-color .18s; }
            .corte-close-btn:hover{ background:#ff5050;color:#fff;border-color:#ff5050; }
            .corte-body    { flex:1;overflow-y:auto;padding:16px 18px;display:flex;flex-direction:column;gap:14px;scrollbar-width:thin;scrollbar-color:rgba(204,85,255,0.3) transparent; }
            .corte-section { background:rgba(237,233,254,0.3);border:1.5px solid rgba(26,0,96,0.08);border-radius:14px;padding:14px; }
            .corte-section-head { display:flex;align-items:center;gap:7px;font-family:'Syne',sans-serif;font-weight:800;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px; }
            .corte-label   { display:flex;align-items:center;gap:5px;font-family:'Syne',sans-serif;font-weight:700;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#1a0060;margin-bottom:6px; }
            .corte-label svg{ color:#cc55ff; }
            .corte-input   { width:100%;background:#faf5ff;border:2px solid #d4b8f0;border-radius:10px;padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#1a0060;outline:none;transition:border-color .18s,box-shadow .18s,background .18s;box-sizing:border-box; }
            .corte-input:focus{ border-color:#cc55ff;box-shadow:0 0 0 3px rgba(204,85,255,0.12),2px 2px 0px #1a0060;background:#fff; }
            .corte-input::placeholder{ color:#b9a0d4; }
            .corte-drop-trigger{ width:100%;background:#faf5ff;border:2px solid #d4b8f0;border-radius:10px;padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;outline:none;text-align:left;transition:border-color .18s,box-shadow .18s; }
            .corte-drop-trigger.open{ border-color:#cc55ff;box-shadow:0 0 0 3px rgba(204,85,255,0.12),2px 2px 0px #1a0060;background:#fff; }
            .corte-drop-trigger .ph{ color:#b9a0d4; }
            .corte-drop-panel{ position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:2.5px solid #1a0060;border-radius:14px;box-shadow:5px 5px 0px #1a0060;overflow:hidden;z-index:100; }
            .corte-drop-list { max-height:180px;overflow-y:auto;scrollbar-width:thin; }
            .corte-drop-item { display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:rgba(26,0,96,0.8);border-bottom:1px solid rgba(26,0,96,0.05);transition:background .13s; }
            .corte-drop-item:hover{ background:rgba(204,85,255,0.08); }
            .corte-drop-item.sel { background:#ffe144;font-weight:700;color:#1a0060; }
            .corte-money-grid{ display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px; }
            .corte-money-card{ border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:4px; }
            .corte-money-card .label{ font-family:'Syne',sans-serif;font-weight:700;font-size:9px;letter-spacing:.12em;text-transform:uppercase; }
            .corte-money-card .value{ font-family:'Syne',sans-serif;font-weight:900;font-size:20px;line-height:1; }
            .corte-inv-table{ width:100%;border-collapse:collapse; }
            .corte-inv-table thead tr{ background:#1a0060; }
            .corte-inv-table thead th{ padding:9px 12px;font-family:'Syne',sans-serif;font-weight:800;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,0.55);text-align:center;border-right:1px solid rgba(255,255,255,0.06);white-space:nowrap; }
            .corte-inv-table thead th:first-child{ color:#ffe144;text-align:left;width:35%; }
            .corte-inv-table tbody tr{ border-bottom:1.5px solid rgba(26,0,96,0.06);transition:background .13s; }
            .corte-inv-table tbody tr:nth-child(even){ background:rgba(237,233,254,0.25); }
            .corte-inv-table tbody tr:hover{ background:rgba(204,85,255,0.06); }
            .corte-inv-table tbody td{ padding:9px 12px;font-size:12.5px;font-weight:500;color:rgba(26,0,96,0.8);vertical-align:middle;text-align:center; }
            .corte-inv-table tbody td:first-child{ text-align:left;font-weight:600;color:#1a0060; }
            .corte-qty-input{ width:64px;text-align:center;background:#faf5ff;border:2px solid #d4b8f0;border-radius:8px;padding:5px 6px;font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:#1a0060;outline:none;transition:border-color .18s,box-shadow .18s; }
            .corte-qty-input:focus{ border-color:#cc55ff;box-shadow:0 0 0 3px rgba(204,85,255,0.12); }
            .corte-footer  { padding:12px 16px;border-top:2px solid rgba(26,0,96,0.08);background:rgba(237,233,254,0.4);border-radius:0 0 19px 19px;flex-shrink:0;display:flex;flex-direction:column;gap:8px; }
            .corte-save-btn{ width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:#1a0060;color:#ffe144;font-family:'Syne',sans-serif;font-weight:900;font-size:14px;letter-spacing:.1em;text-transform:uppercase;border:2.5px solid #1a0060;border-radius:14px;padding:15px;cursor:pointer;box-shadow:4px 4px 0px rgba(0,0,0,0.28);transition:transform .12s,box-shadow .12s; }
            .corte-save-btn:hover:not(:disabled) { transform:translate(-2px,-2px);box-shadow:6px 6px 0px rgba(0,0,0,0.28); }
            .corte-save-btn:active:not(:disabled){ transform:translate(2px,2px);box-shadow:2px 2px 0px rgba(0,0,0,0.22); }
            .corte-save-btn:disabled{ opacity:.55;cursor:not-allowed; }
            `}</style>

            <motion.div className="corte-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.div className="corte-modal" drag dragControls={dragControls} dragListener={false} dragMomentum={false} initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 24 }}>
            <div className="corte-drag" onPointerDown={e => dragControls.start(e)} style={{ touchAction: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'none' }}>
            <div className="corte-drag-icon">{corteAEditar ? <Pencil size={18} /> : <Wallet size={18} />}</div>
            <div>
            <p className="corte-drag-title">{corteAEditar ? 'Editar Conciliación' : 'Nueva Conciliación'}</p>
            <span className="corte-drag-sub">Liquidación de inventario y efectivo</span>
            </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <GripHorizontal size={16} style={{ color: 'rgba(26,0,96,0.25)' }} />
            <button className="corte-close-btn" onClick={onClose} onPointerDown={e => e.stopPropagation()} type="button"><X size={16} /></button>
            </div>
            </div>

            <div className="corte-body p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-4">
            <label className="flex items-center gap-2 font-black text-[#1a0060] uppercase text-xs tracking-widest mb-2"><PackageOpen size={16}/> Folio de Asignación</label>
            <select className="w-full p-3 border-2 border-[#1a0060]/20 rounded-xl font-bold text-[#1a0060] outline-none" disabled={!!corteAEditar} value={asigSel?.id_asignacion || ''} onChange={(e) => handleSeleccionarAsignacion(asignacionesActivas.find(a => a.id_asignacion === Number(e.target.value)))}>
            {corteAEditar ? (
                <option value={corteAEditar.asignacion?.id_asignacion}>Folio #{corteAEditar.asignacion?.id_asignacion} — {corteAEditar.vendedor?.nombre_completo}</option>
            ) : (
                <>
                <option value="">Seleccione folio activo...</option>
                {asignacionesActivas.map(a => <option key={a.id_asignacion} value={a.id_asignacion}>Folio #{a.id_asignacion} — {a.vendedor.nombre_completo}</option>)}
                </>
            )}
            </select>
            </div>

            {asigSel && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                <div className="bg-white rounded-xl border-2 border-[#1a0060]/10 overflow-hidden shadow-sm">
                <div className="bg-[#1a0060] text-white p-3 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <PackageOpen size={16} className="text-[#06d6a0]"/> Desglose de Inventario
                </div>
                <table className="w-full text-xs text-center">
                <thead className="bg-gray-100 text-[#1a0060] border-b-2 border-gray-200">
                <tr>
                <th className="p-3 text-left font-black uppercase">Producto</th>
                <th className="p-3 font-black uppercase">Asig.</th>
                <th className="p-3 font-black uppercase text-blue-600">Vendido</th>
                <th className="p-3 font-black uppercase text-green-600">Devuelto</th>
                <th className="p-3 font-black uppercase text-red-600">Merma</th>
                </tr>
                </thead>
                <tbody>
                {detallesInventario.map((det, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-left font-bold text-gray-800">{det.nombre}</td>
                    <td className="p-3 font-black text-gray-400 text-sm">{det.cantidad_asignada}</td>
                    <td className="p-2"><input type="number" min={0} className="w-full text-center bg-white border border-blue-300 text-blue-800 rounded-lg p-1.5 font-bold outline-none focus:ring-2 focus:ring-blue-500" value={det.cantidad_vendida} onChange={e => actualizarDetalle(idx, 'cantidad_vendida', e.target.value)} /></td>
                    <td className="p-2"><input type="number" min={0} className="w-full text-center bg-white border border-green-300 text-green-800 rounded-lg p-1.5 font-bold outline-none focus:ring-2 focus:ring-green-500" value={det.cantidad_devuelta} onChange={e => actualizarDetalle(idx, 'cantidad_devuelta', e.target.value)} /></td>
                    <td className="p-2"><input type="number" min={0} className="w-full text-center bg-gray-100 border border-red-200 text-red-800 rounded-lg p-1.5 font-bold outline-none" value={det.merma_reportada} readOnly title="Calculado automáticamente" /></td>
                    </tr>
                ))}
                </tbody>
                </table>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-center">
                <p className="font-black text-[10px] uppercase text-gray-500 mb-1 tracking-widest">Venta Bruta</p>
                <p className="font-black text-xl text-gray-800">${calculosFinancieros.bruto.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                <p className="font-black text-[10px] uppercase text-red-500 mb-1 tracking-widest">Comisión</p>
                <p className="font-black text-xl text-red-600">- ${calculosFinancieros.comision.toFixed(2)}</p>
                </div>
                <div className="bg-[#06d6a0]/10 border-2 border-[#06d6a0]/30 rounded-xl p-4 text-center">
                <p className="font-black text-[10px] uppercase text-[#0a8060] mb-1 tracking-widest">A Entregar</p>
                <p className="font-black text-xl text-[#06d6a0]">${dineroEsperadoNeto.toFixed(2)}</p>
                </div>
                <div className="bg-[#faf5ff] border-2 border-[#cc55ff]/30 rounded-xl p-4 text-center relative overflow-hidden">
                <p className="font-black text-[10px] uppercase text-[#8833cc] mb-1 tracking-widest">Recibido</p>
                <input type="number" className="w-full bg-transparent text-center font-black text-xl text-[#cc55ff] outline-none" placeholder="$ 0.00" value={dineroEntregado} onChange={e => setDineroEntregado(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                </div>

                <AnimatePresence>
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', lineHeight: 1.4 }}>{errorMsg}</p>
                    </motion.div>
                )}
                </AnimatePresence>

                <textarea className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 font-medium text-sm outline-none focus:border-[#1a0060]" placeholder="Observaciones (Ej. El vendedor perdió un pin...)" value={observaciones} onChange={e => setObservaciones(e.target.value)} />
                </motion.div>
            )}
            </div>

            <div className="bg-white p-4 border-t border-gray-200 mt-auto">
            <button className="w-full bg-[#1a0060] hover:bg-[#2a0080] text-[#ffe144] font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none" disabled={guardandoCorte || !asigSel} onClick={handleGuardarCorteClick}>
            {guardandoCorte ? <><RefreshCw className="animate-spin inline mr-2" size={16}/> Guardando...</> : (corteAEditar ? 'Guardar Cambios' : 'Finalizar y Guardar Corte')}
            </button>
            </div>
            </motion.div>

            <ActionModal isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle} description={actionModal.description} itemName={actionModal.itemName} onClose={() => setActionModal(p => ({...p, isOpen: false}))} onConfirm={actionModal.onConfirm} />

            <ModalAutorizacion
            isOpen={authModalOpen}
            esFaltante={diferencia !== null && diferencia < 0}
            monto={diferencia !== null ? Math.abs(diferencia).toFixed(2) : "0.00"}
            vendedor={asigSel?.vendedor?.nombre_completo || ""}
            onConfirm={ejecutarGuardarCorte}
            onClose={() => setAuthModalOpen(false)}
            />
            </div>
    );
}
