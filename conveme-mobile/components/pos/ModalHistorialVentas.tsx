import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, StyleSheet, ScrollView,
} from 'react-native';
import {
    X, Receipt, Trash2, Search, TrendingUp, ShoppingBag,
    CreditCard, Banknote, Save, Pencil,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { getVentas, deleteVenta, updateVenta } from '@/services/venta.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const formatFecha = (s: string) => {
    if (!s) return '—';
    return new Date(s).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const METODO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    efectivo: { bg: 'rgba(6,214,160,0.12)', color: '#05b589', label: 'Efectivo' },
    tarjeta: { bg: 'rgba(204,85,255,0.12)', color: '#9b30cc', label: 'Tarjeta' },
    transferencia: { bg: 'rgba(3,1,255,0.1)', color: '#0301ff', label: 'Transferencia' },
};
const metodoStyle = (m: string) => METODO_STYLES[m?.toLowerCase()] ?? { bg: 'rgba(26,0,96,0.07)', color: '#1a0060', label: m ?? '—' };

export default function ModalHistorialVentas({ isOpen, onClose }: Props) {
    const [ventas, setVentas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [editMetodo, setEditMetodo] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [showMetodoPicker, setShowMetodoPicker] = useState(false);

    useEffect(() => {
        if (isOpen) { cargarVentas(); setSearch(''); setSelectedTicket(null); }
    }, [isOpen]);

    const cargarVentas = async () => {
        setLoading(true);
        try {
            const data = await getVentas();
            setVentas(data.sort((a: any, b: any) => b.id_venta - a.id_venta));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const stats = useMemo(() => {
        const total = ventas.reduce((s, v) => s + Number(v.monto_total || 0), 0);
        return { total, count: ventas.length };
    }, [ventas]);

    const ventasFiltradas = useMemo(() =>
        ventas.filter(v => {
            const matchSearch = String(v.id_venta).includes(search) || (v.vendedor?.nombre_completo || '').toLowerCase().includes(search.toLowerCase());
            return matchSearch;
        }),
    [ventas, search]);

    const handleTicketClick = (venta: any) => {
        setSelectedTicket(venta);
        setEditMetodo(venta.metodo_pago || 'Efectivo');
        setShowMetodoPicker(false);
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

    const handleDeleteTicket = async () => {
        if (!selectedTicket) return;
        try {
            await deleteVenta(selectedTicket.id_venta);
            await cargarVentas();
            setSelectedTicket(null);
        } catch (e) { console.error(e); }
    };

    const renderTicket = useCallback(({ item }: { item: any }) => {
        const ms = metodoStyle(item.metodo_pago);
        return (
            <TouchableOpacity style={s.ticket} onPress={() => handleTicketClick(item)} data-testid={`ticket-${item.id_venta}`} activeOpacity={0.8}>
                <View style={s.ticketTop}>
                    <View style={{ flex: 1 }}>
                        <View style={s.ticketIdRow}>
                            <Text style={s.ticketTitle}>Ticket</Text>
                            <Text style={s.ticketIdNum}>#{item.id_venta}</Text>
                            <View style={[s.metodoBadge, { backgroundColor: ms.bg }]}>
                                <Text style={[s.metodoBadgeText, { color: ms.color }]}>{ms.label}</Text>
                            </View>
                        </View>
                        <Text style={s.ticketVendedor}>Vendio: {item.vendedor?.nombre_completo || 'N/A'}</Text>
                    </View>
                    <View style={s.ticketMoney}>
                        <Text style={s.ticketTotalLabel}>Total</Text>
                        <Text style={s.ticketTotalValue}>${Number(item.monto_total).toFixed(2)}</Text>
                    </View>
                </View>
                <View style={s.ticketBottom}>
                    <Text style={s.ticketDate}>{formatFecha(item.fecha_venta)}</Text>
                    <Text style={s.ticketOpenBtn}>Abrir</Text>
                </View>
            </TouchableOpacity>
        );
    }, []);

    if (!isOpen) return null;

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <View style={s.modal}>
                    {/* Header */}
                    <View style={s.header}>
                        <View style={s.headerIcon}><Receipt size={18} color={Colors.moradoAccento} /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.headerTitle}>Historial de Ventas</Text>
                            <Text style={s.headerSub}>Toca un ticket para ver detalles</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn} data-testid="modal-historial-close"><X size={16} color="rgba(26,0,96,0.5)" /></TouchableOpacity>
                    </View>

                    {/* Stats */}
                    {!loading && ventas.length > 0 && (
                        <View style={s.statsRow}>
                            <View style={s.statItem}>
                                <Text style={s.statLabel}>Ventas</Text>
                                <Text style={[s.statValue, { color: Colors.moradoAccento }]}>{stats.count}</Text>
                            </View>
                            <View style={s.statDivider} />
                            <View style={s.statItem}>
                                <Text style={s.statLabel}>Total</Text>
                                <Text style={[s.statValue, { color: Colors.verdeExito }]}>${stats.total.toFixed(2)}</Text>
                            </View>
                        </View>
                    )}

                    {/* Search */}
                    <View style={s.searchRow}>
                        <Search size={14} color="rgba(26,0,96,0.3)" />
                        <TextInput style={s.searchInput} placeholder="Buscar por ID o vendedor..." placeholderTextColor="rgba(26,0,96,0.3)" value={search} onChangeText={setSearch} data-testid="historial-search" />
                        {search !== '' && <TouchableOpacity onPress={() => setSearch('')}><X size={14} color="rgba(26,0,96,0.3)" /></TouchableOpacity>}
                        <View style={s.countBadge}><Text style={s.countText}>{ventasFiltradas.length}</Text></View>
                    </View>

                    {/* List */}
                    {loading ? (
                        <View style={s.loadingWrap}><ActivityIndicator size="large" color={Colors.moradoAccento} /><Text style={s.loadingText}>Cargando historial...</Text></View>
                    ) : (
                        <FlatList
                            data={ventasFiltradas}
                            renderItem={renderTicket}
                            keyExtractor={(item) => String(item.id_venta)}
                            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }}
                            ListEmptyComponent={
                                <View style={s.emptyWrap}><Receipt size={40} color="rgba(26,0,96,0.15)" /><Text style={s.emptyTitle}>Sin ventas</Text></View>
                            }
                        />
                    )}
                </View>

                {/* Detail modal */}
                {selectedTicket && (
                    <Modal transparent visible={true} animationType="slide" onRequestClose={() => setSelectedTicket(null)}>
                        <View style={s.detailOverlay}>
                            <View style={s.detailCard}>
                                <View style={s.detailPill} />
                                <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
                                    {/* Ticket info */}
                                    <View style={s.realTicket}>
                                        <Text style={s.rtTitle}>COMPROBANTE DE VENTA</Text>
                                        <Text style={s.rtDate}>Ticket #{selectedTicket.id_venta} - {formatFecha(selectedTicket.fecha_venta)}</Text>

                                        <View style={s.rtDivider} />
                                        {selectedTicket.detalles?.map((d: any, idx: number) => (
                                            <View key={idx} style={s.rtItemRow}>
                                                <Text style={s.rtItemName}>{d.cantidad}x {d.producto?.nombre}</Text>
                                                <Text style={s.rtItemPrice}>${Number(d.precio_unitario * d.cantidad).toFixed(2)}</Text>
                                            </View>
                                        ))}
                                        <View style={s.rtDivider} />

                                        <View style={s.rtTotalRow}>
                                            <Text style={s.rtTotalLabel}>Total</Text>
                                            <Text style={s.rtTotalValue}>${Number(selectedTicket.monto_total).toFixed(2)}</Text>
                                        </View>

                                        <View style={s.rtInfo}>
                                            <Text style={s.rtInfoText}>Metodo: {selectedTicket.metodo_pago || 'N/A'}</Text>
                                            <Text style={s.rtInfoText}>Vendedor: {selectedTicket.vendedor?.nombre_completo || 'N/A'}</Text>
                                        </View>
                                    </View>

                                    {/* Edit metodo */}
                                    <View style={s.editWrap}>
                                        <Text style={s.editLabel}>Cambiar Metodo de Pago</Text>
                                        <TouchableOpacity style={s.editPickerBtn} onPress={() => setShowMetodoPicker(!showMetodoPicker)}>
                                            <Text style={s.editPickerText}>{editMetodo}</Text>
                                        </TouchableOpacity>
                                        {showMetodoPicker && (
                                            <View style={s.editPickerList}>
                                                {['Efectivo', 'Tarjeta', 'Transferencia'].map(m => (
                                                    <TouchableOpacity key={m} style={[s.editPickerItem, editMetodo === m && s.editPickerItemActive]} onPress={() => { setEditMetodo(m); setShowMetodoPicker(false); }}>
                                                        <Text style={s.editPickerItemText}>{m}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                        <TouchableOpacity style={s.editSaveBtn} onPress={handleSaveEdit} disabled={savingEdit || editMetodo === selectedTicket.metodo_pago} activeOpacity={0.8}>
                                            {savingEdit ? <ActivityIndicator color={Colors.azulMarino} /> : <><Save size={16} color={Colors.azulMarino} /><Text style={s.editSaveBtnText}>Guardar Cambios</Text></>}
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteTicket}>
                                        <Trash2 size={16} color={Colors.rojoPeligro} /><Text style={s.deleteBtnText}>Eliminar este ticket</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={s.backBtn} onPress={() => setSelectedTicket(null)}>
                                        <Text style={s.backBtnText}>Volver a la lista</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                )}
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.4)', justifyContent: 'center', alignItems: 'center', padding: 12 },
    modal: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 22, width: '100%', maxHeight: '90%', elevation: 12, shadowColor: Colors.azulMarino, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.3, shadowRadius: 0, flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.1)', backgroundColor: 'rgba(237,233,254,0.6)', borderTopLeftRadius: 19, borderTopRightRadius: 19 },
    headerIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(204,85,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(204,85,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { fontSize: 10, fontWeight: '500', color: 'rgba(26,0,96,0.45)', marginTop: 1 },
    closeBtn: { width: 32, height: 32, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(26,0,96,0.15)', backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
    statsRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.08)' },
    statItem: { flex: 1, paddingVertical: 10, paddingHorizontal: 16 },
    statLabel: { fontWeight: '700', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(26,0,96,0.38)', marginBottom: 2 },
    statValue: { fontWeight: '900', fontSize: 18 },
    statDivider: { width: 1, backgroundColor: 'rgba(26,0,96,0.08)' },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, marginBottom: 0, backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(212,184,240,0.5)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
    searchInput: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.azulMarino, padding: 0 },
    countBadge: { backgroundColor: 'rgba(204,85,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(204,85,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
    countText: { fontWeight: '800', fontSize: 11, color: Colors.moradoAccento },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 40 },
    loadingText: { fontWeight: '700', fontSize: 13, color: 'rgba(26,0,96,0.4)' },
    ticket: { backgroundColor: Colors.blanco, borderWidth: 3, borderColor: Colors.azulMarino, borderRadius: 20, overflow: 'hidden', elevation: 3, shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.15, shadowRadius: 0 },
    ticketTop: { flexDirection: 'row', padding: 14, backgroundColor: 'rgba(248,245,255,1)', borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.08)', gap: 10 },
    ticketIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
    ticketTitle: { fontWeight: '900', fontSize: 16, color: Colors.azulMarino },
    ticketIdNum: { fontWeight: '800', fontSize: 13, color: 'rgba(26,0,96,0.4)' },
    metodoBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    metodoBadgeText: { fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    ticketVendedor: { fontWeight: '600', fontSize: 12, color: 'rgba(26,0,96,0.6)' },
    ticketMoney: { alignItems: 'flex-end', justifyContent: 'center' },
    ticketTotalLabel: { fontWeight: '800', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(26,0,96,0.4)' },
    ticketTotalValue: { fontWeight: '900', fontSize: 22, color: Colors.verdeExito },
    ticketBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8 },
    ticketDate: { fontWeight: '800', fontSize: 10, textTransform: 'uppercase', color: 'rgba(26,0,96,0.4)', letterSpacing: 0.3 },
    ticketOpenBtn: { fontWeight: '800', fontSize: 10, color: Colors.blanco, backgroundColor: Colors.azulMarino, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5, overflow: 'hidden' },
    emptyWrap: { alignItems: 'center', paddingTop: 40, gap: 12 },
    emptyTitle: { fontWeight: '800', fontSize: 18, color: Colors.azulMarino },
    // Detail
    detailOverlay: { flex: 1, backgroundColor: 'rgba(26,0,96,0.5)', justifyContent: 'flex-end' },
    detailCard: { backgroundColor: Colors.fondoMoradoClaro, borderWidth: 3, borderColor: Colors.azulMarino, borderBottomWidth: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '90%' },
    detailPill: { width: 50, height: 6, backgroundColor: 'rgba(26,0,96,0.2)', borderRadius: 10, alignSelf: 'center', marginTop: 12 },
    realTicket: { backgroundColor: Colors.blanco, padding: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(212,184,240,0.4)', borderStyle: 'dashed' },
    rtTitle: { fontWeight: '900', fontSize: 16, color: Colors.azulMarino, textAlign: 'center', letterSpacing: 0.5, marginBottom: 4 },
    rtDate: { fontWeight: '700', fontSize: 11, color: 'rgba(26,0,96,0.5)', textAlign: 'center', textTransform: 'uppercase' },
    rtDivider: { height: 2, backgroundColor: 'rgba(26,0,96,0.08)', marginVertical: 12, borderStyle: 'dashed' },
    rtItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    rtItemName: { fontWeight: '600', fontSize: 13, color: Colors.azulMarino, flex: 1 },
    rtItemPrice: { fontWeight: '900', fontSize: 13, color: Colors.azulMarino },
    rtTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    rtTotalLabel: { fontWeight: '800', fontSize: 14, color: Colors.azulMarino, textTransform: 'uppercase' },
    rtTotalValue: { fontWeight: '900', fontSize: 28, color: Colors.verdeExito },
    rtInfo: { backgroundColor: 'rgba(237,233,254,0.4)', borderRadius: 8, padding: 12, gap: 4 },
    rtInfoText: { fontWeight: '700', fontSize: 11, color: 'rgba(26,0,96,0.6)' },
    editWrap: { backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 16, padding: 16 },
    editLabel: { fontWeight: '800', fontSize: 11, color: Colors.azulMarino, textTransform: 'uppercase', marginBottom: 8 },
    editPickerBtn: { backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(212,184,240,0.5)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
    editPickerText: { fontWeight: '700', fontSize: 14, color: Colors.azulMarino },
    editPickerList: { borderWidth: 2, borderColor: Colors.azulMarino, borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
    editPickerItem: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.06)' },
    editPickerItemActive: { backgroundColor: Colors.amarilloAccento },
    editPickerItemText: { fontWeight: '500', fontSize: 13, color: Colors.azulMarino },
    editSaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.verdeExito, borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 12, paddingVertical: 14, elevation: 3, shadowColor: Colors.azulMarino, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, shadowRadius: 0 },
    editSaveBtnText: { fontWeight: '900', fontSize: 13, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 0.5 },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: 'rgba(255,80,80,0.4)', borderRadius: 12, paddingVertical: 14, borderStyle: 'dashed' },
    deleteBtnText: { fontWeight: '800', fontSize: 12, color: Colors.rojoPeligro, textTransform: 'uppercase' },
    backBtn: { alignItems: 'center', paddingVertical: 14 },
    backBtnText: { fontWeight: '800', fontSize: 12, color: 'rgba(26,0,96,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 },
});
