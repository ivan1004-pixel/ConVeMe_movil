// src/components/ui/ActionModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Check, Trash2, RefreshCw, X } from 'lucide-react';

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
    const modalRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);
    const prefersReducedMotion = useReducedMotion();

    // Bloqueo de scroll
    useEffect(() => {
        if (!isOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    return () => {
        document.body.style.overflow = original;
    };
    }, [isOpen]);

    // Guardar foco previo y enfocar primer elemento del modal
    useEffect(() => {
        if (!isOpen) return;
        previouslyFocused.current = document.activeElement as HTMLElement | null;
        // esperar a que el modal esté en DOM
        setTimeout(() => {
            const first = getFocusableElements(modalRef.current)[0];
            (first ?? modalRef.current)?.focus();
        }, 0);

        return () => {
            if (previouslyFocused.current) {
                previouslyFocused.current.focus();
            }
        };
    }, [isOpen]);

    // Escape para cerrar
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onClose();
            if (e.key === 'Tab') {
                // handled by onKeyDown on modal container
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, loading, onClose]);

    // Confirm handler
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
            setError(err?.message ?? 'Ocurrió un error. Intenta nuevamente.');
            setLoading(false);
        }
    };

    // Backdrop click
    const handleBackdropClick = () => {
        if (type === 'confirm-delete' && !loading) onClose();
    };

        // Focus trap: manejar Tab y Shift+Tab
        const onModalKeyDown = (e: React.KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const focusables = getFocusableElements(modalRef.current);
            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            } else if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            }
        };

        // Animaciones condicionales
        const containerInitial = prefersReducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 12 };
        const containerAnimate = { opacity: 1, scale: 1, y: 0 };
        const containerExit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 };

        const portalTarget = typeof document !== 'undefined' ? document.body : null;
        if (!portalTarget) return null;

        return createPortal(
            <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans" aria-hidden={false}>
                <motion.div
                className="absolute inset-0 bg-[#1a0060]/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackdropClick}
                aria-hidden="true"
                />

                <motion.div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="action-modal-title"
                aria-describedby="action-modal-desc"
                tabIndex={-1}
                onKeyDown={onModalKeyDown}
                className="relative bg-white border-[3px] border-[#1a0060] rounded-[28px] w-full max-w-[400px] shadow-[8px_8px_0px_#1a0060] overflow-hidden flex flex-col z-10"
                initial={containerInitial}
                animate={containerAnimate}
                exit={containerExit}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                {type === 'confirm-delete' && (
                    <div className="flex items-center justify-between p-5 border-b-[2.5px] border-[#1a0060]/10 bg-[#f8f5ff]">
                    <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFEAEF] border-2 border-[#ff5050]/20 flex items-center justify-center text-[#ff5050]">
                    <Trash2 size={20} />
                    </div>
                    <div>
                    <h3 id="action-modal-title" className="font-syne font-black text-[#1a0060] uppercase tracking-wider leading-tight text-[15px]">
                    {title}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#1a0060]/50 block mt-0.5">
                    Esta acción no se puede deshacer
                    </span>
                    </div>
                    </div>
                    <button
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Cerrar"
                    className="w-9 h-9 rounded-xl border-2 border-[#1a0060]/15 bg-white flex items-center justify-center text-[#1a0060]/50 hover:bg-[#ff5050] hover:text-white hover:border-[#ff5050] transition-colors disabled:opacity-50"
                    >
                    <X size={16} />
                    </button>
                    </div>
                )}

                <div className="p-8 flex flex-col items-center text-center gap-4">
                {type === 'confirm-delete' && !showSuccess && (
                    <>
                    <motion.div
                    initial={prefersReducedMotion ? {} : { rotate: -15, scale: 0.7 }}
                    animate={prefersReducedMotion ? {} : { rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280 }}
                    className="w-16 h-16 rounded-[20px] bg-[#FFEAEF] border-[2.5px] border-[#ff5050]/20 flex items-center justify-center text-[#ff5050]"
                    aria-hidden="true"
                    >
                    <AlertTriangle size={28} />
                    </motion.div>

                    <h4 id="action-modal-desc" className="font-syne font-black text-[22px] text-[#1a0060] mt-2 leading-none">
                    {subtitle}
                    </h4>

                    {description && (
                        <p className="text-[13px] font-medium text-[#1a0060]/60 max-w-[280px] leading-relaxed">
                        {description}
                        </p>
                    )}

                    {itemName && (
                        <div className="bg-[#FFEAEF] border-2 border-[#ff5050]/15 rounded-xl px-5 py-3 font-syne font-black text-[15px] text-[#ff5050] w-full mt-2 truncate">
                        {itemName}
                        </div>
                    )}

                    {error && (
                        <div className="w-full mt-2 text-left text-[13px] text-[#ff5050] font-medium">
                        {error}
                        </div>
                    )}

                    <div className="flex gap-3 w-full mt-4">
                    <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 bg-white border-[2.5px] border-[#d4b8f0] rounded-2xl py-3.5 font-syne font-black text-[13px] uppercase tracking-wider text-[#1a0060]/60 hover:bg-[#f8f5ff] hover:border-[#1a0060] hover:text-[#1a0060] transition-all disabled:opacity-50"
                    data-autofocus
                    >
                    Cancelar
                    </button>

                    <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 bg-[#ff5050] border-[3px] border-[#1a0060] rounded-2xl py-3.5 font-syne font-black text-[13px] uppercase tracking-wider text-white shadow-[4px_4px_0px_#1a0060] hover:shadow-[6px_6px_0px_#1a0060] hover:-translate-y-[2px] transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#1a0060] flex items-center justify-center gap-2"
                    aria-disabled={loading}
                    >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Sí, eliminar'}
                    </button>
                    </div>
                    </>
                )}

                {type === 'success' && !showSuccess && (
                    <>
                    <motion.div
                    initial={prefersReducedMotion ? {} : { scale: 0, rotate: -20 }}
                    animate={prefersReducedMotion ? {} : { scale: [0, 1.25, 1], rotate: [0, 10, 0] }}
                    transition={{ type: 'spring' }}
                    className="w-[84px] h-[84px] rounded-[28px] bg-[#06d6a0]/15 border-[3px] border-[#06d6a0]/30 flex items-center justify-center text-[#06d6a0] mb-2"
                    aria-hidden="true"
                    >
                    <Check size={40} />
                    </motion.div>
                    <h4 className="font-syne font-black text-[24px] text-[#1a0060] leading-none">{title}</h4>
                    <p className="text-[14px] font-medium text-[#1a0060]/60">{subtitle}</p>
                    </>
                )}

                {type === 'success-delete' && !showSuccess && (
                    <>
                    <motion.div
                    initial={prefersReducedMotion ? {} : { scale: 0 }}
                    animate={prefersReducedMotion ? {} : { scale: [0, 1.2, 1] }}
                    transition={{ type: 'spring' }}
                    className="w-[84px] h-[84px] rounded-[28px] bg-[#FFEAEF] border-[3px] border-[#ff5050]/20 flex items-center justify-center text-[#ff5050] mb-2"
                    aria-hidden="true"
                    >
                    <Trash2 size={36} />
                    </motion.div>
                    <h4 className="font-syne font-black text-[24px] text-[#1a0060] leading-none">{title}</h4>
                    <p className="text-[14px] font-medium text-[#1a0060]/60">{subtitle}</p>
                    </>
                )}

                {showSuccess && (
                    <>
                    <motion.div
                    initial={prefersReducedMotion ? {} : { scale: 0 }}
                    animate={prefersReducedMotion ? {} : { scale: [0, 1.2, 1] }}
                    transition={{ type: 'spring' }}
                    className={`w-[84px] h-[84px] rounded-[28px] ${
                        type === 'confirm-delete' || type === 'success-delete'
                        ? 'bg-[#FFEAEF] border-[3px] border-[#ff5050]/20 text-[#ff5050]'
                        : 'bg-[#06d6a0]/15 border-[3px] border-[#06d6a0]/30 text-[#06d6a0]'
                    } flex items-center justify-center mb-2`}
                    aria-hidden="true"
                    >
                    {type === 'confirm-delete' || type === 'success-delete' ? <Trash2 size={36} /> : <Check size={40} />}
                    </motion.div>
                    <h4 className="font-syne font-black text-[24px] text-[#1a0060] leading-none">
                    {type === 'confirm-delete' || type === 'success-delete' ? 'Eliminado' : 'Listo'}
                    </h4>
                    <p className="text-[14px] font-medium text-[#1a0060]/60">
                    {type === 'confirm-delete' || type === 'success-delete' ? 'El elemento fue eliminado correctamente.' : subtitle}
                    </p>
                    </>
                )}
                </div>
                </motion.div>
                </div>
            )}
            </AnimatePresence>,
            portalTarget
        );
}

/**
 * Obtiene elementos focusables dentro de un contenedor.
 * Filtra elementos con display none, disabled, aria-hidden, o tabindex -1.
 */
function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
    if (!container) return [];
    const selectors = [
        'a[href]',
        'area[href]',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'button:not([disabled])',
        'iframe',
        'object',
        'embed',
        '[contenteditable]',
        '[tabindex]:not([tabindex="-1"])',
    ];
    const nodes = Array.from(container.querySelectorAll<HTMLElement>(selectors.join(',')));
    return nodes.filter((el) => {
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return false;
        if (el.hasAttribute('aria-hidden')) return false;
        return true;
    });
}
