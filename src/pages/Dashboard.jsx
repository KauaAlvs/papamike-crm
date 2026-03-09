import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, Calendar, DollarSign, CheckCircle,
    Loader2, Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';

// --- ESTILOS GLOBAIS ---
const getStyles = (theme) => {
    const isDark = theme === 'dark';
    return {
        isDark,
        bg: isDark ? '#0f172a' : '#f8fafc',
        card: isDark ? '#1e293b' : '#ffffff',
        text: isDark ? '#f8fafc' : '#1e293b',
        textSec: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? '#334155' : '#e2e8f0',
        grid: isDark ? '#334155' : '#e2e8f0',
        primary: '#fbbf24',
        accent: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        purple: '#8b5cf6',
        shadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    };
};

// --- FUNÇÕES AUXILIARES ---
const parseCurrency = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    let v = value.toString().replace('R$', '').trim();
    if (v.includes(',') && v.includes('.')) v = v.replace(/\./g, '').replace(',', '.');
    else if (v.includes(',')) v = v.replace(',', '.');
    return parseFloat(v) || 0;
};

const Dashboard = ({ theme, user }) => {
    const s = getStyles(theme);
    const isAdmin = ['admin', 'developer', 'mantenedor', 'coordenacao'].includes(user?.cargo);
    const canViewFinance = ['developer', 'mantenedor', 'financeiro', 'admin'].includes(user?.cargo);

    // --- ESTADOS ---
    const [rawLeads, setRawLeads] = useState([]);
    const [dbGoals, setDbGoals] = useState({ leads: 0, matriculas: 0, visitas: 0, receita: 0 });
    const [loadingData, setLoadingData] = useState(true);

    // Filtros
    const [periodFilter, setPeriodFilter] = useState('mes');
    const [revenueCategory, setRevenueCategory] = useState('matricula');

    // --- CARREGAMENTO ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const [resLeads, resGoals] = await Promise.all([
                    fetch('http://localhost:3000/leads'),
                    fetch('http://localhost:3000/metas')
                ]);

                if (resLeads.ok) setRawLeads(await resLeads.json());
                if (resGoals.ok) setDbGoals(await resGoals.json());

            } catch (e) { console.error("Erro dashboard", e); }
            finally { setLoadingData(false); }
        };
        loadData();
    }, []);

    // --- CÁLCULOS OTIMIZADOS ---
    const dashboardData = useMemo(() => {
        const now = new Date();

        // Função Helper: Verifica se o lead conta como venda (independente de estar arquivado)
        const isVendaConfirmada = (lead) => {
            if (lead.status === 'matriculado') return true;
            if (lead.etapa_matricula === 'concluido') return true;
            if (lead.data_matricula) return true; // Se tem data, é venda.
            return false;
        };

        // Função de Filtro de Data
        const isWithinPeriod = (dateStr) => {
            if (!dateStr) return false;
            const d = new Date(dateStr);
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (periodFilter === 'hoje') {
                return d >= startOfDay;
            }
            if (periodFilter === 'semana') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Volta para Domingo
                startOfWeek.setHours(0, 0, 0, 0);
                return d >= startOfWeek;
            }
            if (periodFilter === 'mes') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            if (periodFilter === 'ano') {
                return d.getFullYear() === now.getFullYear();
            }
            return true;
        };

        // 1. Filtragem de Leads Captados (Baseado na data de criação)
        const leadsNoPeriodo = rawLeads.filter(l => isWithinPeriod(l.date));

        // 2. Filtragem de Matrículas (Baseado na data da matrícula OU data de criação se não houver matricula)
        // AQUI ESTÁ A CORREÇÃO PRINCIPAL: Verifica isVendaConfirmada
        const matriculadosNoPeriodo = rawLeads.filter(l =>
            isVendaConfirmada(l) && isWithinPeriod(l.data_matricula || l.date)
        );

        // 3. Filtragem de Visitas
        const visitasNoPeriodo = rawLeads.filter(l =>
            (['visita_agendada', 'visitando', 'matriculado', 'negociando'].includes(l.status) || l.visitDate) &&
            isWithinPeriod(l.visitDate || l.date)
        );

        // 4. Cálculo Financeiro (Baseado nos matriculados filtrados acima)
        const receitaCalculada = matriculadosNoPeriodo.reduce((acc, lead) => {
            const p = lead.proposta_comercial || {};
            let valorParaSomar = 0;

            if (revenueCategory === 'total') {
                valorParaSomar += parseCurrency(p.matricula);
                valorParaSomar += parseCurrency(p.mensalidade);
                valorParaSomar += parseCurrency(p.material);
                valorParaSomar += parseCurrency(p.integral);
            } else if (revenueCategory === 'matricula') {
                valorParaSomar = parseCurrency(p.matricula || p.valor_final);
            } else if (revenueCategory === 'mensalidade') {
                valorParaSomar = parseCurrency(p.mensalidade);
            } else if (revenueCategory === 'material') {
                valorParaSomar = parseCurrency(p.material);
            } else if (revenueCategory === 'integral') {
                valorParaSomar = parseCurrency(p.integral);
            }

            return acc + valorParaSomar;
        }, 0);

        // 5. Conversão
        const taxaConversao = leadsNoPeriodo.length > 0
            ? ((matriculadosNoPeriodo.length / leadsNoPeriodo.length) * 100).toFixed(1)
            : 0;

        // 6. Ranking de Origem
        const originsMap = leadsNoPeriodo.reduce((acc, l) => {
            const orig = l.origem || 'Não Informado';
            acc[orig] = (acc[orig] || 0) + 1;
            return acc;
        }, {});

        const originData = Object.keys(originsMap)
            .map(k => ({ name: k, value: originsMap[k] }))
            .sort((a, b) => b.value - a.value);

        return {
            leads: leadsNoPeriodo.length,
            matriculas: matriculadosNoPeriodo.length,
            visitas: visitasNoPeriodo.length,
            receita: receitaCalculada,
            conversao: taxaConversao,
            originData,
            ticketMedio: matriculadosNoPeriodo.length > 0 ? receitaCalculada / matriculadosNoPeriodo.length : 0
        };

    }, [rawLeads, periodFilter, revenueCategory]);

    // Gráfico de Evolução (Considera também status arquivado+concluido)
    const chartData = useMemo(() => {
        const data = [];
        const today = new Date();
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        const isVendaHistorica = (l) => l.status === 'matriculado' || (l.status === 'arquivado' && l.etapa_matricula === 'concluido') || !!l.data_matricula;

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const mIdx = d.getMonth();
            const yr = d.getFullYear();

            const leadsMes = rawLeads.filter(l => {
                const lDate = new Date(l.date);
                return lDate.getMonth() === mIdx && lDate.getFullYear() === yr;
            });

            const matriculasMes = rawLeads.filter(l => {
                // Tenta usar data de matricula, senão data de criação
                const dataRef = l.data_matricula ? new Date(l.data_matricula) : new Date(l.date);
                return isVendaHistorica(l) && dataRef.getMonth() === mIdx && dataRef.getFullYear() === yr;
            });

            data.push({
                name: monthNames[mIdx],
                leads: leadsMes.length,
                matriculas: matriculasMes.length
            });
        }
        return data;
    }, [rawLeads]);

    if (loadingData) return <LoadingScreen s={s} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '60px', fontFamily: "'Inter', sans-serif" }}>

            {/* --- HEADER --- */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', color: s.text, letterSpacing: '-1px', margin: 0 }}>
                        Visão Geral
                    </h1>
                    <p style={{ color: s.textSec, fontSize: '16px', marginTop: '5px' }}>
                        Acompanhamento de performance em tempo real.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: s.textSec, textTransform: 'uppercase' }}>Período de Análise</span>
                    <div style={{ display: 'flex', backgroundColor: s.bg, borderRadius: '8px', padding: '4px', border: `1px solid ${s.border}` }}>
                        {['hoje', 'semana', 'mes', 'ano'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setPeriodFilter(opt)}
                                style={{
                                    border: 'none',
                                    background: periodFilter === opt ? s.card : 'transparent',
                                    color: periodFilter === opt ? s.primary : s.textSec,
                                    borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', textTransform: 'capitalize',
                                    boxShadow: periodFilter === opt ? s.shadow : 'none', transition: 'all 0.2s'
                                }}>
                                {opt === 'mes' ? 'Mês Atual' : opt}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* --- KPIS PRINCIPAIS --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <MetricCard s={s} title="Leads Captados" value={dashboardData.leads} goal={dbGoals.leads} icon={Users} color={s.accent} sub="Novos contatos no período" />
                <MetricCard s={s} title="Visitas / Agend." value={dashboardData.visitas} goal={dbGoals.visitas} icon={Calendar} color={s.primary} sub="Interesse demonstrado" />
                <MetricCard s={s} title="Matrículas" value={dashboardData.matriculas} goal={dbGoals.matriculas} icon={CheckCircle} color={s.success} sub="Contratos fechados" />

                {/* --- CARD DE RECEITA COM FILTRO INTERNO --- */}
                {canViewFinance && (
                    <div style={{ backgroundColor: s.card, padding: '24px', borderRadius: '20px', border: `1px solid ${s.border}`, boxShadow: s.shadow, gridColumn: 'span 1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: `${s.purple}20` }}>
                                    <DollarSign size={20} color={s.purple} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', color: s.textSec, fontWeight: '600' }}>Receita Confirmada</div>
                                    <div style={{ fontSize: '11px', color: s.textSec }}>Base: Matrículas no Período</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: '28px', fontWeight: '800', color: s.text, marginBottom: '20px' }}>
                            {dashboardData.receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>

                        {/* Botões de Categoria Financeira */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {[
                                { id: 'matricula', label: 'Matrícula' },
                                { id: 'mensalidade', label: 'Mensalidade' },
                                { id: 'material', label: 'Material' },
                                { id: 'integral', label: 'Integral' },
                                { id: 'total', label: 'Total Geral' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setRevenueCategory(cat.id)}
                                    style={{
                                        flex: 1,
                                        fontSize: '10px',
                                        padding: '6px 4px',
                                        borderRadius: '6px',
                                        border: revenueCategory === cat.id ? `1px solid ${s.purple}` : `1px solid ${s.border}`,
                                        backgroundColor: revenueCategory === cat.id ? `${s.purple}15` : 'transparent',
                                        color: revenueCategory === cat.id ? s.purple : s.textSec,
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- GRÁFICOS E DETALHES --- */}
            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '2fr 1fr' : '1fr', gap: '24px' }}>

                {/* 1. Evolução Mensal (Fixo) */}
                <CardContainer s={s} title="Evolução Semestral" subtitle="Histórico de Leads e Matrículas">
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={s.grid} />
                                <XAxis dataKey="name" stroke={s.textSec} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <YAxis stroke={s.textSec} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: s.card, borderRadius: '8px', border: `1px solid ${s.border}`, color: s.text }}
                                    cursor={{ fill: s.isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }}
                                />
                                <Bar dataKey="leads" fill={s.accent} radius={[4, 4, 0, 0]} name="Leads" />
                                <Bar dataKey="matriculas" fill={s.success} radius={[4, 4, 0, 0]} name="Matrículas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContainer>

                {/* 2. Origem e Funil */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <InfoBlock s={s} title="Funil do Período" icon={<Activity size={18} />}>
                        <FunnelRow label="Leads" value={dashboardData.leads} color={s.accent} max={dashboardData.leads} s={s} />
                        <FunnelRow label="Visitas" value={dashboardData.visitas} color={s.primary} max={dashboardData.leads} s={s} />
                        <FunnelRow label="Matrículas" value={dashboardData.matriculas} color={s.success} max={dashboardData.leads} s={s} />

                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: `1px solid ${s.grid}`, display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '12px', color: s.textSec }}>Taxa de Conversão</div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: s.success }}>{dashboardData.conversao}%</div>
                        </div>
                    </InfoBlock>

                    {isAdmin && (
                        <CardContainer s={s} title="Top Origens" subtitle="No período selecionado">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                {dashboardData.originData.slice(0, 4).map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: idx === 0 ? s.success : s.textSec }}></div>
                                            <span style={{ color: s.text }}>{item.name}</span>
                                        </div>
                                        <span style={{ fontWeight: '700', color: s.textSec }}>{item.value}</span>
                                    </div>
                                ))}
                                {dashboardData.originData.length === 0 && <span style={{ fontSize: '12px', color: s.textSec }}>Sem dados.</span>}
                            </div>
                        </CardContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTES UI AUXILIARES ---

const CardContainer = ({ s, title, subtitle, children }) => (
    <div style={{ backgroundColor: s.card, borderRadius: '20px', padding: '25px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}>
        <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: s.text, margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '12px', color: s.textSec, marginTop: '2px' }}>{subtitle}</p>}
        </div>
        {children}
    </div>
);

const MetricCard = ({ s, title, value, goal, icon: Icon, color, sub }) => {
    const numericGoal = Number(goal) || 1;
    const percent = Math.min((value / (numericGoal || 1)) * 100, 100);

    return (
        <div style={{ backgroundColor: s.card, padding: '24px', borderRadius: '20px', border: `1px solid ${s.border}`, boxShadow: s.shadow, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: s.text, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: s.textSec, marginTop: '4px' }}>{title}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: `${color}15`, color: color }}>
                    <Icon size={22} />
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', color: s.textSec, marginBottom: '6px' }}>
                    <span>Meta: {goal}</span>
                    <span>{percent.toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: s.bg, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: color, borderRadius: '3px', transition: 'width 1s' }} />
                </div>
                {sub && <div style={{ fontSize: '11px', color: s.textSec, marginTop: '8px', fontStyle: 'italic' }}>{sub}</div>}
            </div>
        </div>
    );
};

const InfoBlock = ({ s, title, icon, children }) => (
    <div style={{ backgroundColor: s.card, borderRadius: '20px', padding: '25px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: `1px solid ${s.grid}` }}>
            {React.cloneElement(icon, { color: s.textSec })}
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: s.text, margin: 0 }}>{title}</h3>
        </div>
        {children}
    </div>
);

const FunnelRow = ({ label, value, color, max, s }) => {
    const percent = max > 0 ? (value / max) * 100 : 0;
    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px', fontWeight: '600', color: s.text }}>
                <span>{label}</span>
                <span>{value}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: s.bg, borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, height: '100%', backgroundColor: color, transition: 'width 0.8s' }} />
            </div>
        </div>
    );
};

const LoadingScreen = ({ s }) => (
    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" color={s.primary} />
    </div>
);

export default Dashboard;