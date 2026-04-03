import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    FlatList, ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import {
    Wallet, PackageOpen, X, RefreshCw, AlertTriangle,
    AlertCircle, Pencil, ChevronDown,
} from 'lucide-react-native';
import ActionModal from '@/components/ui/ActionModal';
import type { ActionType } from '@/components/ui/ActionModal';
import ModalAutorizacion from '@/components/ui/ModalAutorizacion';
import { createCorte, updateCorte } from '@/services/corte.service';
import { getAsignaciones, updateAsignacion } from '@/services/asignacion.service';
import { Colors } from '@/constants/Colors';

interface ModalCorteProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    corteAEditar?: any | null;
}

export default function ModalCorte({ isOpen, onClose, onSuccess, corteAEditar }: ModalCorteProps) {
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
        isOpen: boolean; type: ActionType; title: string; subtitle: string;
        description?: string; onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        if (isOpen) {
            cargarAsignaciones();
            if (corteAEditar) {
                setDineroEntregado(corteAEditar.dinero_total_entregado);
                setObservaciones(corteAEditar.observaciones || '');
                setAsigSel({
                    id_asignacion: corteAEditar.asignacion?.id_asignacion,
                    vendedor: corteAEditar.vendedor,
                });

                const detallesEdit = corteAEditar.detalles.map((d: any) => ({
                    id_det_corte: d.id_det_corte,
                    producto_id: d.producto.id_producto,
                    nombre: d.producto.nombre,
                    precio_unitario: Number(d.producto.precio_unitario) || 0,
                    cantidad_vendida: d.cantidad_vendida,
                    cantidad_devuelta: d.cantidad_devuelta,
                    merma_reportada: d.merma_reportada,
                    cantidad_asignada: d.cantidad_vendida + d.cantidad_devuelta + d.merma_reportada,
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
        } catch (error) {
            console.error(error);
        }
    };

    const handleSeleccionarAsignacion = (asig: any) => {
        setAsigSel(asig);
        setShowAsigDrop(false);
        setErrorMsg('');
        if (asig) {
            setDetallesInventario(
                asig.detalles.map((d: any) => ({
                    producto_id: d.producto.id_producto || d.producto_id,
                    nombre: d.producto.nombre,
                    precio_unitario: Number(d.producto.precio_unitario) || 0,
                    cantidad_asignada: d.cantidad_asignada,
                    cantidad_vendida: 0,
                    cantidad_devuelta: d.cantidad_asignada,
                    merma_reportada: 0,
                })),
            );
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
        let vend = campo === 'cantidad_vendida' ? val : Number(nuevos[index].cantidad_vendida) || 0;
        let dev = campo === 'cantidad_devuelta' ? val : Number(nuevos[index].cantidad_devuelta) || 0;

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

    const calculosFinancieros = detallesInventario.reduce(
        (acc, det) => {
            const vendidas = Number(det.cantidad_vendida) || 0;
            const ventaBruta = vendidas * det.precio_unitario;
            const esSticker = det.nombre.toLowerCase().includes('sticker');
            const comisionUnitaria = esSticker ? 2 : 6.5;
            const comisionTotal = vendidas * comisionUnitaria;
            return { bruto: acc.bruto + ventaBruta, comision: acc.comision + comisionTotal };
        },
        { bruto: 0, comision: 0 },
    );

    const dineroEsperadoNeto = calculosFinancieros.bruto - calculosFinancieros.comision;
    const diferencia = dineroEntregado !== '' ? Number(dineroEntregado) - dineroEsperadoNeto : null;
    const hayDiferencia = diferencia !== null && Math.abs(diferencia) > 0.009;
    const puedeGuardar = asigSel && dineroEntregado !== '';

    const ejecutarGuardarCorte = async () => {
        setGuardandoCorte(true);
        setErrorMsg('');
        try {
            const payload = {
                ...(corteAEditar && { id_corte: corteAEditar.id_corte }),
                vendedor_id: asigSel.vendedor.id_vendedor,
                asignacion_id: asigSel.id_asignacion,
                dinero_esperado: Number(dineroEsperadoNeto.toFixed(2)),
                dinero_total_entregado: Number(dineroEntregado),
                diferencia_corte: Number((Number(dineroEntregado) - dineroEsperadoNeto).toFixed(2)),
                observaciones,
                detalles: detallesInventario.map(d => ({
                    ...(corteAEditar && { corte_id: corteAEditar.id_corte }),
                    ...(d.id_det_corte && { id_det_corte: d.id_det_corte }),
                    producto_id: d.producto_id,
                    cantidad_vendida: Number(d.cantidad_vendida || 0),
                    cantidad_devuelta: Number(d.cantidad_devuelta || 0),
                    merma_reportada: Number(d.merma_reportada || 0),
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
            setErrorMsg(e.message.replace('GraphQL error: ', '') || 'Error al conectar con la base de datos.');
        } finally {
            setGuardandoCorte(false);
            setAuthModalOpen(false);
        }
    };

    const handleGuardarCorteClick = () => {
        setErrorMsg('');
        if (!puedeGuardar) {
            setErrorMsg('Debes ingresar el Efectivo Recibido para poder continuar.');
            return;
        }
        if (hayDiferencia) {
            setAuthModalOpen(true);
        } else {
            ejecutarGuardarCorte();
        }
    };

    const resetCorteForm = () => {
        setAsigSel(null);
        setDineroEntregado('');
        setObservaciones('');
        setDetallesInventario([]);
        setShowAsigDrop(false);
        setErrorMsg('');
        setAuthModalOpen(false);
    };

    return (
        <Modal transparent visible={isOpen} animationType="slide" onRequestClose={onClose}>
            <View style={s.overlay}>
                <View style={s.modal}>
                    {/* ── Header ── */}
                    <View style={s.dragBar}>
                        <View style={s.dragLeft}>
                            <View style={s.dragIcon}>
                                {corteAEditar
                                    ? <Pencil size={18} color={Colors.azulMarino} />
                                    : <Wallet size={18} color={Colors.azulMarino} />
                                }
                            </View>
                            <View>
                                <Text style={s.dragTitle}>
                                    {corteAEditar ? 'Editar Conciliacion' : 'Nueva Conciliacion'}
                                </Text>
                                <Text style={s.dragSub}>Liquidacion de inventario y efectivo</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                            <X size={16} color="rgba(26,0,96,0.5)" />
                        </TouchableOpacity>
                    </View>

                    {/* ── Body ── */}
                    <ScrollView style={s.body} contentContainerStyle={s.bodyContent} keyboardShouldPersistTaps="handled">
                        {/* Selector de Asignacion */}
                        <View style={s.sectionGray}>
                            <View style={s.fieldLabel}>
                                <PackageOpen size={16} color={Colors.azulMarino} />
                                <Text style={s.fieldLabelText}>Folio de Asignacion</Text>
                            </View>

                            {corteAEditar ? (
                                <View style={s.selectDisabled}>
                                    <Text style={s.selectDisabledText}>
                                        Folio #{corteAEditar.asignacion?.id_asignacion} — {corteAEditar.vendedor?.nombre_completo}
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[s.selectTrigger, showAsigDrop && s.selectTriggerActive]}
                                        onPress={() => setShowAsigDrop(v => !v)}
                                    >
                                        <Text style={asigSel ? s.selectText : s.selectPlaceholder}>
                                            {asigSel
                                                ? `Folio #${asigSel.id_asignacion} — ${asigSel.vendedor.nombre_completo}`
                                                : 'Seleccione folio activo...'}
                                        </Text>
                                        <ChevronDown size={15} color="rgba(26,0,96,0.35)" />
                                    </TouchableOpacity>

                                    {showAsigDrop && (
                                        <View style={s.dropPanel}>
                                            <FlatList
                                                data={asignacionesActivas}
                                                keyExtractor={item => String(item.id_asignacion)}
                                                style={{ maxHeight: 180 }}
                                                keyboardShouldPersistTaps="handled"
                                                ListEmptyComponent={
                                                    <Text style={s.dropEmpty}>Sin asignaciones activas</Text>
                                                }
                                                renderItem={({ item }) => {
                                                    const selected = asigSel?.id_asignacion === item.id_asignacion;
                                                    return (
                                                        <TouchableOpacity
                                                            style={[s.dropItem, selected && s.dropItemSel]}
                                                            onPress={() => handleSeleccionarAsignacion(item)}
                                                        >
                                                            <Text style={[s.dropItemText, selected && { fontWeight: '700', color: Colors.azulMarino }]}>
                                                                Folio #{item.id_asignacion} — {item.vendedor.nombre_completo}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                }}
                                            />
                                        </View>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Desglose de Inventario */}
                        {asigSel && (
                            <>
                                <View style={s.inventoryCard}>
                                    <View style={s.inventoryHeader}>
                                        <PackageOpen size={16} color={Colors.verdeExito} />
                                        <Text style={s.inventoryHeaderText}>Desglose de Inventario</Text>
                                    </View>

                                    {/* Column Headers */}
                                    <View style={s.invColHeaders}>
                                        <Text style={[s.invColHeaderText, { flex: 1, textAlign: 'left' }]}>Producto</Text>
                                        <Text style={[s.invColHeaderText, { width: 46 }]}>Asig.</Text>
                                        <Text style={[s.invColHeaderText, { width: 60, color: '#3b82f6' }]}>Vendido</Text>
                                        <Text style={[s.invColHeaderText, { width: 60, color: Colors.verdeExito }]}>Devuelto</Text>
                                        <Text style={[s.invColHeaderText, { width: 50, color: Colors.rojoPeligro }]}>Merma</Text>
                                    </View>

                                    <FlatList
                                        data={detallesInventario}
                                        keyExtractor={(_, idx) => String(idx)}
                                        scrollEnabled={false}
                                        renderItem={({ item, index }) => (
                                            <View style={[s.invRow, index % 2 === 1 && s.invRowEven]}>
                                                <Text style={s.invProductName} numberOfLines={1}>{item.nombre}</Text>
                                                <Text style={s.invAsigText}>{item.cantidad_asignada}</Text>
                                                <TextInput
                                                    keyboardType="number-pad"
                                                    value={String(item.cantidad_vendida)}
                                                    onChangeText={t => actualizarDetalle(index, 'cantidad_vendida', t)}
                                                    style={[s.invInput, s.invInputBlue]}
                                                />
                                                <TextInput
                                                    keyboardType="number-pad"
                                                    value={String(item.cantidad_devuelta)}
                                                    onChangeText={t => actualizarDetalle(index, 'cantidad_devuelta', t)}
                                                    style={[s.invInput, s.invInputGreen]}
                                                />
                                                <TextInput
                                                    keyboardType="number-pad"
                                                    value={String(item.merma_reportada)}
                                                    editable={false}
                                                    style={[s.invInput, s.invInputRed]}
                                                />
                                            </View>
                                        )}
                                    />
                                </View>

                                {/* Financial cards */}
                                <View style={s.moneyGrid}>
                                    <View style={[s.moneyCard, s.moneyGray]}>
                                        <Text style={s.moneyLabel}>Venta Bruta</Text>
                                        <Text style={[s.moneyValue, { color: Colors.gris800 }]}>
                                            ${calculosFinancieros.bruto.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={[s.moneyCard, s.moneyRed]}>
                                        <Text style={[s.moneyLabel, { color: Colors.rojoPeligro }]}>Comision</Text>
                                        <Text style={[s.moneyValue, { color: '#dc2626' }]}>
                                            - ${calculosFinancieros.comision.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={[s.moneyCard, s.moneyGreen]}>
                                        <Text style={[s.moneyLabel, { color: '#0a8060' }]}>A Entregar</Text>
                                        <Text style={[s.moneyValue, { color: Colors.verdeExito }]}>
                                            ${dineroEsperadoNeto.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={[s.moneyCard, s.moneyPurple]}>
                                        <Text style={[s.moneyLabel, { color: '#8833cc' }]}>Recibido</Text>
                                        <TextInput
                                            keyboardType="decimal-pad"
                                            placeholder="$ 0.00"
                                            placeholderTextColor="#b9a0d4"
                                            value={dineroEntregado === '' ? '' : String(dineroEntregado)}
                                            onChangeText={t => setDineroEntregado(t === '' ? '' : Number(t))}
                                            style={s.moneyInput}
                                        />
                                    </View>
                                </View>

                                {/* Error */}
                                {errorMsg !== '' && (
                                    <View style={s.errorBanner}>
                                        <AlertCircle size={18} color="#ef4444" />
                                        <Text style={s.errorBannerText}>{errorMsg}</Text>
                                    </View>
                                )}

                                {/* Observaciones */}
                                <TextInput
                                    multiline
                                    placeholder="Observaciones (Ej. El vendedor perdio un pin...)"
                                    placeholderTextColor={Colors.gris400}
                                    value={observaciones}
                                    onChangeText={setObservaciones}
                                    style={s.textArea}
                                />
                            </>
                        )}
                    </ScrollView>

                    {/* ── Footer ── */}
                    <View style={s.footer}>
                        <TouchableOpacity
                            style={[s.saveBtn, (guardandoCorte || !asigSel) && s.saveBtnDisabled]}
                            disabled={guardandoCorte || !asigSel}
                            onPress={handleGuardarCorteClick}
                            activeOpacity={0.8}
                        >
                            {guardandoCorte ? (
                                <View style={s.saveBtnContent}>
                                    <RefreshCw size={16} color={Colors.amarilloAccento} />
                                    <Text style={s.saveBtnText}>Guardando...</Text>
                                </View>
                            ) : (
                                <Text style={s.saveBtnText}>
                                    {corteAEditar ? 'Guardar Cambios' : 'Finalizar y Guardar Corte'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ActionModal
                isOpen={actionModal.isOpen}
                type={actionModal.type}
                title={actionModal.title}
                subtitle={actionModal.subtitle}
                description={actionModal.description}
                onClose={() => setActionModal(p => ({ ...p, isOpen: false }))}
                onConfirm={actionModal.onConfirm}
            />

            <ModalAutorizacion
                isOpen={authModalOpen}
                esFaltante={diferencia !== null && diferencia < 0}
                monto={diferencia !== null ? Math.abs(diferencia).toFixed(2) : '0.00'}
                vendedor={asigSel?.vendedor?.nombre_completo || ''}
                onConfirm={ejecutarGuardarCorte}
                onClose={() => setAuthModalOpen(false)}
            />
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(26,0,96,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    modal: {
        backgroundColor: Colors.blanco,
        borderWidth: 3,
        borderColor: Colors.azulMarino,
        borderRadius: 22,
        width: '100%',
        maxWidth: 700,
        maxHeight: '95%',
        elevation: 10,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        overflow: 'hidden',
    },
    dragBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 18, paddingVertical: 12,
        borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.1)',
        backgroundColor: 'rgba(237,233,254,0.6)',
    },
    dragLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    dragIcon: {
        width: 36, height: 36, borderRadius: 11,
        backgroundColor: 'rgba(26,0,96,0.1)', borderWidth: 1.5, borderColor: 'rgba(26,0,96,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    dragTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.8 },
    dragSub: { fontSize: 10, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 1 },
    closeBtn: {
        width: 32, height: 32, borderRadius: 9,
        borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)',
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center', alignItems: 'center',
    },
    body: { flex: 1 },
    bodyContent: { padding: 16, gap: 16 },
    sectionGray: {
        backgroundColor: Colors.gris100, borderWidth: 2, borderColor: Colors.gris200,
        borderRadius: 12, padding: 16,
    },
    fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    fieldLabelText: { fontWeight: '900', fontSize: 12, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 2 },
    selectDisabled: {
        padding: 12, backgroundColor: Colors.gris100,
        borderWidth: 2, borderColor: 'rgba(26,0,96,0.2)', borderRadius: 12,
    },
    selectDisabledText: { fontWeight: '700', color: Colors.azulMarino, fontSize: 14 },
    selectTrigger: {
        padding: 12, backgroundColor: Colors.blanco,
        borderWidth: 2, borderColor: 'rgba(26,0,96,0.2)', borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    selectTriggerActive: { borderColor: Colors.moradoAccento },
    selectText: { fontWeight: '700', color: Colors.azulMarino, fontSize: 14 },
    selectPlaceholder: { fontWeight: '500', color: Colors.gris400, fontSize: 14 },
    dropPanel: {
        marginTop: 6, backgroundColor: Colors.blanco,
        borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 14,
        overflow: 'hidden',
        elevation: 8, shadowColor: Colors.azulMarino,
        shadowOffset: { width: 5, height: 5 }, shadowOpacity: 0.3, shadowRadius: 0,
    },
    dropEmpty: { padding: 16, textAlign: 'center', fontSize: 12, fontWeight: '600', color: 'rgba(26,0,96,0.35)' },
    dropItem: {
        paddingHorizontal: 14, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.05)',
    },
    dropItemSel: { backgroundColor: Colors.amarilloAccento },
    dropItemText: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.8)' },
    inventoryCard: {
        backgroundColor: Colors.blanco, borderRadius: 12,
        borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', overflow: 'hidden',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
    },
    inventoryHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: Colors.azulMarino, padding: 12,
    },
    inventoryHeaderText: {
        fontWeight: '900', fontSize: 12, textTransform: 'uppercase',
        letterSpacing: 2, color: Colors.blanco,
    },
    invColHeaders: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.gris100, paddingVertical: 8, paddingHorizontal: 12,
        borderBottomWidth: 2, borderBottomColor: Colors.gris200,
    },
    invColHeaderText: {
        fontWeight: '900', fontSize: 10, textTransform: 'uppercase',
        color: Colors.azulMarino, textAlign: 'center',
    },
    invRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 8, paddingHorizontal: 12,
        borderBottomWidth: 1, borderBottomColor: Colors.gris100,
        backgroundColor: Colors.blanco,
    },
    invRowEven: { backgroundColor: '#fafafa' },
    invProductName: { flex: 1, fontWeight: '700', fontSize: 12, color: Colors.gris800 },
    invAsigText: { width: 46, textAlign: 'center', fontWeight: '900', fontSize: 13, color: Colors.gris400 },
    invInput: {
        width: 54, textAlign: 'center', borderWidth: 1, borderRadius: 8,
        paddingVertical: 4, paddingHorizontal: 4, fontWeight: '700', fontSize: 13, marginHorizontal: 3,
    },
    invInputBlue: { backgroundColor: Colors.blanco, borderColor: '#93c5fd', color: '#1e40af' },
    invInputGreen: { backgroundColor: Colors.blanco, borderColor: '#86efac', color: '#166534' },
    invInputRed: { backgroundColor: Colors.gris100, borderColor: '#fca5a5', color: '#991b1b' },
    moneyGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    },
    moneyCard: {
        flex: 1, minWidth: '45%', borderRadius: 12, padding: 12,
        borderWidth: 2, alignItems: 'center',
    },
    moneyGray: { backgroundColor: Colors.gris100, borderColor: Colors.gris200 },
    moneyRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    moneyGreen: { backgroundColor: 'rgba(6,214,160,0.1)', borderColor: 'rgba(6,214,160,0.3)' },
    moneyPurple: { backgroundColor: '#faf5ff', borderColor: 'rgba(204,85,255,0.3)' },
    moneyLabel: {
        fontWeight: '900', fontSize: 9, textTransform: 'uppercase',
        letterSpacing: 1.5, color: Colors.gris500, marginBottom: 4,
    },
    moneyValue: { fontWeight: '900', fontSize: 18 },
    moneyInput: {
        fontWeight: '900', fontSize: 18, color: Colors.moradoAccento,
        textAlign: 'center', width: '100%', padding: 0,
    },
    errorBanner: {
        backgroundColor: '#fef2f2', borderWidth: 1.5, borderColor: '#fca5a5',
        borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    errorBannerText: { fontSize: 12, fontWeight: '600', color: '#991b1b', flex: 1, lineHeight: 18 },
    textArea: {
        backgroundColor: Colors.gris100, borderWidth: 2, borderColor: Colors.gris200,
        borderRadius: 12, padding: 16, fontWeight: '500', fontSize: 14,
        color: Colors.azulMarino, minHeight: 80, textAlignVertical: 'top',
    },
    footer: {
        padding: 16, borderTopWidth: 2, borderTopColor: Colors.gris200,
        backgroundColor: Colors.blanco,
    },
    saveBtn: {
        width: '100%', backgroundColor: Colors.azulMarino,
        borderRadius: 12, paddingVertical: 16,
        elevation: 4, shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 0,
        alignItems: 'center', justifyContent: 'center',
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    saveBtnText: {
        fontWeight: '900', fontSize: 14, textTransform: 'uppercase',
        letterSpacing: 2, color: Colors.amarilloAccento, textAlign: 'center',
    },
});
