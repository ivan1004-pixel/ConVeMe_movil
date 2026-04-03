import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert, Loader2 } from 'lucide-react';
import { convemeApi } from '../../api/convemeApi';

interface ModalAutorizacionProps {
    isOpen: boolean;
    esFaltante: boolean;
    monto: string;
    vendedor: string;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export default function ModalAutorizacion({ isOpen, esFaltante, monto, vendedor, onConfirm, onClose }: ModalAutorizacionProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        if (!password) {
            setError("Debes ingresar tu contraseña de administrador.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. ¡AQUÍ ESTÁ LA MAGIA! Buscamos la llave correcta: 'id_usuario'
            const idUsuarioStr = localStorage.getItem('id_usuario');

            if (!idUsuarioStr) {
                throw new Error("No se encontró tu sesión. Por favor cierra sesión y vuelve a entrar.");
            }

            const idUsuario = parseInt(idUsuarioStr, 10);

            // 2. Armamos la consulta usando VARIABLES
            const query = `
            query ValidarPassword($id: Int!, $pass: String!) {
                validarPasswordAdmin(id_usuario: $id, password: $pass)
            }
            `;

            // 3. Enviamos la petición
            const { data } = await convemeApi.post('', {
                query,
                variables: {
                    id: idUsuario,
                    pass: password
                }
            });

            // 4. Revisamos si GraphQL nos regresó un error específico
            if (data.errors) {
                console.error("Detalle del error GraphQL:", data.errors);
                throw new Error(data.errors[0].message || "Error de validación en el servidor.");
            }

            // 5. Verificamos el resultado
            if (!data.data.validarPasswordAdmin) {
                throw new Error("Contraseña de administrador incorrecta.");
            }

            // ¡Éxito!
            await onConfirm();
            setPassword('');
        } catch (e: any) {
            const mensajeReal = e.response?.data?.errors?.[0]?.message || e.message;
            setError(mensajeReal || "Error al validar autorización.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a0060]/50 backdrop-blur-sm font-sans">
        <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-sm border-[3px] border-[#1a0060] shadow-[6px_6px_0_0_#1a0060] overflow-hidden"
        >
        {/* Header Advertencia */}
        <div className={`${esFaltante ? 'bg-[#fff1f2] border-b-[3px] border-[#fecdd3]' : 'bg-[#fefce8] border-b-[3px] border-[#fde047]'} p-4 flex justify-between items-center`}>
        <div className="flex items-center gap-3">
        <div className={`${esFaltante ? 'text-red-500 bg-red-100 border-red-200' : 'text-amber-500 bg-amber-100 border-amber-200'} p-2 rounded-xl border-2`}>
        <AlertTriangle size={24} />
        </div>
        <div>
        <h3 className={`font-black text-lg uppercase tracking-tight ${esFaltante ? 'text-red-600' : 'text-amber-600'}`}>
        {esFaltante ? 'Faltante Detectado' : 'Sobrante Detectado'}
        </h3>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Requiere Autorización</p>
        </div>
        </div>
        <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-800 transition-colors">
        <X size={20} />
        </button>
        </div>

        <div className="p-6 text-center">
        <p className="font-black text-2xl text-[#1a0060] mb-2">
        {esFaltante ? 'Faltan' : 'Sobran'} <span className={esFaltante ? 'text-red-500' : 'text-amber-500'}>${monto}</span> para cuadrar.
        </p>
        <p className="text-sm font-semibold text-gray-500 mb-6 px-4">
        El vendedor entregó {esFaltante ? 'menos' : 'más'} dinero del esperado.
        </p>

        <div className={`p-3 rounded-xl border-2 border-dashed ${esFaltante ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'} text-xs font-bold mb-6`}>
        Vendedor: {vendedor}
        </div>

        {/* Input Contraseña */}
        <div className="text-left mb-6">
        <label className="flex items-center gap-2 text-xs font-black text-[#1a0060] uppercase tracking-widest mb-2">
        <ShieldAlert size={14} className="text-[#cc55ff]" />
        Contraseña de Administrador
        </label>
        <input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full bg-[#f8f9fc] border-[3px] border-gray-200 rounded-xl p-3 font-bold text-[#1a0060] outline-none focus:border-[#cc55ff] focus:bg-white transition-all text-center tracking-widest"
        />
        {error && <p className="text-red-500 text-xs font-bold mt-2 flex items-center justify-center gap-1"><AlertTriangle size={12}/> {error}</p>}
        </div>

        <div className="flex gap-3">
        <button
        onClick={onClose}
        disabled={loading}
        className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
        >
        Cancelar
        </button>
        <button
        onClick={handleConfirm}
        disabled={loading}
        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border-[3px] shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-2 ${esFaltante ? 'bg-red-500 text-white border-red-700' : 'bg-amber-400 text-[#1a0060] border-amber-600'}`}
        >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sí, Autorizar'}
        </button>
        </div>
        </div>
        </motion.div>
        </div>
        </AnimatePresence>
    );
}
