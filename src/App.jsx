import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, Loader2 } from 'lucide-react';

// Importação dos Componentes
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Agenda from './pages/Agenda';
import Atendimentos from './pages/Atendimentos';
import Formularios from './pages/Formularios';
import GestaoAcessos from './pages/GestaoAcessos';
import Configuracoes from './pages/Configuracoes';
import Relatorios from './pages/Relatorios';
import MinhaConta from './pages/MinhaConta';

function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- EFEITO INICIAL (Recuperar Sessão) ---
  useEffect(() => {
    const savedUser = localStorage.getItem('usuario_ativo');
    const savedTheme = localStorage.getItem('papamike_theme');

    if (savedTheme) setTheme(savedTheme);

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('usuario_ativo');
        }
      } catch (error) {
        console.error("Erro ao recuperar usuário:", error);
        localStorage.removeItem('usuario_ativo');
      }
    }
    setLoading(false);
  }, []);

  // --- HANDLERS ---
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('papamike_theme', newTheme);
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleLogin = (userData, remember) => {
    setUser(userData);
    localStorage.setItem('usuario_ativo', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('usuario_ativo');
  };

  const handleUpdateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('usuario_ativo', JSON.stringify(updatedData));
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  // --- ROTA PROTEGIDA ---
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (loading) return null;
    if (!user) return <Navigate to="/" replace />;

    const userRole = user.cargo || user.role;

    // Acesso total para developer
    if (userRole === 'developer') return children;

    // Se não houver roles restritas, libera geral
    if (!allowedRoles) return children;

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(userRole)) return <Navigate to="/dashboard" replace />;

    return children;
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;

  // Se não estiver logado, mostra Login
  if (!user) return <Login onLogin={handleLogin} theme={theme} />;

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc', color: theme === 'dark' ? 'white' : '#1e293b', flexDirection: 'column' }}>

        {/* Header Mobile */}
        <div className="mobile-header" style={{ display: 'none', padding: '15px 20px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderBottom: '1px solid #334155', flexShrink: 0 }}>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: theme === 'dark' ? '#fff' : '#000', cursor: 'pointer' }}><Menu size={28} /></button>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Papa Mike</span>
          <div style={{ width: 28 }}></div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', flexDirection: 'row' }}>

          {/* Sidebar */}
          <div className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: isSidebarCollapsed ? '80px' : '280px', transition: 'width 0.3s ease', flexShrink: 0, zIndex: 50, overflow: 'visible' }}>
            <Sidebar
              theme={theme}
              toggleTheme={toggleTheme}
              user={user}
              onLogout={handleLogout}
              closeMobile={closeMobile}
              collapsed={isSidebarCollapsed}
              toggleCollapse={toggleSidebar}
            />
          </div>

          {/* Overlay Mobile */}
          {isMobileMenuOpen && <div onClick={closeMobile} className="mobile-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}></div>}

          {/* Conteúdo Principal */}
          <main style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '20px', position: 'relative', width: '100%' }}>
            <div style={{ maxWidth: '100%', margin: '0 auto', paddingBottom: '50px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="/minha-conta" element={<MinhaConta theme={theme} user={user} updateUser={handleUpdateUser} />} />

                {/* CORREÇÃO AQUI: Passando user={user} para o Dashboard */}
                <Route path="/dashboard" element={<Dashboard theme={theme} user={user} />} />

                {/* CORREÇÃO AQUI: Passando user={user} para a Agenda */}
                <Route path="/agenda" element={<Agenda theme={theme} user={user} />} />

                <Route path="/atendimentos" element={<Atendimentos theme={theme} user={user} />} />
                <Route path="/formularios" element={<Formularios theme={theme} user={user} />} />

                <Route path="/leads" element={<ProtectedRoute allowedRoles={['mantenedor', 'secretaria', 'admin']}><Leads theme={theme} /></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute allowedRoles={['mantenedor', 'coordenacao', 'admin']}><Relatorios theme={theme} /></ProtectedRoute>} />
                <Route path="/acessos" element={<ProtectedRoute allowedRoles={['mantenedor', 'admin']}><GestaoAcessos theme={theme} /></ProtectedRoute>} />

                {/* CORREÇÃO CRÍTICA AQUI: Adicionado user={user} */}
                <Route path="/configuracoes" element={<ProtectedRoute allowedRoles={['mantenedor', 'admin']}><Configuracoes theme={theme} user={user} /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </main>
        </div>

        <style>{`.sidebar-container { height: 100%; position: relative; z-index: 50; flex-shrink: 0; background-color: ${theme === 'dark' ? '#1e293b' : '#fff'}; border-right: 1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}; } @media (max-width: 768px) { .mobile-header { display: flex !important; } .sidebar-container { position: absolute; left: -280px; width: 280px !important; top: 0; bottom: 0; transition: left 0.3s ease-in-out; box-shadow: 5px 0 15px rgba(0,0,0,0.3); } .sidebar-container.open { left: 0; } .mobile-overlay { display: block; } } @media (min-width: 769px) { .mobile-overlay { display: none !important; } }`}</style>
      </div>
    </BrowserRouter>
  );
}

export default App;