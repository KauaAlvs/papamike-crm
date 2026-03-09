import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, BookOpen, DollarSign, ArrowLeft, School,
    CheckCircle, Clock, Loader2, Star, CheckSquare, History, FileText, User,
    ChevronRight, MapPin, Phone, Mail, Trash2, Percent, Image as ImageIcon,
    X, Bell, AlertCircle, LayoutDashboard, Send, HelpCircle, Filter, Calendar,
    FastForward, ThumbsUp, MessageSquare, TrendingUp, Users, Activity, Maximize2,
    RotateCcw, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

// Importe seu componente de Lousa
import LousaDigital from '../components/LousaDigital';

// ==================================================================================
// --- TEMA E ESTILOS GLOBAIS ---
// ==================================================================================
const getTheme = (theme) => ({
    isDark: theme === 'dark',
    bgMain: theme === 'dark' ? '#0f172a' : '#f8fafc',
    bgCard: theme === 'dark' ? '#1e293b' : '#ffffff',
    textPrimary: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    textSecondary: theme === 'dark' ? '#94a3b8' : '#64748b',
    border: theme === 'dark' ? '#334155' : '#e2e8f0',
    primary: '#fbbf24',
    accent: '#3b82f6',
    success: '#10b981',
    purple: '#8b5cf6',
    danger: '#ef4444',
    shadow: theme === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
    shadowHover: theme === 'dark' ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
});

// ==================================================================================
// --- HELPERS ---
// ==================================================================================
const formatarMoeda = (valor) => {
    if (!valor) return '';
    const v = String(valor).replace(/\D/g, "");
    return (parseFloat(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatarValorReais = (valor) => {
    if (!valor) return '';
    if (String(valor).includes(',')) return valor;
    const numero = parseFloat(valor);
    if (isNaN(numero)) return valor;
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseMoeda = (valorStr) => {
    if (!valorStr) return 0;
    let v = String(valorStr).replace('R$', '').trim();
    if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.');
    return parseFloat(v) || 0;
};

const formatarLista = (valor) => Array.isArray(valor) ? valor.join(', ') : (valor || '-');

const formatDataBr = (dataString) => {
    if (!dataString) return '-';
    try {
        const date = new Date(dataString);
        return date.toLocaleDateString('pt-BR');
    } catch (e) { return '-'; }
};

const getStatusColor = (status, s) => {
    if (status === 'concluido' || status === 'matriculado') return s.success;
    if (status === 'fechado') return s.accent;
    if (status === 'negociando') return s.primary;
    if (status === 'visitando' || status === 'visita_agendada' || status === 'aguardando_pedagogico') return s.purple;
    if (status === 'lost' || status === 'perdido') return s.danger;
    return s.textSecondary;
};

const getStatusLabel = (status) => {
    if (!status) return 'Novo';
    return status.replace(/_/g, ' ');
};

// ==================================================================================
// --- SERVIÇOS DE AGENDA ---
// ==================================================================================
const AgendaService = {
    criarTarefa: async (leadId, tipo, titulo) => {
        try {
            await fetch('http://localhost:3000/agenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadId: leadId,
                    tipo: tipo,
                    titulo: titulo,
                    data: new Date().toISOString(),
                    status: 'pendente',
                    descricao: `Tarefa automática gerada pelo fluxo de matrícula.`
                })
            });
        } catch (e) { console.error("Erro Agenda:", e); }
    },

    concluirTarefa: async (leadId, tipo) => {
        try {
            const res = await fetch(`http://localhost:3000/agenda?leadId=${leadId}&tipo=${tipo}`);
            const tarefas = await res.json();
            if (tarefas.length > 0) {
                for (const tarefa of tarefas) {
                    await fetch(`http://localhost:3000/agenda/${tarefa.id}`, { method: 'DELETE' });
                }
            }
        } catch (e) { console.error("Erro Agenda:", e); }
    }
};

// ==================================================================================
// 1. ÁREA ADMINISTRATIVA (MODO GESTÃO)
// ==================================================================================
const FormulariosAdmin = ({ theme, user }) => {
    const s = getTheme(theme);
    const [leads, setLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, matriculas: 0, conversao: 0, filaPed: 0, filaCom: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:3000/leads');
                const data = await res.json();
                if (Array.isArray(data)) {
                    const sorted = data.sort((a, b) => b.id - a.id);
                    setLeads(sorted);
                    const total = sorted.length;
                    const matriculas = sorted.filter(l => l.status === 'matriculado').length;
                    const conversao = total > 0 ? ((matriculas / total) * 100).toFixed(1) : 0;

                    const filaPed = sorted.filter(l => l.etapa_matricula === 'aguardando_pedagogico' || l.pedagogical_status === 'waiting_interview').length;
                    const filaCom = sorted.filter(l => l.etapa_matricula === 'aguardando_comercial' || (l.pedagogical_status === 'interview_done' && l.status !== 'matriculado')).length;

                    setStats({ total, matriculas, conversao, filaPed, filaCom });
                }
                setLoading(false);
            } catch (e) { setLoading(false); }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredLeads = leads.filter(l => (l.aluno?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (l.responsavel?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
    const getSafeData = (lead) => ({ aluno: lead.aluno || lead.perfil_completo?.alunos?.[0]?.nome || "Desconhecido", resp: lead.responsavel || lead.perfil_completo?.responsaveis?.[0]?.nome || "Desconhecido", tel: lead.telefone || lead.perfil_completo?.contatos?.[0]?.numero || "-", status: lead.status || 'novo', etapa: lead.etapa_matricula || '-' });

    if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color={s.primary} /></div>;

    return (
        <div style={{ height: '100%', display: 'flex', backgroundColor: s.bgMain, overflow: 'hidden' }}>
            <div style={{ width: '400px', borderRight: `1px solid ${s.border}`, display: 'flex', flexDirection: 'column', backgroundColor: s.bgCard, zIndex: 10 }}>
                <div style={{ padding: '20px', borderBottom: `1px solid ${s.border}`, backgroundColor: theme === 'dark' ? '#1e293b' : '#f0f9ff' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: s.textPrimary, margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={20} color={s.accent} /> Visão Geral</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <KPICard label="Total Leads" value={stats.total} icon={Users} color={s.accent} s={s} />
                        <KPICard label="Conversão" value={`${stats.conversao}%`} icon={TrendingUp} color={s.success} s={s} />
                        <KPICard label="Fila Ped." value={stats.filaPed} icon={BookOpen} color={s.purple} s={s} />
                        <KPICard label="Fila Com." value={stats.filaCom} icon={DollarSign} color={s.primary} s={s} />
                    </div>
                    <div style={{ position: 'relative' }}><Search size={16} color={s.textSecondary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} /><input type="text" placeholder="Buscar lead..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '10px', border: `1px solid ${s.border}`, backgroundColor: s.bgMain, color: s.textPrimary, outline: 'none', fontSize: '13px' }} /></div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                    {filteredLeads.map(lead => {
                        const d = getSafeData(lead);
                        const color = getStatusColor(d.status, s);
                        return (
                            <motion.div key={lead.id} whileHover={{ scale: 1.01 }} style={{ padding: '15px', marginBottom: '10px', borderRadius: '12px', cursor: 'default', backgroundColor: 'transparent', border: `1px solid ${s.border}`, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span style={{ fontWeight: 'bold', color: s.textPrimary, fontSize: '14px' }}>{d.aluno}</span><span style={{ fontSize: '10px', color: s.textSecondary }}>{formatDataBr(lead.date)}</span></div>
                                <div style={{ fontSize: '12px', color: s.textSecondary, marginBottom: '8px' }}>{d.resp}</div>
                                <div style={{ display: 'flex', gap: '5px' }}><span style={{ fontSize: '10px', fontWeight: 'bold', color: color, backgroundColor: `${color}15`, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{d.status}</span></div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: s.bgMain, color: s.textSecondary }}>
                <p>Selecione um lead no modo Operacional para detalhes.</p>
            </div>
        </div>
    );
};

const KPICard = ({ label, value, icon: Icon, color, s }) => (<div style={{ backgroundColor: s.bgMain, padding: '10px', borderRadius: '10px', border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ padding: '6px', borderRadius: '6px', backgroundColor: `${color}20`, color: color }}><Icon size={16} /></div><div><div style={{ fontSize: '10px', color: s.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</div><div style={{ fontSize: '14px', fontWeight: '800', color: s.textPrimary }}>{value}</div></div></div>);

// ==================================================================================
// 2. OPERACIONAL (MENU HUB - UNIFICADO)
// ==================================================================================
const MenuHub = ({ s, onSelect, user, counts, viewedState }) => {
    const role = user?.cargo || '';
    const isCoord = ['coordenacao', 'mantenedor', 'admin', 'developer'].includes(role);
    const isComercial = ['secretaria', 'financeiro', 'mantenedor', 'admin', 'developer'].includes(role);
    const showPedBadge = counts.ped > 0 && !viewedState.ped;
    const showComBadge = counts.com > 0 && !viewedState.com;

    return (
        <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '40px' }}><h1 style={{ fontSize: '32px', fontWeight: '800', color: s.textPrimary, letterSpacing: '-1px' }}>Central de Matrículas</h1><p style={{ color: s.textSecondary, fontSize: '16px' }}>Painel Operacional • {user?.nome}</p></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'repeat(2, 200px)', gap: '25px' }}>
                <motion.div whileHover={{ y: -5, boxShadow: s.shadowHover }} onClick={() => onSelect('novo_lead')} style={{ gridColumn: 'span 6', gridRow: 'span 2', backgroundColor: s.primary, borderRadius: '30px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: s.shadow }}><div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.15 }}><Plus size={200} color="#000" /></div><div><div style={{ backgroundColor: 'rgba(0,0,0,0.1)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><Plus size={30} color="#3f2305" /></div><h2 style={{ fontSize: '36px', fontWeight: '800', color: '#3f2305', margin: 0, lineHeight: 1.1 }}>Novo<br />Atendimento</h2></div><div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3f2305', fontWeight: 'bold' }}><span>Iniciar cadastro</span> <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} /></div></motion.div>
                {(isCoord || isComercial) && <StatusCard s={s} title="Fila Pedagógica" icon={BookOpen} color={s.purple} count={showPedBadge ? counts.ped : 0} onClick={() => onSelect('fila_pedagogica')} desc="Entrevistas / Triagem" gridSpan="span 3" />}
                {isComercial && <StatusCard s={s} title="Fechamento" icon={DollarSign} color={s.success} count={showComBadge ? counts.com : 0} onClick={() => onSelect('fila_comercial')} desc="Matrículas" gridSpan="span 3" />}
                <motion.div whileHover={{ y: -5, boxShadow: s.shadowHover }} onClick={() => onSelect('historico')} style={{ gridColumn: 'span 6', backgroundColor: s.bgCard, borderRadius: '30px', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: `1px solid ${s.border}`, boxShadow: s.shadow }}><div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}><div style={{ width: '60px', height: '60px', borderRadius: '20px', backgroundColor: '#f43f5e20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}><History size={30} /></div><div><h3 style={{ fontSize: '20px', fontWeight: 'bold', color: s.textPrimary, margin: 0 }}>Histórico & Feed</h3><p style={{ margin: 0, color: s.textSecondary }}>Consulte todos os leads</p></div></div><ChevronRight size={24} color={s.textSecondary} /></motion.div>
            </div>
            <style>{`@media (max-width: 1024px) { div[style*="grid-template-columns"] { display: flex; flexDirection: column; height: auto; } div[style*="gridRow: 'span 2'"] { height: 200px; } }`}</style>
        </div>
    );
};

const StatusCard = ({ s, title, icon: Icon, color, count, onClick, desc, gridSpan }) => (
    <motion.div whileHover={{ y: -5, boxShadow: s.shadowHover }} onClick={onClick} style={{ gridColumn: gridSpan, backgroundColor: s.bgCard, borderRadius: '30px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', border: `1px solid ${s.border}`, boxShadow: s.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div style={{ width: '50px', height: '50px', borderRadius: '16px', backgroundColor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}><Icon size={24} /></div>{count > 0 && (<div style={{ backgroundColor: s.danger, color: 'white', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>{count}</div>)}</div>
        <div><h3 style={{ fontSize: '18px', fontWeight: 'bold', color: s.textPrimary, margin: '0 0 5px 0' }}>{title}</h3><p style={{ margin: 0, color: s.textSecondary, fontSize: '13px' }}>{desc}</p></div>
    </motion.div>
);

// ==================================================================================
// 3. FORMULÁRIO NOVO (RECEPÇÃO)
// ==================================================================================
const FormularioNovo = ({ theme, user, onExit, onRefresh }) => {
    const s = getTheme(theme);
    const [step, setStep] = useState(0);
    const [visitaImediata, setVisitaImediata] = useState(false);

    const [formData, setFormData] = useState({
        atendente: user?.nome, canal: '', detalheCanal: '',
        responsaveis: [{ nome: '', parentesco: 'Pai/Mãe', telefone: '', email: '' }],
        contatos: [{ tipo: 'Whatsapp', numero: '' }],
        endereco: { cep: '', rua: '', numero: '', bairro: '', cidade: '' },
        alunos: [{ nome: '', nasc: '', escola_anterior: '', serie: '' }],
        motivoTroca: [], valoriza: [], conheceu: '', notasComerciais: '', nivelInteresse: 0,
        motivoSaida: ''
    });

    const steps = ['Canal', 'Resp.', 'Endereço', 'Aluno(s)', 'Pesquisa', 'Análise'];
    const listas = {
        canais: ['Indicação', 'Localização (Passou na frente)', 'Instagram', 'Facebook', 'Site / Google', 'Material Promocional', 'Outros'],
        turmas: ['Berçário', 'Maternal I', 'Maternal II', 'Jardim I', 'Jardim II', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano', '1º Médio', '2º Médio', '3º Médio'],
        motivos: ['Mudança de Casa', 'Insatisfação Pedagógica', 'Insatisfação Disciplinar', 'Bullying / Social', 'Valor / Financeiro', 'Indicação de Amigos', 'Infraestrutura', 'Proximidade', 'Horário / Turno'],
        valoriza: ['Segurança', 'Disciplina / Normas', 'Qualidade de Ensino', 'Preço Justo', 'Esportes / Quadra', 'Ambiente Familiar', 'Atendimento', 'Tecnologia / Inovação']
    };

    const update = (field, val) => setFormData(p => ({ ...p, [field]: val }));
    const updateArray = (arr, idx, field, val) => { const newArr = [...formData[arr]]; newArr[idx] = { ...newArr[idx], [field]: val }; setFormData(p => ({ ...p, [arr]: newArr })); };
    const addItem = (arr, item) => setFormData(p => ({ ...p, [arr]: [...p[arr], item] }));
    const removeItem = (arr, idx) => setFormData(p => ({ ...p, [arr]: p[arr].filter((_, i) => i !== idx) }));
    const toggleMulti = (f, val) => { const c = formData[f] || []; setFormData(p => ({ ...p, [f]: c.includes(val) ? c.filter(i => i !== val) : [...c, val] })); };
    const handleCanalChange = (opt) => setFormData(p => ({ ...p, canal: opt, detalheCanal: '' }));

    const handleSubmit = async () => {
        if (!formData.responsaveis[0].nome || !formData.alunos[0].nome) { Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Preencha o nome do Responsável e do Aluno.' }); return; }
        try {
            const now = new Date();
            const dadosFinais = {
                ...formData,
                contatos: [{ numero: formData.responsaveis[0].telefone || '', email: formData.responsaveis[0].email || '' }],
                status: visitaImediata ? 'visita_agendada' : 'novo',
                visitDate: visitaImediata ? now.toISOString().split('T')[0] : null,
                visitTime: visitaImediata ? now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null
            };

            const res = await fetch('http://localhost:3000/atendimentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...dadosFinais, tipo: 'novo' }) });
            const savedLead = await res.json();

            if (visitaImediata) {
                await fetch('http://localhost:3000/atendimentos-pedagogicos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lead_id: savedLead.leadId,
                        aluno: formData.alunos[0].nome,
                        turma: formData.alunos[0].serie,
                        responsavel: formData.responsaveis[0].nome,
                        status: 'aguardando_entrevista',
                        data_solicitacao: new Date().toISOString()
                    })
                });
            }

            await AgendaService.criarTarefa(savedLead.leadId, 'pedagogico', `Triagem: ${formData.alunos[0].nome}`);
            await Swal.fire({ icon: 'success', title: 'Cadastro Realizado!', text: visitaImediata ? 'Visita Iniciada! Enviado para Fila Pedagógica.' : 'Lead criado com sucesso.', timer: 2000, showConfirmButton: false });
            onRefresh(); onExit();
        } catch (e) { Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha ao salvar.' }); }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: s.bgMain }}>
            <div style={{ padding: '15px 20px', backgroundColor: s.bgCard, borderBottom: `1px solid ${s.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><button onClick={onExit} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><ArrowLeft size={24} color={s.textPrimary} /></button><div><h2 style={{ fontSize: '18px', fontWeight: 'bold', color: s.textPrimary, margin: 0 }}>{steps[step]}</h2><span style={{ fontSize: '12px', color: s.textSecondary }}>Passo {step + 1} de {steps.length}</span></div></div>
                <div style={{ display: 'flex', gap: '5px' }}>{steps.map((_, i) => <div key={i} style={{ width: '30px', height: '4px', borderRadius: '2px', backgroundColor: i <= step ? s.primary : s.border }} />)}</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                {step === 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>{listas.canais.map(opt => <button key={opt} onClick={() => handleCanalChange(opt)} style={{ padding: '20px', borderRadius: '16px', border: formData.canal === opt ? `2px solid ${s.primary}` : `1px solid ${s.border}`, backgroundColor: formData.canal === opt ? `${s.primary}15` : s.bgCard, color: s.textPrimary, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textAlign: 'center' }}>{opt}</button>)}</div>{(formData.canal === 'Indicação' || formData.canal === 'Outros') && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px' }}><Input label={formData.canal === 'Indicação' ? "Quem indicou?" : "Especifique"} value={formData.detalheCanal} onChange={e => update('detalheCanal', e.target.value)} s={s} autoFocus /></motion.div>}</div>}
                {step === 1 && <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>{formData.responsaveis.map((resp, i) => (<div key={i} style={{ backgroundColor: s.bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><h3 style={{ color: s.accent, margin: 0, fontSize: '16px' }}>Responsável {i + 1}</h3>{i > 0 && <button onClick={() => removeItem('responsaveis', i)} style={{ background: 'transparent', border: 'none' }}><Trash2 color={s.danger} /></button>}</div><div style={{ display: 'grid', gap: '15px' }}><Input label="Nome Completo" value={resp.nome} onChange={e => updateArray('responsaveis', i, 'nome', e.target.value)} s={s} autoFocus={i === 0} /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}><Input label="Parentesco" value={resp.parentesco} onChange={e => updateArray('responsaveis', i, 'parentesco', e.target.value)} s={s} /><Input label="Telefone / Whatsapp" value={resp.telefone} onChange={e => updateArray('responsaveis', i, 'telefone', e.target.value)} s={s} /></div><Input label="E-mail" value={resp.email} onChange={e => updateArray('responsaveis', i, 'email', e.target.value)} s={s} /></div></div>))}<button onClick={() => addItem('responsaveis', { nome: '', parentesco: '', telefone: '', email: '' })} style={{ padding: '15px', width: '100%', borderRadius: '12px', border: `2px dashed ${s.border}`, background: 'transparent', color: s.textPrimary, fontWeight: 'bold', cursor: 'pointer' }}>+ Adicionar Outro Responsável</button></div>}
                {step === 2 && <div style={{ backgroundColor: s.bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}><h3 style={{ color: s.textPrimary, margin: '0 0 15px 0', fontSize: '16px' }}>Endereço Completo</h3><div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px' }}><Input label="CEP" value={formData.endereco.cep} onChange={e => setFormData(p => ({ ...p, endereco: { ...p.endereco, cep: e.target.value } }))} s={s} /><Input label="Rua" value={formData.endereco.rua} onChange={e => setFormData(p => ({ ...p, endereco: { ...p.endereco, rua: e.target.value } }))} s={s} /></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '15px' }}><Input label="Num" value={formData.endereco.numero} onChange={e => setFormData(p => ({ ...p, endereco: { ...p.endereco, numero: e.target.value } }))} s={s} /><Input label="Bairro" value={formData.endereco.bairro} onChange={e => setFormData(p => ({ ...p, endereco: { ...p.endereco, bairro: e.target.value } }))} s={s} /><Input label="Cidade" value={formData.endereco.cidade} onChange={e => setFormData(p => ({ ...p, endereco: { ...p.endereco, cidade: e.target.value } }))} s={s} /></div></div>}
                {step === 3 && <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>{formData.alunos.map((aluno, i) => (<div key={i} style={{ backgroundColor: s.bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><h3 style={{ color: s.primaryText, margin: 0, fontSize: '16px' }}>Aluno {i + 1}</h3>{i > 0 && <button onClick={() => removeItem('alunos', i)} style={{ background: 'transparent', border: 'none' }}><Trash2 color={s.danger} /></button>}</div><Input label="Nome Completo" value={aluno.nome} onChange={e => updateArray('alunos', i, 'nome', e.target.value)} s={s} /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}><Input label="Nascimento" type="date" value={aluno.nasc} onChange={e => updateArray('alunos', i, 'nasc', e.target.value)} s={s} /><div><label style={{ display: 'block', marginBottom: '8px', color: s.textSecondary, fontWeight: 'bold', fontSize: '13px' }}>Série</label><select value={aluno.serie} onChange={e => updateArray('alunos', i, 'serie', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${s.border}`, backgroundColor: s.bgMain, color: s.textPrimary, fontSize: '14px' }}><option value="">Selecione...</option>{listas.turmas.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div><div style={{ marginTop: '15px' }}><Input label="Escola Anterior" value={aluno.escola_anterior} onChange={e => updateArray('alunos', i, 'escola_anterior', e.target.value)} s={s} /></div></div>))}<button onClick={() => addItem('alunos', { nome: '', serie: '', escola_anterior: '' })} style={{ padding: '15px', width: '100%', borderRadius: '12px', border: `2px dashed ${s.border}`, background: 'transparent', color: s.textPrimary, fontWeight: 'bold', cursor: 'pointer' }}>+ Adicionar Irmão</button></div>}
                {step === 4 && <div style={{ backgroundColor: s.bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}><h3 style={{ color: s.textPrimary, margin: '0 0 15px 0', fontSize: '16px' }}>Pesquisa</h3><label style={{ display: 'block', color: s.textSecondary, fontWeight: 'bold', marginBottom: '10px', fontSize: '13px' }}>O que mais valoriza?</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px' }}>{listas.valoriza.map(opt => (<button key={opt} onClick={() => toggleMulti('valoriza', opt)} style={{ padding: '8px 15px', borderRadius: '20px', border: formData.valoriza.includes(opt) ? `2px solid ${s.success}` : `1px solid ${s.border}`, backgroundColor: formData.valoriza.includes(opt) ? `${s.success}15` : 'transparent', color: formData.valoriza.includes(opt) ? s.success : s.textPrimary, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>{opt}</button>))}</div><label style={{ display: 'block', color: s.textSecondary, fontWeight: 'bold', marginBottom: '10px', fontSize: '13px' }}>Motivo da Procura</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px' }}>{listas.motivos.map(opt => (<button key={opt} onClick={() => toggleMulti('motivoTroca', opt)} style={{ padding: '8px 15px', borderRadius: '20px', border: formData.motivoTroca.includes(opt) ? `2px solid ${s.accent}` : `1px solid ${s.border}`, backgroundColor: formData.motivoTroca.includes(opt) ? `${s.accent}15` : 'transparent', color: formData.motivoTroca.includes(opt) ? s.accent : s.textPrimary, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>{opt}</button>))}</div><Input label="Motivo da Saída (Escola Anterior)" value={formData.motivoSaida} onChange={e => update('motivoSaida', e.target.value)} s={s} placeholder="Ex: Bullying, Preço, Mudança..." /></div>}
                {step === 5 && (<div style={{ backgroundColor: s.bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}><h3 style={{ color: s.textPrimary, margin: '0 0 15px 0', fontSize: '16px' }}>Análise</h3><label style={{ display: 'block', marginBottom: '10px', color: s.textSecondary, fontWeight: 'bold', fontSize: '13px' }}>Termômetro de Interesse</label><div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>{[1, 2, 3, 4, 5].map(sVal => (<Star key={sVal} size={36} fill={sVal <= formData.nivelInteresse ? s.primary : 'none'} color={sVal <= formData.nivelInteresse ? s.primary : s.border} onClick={() => update('nivelInteresse', sVal)} style={{ cursor: 'pointer' }} />))}</div><label style={{ display: 'block', marginBottom: '10px', color: s.textSecondary, fontWeight: 'bold', fontSize: '13px' }}>Anotação Comercial (Para Coordenação)</label><textarea value={formData.notasComerciais} onChange={e => update('notasComerciais', e.target.value)} style={{ width: '100%', height: '150px', padding: '12px', borderRadius: '12px', border: `1px solid ${s.border}`, backgroundColor: s.bgMain, color: s.textPrimary, fontSize: '14px', outline: 'none', resize: 'none', marginBottom: '25px' }} placeholder="Ex: Família busca ensino forte..." /><div onClick={() => setVisitaImediata(!visitaImediata)} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '12px', backgroundColor: visitaImediata ? `${s.primary}15` : s.bgMain, border: visitaImediata ? `2px solid ${s.primary}` : `1px solid ${s.border}`, cursor: 'pointer' }}><div style={{ width: '24px', height: '24px', borderRadius: '6px', border: `2px solid ${visitaImediata ? s.primary : s.textSecondary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: visitaImediata ? s.primary : 'transparent' }}>{visitaImediata && <CheckCircle size={16} color="#000" />}</div><div><div style={{ fontWeight: 'bold', color: s.textPrimary }}>A família está realizando a visita agora?</div><div style={{ fontSize: '12px', color: s.textSecondary }}>Se marcado, o lead vai direto para "Visita Agendada".</div></div></div></div>)}
            </div>
            <div style={{ padding: '20px', backgroundColor: s.bgCard, borderTop: `1px solid ${s.border}`, display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => step > 0 && setStep(s => s - 1)} disabled={step === 0} style={{ padding: '12px 25px', borderRadius: '10px', border: `1px solid ${s.border}`, background: 'transparent', color: s.textSecondary, fontWeight: 'bold', opacity: step === 0 ? 0.5 : 1, cursor: 'pointer' }}>Voltar</button>
                <button onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : handleSubmit()} style={{ padding: '12px 40px', borderRadius: '10px', border: 'none', background: s.primary, color: '#3f2305', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: s.shadow }}>{step === steps.length - 1 ? 'Enviar' : 'Próximo'}</button>
            </div>
        </div>
    );
};

// ==================================================================================
// 5. TELA PEDAGÓGICA (COM FILA UNIFICADA)
// ==================================================================================
const TelaPedagogica = ({ theme, lead, onExit, onRefresh, user }) => {
    const s = getTheme(theme);
    const [notas, setNotas] = useState('');
    const [avaliacao, setAvaliacao] = useState(0);
    const [showLousa, setShowLousa] = useState(false);
    const canEdit = ['coordenacao', 'mantenedor', 'admin', 'developer'].includes(user?.cargo);

    const perf = lead?.perfil_completo || {};
    const motivos = Array.isArray(perf.motivos) ? perf.motivos.join(', ') : (perf.motivos || '-');
    const valores = Array.isArray(perf.valores) ? perf.valores.join(', ') : (perf.valores || '-');
    const notaRecepcao = perf.notas || '-';

    const escolaAnterior = lead?.escola_anterior || perf?.alunos?.[0]?.escola_anterior || '-';
    const nomeAluno = lead?.aluno || perf?.alunos?.[0]?.nome || '-';
    const nomeResp = lead?.responsavel || perf?.responsaveis?.[0]?.nome || '-';
    const serie = lead?.ano || perf?.alunos?.[0]?.serie || '-';

    const handleSave = async (imagemBase64 = null) => {
        if (avaliacao === 0 && canEdit) { Swal.fire({ icon: 'warning', title: 'Avalie a Triagem', text: 'Por favor, dê estrelas.' }); return; }
        try {
            await fetch(`http://localhost:3000/leads/${lead.id}/pedagogico`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notas_pedagogicas: notas, avaliacao_atendimento: avaliacao, lousa_pedagogica: imagemBase64, etapa_matricula: 'aguardando_comercial', status: 'negociando' }) });
            await AgendaService.concluirTarefa(lead.id, 'pedagogico');
            await AgendaService.criarTarefa(lead.id, 'financeiro', `Matrícula: ${nomeAluno}`);
            await Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Enviado para Comercial.', timer: 2000, showConfirmButton: false });
            onRefresh(); onExit();
        } catch (e) { Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível salvar.' }); }
    };

    const handleSkip = async () => {
        const confirm = await Swal.fire({ title: 'Pular Entrevista?', text: "Use apenas se a coordenação não estiver disponível.", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, Pular', cancelButtonText: 'Cancelar' });
        if (!confirm.isConfirmed) return;
        try {
            await fetch(`http://localhost:3000/leads/${lead.id}/pedagogico`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    etapa_matricula: 'aguardando_comercial',
                    status: 'negociando',
                    pedagogical_status: 'interview_done', // Marca como feito para liberar fluxo
                    notas_pedagogicas: 'Etapa pulada manualmente.'
                })
            });
            await AgendaService.concluirTarefa(lead.id, 'pedagogico');
            await AgendaService.criarTarefa(lead.id, 'financeiro', `Matrícula: ${nomeAluno}`);
            onRefresh(); onExit();
        } catch (e) { Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao pular etapa.' }); }
    };

    if (showLousa) return <div style={{ height: '100%', backgroundColor: '#fff' }}><LousaDigital onSave={(img) => { setShowLousa(false); handleSave(img); }} onCancel={() => setShowLousa(false)} /></div>;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: s.bgMain }}>
            <HeaderTela title="Entrevista Pedagógica" sub={nomeAluno} onExit={onExit} theme={theme} icon={BookOpen} color={s.purple} />
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#fefce8', border: '1px solid #fde047', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '14px', color: '#854d0e', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={16} /> DADOS DA RECEPÇÃO</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div><strong style={{ fontSize: '12px', color: '#a16207' }}>MOTIVO PROCURA:</strong><div style={{ fontSize: '14px', color: '#422006' }}>{motivos}</div></div>
                        <div><strong style={{ fontSize: '12px', color: '#a16207' }}>O QUE VALORIZA:</strong><div style={{ fontSize: '14px', color: '#422006' }}>{valores}</div></div>
                        <div style={{ gridColumn: 'span 2' }}><strong style={{ fontSize: '12px', color: '#a16207' }}>NOTA COMERCIAL:</strong><div style={{ fontSize: '14px', color: '#422006' }}>{notaRecepcao}</div></div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '20px' }}><InfoBox label="Aluno" value={nomeAluno} s={s} /><InfoBox label="Série" value={serie} s={s} /><InfoBox label="Escola Anterior" value={escolaAnterior} s={s} /><InfoBox label="Resp." value={nomeResp} s={s} /></div>

                {canEdit ? (
                    <>
                        <div style={{ backgroundColor: s.bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${s.border}`, marginBottom: '20px', textAlign: 'center', boxShadow: s.shadow }}><h3 style={{ color: s.textPrimary, marginTop: 0, fontSize: '16px' }}>Avaliação da Triagem</h3><div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>{[1, 2, 3, 4, 5].map(star => <Star key={star} size={32} fill={star <= avaliacao ? s.primary : 'none'} color={star <= avaliacao ? s.primary : s.border} style={{ cursor: 'pointer' }} onClick={() => setAvaliacao(star)} />)}</div></div>
                        <div style={{ backgroundColor: s.bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}><h3 style={{ color: s.textPrimary, marginTop: 0, fontSize: '16px' }}>Parecer Pedagógico</h3><textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Digite observações importantes..." style={{ width: '100%', height: '180px', padding: '15px', borderRadius: '10px', border: `1px solid ${s.border}`, backgroundColor: s.bgMain, color: s.textPrimary, fontSize: '15px', lineHeight: '1.5', outline: 'none' }} /></div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: s.textSecondary }}>
                        <Lock size={40} style={{ marginBottom: '15px' }} />
                        <p>Aguardando entrevista com a Coordenação.</p>
                        <p style={{ fontSize: '14px' }}>Se necessário, use o botão abaixo para pular esta etapa.</p>
                    </div>
                )}
            </div>
            <div style={{ padding: '20px', backgroundColor: s.bgCard, borderTop: `1px solid ${s.border}`, display: 'flex', gap: '15px' }}>{canEdit ? (<><button onClick={() => setShowLousa(true)} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: `1px solid ${s.purple}`, background: 'transparent', color: s.purple, fontWeight: 'bold', cursor: 'pointer' }}>Lousa Digital</button><button onClick={() => handleSave(null)} style={{ flex: 2, padding: '15px', backgroundColor: s.purple, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }}>Concluir Entrevista</button></>) : (<button onClick={handleSkip} style={{ width: '100%', padding: '15px', backgroundColor: s.textSecondary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><FastForward size={20} /> PULAR ETAPA (COORD. AUSENTE)</button>)}</div>
        </div>
    );
};

// ==================================================================================
// 6. TELA COMERCIAL (COCKPIT DE VENDAS + TELA DO CLIENTE 180º)
// ==================================================================================
const TelaComercial = ({ theme, lead, onExit, onRefresh }) => {
    const s = getTheme(theme);
    const [valores, setValores] = useState({
        matricula: formatarValorReais(lead?.proposta_comercial?.matricula || ''),
        mensalidade: formatarValorReais(lead?.proposta_comercial?.mensalidade || ''),
        material: formatarValorReais(lead?.proposta_comercial?.material || ''),
        integral: formatarValorReais(lead?.proposta_comercial?.integral || ''),
        turno: lead?.proposta_comercial?.turno || 'Manhã',
        obs: lead?.proposta_comercial?.obs || ''
    });

    // Controle da Negociação
    const [baseMensalidade, setBaseMensalidade] = useState(null);
    const [activeDiscount, setActiveDiscount] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showClientView, setShowClientView] = useState(false); // Modal do Cliente

    const nomeAluno = lead?.aluno || lead?.perfil_completo?.alunos?.[0]?.nome || '-';
    const nomeResp = lead?.responsavel || lead?.perfil_completo?.responsaveis?.[0]?.nome || '-';
    const serie = lead?.ano || lead?.perfil_completo?.alunos?.[0]?.serie || '-';

    // Handlers Rápidos
    const setMatriculaRapida = (val) => setValores(p => ({ ...p, matricula: formatarValorReais(val) }));
    const setMaterialRapido = (val) => setValores(p => ({ ...p, material: formatarValorReais(val) }));

    const applyDiscount = (type, percent) => {
        if (activeDiscount === type) return;
        let base = baseMensalidade;
        if (base === null) {
            base = parseMoeda(valores.mensalidade);
            setBaseMensalidade(base);
        }
        const newValue = base * (1 - percent / 100);
        setValores(prev => ({ ...prev, mensalidade: newValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }));
        setActiveDiscount(type);
    };

    const handleMensalidadeChange = (e) => {
        setValores({ ...valores, mensalidade: formatarMoeda(e.target.value) });
        setBaseMensalidade(null);
        setActiveDiscount(null);
    };

    const handleAction = async (tipo) => {
        const isClosing = tipo === 'fechado';
        const msgConfirm = isClosing ? "A matrícula será FECHADA e o financeiro gerado." : "Os valores serão salvos e o status mantido em NEGOCIAÇÃO.";
        const result = await Swal.fire({ title: isClosing ? 'Fechar Matrícula?' : 'Salvar Proposta?', text: msgConfirm, icon: 'question', showCancelButton: true, confirmButtonColor: isClosing ? s.success : s.primary, cancelButtonColor: s.danger, confirmButtonText: 'Confirmar' });

        if (!result.isConfirmed) return;

        try {
            await fetch(`http://localhost:3000/leads/${lead.id}/comercial`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposta: { ...valores, valor_final: valores.mensalidade },
                    etapa_matricula: isClosing ? 'concluido' : 'aguardando_comercial',
                    status: isClosing ? 'fechado' : 'negociando'
                })
            });
            if (isClosing) {
                await AgendaService.concluirTarefa(lead.id, 'financeiro');
                await Swal.fire({ icon: 'success', title: 'Parabéns!', text: 'Venda Fechada!', timer: 1500, showConfirmButton: false });
            } else {
                await Swal.fire({ icon: 'success', title: 'Salvo', text: 'Proposta atualizada.', timer: 1500, showConfirmButton: false });
            }
            onRefresh(); onExit();
        } catch (e) { Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao salvar.' }); }
    };

    return (
        <div style={{ height: '100%', display: 'flex', backgroundColor: s.bgMain, flexDirection: 'row' }}>

            {/* ESQUERDA: PAINEL DE NEGOCIAÇÃO */}
            <div style={{ width: '55%', padding: '25px', overflowY: 'auto', borderRight: `1px solid ${s.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={onExit} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><ArrowLeft size={24} color={s.textPrimary} /></button>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: s.textPrimary, margin: 0 }}>Negociação</h2>
                </div>

                {lead?.lousa_pedagogica && (<button onClick={() => setShowImageModal(true)} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '12px', border: `1px solid ${s.purple}`, color: s.purple, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}><ImageIcon size={18} /> Ver Lousa Pedagógica</button>)}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ backgroundColor: s.bgCard, padding: '15px', borderRadius: '12px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}>
                        <Input label="Valor Matrícula" value={valores.matricula} onChange={e => setValores({ ...valores, matricula: formatarMoeda(e.target.value) })} s={s} placeholder="R$ 0,00" />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>{[300, 400, 500].map(v => (<button key={v} onClick={() => setMatriculaRapida(v)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${s.border}`, background: s.bgMain, color: s.textPrimary, fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>R$ {v}</button>))}</div>
                    </div>
                    <div style={{ backgroundColor: s.bgCard, padding: '15px', borderRadius: '12px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}>
                        <Input label="Mensalidade Base" value={valores.mensalidade} onChange={handleMensalidadeChange} s={s} placeholder="R$ 0,00" />
                        <label style={{ display: 'block', margin: '10px 0 5px 0', fontSize: '11px', color: s.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' }}>Aplicar Desconto</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button onClick={() => applyDiscount('aniversario', 40)} style={{ padding: '8px', borderRadius: '8px', border: activeDiscount === 'aniversario' ? `2px solid ${s.accent}` : `1px solid ${s.border}`, background: activeDiscount === 'aniversario' ? `${s.accent}20` : s.bgMain, color: activeDiscount === 'aniversario' ? s.accent : s.textPrimary, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🎂 Aniversário (40%)</button>
                            <button onClick={() => applyDiscount('irmaos', 5)} style={{ padding: '8px', borderRadius: '8px', border: activeDiscount === 'irmaos' ? `2px solid ${s.accent}` : `1px solid ${s.border}`, background: activeDiscount === 'irmaos' ? `${s.accent}20` : s.bgMain, color: activeDiscount === 'irmaos' ? s.accent : s.textPrimary, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>👶 Irmãos (5%)</button>
                            <button onClick={() => applyDiscount('pm', 5)} style={{ padding: '8px', borderRadius: '8px', border: activeDiscount === 'pm' ? `2px solid ${s.accent}` : `1px solid ${s.border}`, background: activeDiscount === 'pm' ? `${s.accent}20` : s.bgMain, color: activeDiscount === 'pm' ? s.accent : s.textPrimary, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>👮 Policial (5%)</button>
                            <button onClick={() => applyDiscount('avulso', 5)} style={{ padding: '8px', borderRadius: '8px', border: activeDiscount === 'avulso' ? `2px solid ${s.accent}` : `1px solid ${s.border}`, background: activeDiscount === 'avulso' ? `${s.accent}20` : s.bgMain, color: activeDiscount === 'avulso' ? s.accent : s.textPrimary, fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🏷️ Avulso (5%)</button>
                        </div>
                    </div>
                    <div style={{ backgroundColor: s.bgCard, padding: '15px', borderRadius: '12px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}>
                        <Input label="Material Didático" value={valores.material} onChange={e => setValores({ ...valores, material: formatarMoeda(e.target.value) })} s={s} placeholder="R$ 0,00" />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button onClick={() => setMaterialRapido(130)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${s.border}`, background: s.bgMain, color: s.textPrimary, fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Fund 1 (130)</button>
                            <button onClick={() => setMaterialRapido(125)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${s.border}`, background: s.bgMain, color: s.textPrimary, fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Fund 2 (125)</button>
                            <button onClick={() => setMaterialRapido(135)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${s.border}`, background: s.bgMain, color: s.textPrimary, fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Médio (135)</button>
                        </div>
                    </div>
                    <div style={{ backgroundColor: s.bgCard, padding: '15px', borderRadius: '12px', border: `1px solid ${s.border}`, boxShadow: s.shadow }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: s.textSecondary, fontWeight: 'bold', fontSize: '13px' }}>Turno</label>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: valores.turno === 'Integral' ? '15px' : '0' }}>
                            <button onClick={() => setValores({ ...valores, turno: 'Manhã' })} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: valores.turno === 'Manhã' ? `2px solid ${s.success}` : `1px solid ${s.border}`, backgroundColor: valores.turno === 'Manhã' ? (theme === 'dark' ? '#064e3b' : '#ecfdf5') : s.bgMain, color: s.textPrimary, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Manhã</button>
                            <button onClick={() => setValores({ ...valores, turno: 'Integral' })} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: valores.turno === 'Integral' ? `2px solid ${s.success}` : `1px solid ${s.border}`, backgroundColor: valores.turno === 'Integral' ? (theme === 'dark' ? '#064e3b' : '#ecfdf5') : s.bgMain, color: s.textPrimary, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Integral</button>
                        </div>
                        {valores.turno === 'Integral' && (<Input label="Valor do Período Integral" value={valores.integral} onChange={e => setValores({ ...valores, integral: formatarMoeda(e.target.value) })} s={s} placeholder="R$ 0,00" />)}
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '15px' }}>
                    <button onClick={() => handleAction('negociando')} style={{ flex: 1, padding: '15px', backgroundColor: s.primary, color: '#3f2305', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><MessageSquare size={20} /> Negociação</button>
                    <button onClick={() => handleAction('fechado')} style={{ flex: 1, padding: '15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><CheckCircle size={20} /> Fechar Matrícula</button>
                </div>
            </div>

            {/* DIREITA: TELA DO PAI (PREVIEW CLICÁVEL) */}
            <div style={{ width: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9', padding: '40px' }}>
                <motion.div onClick={() => setShowClientView(true)} whileHover={{ scale: 1.05 }} initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ backgroundColor: s.bgCard, padding: '30px', borderRadius: '24px', boxShadow: s.shadow, border: `1px solid ${s.border}`, width: '100%', maxWidth: '400px', cursor: 'pointer', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 15, right: 15 }}><Maximize2 size={20} color={s.textSecondary} /></div>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {/* LOGO AQUI */}
                        <img src="/logo.png" alt="Colégio Papa Mike" style={{ maxHeight: '60px', maxWidth: '100%', marginBottom: '10px' }} />
                        <h2 style={{ color: s.textPrimary, fontSize: '20px', margin: '10px 0 0 0' }}>Resumo da Proposta</h2>
                        <span style={{ fontSize: '12px', color: s.textSecondary }}>Clique para ampliar</span>
                    </div>
                    <div style={{ marginBottom: '20px' }}><div style={{ display: 'flex', justifyContent: 'space-between', color: s.textPrimary, fontSize: '15px' }}><span>Aluno:</span><strong>{nomeAluno}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between', color: s.textPrimary, fontSize: '15px' }}><span>Série:</span><strong>{serie}</strong></div></div>
                    <div style={{ backgroundColor: s.bgMain, padding: '20px', borderRadius: '12px' }}><ValoresItem label="Matrícula" value={valores.matricula} s={s} /><ValoresItem label="Mensalidade" value={valores.mensalidade} s={s} highlight /><ValoresItem label="Material" value={valores.material} s={s} />{valores.integral && <ValoresItem label="Integral" value={valores.integral} s={s} />}</div>
                </motion.div>
            </div>

            {/* MODAL CLIENTE 180 GRAUS (APRESENTAÇÃO) */}
            <AnimatePresence>
                {showClientView && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowClientView(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ scale: 0.8, rotate: 180 }} animate={{ scale: 1, rotate: 180 }} exit={{ scale: 0.8, opacity: 0 }} style={{ backgroundColor: s.bgCard, padding: '50px', borderRadius: '40px', width: '90%', maxWidth: '600px', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', border: `2px solid ${s.primary}` }}>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                {/* LOGO MAIOR AQUI */}
                                <img src="/logo.png" alt="Colégio Papa Mike" style={{ maxHeight: '100px', maxWidth: '100%', marginBottom: '20px' }} />
                                <h1 style={{ color: s.textPrimary, fontSize: '42px', fontWeight: '800', margin: 0, lineHeight: 1 }}>{nomeAluno}</h1>
                                <p style={{ color: s.textSecondary, fontSize: '24px', margin: '10px 0 0 0' }}>{serie}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <ValoresItem label="Matrícula" value={valores.matricula} s={s} size="large" />
                                <ValoresItem label="Mensalidade" value={valores.mensalidade} s={s} highlight size="xl" />
                                <ValoresItem label="Material Didático" value={valores.material} s={s} size="large" />
                                {valores.turno === 'Integral' && <ValoresItem label="Período Integral" value={valores.integral} s={s} size="large" />}
                            </div>
                            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: `${s.success}15`, borderRadius: '20px', textAlign: 'center' }}>
                                <strong style={{ color: s.success, fontSize: '20px', display: 'block' }}>TURNO: {valores.turno.toUpperCase()}</strong>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>{showImageModal && (<div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><button onClick={() => setShowImageModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={30} color="white" /></button><img src={lead.lousa_pedagogica} alt="Lousa" style={{ maxWidth: '90%', maxHeight: '80vh', borderRadius: '12px', border: '2px solid white' }} /></div>)}</AnimatePresence>
        </div>
    );
};

// ==================================================================================
// UTILS E ROTEADOR (Mantidos, apenas update em ValoresItem para suportar tamanhos)
// ==================================================================================
const FilaLista = ({ theme, title, leads, onSelect, onBack, icon: Icon, color }) => {
    const s = getTheme(theme);
    const getCardData = (lead) => ({ aluno: lead.aluno || lead.perfil_completo?.alunos?.[0]?.nome || "Sem Nome", responsavel: lead.responsavel || lead.perfil_completo?.responsaveis?.[0]?.nome || "Sem Resp.", id: lead.id });
    if (!Array.isArray(leads)) return null;
    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}><button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><ArrowLeft size={24} color={s.textPrimary} /></button><h1 style={{ fontSize: '24px', fontWeight: 'bold', color: s.textPrimary }}>{title}</h1></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {leads.map(lead => {
                    const data = getCardData(lead);
                    return (
                        <motion.div whileHover={{ y: -3, boxShadow: s.shadow }} key={data.id} onClick={() => onSelect(lead)} style={{ backgroundColor: s.bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${s.border}`, cursor: 'pointer', borderLeft: `4px solid ${color}`, transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontWeight: 'bold', fontSize: '16px', color: s.textPrimary }}>{data.aluno}</span><Icon color={color} size={18} /></div>
                            <div style={{ fontSize: '13px', color: s.textSecondary }}>Resp: {data.responsavel}</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

const HeaderTela = ({ title, sub, onExit, theme, icon: Icon, color }) => { const s = getTheme(theme); return (<div style={{ padding: '15px 20px', backgroundColor: s.bgCard, borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><button onClick={onExit} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><ArrowLeft size={24} color={s.textPrimary} /></button><div><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><h2 style={{ fontSize: '18px', fontWeight: 'bold', color: s.textPrimary, margin: 0 }}>{title}</h2>{Icon && <Icon size={18} color={color} />}</div><div style={{ fontSize: '13px', color: s.textSecondary }}>Aluno: {sub}</div></div></div></div>); };
const InfoBox = ({ label, value, s }) => (<div><div style={{ fontSize: '11px', fontWeight: 'bold', color: s.textSecondary, textTransform: 'uppercase' }}>{label}</div><div style={{ fontSize: '14px', color: s.textPrimary, fontWeight: '500' }}>{value || '-'}</div></div>);
const Input = ({ label, value, onChange, s, type = "text", placeholder, autoFocus }) => (<div style={{ width: '100%' }}><label style={{ display: 'block', marginBottom: '6px', color: s.textSecondary, fontWeight: 'bold', fontSize: '13px' }}>{label}</label><input type={type} value={value} onChange={onChange} autoFocus={autoFocus} placeholder={placeholder} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${s.border}`, backgroundColor: s.bgMain, color: s.textPrimary, fontSize: '16px', outline: 'none' }} /></div>);

const ValoresItem = ({ label, value, s, highlight, size }) => {
    const labelSize = size === 'xl' ? '24px' : size === 'large' ? '18px' : '15px';
    const valSize = size === 'xl' ? '36px' : size === 'large' ? '24px' : '16px';
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: highlight ? 'none' : `1px dashed ${s.border}`, alignItems: 'baseline' }}>
            <span style={{ color: s.textSecondary, fontSize: labelSize, fontWeight: '500' }}>{label}</span>
            <span style={{ color: highlight ? s.success : s.textPrimary, fontSize: valSize, fontWeight: 'bold' }}>{value ? `R$ ${value}` : '-'}</span>
        </div>
    );
};

const AdminCard = ({ title, icon: Icon, color, children, s }) => (<div style={{ backgroundColor: s.bgCard, borderRadius: '16px', border: `1px solid ${s.border}`, overflow: 'hidden', boxShadow: s.shadow }}><div style={{ padding: '12px 15px', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: `${color}10` }}><Icon size={18} color={color} /><h3 style={{ fontSize: '14px', fontWeight: 'bold', color: s.textPrimary, margin: 0 }}>{title}</h3></div><div style={{ padding: '15px' }}>{children}</div></div>);
const DetailRow = ({ label, value, s, highlight }) => (<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', borderBottom: `1px dashed ${s.border}`, paddingBottom: '4px' }}><span style={{ fontSize: '12px', color: s.textSecondary }}>{label}:</span><span style={{ fontSize: '13px', fontWeight: highlight ? 'bold' : '500', color: highlight ? s.success : s.textPrimary }}>{value || '-'}</span></div>);

// ==================================================================================
// ROTEADOR E LÓGICA DE VIEW (FormulariosOperacional)
// ==================================================================================

const FormulariosOperacional = ({ theme, user }) => {
    const s = getTheme(theme);
    const [view, setView] = useState('menu');
    const [queueData, setQueueData] = useState([]);
    const [counts, setCounts] = useState({ ped: 0, com: 0 });
    const [viewedState, setViewedState] = useState({ ped: false, com: false });
    const [activeLead, setActiveLead] = useState(null);

    const refreshHub = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:3000/leads');
            const data = await res.json();
            if (Array.isArray(data)) {
                // FILA PEDAGÓGICA UNIFICADA: Leads do form externo + Leads manuais enviados
                const pedCount = data.filter(l =>
                    l.etapa_matricula === 'aguardando_pedagogico' ||
                    l.pedagogical_status === 'waiting_interview'
                ).length;

                // FILA COMERCIAL UNIFICADA
                const comCount = data.filter(l =>
                    l.etapa_matricula === 'aguardando_comercial' ||
                    (l.pedagogical_status === 'interview_done' && l.status !== 'matriculado')
                ).length;

                setCounts({ ped: pedCount, com: comCount });
                if (pedCount > counts.ped) setViewedState(p => ({ ...p, ped: false }));
                if (comCount > counts.com) setViewedState(p => ({ ...p, com: false }));
            }
        } catch (e) { console.error(e); }
    }, [counts]);

    useEffect(() => { refreshHub(); const i = setInterval(refreshHub, 5000); return () => clearInterval(i); }, []);

    const loadQueue = async (type) => {
        try {
            const res = await fetch('http://localhost:3000/leads');
            const data = await res.json();
            if (Array.isArray(data)) {
                setActiveLead(null);
                if (type === 'ped') {
                    // FILTRO UNIFICADO PEDAGÓGICO
                    setQueueData(data.filter(l =>
                        l.etapa_matricula === 'aguardando_pedagogico' ||
                        l.pedagogical_status === 'waiting_interview'
                    ));
                    setView('fila_pedagogica');
                    setViewedState(p => ({ ...p, ped: true }));
                } else if (type === 'com') {
                    // FILTRO UNIFICADO COMERCIAL
                    setQueueData(data.filter(l =>
                        l.etapa_matricula === 'aguardando_comercial' ||
                        (l.pedagogical_status === 'interview_done' && l.status !== 'matriculado')
                    ));
                    setView('fila_comercial');
                    setViewedState(p => ({ ...p, com: true }));
                }
            }
        } catch (e) { console.error(e); }
    };

    if (view === 'menu') return <MenuHub s={s} user={user} counts={counts} viewedState={viewedState} onSelect={(v) => { if (v.startsWith('fila')) loadQueue(v === 'fila_pedagogica' ? 'ped' : 'com'); else setView(v); }} />;
    if (view === 'novo_lead') return <FormularioNovo theme={theme} user={user} onExit={() => setView('menu')} onRefresh={refreshHub} />;
    if (view === 'historico') return <TelaHistorico theme={theme} onBack={() => setView('menu')} />;
    if (view === 'fila_pedagogica') {
        if (activeLead) return <TelaPedagogica theme={theme} lead={activeLead} user={user} onExit={() => { setActiveLead(null); loadQueue('ped'); }} onRefresh={refreshHub} />;
        return <FilaLista theme={theme} title="Fila Pedagógica" leads={queueData} onSelect={setActiveLead} onBack={() => setView('menu')} icon={BookOpen} color="#8b5cf6" />;
    }
    if (view === 'fila_comercial') {
        if (activeLead) return <TelaComercial theme={theme} lead={activeLead} onExit={() => { setActiveLead(null); loadQueue('com'); }} onRefresh={refreshHub} />;
        return <FilaLista theme={theme} title="Fila Comercial" leads={queueData} onSelect={setActiveLead} onBack={() => setView('menu')} icon={DollarSign} color="#10b981" />;
    }
    return null;
};

const Formularios = ({ theme, user }) => {
    const isAdmin = ['developer', 'mantenedor'].includes(user?.cargo);
    const [adminMode, setAdminMode] = useState(false);

    if (isAdmin) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '8px', display: 'flex', justifyContent: 'flex-end', backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                    <button onClick={() => setAdminMode(!adminMode)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: adminMode ? '#3b82f6' : '#64748b', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {adminMode ? <School size={12} /> : <LayoutDashboard size={12} />} {adminMode ? 'Ir para Operacional' : 'Modo Gestão'}
                    </button>
                </div>
                {adminMode ? <FormulariosAdmin theme={theme} user={user} /> : <FormulariosOperacional theme={theme} user={user} />}
            </div>
        );
    }
    return <FormulariosOperacional theme={theme} user={user} />;
};

export default Formularios;