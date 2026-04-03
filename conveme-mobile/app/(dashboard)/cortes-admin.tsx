import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    FlatList, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    PackageOpen, Search, X, Scale, Trash2,
    Pencil, PackagePlus, Wallet,
} from 'lucide-react-native';

import TopBar from '@/components/ui/TopBar';
import ModalAsignacion from '@/components/inventario/ModalAsignacion';
import ModalCorte from '@/components/inventario/ModalCorte';
import ActionModal from '@/components/ui/ActionModal';
import type { ActionType } from '@/components/ui/ActionModal';

import { getCortes, deleteCorte } from '@/services/corte.service';
import { getAsignaciones, deleteAsignacion } from '@/services/asignacion.service';
import { Colors } from '@/constants/Colors';

export default function CortesAdmin() {
    const [tabActiva, setTabActiva] = useState('cortes');
    const [isModalAsigOpen, setIsModalAsigOpen] = useState(false);
    const [isModalCorteOpen, setIsModalCorteOpen] = useState(false);
    const [cortes, setCortes] = useState<any[]>([]);
    const [asignaciones, setAsignaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [asigAEditar, setAsigAEditar] = useState<any>(null);
    const [corteAEditar, setCorteAEditar] = useState<any>(null);

    const [actionModal, setActionModal] = useState<{
        isOpen: boolean; type: ActionType; title: string; subtitle: string;
        description?: string; itemName?: string; onConfirm?: () => Promise<void>;
    }>({ isOpen: false, type: 'success', title: '', subtitle: '' });

    useEffect(() => {
        const t = setTimeout(() => cargarDatos(search), 500);
        return () => clearTimeout(t);
    }, [search, tabActiva]);

    const cargarDatos = async (termino = search) => {
        setLoading(true);
        try {
            const [cortesData, asigs] = await Promise.all([
                getCortes(termino),
                getAsignaciones(termino),
            ]);
            setCortes(cortesData);
            setAsignaciones(asigs);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const closeAction = () => setActionModal(p => ({ ...p, isOpen: false }));

    const handleDeleteCorte = (corte: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete', title: 'Eliminar Corte',
            subtitle: `Eliminar el corte #C-${corte.id_corte}?`,
            description: 'Se eliminara el registro.',
            itemName: `#C-${corte.id_corte} — ${corte.vendedor?.nombre_completo}`,
            onConfirm: async () => {
                await deleteCorte(corte.id_corte);
                await cargarDatos();
                setActionModal({ isOpen: true, type: 'success-delete', title: 'Corte eliminado', subtitle: 'El registro fue eliminado.' });
                setTimeout(closeAction, 2200);
            },
        });
    };

    const handleDeleteAsignacion = (asig: any) => {
        setActionModal({
            isOpen: true, type: 'confirm-delete', title: 'Eliminar Asignacion',
            subtitle: `Eliminar el folio #A-${asig.id_asignacion}?`,
            description: 'Se eliminara la asignacion y sus detalles.',
            itemName: `#A-${asig.id_asignacion} — ${asig.vendedor?.nombre_completo}`,
            onConfirm: async () => {
                await deleteAsignacion(asig.id_asignacion);
                await cargarDatos();
                setActionModal({ isOpen: true, type: 'success-delete', title: 'Asignacion eliminada', subtitle: 'El folio fue removido.' });
                setTimeout(closeAction, 2200);
            },
        });
    };

    const renderCorteItem = ({ item: c }: { item: any }) => (
        <View style={s.card}>
            <View style={s.cardRow}>
                <Text style={s.cardFolio}>#C-{c.id_corte}</Text>
                <Text style={s.cardDate}>{new Date(c.fecha_corte).toLocaleDateString('es-MX')}</Text>
            </View>
            <Text style={s.cardVendedor}>{c.vendedor?.nombre_completo}</Text>
            <Text style={s.cardAsig}>Asig. #{c.asignacion?.id_asignacion}</Text>
            <View style={s.cardMoneyRow}>
                <View style={s.moneyBox}>
                    <Text style={s.moneyLabel}>Esperado</Text>
                    <Text style={s.moneyBlue}>${Number(c.dinero_esperado).toFixed(2)}</Text>
                </View>
                <View style={s.moneyBox}>
                    <Text style={s.moneyLabel}>Entregado</Text>
                    <Text style={s.moneyGreen}>${Number(c.dinero_total_entregado).toFixed(2)}</Text>
                </View>
                <View style={s.moneyBox}>
                    <Text style={s.moneyLabel}>Diferencia</Text>
                    <Text style={c.diferencia_corte < 0 ? s.moneyRed : s.moneyGray}>
                        {c.diferencia_corte < 0 ? `- $${Math.abs(c.diferencia_corte)}` : `$${c.diferencia_corte}`}
                    </Text>
                </View>
            </View>
            <View style={s.cardActions}>
                <TouchableOpacity style={s.editBtn} onPress={() => { setCorteAEditar(c); setIsModalCorteOpen(true); }}>
                    <Pencil size={13} color="rgba(26,0,96,0.8)" /><Text style={s.editBtnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.delBtn} onPress={() => handleDeleteCorte(c)}>
                    <Trash2 size={13} color="rgba(255,80,80,0.8)" /><Text style={s.delBtnText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderAsignacionItem = ({ item: asig }: { item: any }) => {
        const totalPiezas = asig.detalles?.reduce((s: number, d: any) => s + d.cantidad_asignada, 0) || 0;
        return (
            <View style={s.card}>
                <View style={s.cardRow}>
                    <Text style={s.cardFolio}>#A-{asig.id_asignacion}</Text>
                    <View style={[s.estadoBadge, asig.estado === 'Activa' ? s.estadoActiva : s.estadoInactiva]}>
                        <Text style={[s.estadoText, asig.estado === 'Activa' ? s.estadoTextActiva : s.estadoTextInactiva]}>
                            {asig.estado}
                        </Text>
                    </View>
                </View>
                <Text style={s.cardVendedor}>{asig.vendedor?.nombre_completo}</Text>
                <View style={s.cardRow}>
                    <Text style={s.cardDate}>{new Date(asig.fecha_asignacion).toLocaleDateString('es-MX')}</Text>
                    <Text style={s.piezasText}>{totalPiezas} piezas</Text>
                </View>
                <View style={s.cardActions}>
                    <TouchableOpacity style={s.editBtn} onPress={() => { setAsigAEditar(asig); setIsModalAsigOpen(true); }}>
                        <Pencil size={13} color="rgba(26,0,96,0.8)" /><Text style={s.editBtnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.delBtn} onPress={() => handleDeleteAsignacion(asig)}>
                        <Trash2 size={13} color="rgba(255,80,80,0.8)" /><Text style={s.delBtnText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={s.root} edges={['top']}>
            <TopBar title="Operaciones" />

            <View style={s.header}>
                <Text style={s.headerTitle}>Operaciones de Vendedores</Text>
                <Text style={s.headerSub}>Gestiona entregas de mercancia y liquidaciones.</Text>
                <View style={s.headerButtons}>
                    <TouchableOpacity style={s.btnGreen} onPress={() => { setAsigAEditar(null); setIsModalAsigOpen(true); }}>
                        <PackagePlus size={18} color={Colors.azulMarino} strokeWidth={3} />
                        <Text style={s.btnGreenText}>Entregar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.btnDark} onPress={() => { setCorteAEditar(null); setIsModalCorteOpen(true); }}>
                        <Scale size={18} color={Colors.verdeExito} strokeWidth={3} />
                        <Text style={s.btnDarkText}>Corte</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={s.tabsRow}>
                <TouchableOpacity style={[s.tab, tabActiva === 'cortes' && s.tabActive]} onPress={() => setTabActiva('cortes')}>
                    <Wallet size={18} color={tabActiva === 'cortes' ? Colors.moradoAccento : Colors.gris400} />
                    <Text style={[s.tabText, tabActiva === 'cortes' && s.tabTextActive]}>Historial de Cortes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.tab, tabActiva === 'asignaciones' && s.tabActive]} onPress={() => setTabActiva('asignaciones')}>
                    <PackageOpen size={18} color={tabActiva === 'asignaciones' ? Colors.moradoAccento : Colors.gris400} />
                    <Text style={[s.tabText, tabActiva === 'asignaciones' && s.tabTextActive]}>Mercancia</Text>
                </TouchableOpacity>
            </View>

            <View style={s.searchBar}>
                <View style={s.searchWrap}>
                    <Search size={14} color={Colors.gris400} />
                    <TextInput
                        style={s.searchInput} placeholder="Buscar por vendedor o folio..."
                        placeholderTextColor={Colors.gris400} value={search} onChangeText={setSearch}
                    />
                    {search !== '' && (
                        <TouchableOpacity onPress={() => setSearch('')}><X size={16} color={Colors.gris400} /></TouchableOpacity>
                    )}
                </View>
                <View style={s.countBadge}>
                    <Text style={s.countText}>{tabActiva === 'cortes' ? cortes.length : asignaciones.length} resultados</Text>
                </View>
            </View>

            {loading ? (
                <View style={s.loaderWrap}><ActivityIndicator size="large" color={Colors.azulMarino} /></View>
            ) : (
                <FlatList
                    data={tabActiva === 'cortes' ? cortes : asignaciones}
                    keyExtractor={item => String(tabActiva === 'cortes' ? item.id_corte : item.id_asignacion)}
                    renderItem={tabActiva === 'cortes' ? renderCorteItem : renderAsignacionItem}
                    contentContainerStyle={s.listContent}
                    ListEmptyComponent={<Text style={s.emptyText}>{tabActiva === 'cortes' ? 'No se encontraron cortes.' : 'No se encontraron asignaciones.'}</Text>}
                />
            )}

            <ModalCorte isOpen={isModalCorteOpen} onClose={() => setIsModalCorteOpen(false)} corteAEditar={corteAEditar}
                onSuccess={() => { cargarDatos(); setActionModal({ isOpen: true, type: 'success', title: 'Corte Exitoso', subtitle: corteAEditar ? 'Corte actualizado.' : 'La cuenta se ha cerrado.' }); setTimeout(closeAction, 2500); }} />
            <ModalAsignacion isOpen={isModalAsigOpen} onClose={() => setIsModalAsigOpen(false)} asigAEditar={asigAEditar}
                onSuccess={() => { cargarDatos(); setActionModal({ isOpen: true, type: 'success', title: 'Exito', subtitle: asigAEditar ? 'Asignacion actualizada.' : 'Asignacion creada.' }); setTimeout(closeAction, 2500); }} />
            <ActionModal isOpen={actionModal.isOpen} type={actionModal.type} title={actionModal.title} subtitle={actionModal.subtitle}
                description={actionModal.description} itemName={actionModal.itemName} onClose={closeAction} onConfirm={actionModal.onConfirm} />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.fondoMoradoClaro },
    header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    headerTitle: { fontWeight: '900', fontSize: 20, color: Colors.azulMarino },
    headerSub: { fontSize: 13, fontWeight: '500', color: 'rgba(26,0,96,0.50)', marginTop: 2 },
    headerButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
    btnGreen: {
        flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.verdeExito,
        paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12,
        elevation: 4, shadowColor: Colors.azulMarino, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 0,
    },
    btnGreenText: { fontWeight: '900', fontSize: 13, color: Colors.azulMarino, textTransform: 'uppercase', letterSpacing: 1 },
    btnDark: {
        flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.azulMarino,
        paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.3, shadowRadius: 0,
    },
    btnDarkText: { fontWeight: '900', fontSize: 13, color: Colors.verdeExito, textTransform: 'uppercase', letterSpacing: 1 },
    tabsRow: {
        flexDirection: 'row', gap: 4, paddingHorizontal: 20,
        borderBottomWidth: 2, borderBottomColor: 'rgba(26,0,96,0.10)', marginBottom: 4,
    },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 10, paddingHorizontal: 4, marginRight: 12 },
    tabActive: { borderBottomWidth: 4, borderBottomColor: Colors.moradoAccento },
    tabText: { fontWeight: '900', fontSize: 11, color: Colors.gris400, textTransform: 'uppercase', letterSpacing: 0.5 },
    tabTextActive: { color: Colors.moradoAccento },
    searchBar: { paddingHorizontal: 20, paddingVertical: 8, gap: 6 },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.blanco,
        borderWidth: 2, borderColor: 'rgba(26,0,96,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    },
    searchInput: { flex: 1, fontWeight: '700', color: Colors.azulMarino, fontSize: 14, padding: 0 },
    countBadge: { backgroundColor: Colors.azulMarinoTranslucido, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
    countText: { fontWeight: '700', fontSize: 11, color: Colors.azulMarino },
    listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 10, paddingTop: 4 },
    loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
    emptyText: { textAlign: 'center', paddingVertical: 40, color: Colors.gris400, fontWeight: '700', fontSize: 14 },
    card: {
        backgroundColor: Colors.blanco, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(26,0,96,0.08)',
        padding: 14, gap: 6,
        elevation: 3, shadowColor: Colors.azulMarino, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.08, shadowRadius: 0,
    },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardFolio: { fontWeight: '900', fontSize: 16, color: Colors.azulMarino },
    cardDate: { fontSize: 12, fontWeight: '700', color: Colors.gris400 },
    cardVendedor: { fontWeight: '700', fontSize: 14, color: Colors.moradoAccento },
    cardAsig: { fontWeight: '700', fontSize: 12, color: Colors.gris500 },
    piezasText: { fontWeight: '900', fontSize: 13, color: Colors.gris500 },
    cardMoneyRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
    moneyBox: { flex: 1, backgroundColor: Colors.fondoMoradoClaro, borderRadius: 8, padding: 7, alignItems: 'center' },
    moneyLabel: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: Colors.gris500, marginBottom: 1 },
    moneyBlue: { fontWeight: '900', fontSize: 13, color: '#2563eb' },
    moneyGreen: { fontWeight: '900', fontSize: 13, color: Colors.verdeExito },
    moneyRed: { fontWeight: '900', fontSize: 13, color: Colors.rojoPeligro },
    moneyGray: { fontWeight: '900', fontSize: 13, color: Colors.gris500 },
    estadoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    estadoActiva: { backgroundColor: Colors.verdeExito },
    estadoInactiva: { backgroundColor: Colors.gris200 },
    estadoText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
    estadoTextActiva: { color: Colors.blanco },
    estadoTextInactiva: { color: Colors.gris500 },
    cardActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(26,0,96,0.08)',
        borderWidth: 1.5, borderColor: 'rgba(26,0,96,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    },
    editBtnText: { fontWeight: '800', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(26,0,96,0.8)' },
    delBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,80,80,0.08)',
        borderWidth: 1.5, borderColor: 'rgba(255,80,80,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    },
    delBtnText: { fontWeight: '800', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,80,80,0.8)' },
});
