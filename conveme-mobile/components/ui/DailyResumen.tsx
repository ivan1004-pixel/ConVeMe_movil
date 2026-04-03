import React, { useState, useEffect } from 'react';
import {
    View, Text, ActivityIndicator, StyleSheet, TouchableOpacity,
} from 'react-native';
import { DollarSign, Scissors, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { getVentas } from '@/services/venta.service';
import { getCortes } from '@/services/corte.service';

interface ResumenData {
    ventasHoy: number;
    cantVentasHoy: number;
    cortesPendientes: number;
    mermaTotal: number;
}

const esHoy = (fecha: string) => {
    if (!fecha) return false;
    const hoy = new Date();
    const f = new Date(fecha);
    return f.getFullYear() === hoy.getFullYear() && f.getMonth() === hoy.getMonth() && f.getDate() === hoy.getDate();
};

export default function DailyResumen({ rolId }: { rolId: number }) {
    const [data, setData] = useState<ResumenData>({ ventasHoy: 0, cantVentasHoy: 0, cortesPendientes: 0, mermaTotal: 0 });
    const [loading, setLoading] = useState(true);

    const cargar = async () => {
        setLoading(true);
        try {
            const [ventas, cortes] = await Promise.all([getVentas(), getCortes()]);

            const ventasDeHoy = ventas.filter((v: any) => esHoy(v.fecha_venta));
            const ventasHoy = ventasDeHoy.reduce((s: number, v: any) => s + Number(v.monto_total || 0), 0);

            const cortesPendientes = cortes.filter((c: any) => Number(c.diferencia_corte) > 0).length;

            const mermaTotal = cortes.reduce((total: number, c: any) => {
                const mermaCorte = (c.detalles || []).reduce((s: number, d: any) => s + Number(d.merma_reportada || 0), 0);
                return total + mermaCorte;
            }, 0);

            setData({ ventasHoy, cantVentasHoy: ventasDeHoy.length, cortesPendientes, mermaTotal });
        } catch (e) {
            console.error('Error cargando resumen diario:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    if (loading) {
        return (
            <View style={s.loadingWrap}>
                <ActivityIndicator size="small" color={Colors.moradoAccento} />
                <Text style={s.loadingText}>Cargando resumen...</Text>
            </View>
        );
    }

    return (
        <View style={s.root} data-testid="daily-resumen-widget">
            <View style={s.headerRow}>
                <Text style={s.title}>Resumen del Dia</Text>
                <TouchableOpacity onPress={cargar} style={s.refreshBtn} data-testid="daily-resumen-refresh">
                    <RefreshCw size={14} color={Colors.moradoAccento} />
                </TouchableOpacity>
            </View>

            <View style={s.cardsRow}>
                {/* Ventas Hoy */}
                <View style={[s.miniCard, s.cardVentas]} data-testid="resumen-ventas-hoy">
                    <View style={[s.miniIcon, { backgroundColor: 'rgba(6,214,160,0.15)' }]}>
                        <DollarSign size={18} color={Colors.verdeExito} />
                    </View>
                    <Text style={s.miniValue}>${data.ventasHoy.toFixed(0)}</Text>
                    <Text style={s.miniLabel}>{data.cantVentasHoy} venta{data.cantVentasHoy !== 1 ? 's' : ''} hoy</Text>
                </View>

                {/* Cortes Pendientes */}
                <View style={[s.miniCard, data.cortesPendientes > 0 && s.cardAlerta]} data-testid="resumen-cortes-pendientes">
                    <View style={[s.miniIcon, { backgroundColor: data.cortesPendientes > 0 ? 'rgba(255,190,11,0.15)' : 'rgba(26,0,96,0.06)' }]}>
                        <Scissors size={18} color={data.cortesPendientes > 0 ? '#d49b00' : Colors.azulMarino} />
                    </View>
                    <Text style={[s.miniValue, data.cortesPendientes > 0 && { color: '#d49b00' }]}>{data.cortesPendientes}</Text>
                    <Text style={s.miniLabel}>corte{data.cortesPendientes !== 1 ? 's' : ''} pendiente{data.cortesPendientes !== 1 ? 's' : ''}</Text>
                </View>

                {/* Merma */}
                {rolId === 1 && (
                    <View style={[s.miniCard, data.mermaTotal > 0 && s.cardMerma]} data-testid="resumen-merma">
                        <View style={[s.miniIcon, { backgroundColor: data.mermaTotal > 0 ? 'rgba(255,80,80,0.12)' : 'rgba(26,0,96,0.06)' }]}>
                            <AlertTriangle size={18} color={data.mermaTotal > 0 ? Colors.rojoPeligro : Colors.azulMarino} />
                        </View>
                        <Text style={[s.miniValue, data.mermaTotal > 0 && { color: Colors.rojoPeligro }]}>{data.mermaTotal}</Text>
                        <Text style={s.miniLabel}>merma (pz)</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        marginTop: 12,
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontWeight: '900',
        fontSize: 13,
        color: Colors.azulMarino,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    refreshBtn: {
        width: 30,
        height: 30,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(204,85,255,0.2)',
        backgroundColor: 'rgba(204,85,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    miniCard: {
        flex: 1,
        backgroundColor: Colors.blanco,
        borderWidth: 2.5,
        borderColor: 'rgba(26,0,96,0.1)',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 0,
    },
    cardVentas: {
        borderColor: 'rgba(6,214,160,0.25)',
    },
    cardAlerta: {
        borderColor: 'rgba(255,190,11,0.3)',
    },
    cardMerma: {
        borderColor: 'rgba(255,80,80,0.25)',
    },
    miniIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    miniValue: {
        fontWeight: '900',
        fontSize: 20,
        color: Colors.azulMarino,
    },
    miniLabel: {
        fontWeight: '700',
        fontSize: 9,
        color: 'rgba(26,0,96,0.45)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginTop: 2,
    },
    loadingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
        paddingVertical: 16,
    },
    loadingText: {
        fontWeight: '700',
        fontSize: 12,
        color: 'rgba(26,0,96,0.4)',
    },
});
