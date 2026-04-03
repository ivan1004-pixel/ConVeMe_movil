import React, { useEffect, useState } from 'react';
import {
    Modal, View, Text, TouchableOpacity,
    ActivityIndicator, StyleSheet, Animated,
} from 'react-native';
import { AlertTriangle, Check, Trash2, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export type ActionType = 'confirm-delete' | 'success' | 'success-delete';

interface ActionModalProps {
    isOpen: boolean;
    type: ActionType;
    title: string;
    subtitle: string;
    description?: string;
    itemName?: string;
    onClose: () => void;
    onConfirm?: () => Promise<void>;
    autoCloseMs?: number;
}

export default function ActionModal({
    isOpen,
    type,
    title,
    subtitle,
    description,
    itemName,
    onClose,
    onConfirm,
    autoCloseMs = 1400,
}: ActionModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const scaleAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setShowSuccess(false);
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 280,
                friction: 22,
                useNativeDriver: true,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!onConfirm) return;
        setError(null);
        setLoading(true);
        try {
            await onConfirm();
            setShowSuccess(true);
            if (autoCloseMs > 0) {
                setTimeout(() => {
                    setShowSuccess(false);
                    setLoading(false);
                    onClose();
                }, autoCloseMs);
            } else {
                setLoading(false);
            }
        } catch (err: any) {
            setError(err?.message ?? 'Ocurrio un error. Intenta nuevamente.');
            setLoading(false);
        }
    };

    const renderIcon = () => {
        if (showSuccess) {
            const isDelete = type === 'confirm-delete' || type === 'success-delete';
            return (
                <View style={[s.bigIcon, isDelete ? s.bigIconRed : s.bigIconGreen]}>
                    {isDelete ? <Trash2 size={36} color={Colors.rojoPeligro} /> : <Check size={40} color={Colors.verdeExito} />}
                </View>
            );
        }
        if (type === 'confirm-delete') {
            return (
                <Animated.View style={[s.bigIcon, s.bigIconRed, { transform: [{ scale: scaleAnim }] }]}>
                    <AlertTriangle size={28} color={Colors.rojoPeligro} />
                </Animated.View>
            );
        }
        if (type === 'success') {
            return (
                <View style={[s.bigIcon, s.bigIconGreen]}>
                    <Check size={40} color={Colors.verdeExito} />
                </View>
            );
        }
        if (type === 'success-delete') {
            return (
                <View style={[s.bigIcon, s.bigIconRed]}>
                    <Trash2 size={36} color={Colors.rojoPeligro} />
                </View>
            );
        }
        return null;
    };

    return (
        <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={type === 'confirm-delete' && !loading ? onClose : undefined}
                />

                <View style={s.modal}>
                    {/* Header para confirm-delete */}
                    {type === 'confirm-delete' && !showSuccess && (
                        <View style={s.header}>
                            <View style={s.headerLeft}>
                                <View style={s.headerIcon}>
                                    <Trash2 size={20} color={Colors.rojoPeligro} />
                                </View>
                                <View>
                                    <Text style={s.headerTitle}>{title}</Text>
                                    <Text style={s.headerSub}>Esta accion no se puede deshacer</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={s.closeBtn} onPress={onClose} disabled={loading}>
                                <X size={16} color={Colors.gris400} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Body */}
                    <View style={s.body}>
                        {renderIcon()}

                        {showSuccess ? (
                            <>
                                <Text style={s.bigTitle}>
                                    {(type === 'confirm-delete' || type === 'success-delete') ? 'Eliminado' : 'Listo'}
                                </Text>
                                <Text style={s.bigSubtitle}>
                                    {(type === 'confirm-delete' || type === 'success-delete')
                                        ? 'El elemento fue eliminado correctamente.'
                                        : subtitle}
                                </Text>
                            </>
                        ) : (
                            <>
                                {type === 'confirm-delete' && (
                                    <>
                                        <Text style={s.bigTitle}>{subtitle}</Text>
                                        {description && <Text style={s.bigSubtitle}>{description}</Text>}
                                        {itemName && (
                                            <View style={s.itemBadge}>
                                                <Text style={s.itemBadgeText}>{itemName}</Text>
                                            </View>
                                        )}
                                        {error && <Text style={s.errorText}>{error}</Text>}
                                        <View style={s.buttonsRow}>
                                            <TouchableOpacity style={s.cancelBtn} onPress={onClose} disabled={loading}>
                                                <Text style={s.cancelBtnText}>Cancelar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={s.deleteBtn} onPress={handleConfirm} disabled={loading}>
                                                {loading
                                                    ? <ActivityIndicator size="small" color={Colors.blanco} />
                                                    : <Text style={s.deleteBtnText}>Si, eliminar</Text>
                                                }
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                                {type === 'success' && (
                                    <>
                                        <Text style={s.bigTitle}>{title}</Text>
                                        <Text style={s.bigSubtitle}>{subtitle}</Text>
                                    </>
                                )}
                                {type === 'success-delete' && (
                                    <>
                                        <Text style={s.bigTitle}>{title}</Text>
                                        <Text style={s.bigSubtitle}>{subtitle}</Text>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(26,0,96,0.30)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modal: {
        backgroundColor: Colors.blanco,
        borderWidth: 3,
        borderColor: Colors.azulMarino,
        borderRadius: 28,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 2.5,
        borderBottomColor: 'rgba(26,0,96,0.10)',
        backgroundColor: Colors.fondoMoradoClaro,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: Colors.rojoFondo,
        borderWidth: 2,
        borderColor: 'rgba(255,80,80,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontWeight: '900',
        color: Colors.azulMarino,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontSize: 15,
    },
    headerSub: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(26,0,96,0.50)',
        marginTop: 2,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(26,0,96,0.15)',
        backgroundColor: Colors.blanco,
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        padding: 32,
        alignItems: 'center',
        gap: 12,
    },
    bigIcon: {
        width: 84,
        height: 84,
        borderRadius: 28,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    bigIconRed: {
        backgroundColor: Colors.rojoFondo,
        borderColor: 'rgba(255,80,80,0.20)',
    },
    bigIconGreen: {
        backgroundColor: Colors.verdeTranslucido,
        borderColor: 'rgba(6,214,160,0.30)',
    },
    bigTitle: {
        fontWeight: '900',
        fontSize: 22,
        color: Colors.azulMarino,
        textAlign: 'center',
    },
    bigSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(26,0,96,0.60)',
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 20,
    },
    itemBadge: {
        backgroundColor: Colors.rojoFondo,
        borderWidth: 2,
        borderColor: 'rgba(255,80,80,0.15)',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        width: '100%',
        marginTop: 8,
    },
    itemBadgeText: {
        fontWeight: '900',
        fontSize: 15,
        color: Colors.rojoPeligro,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 13,
        color: Colors.rojoPeligro,
        fontWeight: '500',
        textAlign: 'left',
        width: '100%',
        marginTop: 8,
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 16,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: Colors.blanco,
        borderWidth: 2.5,
        borderColor: '#d4b8f0',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontWeight: '900',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: 'rgba(26,0,96,0.60)',
    },
    deleteBtn: {
        flex: 1,
        backgroundColor: Colors.rojoPeligro,
        borderWidth: 3,
        borderColor: Colors.azulMarino,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: Colors.azulMarino,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    deleteBtnText: {
        fontWeight: '900',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: Colors.blanco,
    },
});
