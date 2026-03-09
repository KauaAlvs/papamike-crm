import React, { useState, useEffect } from 'react';
import {
    Plus, Search, User, Lock, Trash2, CheckCircle, XCircle,
    Edit, Save, X, KeyRound, Briefcase, Loader2, AlertTriangle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GestaoAcessos = ({ theme }) => {
    // --- TEMAS ---
    const isDark = theme === 'dark';
    const bgCard = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const border = isDark ? '#334155' : '#e2e8f0';
    const inputBg = isDark ? '#0f172a' : '#f8fafc';

    // --- ESTADOS ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ nome: '', login: '', cargo: 'secretaria', senha: '' });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    const apiUrl = 'http://localhost:3000';

    // 1. Carregar Usuários
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/usuarios`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Funções de CRUD
    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ nome: user.nome, login: user.login, cargo: user.cargo, senha: '' });
        } else {
            setEditingUser(null);
            setFormData({ nome: '', login: '', cargo: 'secretaria', senha: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let url = `${apiUrl}/usuarios`;
            let method = 'POST';

            if (editingUser) {
                url = `${apiUrl}/usuarios/${editingUser.id}`;
                method = 'PATCH'; // Alterado para PATCH que é mais comum em updates parciais
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchUsers();
            } else {
                alert('Erro ao salvar');
            }
        } catch (error) {
            alert("Erro de conexão.");
        }
    };

    const toggleStatus = async (user) => {
        const novoStatus = user.status === 'ativo' ? 'inativo' : 'ativo';
        if (!window.confirm(`Deseja alterar o status de ${user.nome}?`)) return;

        try {
            // Como seu backend usa PATCH /usuarios/:id genérico, vamos usar ele
            await fetch(`${apiUrl}/usuarios/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
            fetchUsers();
        } catch (error) {
            alert("Erro ao alterar status");
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteConfirmationText('');
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            // Nota: Seu backend atual não tem DELETE /usuarios/:id explícito no código que você me mandou antes.
            // Se não tiver, você precisará adicionar no index.js ou o botão falhará.
            // Vou assumir que você vai adicionar ou já tem.
            const response = await fetch(`${apiUrl}/usuarios/${userToDelete.id}`, { method: 'DELETE' });
            if (response.ok) {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
                fetchUsers();
            } else {
                alert("Erro ao excluir usuário (Verifique se a rota DELETE existe no backend).");
            }
        } catch (error) {
            alert("Erro de conexão.");
        }
    };

    const getRoleStyle = (cargo) => {
        switch (cargo) {
            case 'developer': return { bg: '#0f172a', color: '#f8fafc', label: 'Developer' };
            case 'mantenedor': return { bg: '#fee2e2', color: '#ef4444', label: 'Mantenedor' };
            case 'financeiro': return { bg: '#dcfce7', color: '#16a34a', label: 'Financeiro' };
            case 'coordenacao': return { bg: '#f3e8ff', color: '#9333ea', label: 'Coordenação' };
            default: return { bg: '#eff6ff', color: '#3b82f6', label: 'Secretaria' };
        }
    };

    const filteredUsers = users.filter(u =>
        u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.login?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* HEADER */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: textPrimary }}>Gestão de Acessos</h1>
                    <p style={{ color: textSecondary }}>Controle total de usuários.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-new"
                    style={{ backgroundColor: '#fbbf24', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(251, 191, 36, 0.4)' }}
                >
                    <Plus size={20} /> <span className="btn-text">Novo Usuário</span>
                </button>
            </div>

            {/* CONTAINER PRINCIPAL */}
            <div className="main-container" style={{
                backgroundColor: bgCard,
                borderRadius: '16px',
                border: `1px solid ${border}`,
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>

                {/* Filtros */}
                <div style={{ padding: '20px', borderBottom: `1px solid ${border}`, display: 'flex', gap: '15px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, padding: '10px 16px', borderRadius: '10px', border: `1px solid ${border}`, flex: 1 }}>
                        <Search size={18} color={textSecondary} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', color: textPrimary, width: '100%', fontSize: '14px' }}
                        />
                    </div>
                </div>

                {/* CABEÇALHO TABELA (Apenas Desktop) */}
                <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.5fr 1fr', padding: '15px 20px', backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderBottom: `1px solid ${border}`, fontWeight: 'bold', fontSize: '12px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                    <div>Usuário</div>
                    <div>Login</div>
                    <div>Cargo</div>
                    <div>Status</div>
                    <div>Último Acesso</div>
                    <div style={{ textAlign: 'right' }}>Ações</div>
                </div>

                {/* LISTA ROLÁVEL */}
                <div className="users-scroll-area">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: textSecondary }}>
                            <Loader2 className="animate-spin" style={{ margin: '0 auto', marginBottom: '10px' }} />
                            Carregando usuários...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: textSecondary }}>Nenhum usuário encontrado.</div>
                    ) : (
                        filteredUsers.map((user) => {
                            const roleStyle = getRoleStyle(user.cargo);
                            return (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="user-card"
                                    style={{ borderBottom: `1px solid ${border}`, color: textPrimary }}
                                >
                                    {/* CONTEÚDO DO CARD */}
                                    <div className="card-content">

                                        {/* Coluna 1: Usuário */}
                                        <div className="col-user" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: roleStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleStyle.color, flexShrink: 0 }}>
                                                <User size={18} />
                                            </div>
                                            <div className="user-info">
                                                <div style={{ fontSize: '15px' }}>{user.nome}</div>
                                                <div className="mobile-only-role" style={{ fontSize: '11px', color: roleStyle.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{roleStyle.label}</div>
                                            </div>
                                        </div>

                                        {/* Coluna 2: Login */}
                                        <div className="col-login">
                                            <span className="mobile-label">Login</span>
                                            <span style={{ color: textSecondary, fontFamily: 'monospace', fontSize: '13px' }}>{user.login}</span>
                                        </div>

                                        {/* Coluna 3: Cargo (Desktop) */}
                                        <div className="col-cargo desktop-only">
                                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: roleStyle.bg, color: roleStyle.color }}>
                                                {roleStyle.label}
                                            </span>
                                        </div>

                                        {/* Coluna 4: Status */}
                                        <div className="col-status">
                                            <span className="mobile-label">Status</span>
                                            <div onClick={() => toggleStatus(user)} style={{ cursor: 'pointer', width: 'fit-content' }}>
                                                {user.status === 'ativo' ? (
                                                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '13px' }}><CheckCircle size={14} /> Ativo</span>
                                                ) : (
                                                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '13px' }}><XCircle size={14} /> Inativo</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Coluna 5: Último Acesso (CORRIGIDO PARA MOSTRAR CORRETAMENTE) */}
                                        <div className="col-acesso">
                                            <span className="mobile-label">Último Acesso</span>
                                            <span style={{ color: textSecondary, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Clock size={14} />
                                                {/* Usa o campo formatado se existir, senão 'Nunca' */}
                                                {user.ultimo_acesso_fmt ? user.ultimo_acesso_fmt : 'Nunca'}
                                            </span>
                                        </div>

                                        {/* Coluna 6: Ações */}
                                        <div className="col-actions">
                                            <button onClick={() => handleOpenModal(user)} className="action-btn edit">
                                                <Edit size={16} /> <span className="mobile-btn-text">Editar</span>
                                            </button>
                                            <button onClick={() => handleDeleteClick(user)} className="action-btn delete">
                                                <Trash2 size={16} /> <span className="mobile-btn-text">Excluir</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    <div className="mobile-spacer" style={{ minWidth: '10px' }}></div>
                </div>
            </div>

            {/* --- MODAIS (Editar/Criar e Excluir) --- */}
            {/* ... Mantido igual ao seu código anterior para economizar espaço aqui, pois a lógica visual é a mesma ... */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '10px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ backgroundColor: bgCard, width: '100%', maxWidth: '450px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary }}>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: textSecondary }}>Nome</label><div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, borderRadius: '8px', border: `1px solid ${border}`, padding: '0 12px' }}><User size={16} color={textSecondary} /><input required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', outline: 'none', color: textPrimary }} /></div></div>
                                <div><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: textSecondary }}>Login</label><div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, borderRadius: '8px', border: `1px solid ${border}`, padding: '0 12px' }}><KeyRound size={16} color={textSecondary} /><input required value={formData.login} onChange={(e) => setFormData({ ...formData, login: e.target.value })} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', outline: 'none', color: textPrimary }} /></div></div>
                                <div><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: textSecondary }}>Cargo</label><div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, borderRadius: '8px', border: `1px solid ${border}`, padding: '0 12px' }}><Briefcase size={16} color={textSecondary} /><select value={formData.cargo} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', outline: 'none', color: textPrimary, cursor: 'pointer' }}><option value="secretaria">Secretaria</option><option value="financeiro">Financeiro</option><option value="coordenacao">Coordenação</option><option value="mantenedor">Mantenedor (Dono)</option><option value="developer">Developer (Dev)</option></select></div></div>
                                <div><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: textSecondary }}>{editingUser ? 'Nova Senha' : 'Senha'}</label><div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, borderRadius: '8px', border: `1px solid ${border}`, padding: '0 12px' }}><Lock size={16} color={textSecondary} /><input type="password" required={!editingUser} value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', outline: 'none', color: textPrimary }} /></div></div>
                                <button type="submit" style={{ marginTop: '10px', backgroundColor: '#fbbf24', color: '#0f172a', fontWeight: 'bold', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Save size={18} /> Salvar</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && userToDelete && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ backgroundColor: bgCard, width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}><AlertTriangle size={32} color="#ef4444" /></div>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary, marginBottom: '10px' }}>Excluir Usuário?</h2>
                            <p style={{ color: textSecondary, marginBottom: '20px' }}>Esta ação é irreversível.</p>
                            <div style={{ marginBottom: '25px', textAlign: 'left' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: textPrimary, display: 'block', marginBottom: '8px' }}>Digite <span style={{ color: '#ef4444' }}>excluir</span>:</label><input type="text" value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} placeholder="excluir" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `2px solid ${deleteConfirmationText === 'excluir' ? '#ef4444' : border}`, backgroundColor: inputBg, color: textPrimary, outline: 'none', fontSize: '15px', fontWeight: 'bold', textAlign: 'center' }} /></div>
                            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setIsDeleteModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: textPrimary, fontWeight: '600' }}>Cancelar</button><button onClick={confirmDelete} disabled={deleteConfirmationText !== 'excluir'} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: deleteConfirmationText === 'excluir' ? '#ef4444' : border, color: deleteConfirmationText === 'excluir' ? 'white' : textSecondary, fontWeight: 'bold', cursor: deleteConfirmationText === 'excluir' ? 'pointer' : 'not-allowed' }}>Apagar</button></div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ESTILOS CSS INTELIGENTES */}
            <style>{`
                /* --- PADRÃO DESKTOP (TABELA) --- */
                .users-scroll-area {
                    flex: 1;
                    overflow-y: auto;
                    display: block;
                }
                .user-card {
                    display: block;
                }
                .card-content {
                    display: grid;
                    grid-template-columns: 2fr 2fr 1.5fr 1fr 1.5fr 1fr;
                    align-items: center;
                    padding: 20px;
                }
                .mobile-label { display: none; }
                .mobile-only-role { display: none; }
                .mobile-spacer { display: none; }
                .mobile-btn-text { display: none; }
                .action-btn {
                    background: transparent;
                    border: 1px solid ${border};
                    border-radius: 6px;
                    cursor: pointer;
                    padding: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .action-btn.edit { color: ${textSecondary}; }
                .action-btn.delete { color: #ef4444; }

                /* --- MOBILE (SLIDER/CARROSSEL DE CARDS) --- */
                @media (max-width: 768px) {
                    /* Container vira scroll horizontal */
                    .users-scroll-area {
                        display: flex;
                        flex-direction: row;
                        overflow-x: auto;
                        overflow-y: hidden;
                        scroll-snap-type: x mandatory; /* Efeito de travar no card */
                        padding: 20px; /* Espaço para sombra */
                        gap: 16px;
                    }
                    
                    /* Esconde barra de rolagem para ficar clean */
                    .users-scroll-area::-webkit-scrollbar {
                        display: none;
                    }

                    /* Cada usuário vira um Card */
                    .user-card {
                        min-width: 85vw; /* Ocupa 85% da tela para ver pontinha do próximo */
                        scroll-snap-align: center; /* Trava no meio */
                        background-color: ${bgCard};
                        border: 1px solid ${border};
                        border-radius: 16px;
                        box-shadow: 0 4px 15px -3px rgba(0,0,0,0.1);
                        height: fit-content;
                    }

                    .card-content {
                        display: flex;
                        flex-direction: column;
                        padding: 20px;
                        gap: 12px;
                    }

                    .main-container {
                        background-color: transparent !important; /* Remove fundo branco do container no mobile */
                        border: none !important;
                        box-shadow: none !important;
                        overflow: visible !important;
                    }

                    .table-header { display: none !important; }
                    .desktop-only { display: none !important; }

                    /* Estilo das Linhas Internas do Card */
                    .col-user {
                        width: 100%;
                        margin-bottom: 5px;
                        border-bottom: 1px solid ${border};
                        padding-bottom: 12px;
                    }
                    .mobile-only-role { display: block; }
                    
                    .col-login, .col-status, .col-acesso {
                        display: flex;
                        justify-content: space-between;
                        width: 100%;
                        font-size: 14px;
                    }

                    .mobile-label {
                        display: inline-block;
                        font-weight: 600;
                        color: ${textSecondary};
                        font-size: 13px;
                    }

                    /* Botões Grandes e Fáceis de Clicar */
                    .col-actions {
                        display: flex;
                        gap: 10px;
                        width: 100%;
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top: 1px solid ${border};
                    }
                    .action-btn {
                        flex: 1;
                        padding: 12px;
                        border-radius: 10px;
                        gap: 8px;
                    }
                    .mobile-btn-text { display: inline; font-size: 14px; font-weight: 600; }
                    
                    .mobile-spacer { display: block; } /* Espaço final no scroll */
                }
            `}</style>
        </div>
    );
};

export default GestaoAcessos;