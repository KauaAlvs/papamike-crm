import React, { useState } from 'react';
import { Lock, User, Loader2, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = ({ onLogin }) => {
    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showWelcome, setShowWelcome] = useState(false);
    const [authenticatedUser, setAuthenticatedUser] = useState(null);

    // Recupera usuário salvo, se houver
    const savedUser = JSON.parse(localStorage.getItem('usuario_ativo'));

    const handleEntrar = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = 'http://localhost:3000'; // Ajuste se usar env

            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: loginInput, senha: password })
            });

            const data = await response.json();

            if (response.ok) {
                const userFound = data.user || data.usuario;

                // Mantém o avatar se já existir localmente
                if (savedUser && savedUser.login === userFound.login && savedUser.avatar) {
                    userFound.avatar = savedUser.avatar;
                }

                setAuthenticatedUser(userFound);

                // Salva sessão no navegador (ESSENCIAL PARA O F5)
                if (remember) {
                    localStorage.setItem('usuario_ativo', JSON.stringify(userFound));
                } else {
                    // Se não marcou lembrar, salva na sessão (opcional, mas aqui vamos salvar no local pra garantir o F5 durante uso)
                    localStorage.setItem('usuario_ativo', JSON.stringify(userFound));
                }

                if (data.token) localStorage.setItem('token', data.token);
                localStorage.setItem('usuario_cargo', userFound.cargo);

                setLoading(false);
                setShowWelcome(true);

                // Redirecionamento com delay para animação
                setTimeout(() => {
                    if (onLogin) {
                        onLogin(userFound);
                    } else {
                        window.location.href = '/dashboard'; // Fallback
                    }
                }, 2000);

            } else {
                setError(data.message || 'Credenciais inválidas.');
                setLoading(false);
            }

        } catch (err) {
            console.error(err);
            setError('Erro de conexão com o servidor.');
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
                {!showWelcome ? (
                    <motion.div
                        key="login-box"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5 }}
                        style={{ backgroundColor: 'white', padding: '40px 50px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', zIndex: 10 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>

                            {/* LOGO RESTAURADA AQUI */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                                <img
                                    src="/logo.png"
                                    alt="Logo Papa Mike"
                                    style={{ height: '80px', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        // Mostra a div seguinte (o quadrado amarelo) se a imagem falhar
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                {/* Fallback caso a imagem não carregue */}
                                <div style={{ display: 'none', width: '70px', height: '70px', background: '#fbbf24', borderRadius: '18px', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '28px', color: '#0f172a' }}>
                                    PM
                                </div>
                            </div>

                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>Acesso Restrito</h1>
                            <p style={{ color: '#64748b', marginTop: '5px' }}>Colégio Papa Mike - CRM</p>
                        </div>

                        <form onSubmit={handleEntrar}>
                            {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '14px', fontWeight: '600' }}>USUÁRIO</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', backgroundColor: '#f8fafc' }}>
                                    <User size={20} color="#94a3b8" />
                                    <input
                                        type="text"
                                        value={loginInput}
                                        onChange={(e) => setLoginInput(e.target.value)}
                                        placeholder="ex: adm.papamike"
                                        required
                                        style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '15px', color: '#334155' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '14px', fontWeight: '600' }}>SENHA</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', backgroundColor: '#f8fafc' }}>
                                    <Lock size={20} color="#94a3b8" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '15px', color: '#334155' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div onClick={() => setRemember(!remember)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#64748b', fontSize: '14px' }}>
                                    {remember ? <CheckSquare size={18} color="#fbbf24" /> : <Square size={18} />}
                                    <span>Lembrar login</span>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#fbbf24', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px -1px rgba(251, 191, 36, 0.4)', opacity: loading ? 0.7 : 1 }}>
                                {loading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Acessar Sistema'}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="welcome-splash"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        style={{ textAlign: 'center', zIndex: 20 }}
                    >
                        <motion.div
                            initial={{ boxShadow: "0 0 0 rgba(251, 191, 36, 0)" }}
                            animate={{ boxShadow: "0 0 50px rgba(251, 191, 36, 0.6)" }}
                            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                            style={{ width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto 30px auto', border: '4px solid #fbbf24', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {/* Avatar ou Inicial */}
                            <div style={{ fontSize: '60px', fontWeight: 'bold', color: '#fbbf24', backgroundColor: '#1e293b', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {authenticatedUser?.nome ? authenticatedUser.nome.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}
                        >
                            Olá, {authenticatedUser?.nome?.split(' ')[0]}!
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            transition={{ delay: 0.6 }}
                            style={{ color: '#94a3b8', fontSize: '18px' }}
                        >
                            Carregando Dashboard...
                        </motion.p>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 100 }}
                            transition={{ delay: 0.5, duration: 1.5 }}
                            style={{ height: '4px', background: '#fbbf24', margin: '20px auto', borderRadius: '2px', maxWidth: '100px' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Login;