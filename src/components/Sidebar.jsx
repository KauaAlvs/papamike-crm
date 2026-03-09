import React from 'react';
import {
    Home, Users, MessageCircle, Calendar, Settings, LogOut, Moon, Sun,
    Shield, FileText, ChevronLeft, ChevronRight, ClipboardList, Briefcase
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ theme, toggleTheme, user, onLogout, closeMobile, collapsed, toggleCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    // Dados do Usuário (Proteção contra null/undefined)
    const userName = user?.nome || 'Usuário';
    const userRole = user?.cargo || 'visitante';

    // Pega a primeira letra do nome ou 'U' se não existir
    const userInitial = userName.charAt(0).toUpperCase();

    // Permissões
    const hasPermission = (allowedRoles) => {
        if (!allowedRoles) return true;
        if (userRole === 'developer') return true;
        return allowedRoles.includes(userRole);
    };

    // Cores do Tema
    const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';
    const borderColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
    const textColor = theme === 'dark' ? '#f1f5f9' : '#334155';
    const profileBg = theme === 'dark' ? '#1e293b' : '#f8fafc';

    // Cores de Ativo
    const activeBg = '#fbbf24'; // Amarelo Papa Mike
    const activeText = '#0f172a'; // Texto escuro no amarelo

    const handleNavigation = (path) => {
        navigate(path);
        if (closeMobile) closeMobile();
    };

    // Formata o cargo para exibição amigável
    const getRoleLabel = (role) => {
        switch (role) {
            case 'developer': return 'Desenvolvedor';
            case 'mantenedor': return 'Mantenedor';
            case 'admin': return 'Administrador';
            case 'secretaria': return 'Secretaria';
            case 'financeiro': return 'Financeiro';
            case 'coordenacao': return 'Coordenação';
            default: return 'Colaborador';
        }
    };

    // Cores baseadas no cargo para o círculo da inicial
    const getRoleColor = (role) => {
        switch (role) {
            case 'developer': return '#0f172a';
            case 'mantenedor': return '#ef4444';
            case 'financeiro': return '#16a34a';
            case 'coordenacao': return '#9333ea';
            case 'secretaria': return '#f59e0b';
            default: return '#3b82f6';
        }
    };

    return (
        <div
            style={{
                width: collapsed ? '80px' : '260px', // Largura fixa para evitar pulos
                height: '100vh',
                backgroundColor: bgColor,
                borderRight: `1px solid ${borderColor}`,
                color: textColor,
                display: 'flex',
                flexDirection: 'column',
                padding: collapsed ? '20px 10px' : '24px',
                position: 'relative',
                zIndex: 50,
                transition: 'width 0.3s ease'
            }}
        >
            {/* Botão Collapse (Desktop) */}
            <button
                onClick={toggleCollapse}
                className="desktop-only"
                style={{
                    position: 'absolute', top: '35px', right: '-12px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    backgroundColor: '#fbbf24', border: `2px solid ${bgColor}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 60, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#0f172a'
                }}
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* LOGO */}
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px', flexShrink: 0 }}>
                {collapsed ? (
                    <div style={{ width: '40px', height: '40px', background: '#fbbf24', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#0f172a', fontSize: '14px', boxShadow: '0 4px 6px rgba(251, 191, 36, 0.3)' }}>PM</div>
                ) : (
                    <img
                        src="/logo.png"
                        alt="Papa Mike"
                        style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    />
                )}
                {!collapsed && <div style={{ display: 'none', fontSize: '20px', fontWeight: '800', color: theme === 'dark' ? '#fbbf24' : '#0f172a' }}>Papa Mike</div>}
            </div>

            {/* PERFIL */}
            <div
                onClick={() => handleNavigation('/minha-conta')}
                title="Minha Conta"
                style={{
                    marginBottom: '25px', padding: collapsed ? '8px' : '12px',
                    backgroundColor: profileBg, borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: collapsed ? '0' : '12px', border: `1px solid ${borderColor}`,
                    cursor: 'pointer', minHeight: '60px',
                    transition: 'transform 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                        width: '40px', height: '40px',
                        background: getRoleColor(userRole),
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: 'white', fontSize: '18px',
                        boxShadow: '0 4px 6px -2px rgba(0,0,0,0.2)'
                    }}>
                        {userInitial}
                    </div>
                </div>

                {!collapsed && (
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {userName.split(' ')[0]} {userName.split(' ')[1] ? userName.split(' ')[1].charAt(0) + '.' : ''}
                        </div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: getRoleColor(userRole), marginTop: '2px' }}>
                            {getRoleLabel(userRole)}
                        </div>
                    </div>
                )}
            </div>

            {/* MENU */}
            <nav className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

                <SectionTitle text="PRINCIPAL" collapsed={collapsed} theme={theme} />
                <MenuItem icon={<Home size={20} />} text="Dashboard" active={isActive('/') || isActive('/dashboard')} onClick={() => handleNavigation('/dashboard')} theme={theme} collapsed={collapsed} activeBg={activeBg} activeText={activeText} />

                {/* --- CENTRAL DE MATRÍCULAS (Antigo Formulários) --- */}
                {/* Aqui ficam: Lousa, Calculadora, Novo Lead, Filas */}
                {hasPermission(['mantenedor', 'secretaria', 'coordenacao', 'admin']) && (
                    <MenuItem
                        icon={<Briefcase size={20} />}
                        text="Central de Matrículas"
                        active={isActive('/formularios')}
                        onClick={() => handleNavigation('/formularios')}
                        theme={theme} collapsed={collapsed} activeBg={activeBg} activeText={activeText}
                    />
                )}

                {hasPermission(['mantenedor', 'secretaria']) && (
                    <MenuItem icon={<Users size={20} />} text="Leads (CRM)" active={isActive('/leads')} onClick={() => handleNavigation('/leads')} theme={theme} collapsed={collapsed} activeBg={activeBg} activeText={activeText} />
                )}

                {/* OPERACIONAL */}
                {hasPermission(['mantenedor', 'secretaria', 'coordenacao']) && (
                    <div style={{ marginTop: '10px' }}>
                        <MenuItem icon={<Calendar size={20} />} text="Agenda" active={isActive('/agenda')} onClick={() => handleNavigation('/agenda')} theme={theme} collapsed={collapsed} activeBg={activeBg} activeText={activeText} />
                        <MenuItem icon={<MessageCircle size={20} />} text="Atendimentos" active={isActive('/atendimentos')} onClick={() => handleNavigation('/atendimentos')} theme={theme} collapsed={collapsed} activeBg={activeBg} activeText={activeText} />
                    </div>
                )}

                {/* GESTÃO */}
                {hasPermission(['mantenedor', 'coordenacao', 'financeiro']) && (
                    <div style={{ marginTop: '20px', paddingTop: collapsed ? '10px' : '0', borderTop: collapsed ? `1px solid ${borderColor}` : 'none' }}>
                        <SectionTitle text="GESTÃO" collapsed={collapsed} theme={theme} />
                        <MenuItem icon={<FileText size={20} />} text="Relatórios" active={isActive('/relatorios')} onClick={() => handleNavigation('/relatorios')} theme={theme} collapsed={collapsed} activeBg={activeBg} activeText={activeText} />

                        {hasPermission(['mantenedor']) && (
                            <>
                                <MenuItem icon={<Shield size={20} />} text="Acessos" active={isActive('/acessos')} onClick={() => handleNavigation('/acessos')} theme={theme} collapsed={collapsed} activeBg={activeBg} activeText={activeText} />
                                <MenuItem icon={<Settings size={20} />} text="Configurações" active={isActive('/configuracoes')} onClick={() => handleNavigation('/configuracoes')} theme={theme} collapsed={collapsed} activeBg={activeBg} activeText={activeText} />
                            </>
                        )}
                    </div>
                )}
            </nav>

            {/* RODAPÉ */}
            <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '10px', marginTop: '10px', flexShrink: 0 }}>
                <div
                    onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px',
                        color: theme === 'dark' ? '#e2e8f0' : '#475569', transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#334155' : '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Alternar Tema"
                >
                    {theme === 'dark' ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} />}
                    {!collapsed && <span style={{ fontSize: '14px', fontWeight: '600' }}>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
                </div>

                <MenuItem icon={<LogOut size={20} />} text="Sair" color="#ef4444" theme={theme} onClick={onLogout} collapsed={collapsed} activeBg="#fee2e2" activeText="#ef4444" />
            </div>

            <style>{`@media (max-width: 768px) { .desktop-only { display: none !important; } }`}</style>
        </div>
    );
};

// Sub-componentes
const SectionTitle = ({ text, collapsed, theme }) => {
    if (collapsed) return <div style={{ height: '10px' }}></div>;
    return <div style={{ fontSize: '10px', fontWeight: '800', color: theme === 'dark' ? '#64748b' : '#94a3b8', marginBottom: '8px', paddingLeft: '12px', letterSpacing: '1px' }}>{text}</div>;
};

const MenuItem = ({ icon, text, active, onClick, color, theme, collapsed, activeBg, activeText }) => {
    const textColor = theme === 'dark' ? '#cbd5e1' : '#64748b';
    return (
        <div
            onClick={onClick}
            title={collapsed ? text : ''}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '12px', padding: '12px', width: '100%', borderRadius: '12px', marginBottom: '4px',
                cursor: 'pointer', backgroundColor: active ? activeBg : 'transparent',
                color: active ? activeText : (color || textColor), fontWeight: active ? '700' : '500',
                whiteSpace: 'nowrap', transition: 'none'
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
            <div style={{ flexShrink: 0 }}>{icon}</div>
            {!collapsed && <span style={{ fontSize: '14px' }}>{text}</span>}
        </div>
    );
};

export default Sidebar;