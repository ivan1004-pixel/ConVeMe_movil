import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Wallet, Receipt, Calculator, FileText } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '@/constants/Colors';
import TopBar from '@/components/ui/TopBar';
import { getCortesPorVendedor } from '@/services/corte.service';

const formatFecha = (s: string) => s ? new Date(s).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const calcularComision = (detalles: any[] = []) => {
    return detalles.reduce((total, det) => {
        const nombre = (det.producto?.nombre || '').toLowerCase();
        const vendidas = Number(det.cantidad_vendida) || 0;
        if (nombre.includes('pin')) return total + (vendidas * 6.50);
        if (nombre.includes('sticker')) return total + (vendidas * 2.00);
        return total;
    }, 0);
};

export default function MisFinanzas() {
    const [vendedorId, setVendedorId] = useState<number>(0);
    const [comprobantes, setComprobantes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        SecureStore.getItemAsync('id_vendedor').then(v => {
            const id = Number(v) || 0;
            setVendedorId(id);
            if (id) cargarHistorial(id);
            else setLoading(false);
        });
    }, []);

    const cargarHistorial = async (id: number) => {
        setLoading(true);
        try { setComprobantes(await getCortesPorVendedor(id)); } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const deudaTotal = comprobantes.reduce((s, c) => s + Number(c.diferencia_corte), 0);
    const ventasHistoricas = comprobantes.reduce((s, c) => s + Number(c.dinero_esperado), 0);
    const comisionesHistoricas = comprobantes.reduce((s, c) => s + calcularComision(c.detalles), 0);

    const renderComprobante = useCallback(({ item }: { item: any }) => {
        const miComision = calcularComision(item.detalles);
        const tieneDeuda = item.diferencia_corte > 0;
        return (
            <View style={[s.card, tieneDeuda && s.cardDeuda]} data-testid={`finanza-card-${item.id_corte}`}>
                <View style={s.cardHeader}>
                    <View><Text style={s.cardTitle}>Folio #C-{item.id_corte}</Text><Text style={s.cardDate}>{formatFecha(item.fecha_corte)}</Text></View>
                    <View style={[s.statusBadge, { backgroundColor: tieneDeuda ? 'rgba(255,80,80,0.1)' : Colors.verdeFondo }]}>
                        <Text style={[s.statusText, { color: tieneDeuda ? Colors.rojoPeligro : Colors.verdeExito }]}>{tieneDeuda ? 'Adeudo' : 'Liquidado'}</Text>
                    </View>
                </View>
                <View style={s.rowsWrap}>
                    <View style={s.infoRow}><Text style={s.infoLabel}>Total Vendido</Text><Text style={s.infoValue}>${Number(item.dinero_esperado).toFixed(2)}</Text></View>
                    <View style={s.infoRow}><Text style={s.infoLabel}>Tu Comision</Text><Text style={[s.infoValue, { color: '#00b4d8' }]}>${miComision.toFixed(2)}</Text></View>
                    <View style={s.infoRow}><Text style={s.infoLabel}>Entregaste</Text><Text style={[s.infoValue, { color: Colors.verdeExito }]}>${Number(item.dinero_total_entregado).toFixed(2)}</Text></View>
                </View>
                {tieneDeuda && (
                    <View style={s.deudaRow}><Text style={s.deudaLabel}>Por liquidar</Text><Text style={s.deudaValue}>${Number(item.diferencia_corte).toFixed(2)}</Text></View>
                )}
                {item.observaciones && <Text style={s.obsText}>{item.observaciones}</Text>}
            </View>
        );
    }, []);

    return (
        <View style={s.root} data-testid="mis-finanzas-screen">
            <TopBar title="Finanzas" />
            <View style={s.headerRow}><Text style={s.pageTitle}>Mis Finanzas</Text><Text style={s.pageSub}>Historial de cortes y liquidaciones.</Text></View>

            {/* Summary cards */}
            <View style={s.statsRow}>
                <View style={s.statCard}><View style={[s.statIcon, { backgroundColor: 'rgba(204,85,255,0.1)' }]}><Calculator size={20} color={Colors.moradoAccento} /></View><View><Text style={s.statLabel}>Ventas Acumuladas</Text><Text style={s.statValue}>${ventasHistoricas.toFixed(2)}</Text></View></View>
                <View style={s.statCard}><View style={[s.statIcon, { backgroundColor: Colors.verdeFondo }]}><Wallet size={20} color={Colors.verdeExito} /></View><View><Text style={s.statLabel}>Tus Comisiones</Text><Text style={s.statValue}>${comisionesHistoricas.toFixed(2)}</Text></View></View>
                <View style={[s.statCard, deudaTotal > 0 && s.statCardDeuda]}><View style={[s.statIcon, { backgroundColor: deudaTotal > 0 ? 'rgba(255,80,80,0.1)' : 'rgba(26,0,96,0.06)' }]}><Receipt size={20} color={deudaTotal > 0 ? Colors.rojoPeligro : Colors.azulMarino} /></View><View><Text style={[s.statLabel, deudaTotal > 0 && { color: 'rgba(255,80,80,0.6)' }]}>Adeudo Actual</Text><Text style={[s.statValue, deudaTotal > 0 && { color: Colors.rojoPeligro }]}>${deudaTotal.toFixed(2)}</Text></View></View>
            </View>

            {/* List */}
            {loading ? (
                <View style={s.loadingWrap}><ActivityIndicator size="large" color={Colors.moradoAccento} /><Text style={s.loadingText}>Cargando tu informacion...</Text></View>
            ) : !vendedorId ? (
                <View style={s.loadingWrap}><Text style={[s.loadingText, { color: Colors.rojoPeligro }]}>No se encontro tu perfil de vendedor.</Text></View>
            ) : (
                <FlatList data={comprobantes} renderItem={renderComprobante} keyExtractor={i => String(i.id_corte)} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
                    ListEmptyComponent={<View style={s.emptyWrap}><Wallet size={40} color="rgba(26,0,96,0.15)" /><Text style={s.emptyTitle}>Sin cortes</Text><Text style={s.emptySub}>Aun no tienes cortes registrados en el sistema.</Text></View>} />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.fondoMoradoClaro },
    headerRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
    pageTitle: { fontWeight: '900', fontSize: 22, color: Colors.azulMarino },
    pageSub: { fontSize: 12, fontWeight: '500', color: 'rgba(26,0,96,0.5)', marginTop: 2 },
    statsRow: { paddingHorizontal: 16, gap: 10, marginBottom: 10 },
    statCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.blanco, borderWidth: 2.5, borderColor: Colors.azulMarino, borderRadius: 18, padding: 14, elevation: 3, shadowColor: Colors.azulMarino, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.1, shadowRadius: 0 },
    statCardDeuda: { borderColor: Colors.rojoPeligro },
    statIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    statLabel: { fontWeight: '700', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(26,0,96,0.5)' },
    statValue: { fontWeight: '900', fontSize: 18, color: Colors.azulMarino },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontWeight: '700', fontSize: 13, color: 'rgba(26,0,96,0.4)' },
    card: { backgroundColor: Colors.blanco, borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 20, padding: 16 },
    cardDeuda: { borderColor: 'rgba(255,80,80,0.2)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(26,0,96,0.08)', borderStyle: 'dashed', paddingBottom: 10 },
    cardTitle: { fontWeight: '900', fontSize: 14, color: Colors.azulMarino },
    cardDate: { fontWeight: '700', fontSize: 10, color: 'rgba(26,0,96,0.4)', marginTop: 2 },
    statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    statusText: { fontWeight: '900', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8 },
    rowsWrap: { gap: 6, marginBottom: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    infoLabel: { fontWeight: '500', fontSize: 12, color: 'rgba(26,0,96,0.6)' },
    infoValue: { fontWeight: '800', fontSize: 12, color: Colors.azulMarino },
    deudaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,80,80,0.05)', borderWidth: 1, borderColor: 'rgba(255,80,80,0.2)', borderRadius: 12, padding: 10, marginTop: 4 },
    deudaLabel: { fontWeight: '700', fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,80,80,0.7)' },
    deudaValue: { fontWeight: '900', fontSize: 14, color: Colors.rojoPeligro },
    obsText: { fontWeight: '500', fontSize: 11, fontStyle: 'italic', color: 'rgba(26,0,96,0.5)', marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(26,0,96,0.05)', paddingTop: 8 },
    emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyTitle: { fontWeight: '800', fontSize: 18, color: Colors.azulMarino },
    emptySub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.45)', textAlign: 'center', maxWidth: 260 },
});
