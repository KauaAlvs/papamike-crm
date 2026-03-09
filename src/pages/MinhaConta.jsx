import React, { useState, useEffect } from 'react';
import { User, KeyRound, Save, Lock, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURAÇÃO ---
// Agora apontamos para a rota padrão de usuários, que aceita PATCH
const API_URL = 'http://localhost:3000/usuarios';

const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20, x: 20 }}
            style={{
                position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
                color: 'white', padding: '12px 20px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontWeight: 'bold', fontSize: '14px'
            }}
        >
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message}
        </motion.div>
    );
};

const MinhaConta = ({ theme, user, onUpdateUser }) => {
    // --- TEMAS ---
    const isDark = theme === 'dark';
    const bgCard = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const border = isDark ? '#334155' : '#e2e8f0';
    const inputBg = isDark ? '#0f172a' : '#f8fafc';

    // --- ESTADOS ---
    const [formData, setFormData] = useState({
        nome: '',
        login: '',
        senha: '',
        confirmarSenha: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    // Carrega dados iniciais
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nome: user.nome || '',
                login: user.login || '',
                senha: '',
                confirmarSenha: ''
            }));
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();

        // 1. Validação de Senhas
        if (formData.senha && formData.senha !== formData.confirmarSenha) {
            showToast("As senhas não coincidem!", "error");
            return;
        }

        // 2. Segurança de ID
        if (!user || !user.id) {
            showToast("Erro: Sessão inválida. Faça login novamente.", "error");
            return;
        }

        try {
            setLoading(true);

            // 3. Monta o Payload (Dados para enviar)
            const payload = { nome: formData.nome };
            // Só envia a senha se o usuário digitou algo
            if (formData.senha) payload.senha = formData.senha;

            // 4. Envio para o Servidor (Agora simplificado)
            // A rota no index.js é: app.patch('/usuarios/:id')
            const response = await fetch(`${API_URL}/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Sucesso!
                const updatedUser = await response.json(); // O back devolve o usuário atualizado

                showToast("Perfil atualizado com sucesso!");

                // CORREÇÃO AQUI: Só chama se a função existir
                if (typeof onUpdateUser === 'function') {
                    onUpdateUser({ ...user, ...updatedUser });
                } else {
                    console.warn("Aviso: onUpdateUser não foi passado para este componente.");
                }

                // Limpa campos de senha
                setFormData(prev => ({ ...prev, senha: '', confirmarSenha: '' }));
            } else {
                // Erro HTTP (404, 500, etc)
                if (response.status === 404) {
                    showToast("Erro 404: Usuário não encontrado. Tente fazer Logout.", "error");
                } else {
                    showToast(`Erro do Servidor: ${response.status}`, "error");
                }
            }

        } catch (error) {
            console.error("Erro Fetch:", error);
            showToast("Erro de conexão com o servidor (Verifique se o backend está rodando).", "error");
        } finally {
            setLoading(false);
        }
    };

    const userInitial = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U';

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px', fontFamily: 'Inter, sans-serif' }}>
            <AnimatePresence>
                {toast && <NotificationToast {...toast} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary }}>Minha Conta</h1>
                <p style={{ color: textSecondary }}>Gerencie suas credenciais de acesso.</p>
            </div>

            <div className="account-grid">
                {/* --- COLUNA 1: CARD --- */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        backgroundColor: bgCard, borderRadius: '16px', border: `1px solid ${border}`,
                        padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        textAlign: 'center', height: 'fit-content'
                    }}
                >
                    <div style={{ width: '100px', height: '100px', borderRadius: '30px', backgroundColor: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', marginBottom: '20px' }}>
                        {userInitial}
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary, marginBottom: '5px' }}>{user?.nome}</h2>
                    <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '20px' }}>
                        {user?.cargo || 'Membro'}
                    </div>
                    <div style={{ width: '100%', borderTop: `1px solid ${border}`, paddingTop: '20px', color: textSecondary, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ShieldCheck size={16} /> Acesso Confirmado
                    </div>
                </motion.div>

                {/* --- COLUNA 2: FORMULÁRIO --- */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ backgroundColor: bgCard, borderRadius: '16px', border: `1px solid ${border}`, padding: '30px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', paddingBottom: '15px', borderBottom: `1px solid ${border}` }}>
                        <User size={20} color={textPrimary} />
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: textPrimary }}>Informações Pessoais</h3>
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: textSecondary }}>Nome Completo</label>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, borderRadius: '10px', border: `1px solid ${border}`, padding: '0 12px' }}>
                                <User size={18} color={textSecondary} />
                                <input
                                    required value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', outline: 'none', color: textPrimary }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: textSecondary }}>Login (Fixo)</label>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '10px', border: `1px solid ${border}`, padding: '0 12px', opacity: 0.7 }}>
                                <KeyRound size={18} color={textSecondary} />
                                <input
                                    readOnly value={formData.login}
                                    style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', outline: 'none', color: textSecondary, cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '10px', paddingTop: '20px', borderTop: `1px solid ${border}` }}>
                            <label style={{ display: 'block', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold', color: textPrimary }}>Segurança</label>
                            <div className="password-grid" style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: textSecondary }}>Nova Senha</label>
                                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, borderRadius: '10px', border: `1px solid ${border}`, padding: '0 12px' }}>
                                        <Lock size={18} color={textSecondary} />
                                        <input
                                            type="password" value={formData.senha} placeholder="Opcional"
                                            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                            style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', outline: 'none', color: textPrimary }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: textSecondary }}>Confirmar</label>
                                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, borderRadius: '10px', border: `1px solid ${border}`, padding: '0 12px' }}>
                                        <Lock size={18} color={textSecondary} />
                                        <input
                                            type="password" value={formData.confirmarSenha} placeholder="Confirme" disabled={!formData.senha}
                                            onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                                            style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', outline: 'none', color: textPrimary, opacity: !formData.senha ? 0.5 : 1 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button
                                type="submit" disabled={loading}
                                style={{ backgroundColor: '#fbbf24', color: '#0f172a', fontWeight: 'bold', padding: '12px 30px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}
                            >
                                <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            <style>{`
                .account-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; align-items: start; }
                .password-grid { grid-template-columns: 1fr 1fr; }
                @media (max-width: 768px) { .account-grid { grid-template-columns: 1fr; } .password-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
};

export default MinhaConta;