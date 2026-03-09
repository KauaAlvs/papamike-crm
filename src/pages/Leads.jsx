import React, { useState, useEffect } from 'react';
import {
    Plus, Search, User, MessageCircle, DollarSign, Target, CheckCircle, X, Trash2,
    CalendarCheck, AlertTriangle, Archive, Edit3, Globe, Instagram,
    MapPin, Clock, RefreshCw, Loader2, Calendar, Phone, Mail, Users, ArrowRight,
    FileText, Lock, BookOpen, ClipboardList, MoreHorizontal, ArrowRightCircle,
    ToggleLeft, ToggleRight, AlertCircle, ThumbsUp, MessageSquare, Calculator, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20, x: 20 }}
            style={{
                position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                backgroundColor: type === 'success' ? '#10b981' : (type === 'warning' ? '#f59e0b' : '#ef4444'),
                color: 'white', padding: '16px 24px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontWeight: 'bold', fontSize: '15px'
            }}
        >
            {type === 'success' ? <CheckCircle size={24} /> : (type === 'warning' ? <Lock size={24} /> : <AlertTriangle size={24} />)}
            {message}
        </motion.div>
    );
};

const ModalWrapper = ({ children, onClose, theme, title, maxWidth = '650px' }) => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                borderRadius: '24px',
                width: maxWidth,
                maxWidth: '95%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* HEADER FIXO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '25px 30px 20px 30px', borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`, flexShrink: 0 }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme === 'dark' ? '#f1f5f9' : '#0f172a', margin: 0 }}>{title}</h2>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}><X size={28} color={theme === 'dark' ? '#94a3b8' : '#64748b'} /></button>
            </div>

            {/* CONTEÚDO COM SCROLL INTERNO */}
            <div style={{ overflowY: 'auto', padding: '0 30px 30px 30px', paddingTop: '20px' }}>
                {children}
            </div>
        </motion.div>
    </div>
);

const ConfirmActionModal = ({ isOpen, onClose, onConfirm, title, message, theme, confirmText = "Confirmar", confirmColor = "#ef4444" }) => {
    if (!isOpen) return null;
    const bgCard = theme === 'dark' ? '#1e293b' : '#ffffff';
    const textPrimary = theme === 'dark' ? '#f1f5f9' : '#0f172a';
    const textSecondary = theme === 'dark' ? '#94a3b8' : '#64748b';
    const border = theme === 'dark' ? '#334155' : '#e2e8f0';

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ backgroundColor: bgCard, padding: '25px', borderRadius: '20px', width: '350px', border: `1px solid ${border}`, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: textPrimary, fontSize: '18px', fontWeight: 'bold' }}>{title}</h3>
                <p style={{ margin: '0 0 20px 0', color: textSecondary, fontSize: '14px' }}>{message}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '10px 15px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', color: textPrimary, cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={onConfirm} style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', background: confirmColor, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{confirmText}</button>
                </div>
            </motion.div>
        </div>
    );
};

const SectionTitle = ({ title, color, border }) => (
    <h4 style={{ color: color, fontSize: '15px', textTransform: 'uppercase', marginBottom: '15px', borderBottom: `1px solid ${border}`, paddingBottom: '8px', letterSpacing: '0.5px', marginTop: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {title}
    </h4>
);

const MiniRespCard = ({ resp, theme, border }) => (
    <div style={{ padding: '15px', borderRadius: '12px', border: `1px dashed ${border}`, display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px', backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
        <div style={{ fontSize: '12px', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}>SECUNDÁRIO</div>
        <div style={{ fontWeight: 'bold', fontSize: '16px', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}>{resp.nome}</div>
        <div style={{ fontSize: '14px', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>({resp.parentesco})</div>
        <div style={{ fontSize: '14px', marginLeft: 'auto', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: '500' }}>{resp.telefone || resp.numero || '-'}</div>
    </div>
);

const TabPill = ({ label, count, active, onClick, theme, isDanger }) => (
    <button onClick={onClick} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.2s', backgroundColor: active ? (isDanger ? '#ef4444' : '#fbbf24') : 'transparent', color: active ? (isDanger ? 'white' : '#0f172a') : (theme === 'dark' ? '#94a3b8' : '#64748b') }}>
        {label} {count > 0 && <span style={{ opacity: 0.7, marginLeft: '4px' }}>({count})</span>}
    </button>
);

const InputGroup = ({ label, value, onChange, theme, placeholder, icon, type = "text", borderColor }) => (
    <div style={{ width: '100%' }}>
        <label style={{ display: 'block', marginBottom: '6px', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${borderColor || (theme === 'dark' ? '#334155' : '#cbd5e1')}`, borderRadius: '10px', padding: '0 12px', height: '45px', transition: 'border 0.2s' }}>
            {icon && <div style={{ marginRight: '10px', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>{icon}</div>}
            <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} style={{ width: '100%', height: '100%', outline: 'none', fontSize: '14px', backgroundColor: 'transparent', border: 'none', color: theme === 'dark' ? '#fff' : '#0f172a' }} />
        </div>
    </div>
);

const InfoBox = ({ label, value, theme, icon, iconColor, borderColor }) => (
    <div style={{ background: theme === 'dark' ? '#0f172a' : '#f1f5f9', padding: '18px', borderRadius: '14px', border: borderColor ? `1px solid ${borderColor}` : 'none' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {icon && <span style={{ color: iconColor }}>{icon}</span>}
            {label}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#0f172a', wordBreak: 'break-word', lineHeight: '1.4' }}>{value || '-'}</div>
    </div>
);

const inputStyle = (border, color, bg) => ({ width: '100%', height: '45px', padding: '0 12px', borderRadius: '10px', border: `1px solid ${border}`, backgroundColor: bg, color: color, outline: 'none', fontSize: '14px' });
const actionBtnStyle = (bg, color) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: bg, color: color, border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.1s' });
const btnPrimaryStyle = { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#fbbf24', border: 'none', color: '#0f172a', fontWeight: '800', cursor: 'pointer', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' };

// ============================================================================
// COMPONENTE PRINCIPAL LEADS
// ============================================================================

const Leads = ({ theme }) => {
    const navigate = useNavigate();

    // --- TEMAS & CONFIG ---
    const bgCard = theme === 'dark' ? '#1e293b' : '#ffffff';
    const bgColumn = theme === 'dark' ? '#0f172a' : '#f8fafc';
    const textPrimary = theme === 'dark' ? '#f1f5f9' : '#0f172a';
    const textSecondary = theme === 'dark' ? '#94a3b8' : '#64748b';
    const border = theme === 'dark' ? '#334155' : '#e2e8f0';
    const primaryColor = '#fbbf24';
    const today = new Date();
    const apiUrl = 'http://localhost:3000';

    // --- ESTADOS ---
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Modais e Ações
    const [showModal, setShowModal] = useState(false);
    const [expandedLead, setExpandedLead] = useState(null);
    const [actionModal, setActionModal] = useState(null);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [confirmModalData, setConfirmModalData] = useState(null);

    // Inputs Temporários
    const [scheduleData, setScheduleData] = useState({ date: '', time: '' });
    const [tempLostReason, setTempLostReason] = useState('');
    const [lostDetail, setLostDetail] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [negotiationValues, setNegotiationValues] = useState({ matricula: '', mensalidade: '', material: '', integral: '' });
    const [showIntegralNegotiation, setShowIntegralNegotiation] = useState(false);

    // Filtros e Edição
    const [viewFilter, setViewFilter] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showIntegral, setShowIntegral] = useState(false);

    // --- ESTRUTURA COMPLETA DO FORMULÁRIO ---
    const initialFormState = {
        id: null,
        alunos: [{ nome: '', nasc: '', escola_anterior: '', serie: '' }],
        responsaveis: [{ nome: '', parentesco: '', telefone: '', email: '' }],
        endereco: { cep: '', rua: '', numero: '', bairro: '', cidade: '' },
        origem: 'Instagram',
        indicacao_aluno: '',
        indicacao_turma: '',
        motivo_troca: '',
        o_que_valoriza: '',
        motivo_saida: '',
        anotacao_comercial: '',
        valor_matricula: '', valor_mensalidade: '', valor_material: '', valor_integral: '', valor_final: '',
        obs: '',
        status: 'novo'
    };
    const [formData, setFormData] = useState(initialFormState);
    const [activeTab, setActiveTab] = useState('alunos');

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    // --- HELPERS ---
    const getLeadAgeStatus = (dateString) => {
        if (!dateString) return 'normal';
        const created = new Date(dateString);
        const days = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
        if (days > 7) return 'critical';
        if (days > 3) return 'warning';
        return 'normal';
    };

    const formatarMoeda = (valor) => {
        if (!valor) return '';
        const v = String(valor).replace(/\D/g, "");
        return (parseFloat(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatarValorReais = (valor) => {
        if (!valor) return '';
        if (String(valor).includes(',')) return valor;
        const n = parseFloat(valor);
        return isNaN(n) ? valor : n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    };

    const formatarLista = (valor) => Array.isArray(valor) ? valor.join(', ') : (valor || '-');

    const getStatusLabel = (status) => {
        const labels = {
            'novo': { text: 'Lead', color: '#3b82f6', bg: '#eff6ff' },
            'visita_agendada': { text: 'Visita Agendada', color: '#8b5cf6', bg: '#f5f3ff' },
            'visitando': { text: 'Em Visita', color: '#8b5cf6', bg: '#f5f3ff' },
            'negociando': { text: 'Negociação', color: '#f59e0b', bg: '#fffbeb' },
            'fechado': { text: 'Fechado (Ganho)', color: '#0ea5e9', bg: '#f0f9ff' },
            'matriculado': { text: 'Matriculado', color: '#10b981', bg: '#f0fdf4' },
            'arquivado': { text: 'Arquivado', color: '#64748b', bg: '#f1f5f9' },
            'lost': { text: 'Perdido', color: '#ef4444', bg: '#fef2f2' },
            'reativado': { text: 'Reativado', color: '#d97706', bg: '#fef3c7' }
        };
        return labels[status] || { text: status || 'Desconhecido', color: textSecondary, bg: 'transparent' };
    };

    const formatDataBr = (dataString) => {
        if (!dataString) return '-';
        try {
            const datePart = dataString.toString().split('T')[0];
            const [ano, mes, dia] = datePart.split('-');
            if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
            return dataString;
        } catch (e) { return dataString; }
    };

    const isOld = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return Math.ceil(Math.abs(today - date) / (1000 * 60 * 60 * 24)) > 30;
    };

    const checkOverdue = (d, t) => {
        if (!d) return false;
        const visit = new Date(`${d.split('T')[0]}T${t || '23:59'}`);
        return visit < new Date();
    };

    const listas = {
        turmas: ['Berçário', 'Maternal I', 'Maternal II', 'Jardim I', 'Jardim II', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano', '6º Ano', '7º Ano', '8º Ano', '9º Ano', '1º Médio', '2º Médio', '3º Médio'],
        origens: ['Instagram', 'Google', 'Indicação', 'Passou na Frente', 'Panfleto', 'Evento', 'Site'],
        motivosPerda: ['Preço Alto', 'Infraestrutura', 'Distância / Localização', 'Pedagógico', 'Atendimento', 'Optou por outra escola', 'Não Compareceu', 'Outros']
    };

    const getOriginIcon = (origin) => {
        switch (origin) {
            case 'Instagram': return <Instagram size={12} color="#E1306C" />;
            case 'Google': return <Globe size={12} color="#4285F4" />;
            default: return <User size={12} color={textSecondary} />;
        }
    };

    // --- API ---
    const fetchLeads = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await fetch(`${apiUrl}/leads`);
            const data = await response.json();
            if (Array.isArray(data)) setLeads(data);
        } catch (error) { if (!silent) showToast("Erro ao carregar leads.", "error"); }
        finally { if (!silent) setLoading(false); }
    };

    useEffect(() => {
        fetchLeads();
        const interval = setInterval(() => fetchLeads(true), 5000);
        return () => clearInterval(interval);
    }, []);

    const apiUpdateField = async (id, fields) => {
        setLeads(prev => prev.map(l => String(l.id) === String(id) ? { ...l, ...fields } : l));
        if (expandedLead && String(expandedLead.id) === String(id)) {
            setExpandedLead(prev => ({ ...prev, ...fields }));
        }
        try {
            await fetch(`${apiUrl}/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
        } catch (error) { showToast("Erro ao salvar.", "error"); fetchLeads(true); }
    };

    // --- HANDLERS ---
    const openScheduleModal = (e, id) => {
        if (e) e.stopPropagation();
        setSelectedLeadId(id);
        setScheduleData({ date: '', time: '' });
        setActionModal('schedule');
    };

    const confirmSchedule = () => {
        if (!scheduleData.date || !scheduleData.time) return showToast("Preencha data e hora!", "error");
        apiUpdateField(selectedLeadId, { status: 'visita_agendada', visitDate: scheduleData.date, visitTime: scheduleData.time });
        setActionModal(null);
        showToast("Visita agendada! Enviado para Coordenação.");
    };

    const handleNegotiate = (e, id, leadData) => {
        if (e) e.stopPropagation();
        setSelectedLeadId(id);
        const prop = leadData?.proposta_comercial || {};
        setNegotiationValues({
            matricula: prop.matricula || formatarMoeda(leadData?.valor_matricula || ''),
            mensalidade: prop.mensalidade || formatarMoeda(leadData?.valor || ''),
            material: prop.material || formatarMoeda(leadData?.valor_material || ''),
            integral: prop.integral || formatarMoeda(leadData?.valor_integral || '')
        });
        setShowIntegralNegotiation(!!prop.integral);
        setActionModal('negotiate');
    };

    const confirmNegotiation = () => {
        const proposta = { ...negotiationValues, integral: showIntegralNegotiation ? negotiationValues.integral : '', valor_final: negotiationValues.mensalidade };
        apiUpdateField(selectedLeadId, { status: 'negociando', proposta_comercial: proposta, valor: negotiationValues.mensalidade });
        setActionModal(null);
        showToast("Proposta salva!");
    };

    const handleTrashClick = (e, id) => { if (e) e.stopPropagation(); setSelectedLeadId(id); setActionModal('delete_choice'); };

    const confirmLost = () => {
        if (!tempLostReason) return showToast("Selecione um motivo.", "error");
        if (tempLostReason === 'Outros' && !lostDetail.trim()) return showToast("Descreva o motivo.", "error");
        const finalReason = tempLostReason === 'Outros' ? `Outros: ${lostDetail}` : tempLostReason;
        apiUpdateField(selectedLeadId, { status: 'lost', lostReason: finalReason, visitDate: null });
        setActionModal(null); setLostDetail(''); setTempLostReason('');
        showToast("Lead movido para perdidos.");
    };

    const handleMatricula = (e, id) => { if (e) e.stopPropagation(); apiUpdateField(id, { status: 'matriculado', matriculaDate: new Date().toISOString() }); showToast("Aluno Matriculado!"); };
    const handleClosed = (e, id) => { if (e) e.stopPropagation(); apiUpdateField(id, { status: 'fechado' }); showToast("Venda fechada!"); };
    const handleReactivate = (e, id) => { if (e) e.stopPropagation(); apiUpdateField(id, { status: 'reativado', isRecovered: true }); showToast("Recuperado!"); };

    const handleWhatsApp = (e, phone, name) => {
        e.stopPropagation();
        if (!phone) return showToast("Sem telefone.", "warning");
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
        const msg = `Olá ${name ? name.split(' ')[0] : ''}, tudo bem? Aqui é da Escola Papa Mike...`;
        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleSendToPedagogical = async (e, lead) => {
        if (e) e.stopPropagation();
        const temAluno = lead.aluno || lead.perfil_completo?.alunos?.[0]?.nome;
        if (!temAluno) { showToast("Dados incompletos.", "warning"); return; }
        try {
            await apiUpdateField(lead.id, { pedagogical_status: 'waiting_interview', last_interaction: new Date().toISOString() });
            showToast("✅ Enviado para Fila Pedagógica!");
        } catch (error) { showToast("Erro.", "error"); }
    };

    const confirmErrorDelete = async () => {
        if (deleteConfirmation !== 'excluir') return;
        try {
            await fetch(`${apiUrl}/leads/${selectedLeadId}`, { method: 'DELETE' });
            setLeads(prev => prev.filter(l => String(l.id) !== String(selectedLeadId)));
            showToast("Lead excluído.");
        } catch (error) { showToast("Erro de conexão.", "error"); }
        setActionModal(null); setDeleteConfirmation('');
    };

    // --- FORMULÁRIO HELPERS ---
    const updateArray = (arr, idx, field, val) => {
        setFormData(p => {
            const newArr = [...p[arr]];
            newArr[idx] = { ...newArr[idx], [field]: val };
            return { ...p, [arr]: newArr };
        });
    };

    const addItem = (arr, item) => setFormData(p => ({ ...p, [arr]: [...p[arr], item] }));

    const removeArrayItem = (arr, index) => {
        setFormData(prev => ({
            ...prev,
            [arr]: prev[arr].filter((_, i) => i !== index)
        }));
    };

    const openNewLead = () => {
        setEditingId(null);
        setExpandedLead(null);
        setFormData({
            ...initialFormState,
            alunos: [{ nome: '', nasc: '', escola_anterior: '', serie: '' }],
            responsaveis: [{ nome: '', parentesco: '', telefone: '', email: '' }],
            endereco: { cep: '', rua: '', numero: '', bairro: '', cidade: '' }
        });
        setShowIntegral(false);
        setActiveTab('alunos');
        setShowModal(true);
    };

    const handleEditClick = (e, lead) => {
        if (e) e.stopPropagation();
        setExpandedLead(null); // Fecha a ficha se estiver aberta para não sobrepor

        if (lead.status === 'matriculado' || lead.status === 'arquivado') {
            showToast("Edição bloqueada para finalizados.", "warning");
            return;
        }

        const perf = lead.perfil_completo || {};
        const alunosList = (perf.alunos && perf.alunos.length > 0) ? perf.alunos : [{ nome: lead.aluno || '', nasc: lead.data_nascimento || '', escola_anterior: lead.escola_anterior || '', serie: lead.ano || '' }];
        const respsList = (perf.responsaveis && perf.responsaveis.length > 0) ? perf.responsaveis : [{ nome: lead.responsavel || '', parentesco: lead.parentesco || '', telefone: lead.telefone || '', email: lead.email || '' }];
        const enderecoObj = perf.endereco || { cep: '', rua: '', numero: '', bairro: lead.bairro || '', cidade: '' };

        const safeLead = {
            ...initialFormState,
            ...lead,
            alunos: alunosList,
            responsaveis: respsList,
            endereco: enderecoObj,
            o_que_valoriza: lead.o_que_valoriza || formatarLista(perf.valores),
            motivo_troca: lead.motivo_troca || formatarLista(perf.motivos),
            motivo_saida: lead.motivo_saida || '',
            origem: lead.origem || 'Instagram',
            indicacao_aluno: lead.indicacao_aluno || '',
            anotacao_comercial: lead.anotacao_comercial || perf.notas || '',
            valor_matricula: lead.proposta_comercial?.matricula || lead.valor_matricula || '',
            valor_mensalidade: lead.proposta_comercial?.mensalidade || lead.valor_mensalidade || '',
            valor_material: lead.proposta_comercial?.material || lead.valor_material || '',
            valor_integral: lead.proposta_comercial?.integral || lead.valor_integral || ''
        };

        if (safeLead.valor_integral && safeLead.valor_integral !== '0,00') setShowIntegral(true);
        else setShowIntegral(false);

        setEditingId(lead.id);
        setFormData(safeLead);
        setActiveTab('alunos');
        setShowModal(true);
    };

    const handleSaveForm = async (e) => {
        e.preventDefault();
        const alunoPrincipal = formData.alunos[0];
        const respPrincipal = formData.responsaveis[0];
        const vFinal = formData.valor_mensalidade;

        const payload = {
            ...formData,
            id: editingId || Date.now().toString(),
            date: editingId ? formData.date : new Date().toISOString(),
            aluno: alunoPrincipal.nome,
            ano: alunoPrincipal.serie,
            responsavel: respPrincipal.nome,
            telefone: respPrincipal.telefone,
            email: respPrincipal.email,
            bairro: formData.endereco.bairro,
            valor: vFinal,
            perfil_completo: {
                alunos: formData.alunos,
                responsaveis: formData.responsaveis,
                endereco: formData.endereco,
                motivos: [formData.motivo_troca],
                valores: [formData.o_que_valoriza],
                notas: formData.anotacao_comercial,
                marketing: { canal: formData.origem, detalhe: formData.indicacao_aluno }
            },
            proposta_comercial: {
                matricula: formData.valor_matricula,
                mensalidade: formData.valor_mensalidade,
                material: formData.valor_material,
                integral: showIntegral ? formData.valor_integral : '',
                valor_final: vFinal
            }
        };

        try {
            if (editingId) await apiUpdateField(editingId, payload);
            else {
                const response = await fetch(`${apiUrl}/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (response.ok) fetchLeads(true);
            }
            setShowModal(false);
            showToast("Salvo com sucesso!");
        } catch (error) { showToast("Erro ao salvar.", "error"); }
    };

    const filteredLeads = leads.filter(lead => {
        if (!lead) return false;
        const term = searchTerm.toLowerCase();
        const statusPt = getStatusLabel(lead.status).text.toLowerCase();
        const matchesSearch =
            (lead.aluno?.toLowerCase().includes(term)) ||
            (lead.responsavel?.toLowerCase().includes(term)) ||
            (lead.ano?.toLowerCase().includes(term)) ||
            (lead.origem?.toLowerCase().includes(term)) ||
            (statusPt.includes(term));

        if (searchTerm) return matchesSearch;
        if (lead.status === 'lost') return viewFilter === 'lost';
        if (viewFilter === 'active') {
            if (lead.isRecovered) return false;
            const activeStatuses = ['novo', 'visita_agendada', 'visitando', 'negociando', 'fechado', 'matriculado', 'reativado'];
            if (lead.status === 'arquivado') return false;
            return activeStatuses.includes(lead.status) || (lead.visitDate && new Date(lead.visitDate) >= new Date().setHours(0, 0, 0, 0));
        }
        if (viewFilter === 'recovery') return lead.isRecovered;
        if (viewFilter === 'old') {
            if (lead.status === 'arquivado') return true;
            return isOld(lead.date) && !['visita_agendada', 'negociando', 'matriculado', 'fechado'].includes(lead.status) && lead.status !== 'lost';
        }
        return false;
    });

    const getColumns = () => {
        const base = [
            { id: 'novo', title: 'LEADS', color: '#3b82f6', icon: <Target size={18} /> },
            { id: 'visita_agendada', title: 'Visita Agendada', color: '#8b5cf6', icon: <Calendar size={18} /> },
            { id: 'negociando', title: 'Em Negociação', color: '#f59e0b', icon: <MessageCircle size={18} /> },
            { id: 'fechado', title: 'Fechados (Ganho)', color: '#0ea5e9', icon: <DollarSign size={18} /> },
            { id: 'matriculado', title: 'Matriculados', color: '#10b981', icon: <CheckCircle size={18} /> }
        ];
        return viewFilter === 'recovery' ? [{ id: 'reativado', title: 'Reativados', color: '#d97706', icon: <RefreshCw size={18} /> }, ...base] : base;
    };

    const onDragEnd = (result) => {
        const { destination, draggableId } = result;
        if (!destination) return;
        const newStatus = destination.droppableId;
        const currentLead = leads.find(l => String(l.id) === String(draggableId));
        if (newStatus === currentLead.status) return;

        if (newStatus === 'visita_agendada') { openScheduleModal(null, draggableId); return; }
        if (newStatus === 'negociando') { handleNegotiate(null, draggableId, currentLead); return; }
        if (newStatus === 'matriculado') { handleMatricula(null, draggableId); return; }

        apiUpdateField(draggableId, { status: newStatus });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <AnimatePresence>{toast && <NotificationToast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>
            <ConfirmActionModal isOpen={!!confirmModalData} onClose={() => setConfirmModalData(null)} theme={theme} {...confirmModalData} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                <div><h1 style={{ fontSize: '28px', fontWeight: '800', color: textPrimary }}>Gestão de Leads</h1><p style={{ color: textSecondary, fontSize: '14px' }}>Pipeline de Vendas</p></div>
                <button onClick={openNewLead} style={{ backgroundColor: primaryColor, border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)' }}><Plus size={20} /> Novo Lead</button>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                {!searchTerm && (
                    <div style={{ display: 'flex', backgroundColor: bgCard, borderRadius: '12px', padding: '4px', border: `1px solid ${border}` }}>
                        <TabPill label="Ativos" active={viewFilter === 'active'} onClick={() => setViewFilter('active')} count={leads.filter(l => !l.isRecovered && l.status !== 'lost' && l.status !== 'arquivado' && (!isOld(l.date) || ['visita_agendada', 'visitando', 'negociando', 'fechado', 'matriculado'].includes(l.status))).length} theme={theme} />
                        <TabPill label="Recuperação" active={viewFilter === 'recovery'} onClick={() => setViewFilter('recovery')} count={leads.filter(l => l.isRecovered && l.status !== 'lost').length} theme={theme} />
                        <TabPill label="Antigos" active={viewFilter === 'old'} onClick={() => setViewFilter('old')} count={leads.filter(l => (l.status === 'arquivado') || (l.status === 'novo' && isOld(l.date) && l.status !== 'lost')).length} theme={theme} />
                        <TabPill label="Perdidos" active={viewFilter === 'lost'} onClick={() => setViewFilter('lost')} count={leads.filter(l => l.status === 'lost').length} theme={theme} isDanger />
                    </div>
                )}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: bgCard, padding: '10px 16px', borderRadius: '12px', border: `1px solid ${border}`, minWidth: '400px', boxShadow: searchTerm ? '0 0 0 2px #fbbf24' : 'none' }}>
                        <Search size={18} color={textSecondary} />
                        <input type="text" placeholder="Filtrar por Nome, Turma, Status, Origem..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', color: textPrimary, width: '100%' }} />
                        {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color={textSecondary} /></button>}
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                {loading && leads.length === 0 ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textSecondary }}><Loader2 className="animate-spin" /> Carregando...</div> :
                    searchTerm ? (
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 100px', padding: '10px 20px', fontWeight: 'bold', color: textSecondary, borderBottom: `1px solid ${border}`, fontSize: '12px', textTransform: 'uppercase' }}><div>Nome do Aluno</div><div>Turma</div><div>Situação</div><div>Origem</div><div style={{ textAlign: 'right' }}>Ações</div></div>
                            {filteredLeads.map(lead => {
                                const statusInfo = getStatusLabel(lead.status);
                                return (
                                    <div key={lead.id} onClick={() => setExpandedLead(lead)} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 100px', padding: '15px 20px', borderBottom: `1px solid ${border}`, alignItems: 'center', backgroundColor: bgCard, cursor: 'pointer' }}>
                                        <div><div style={{ fontWeight: 'bold', color: textPrimary }}>{lead.aluno}</div><div style={{ fontSize: '12px', color: textSecondary }}>{lead.responsavel}</div></div>
                                        <div><span style={{ backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', color: textPrimary, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{lead.ano || '-'}</span></div>
                                        <div><span style={{ backgroundColor: statusInfo.bg, color: statusInfo.color, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{statusInfo.text}</span></div>
                                        <div style={{ fontSize: '13px', color: textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>{getOriginIcon(lead.origem)} {lead.origem}</div>
                                        <div style={{ textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={(e) => handleEditClick(e, lead)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary }}><Edit3 size={16} /></button><button onClick={(e) => handleTrashClick(e, lead.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button></div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (viewFilter === 'active' || viewFilter === 'recovery') ? (
                        <div style={{ flex: 1, overflowX: 'auto', display: 'flex', gap: '25px', paddingBottom: '10px' }}>
                            <DragDropContext onDragEnd={onDragEnd}>
                                {getColumns().map(col => (
                                    <Droppable key={col.id} droppableId={col.id}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minWidth: '340px', width: '340px', backgroundColor: bgColumn, borderRadius: '20px', padding: '15px', border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '0 5px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ padding: '8px', borderRadius: '10px', backgroundColor: `${col.color}20`, color: col.color, boxShadow: `0 0 10px ${col.color}40` }}>{col.icon}</div><span style={{ fontWeight: '800', color: textPrimary, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.title}</span></div><span style={{ backgroundColor: bgCard, padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', color: textSecondary, border: `1px solid ${border}` }}>{filteredLeads.filter(l => l.status === col.id).length}</span></div>
                                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '5px' }}>
                                                    {filteredLeads.filter(l => l.status === col.id).map((lead, index) => {
                                                        const isOverdue = col.id === 'visita_agendada' && checkOverdue(lead.visitDate, lead.visitTime); const isIndicacao = lead.origem === 'Indicação'; const ageStatus = getLeadAgeStatus(lead.date); const borderStatusColor = isOverdue ? '#ef4444' : (ageStatus === 'critical' ? '#ef4444' : (ageStatus === 'warning' ? '#f59e0b' : 'transparent'));
                                                        return (
                                                            <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                                                                {(provided) => (
                                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                        style={{ backgroundColor: bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${border}`, borderLeft: borderStatusColor !== 'transparent' ? `4px solid ${borderStatusColor}` : `1px solid ${border}`, position: 'relative', boxShadow: theme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)', ...provided.draggableProps.style }}
                                                                    >
                                                                        <div onClick={() => setExpandedLead(lead)} style={{ cursor: 'pointer' }}>
                                                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '15px' }}><div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor, fontWeight: 'bold', fontSize: '18px', border: `1px solid ${border}` }}>{lead.aluno?.charAt(0).toUpperCase()}</div><div style={{ flex: 1, overflow: 'hidden' }}><div style={{ fontWeight: '800', color: textPrimary, fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.aluno}</div><div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}><span style={{ fontSize: '11px', fontWeight: '600', color: textSecondary, backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{lead.ano || 'Série?'}</span>{isIndicacao && <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#166534', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>INDICAÇÃO</span>}</div></div></div>
                                                                            <div style={{ marginBottom: '15px', paddingLeft: '5px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: textSecondary, marginBottom: '4px' }}><User size={12} /> {lead.responsavel}</div>{(col.id === 'visita_agendada' || col.id === 'visitando') && (<div style={{ marginTop: '8px', padding: '8px', backgroundColor: isOverdue ? '#fee2e2' : '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: isOverdue ? '#b91c1c' : '#1e40af', fontSize: '12px', fontWeight: 'bold' }}><Clock size={14} /> {formatDataBr(lead.visitDate)} às {lead.visitTime || '--:--'}</div>)}</div>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: `1px solid ${theme === 'dark' ? '#334155' : '#f1f5f9'}` }}>
                                                                            <button onClick={(e) => handleWhatsApp(e, lead.telefone, lead.responsavel)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#166534', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}><MessageCircle size={14} /> Zap</button>
                                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                                {(col.id === 'visita_agendada' || col.id === 'visitando') && (<>{!lead.pedagogical_status && (<button onClick={(e) => handleSendToPedagogical(e, lead)} style={actionBtnStyle('#e0f2fe', '#0369a1')}><ClipboardList size={14} /></button>)}<button onClick={(e) => handleNegotiate(e, lead.id, lead)} style={actionBtnStyle('#ffedd5', '#c2410c')}><MessageCircle size={14} /></button><button onClick={(e) => handleClosed(e, lead.id)} style={actionBtnStyle('#dcfce7', '#166534')}><CheckCircle size={14} /></button></>)}
                                                                                {(col.id === 'novo' || col.id === 'reativado') && <button onClick={(e) => openScheduleModal(e, lead.id)} style={actionBtnStyle('#fef3c7', '#b45309')}><CalendarCheck size={14} /></button>}
                                                                                {(col.id === 'negociando') && (<><button onClick={(e) => handleNegotiate(e, lead.id, lead)} style={actionBtnStyle('#ffedd5', '#c2410c')}><DollarSign size={14} /></button><button onClick={(e) => handleClosed(e, lead.id)} style={actionBtnStyle('#dcfce7', '#166534')}><CheckCircle size={14} /></button></>)}
                                                                                {col.id === 'fechado' && (<button onClick={(e) => handleMatricula(e, lead.id)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><CheckCircle size={14} /> MATRICULAR</button>)}
                                                                                {col.id !== 'fechado' && (<button onClick={(e) => handleEditClick(e, lead)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary }}><Edit3 size={14} /></button>)}
                                                                                <button onClick={(e) => handleTrashClick(e, lead.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    })}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                ))}
                            </DragDropContext>
                        </div>
                    ) : (
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: viewFilter === 'old' ? '2fr 1.5fr 1fr 100px 100px' : '100px 2fr 1.5fr 1fr 150px', padding: '10px 20px', fontWeight: 'bold', color: textSecondary, borderBottom: `1px solid ${border}`, fontSize: '12px', textTransform: 'uppercase' }}>
                                {viewFilter === 'old' ? (<><div>Aluno</div><div>Turma</div><div>Valor Fechado</div><div>Data</div><div style={{ textAlign: 'right' }}>Ações</div></>) : (<><div>Data</div><div>Aluno / Responsável</div><div>{viewFilter === 'lost' ? 'Motivo' : 'Status'}</div><div>Origem</div><div style={{ textAlign: 'right' }}>Ações</div></>)}
                            </div>
                            {filteredLeads.map(lead => (
                                <div key={lead.id} style={{ display: 'grid', gridTemplateColumns: viewFilter === 'old' ? '2fr 1.5fr 1fr 100px 100px' : '100px 2fr 1.5fr 1fr 150px', padding: '15px 20px', borderBottom: `1px solid ${border}`, alignItems: 'center', backgroundColor: bgCard }}>
                                    {viewFilter === 'old' ? (
                                        <><div><div style={{ fontWeight: 'bold', color: textPrimary }}>{lead.aluno}</div><div style={{ fontSize: '12px', color: textPrimary, backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>{lead.ano}</div></div><div style={{ fontWeight: 'bold', color: '#10b981' }}>{lead.valor || lead.valor_final || '-'}</div><div style={{ fontSize: '12px', color: textSecondary }}>{formatDataBr(lead.date)}</div><div style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={(e) => handleTrashClick(e, lead.id)} style={{ background: 'transparent', border: `1px solid ${border}`, padding: '6px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></div></>
                                    ) : (
                                        <><div style={{ fontSize: '12px', color: textSecondary }}>{formatDataBr(lead.date)}</div><div onClick={() => setExpandedLead(lead)} style={{ cursor: 'pointer' }}><div style={{ fontWeight: 'bold', color: textPrimary }}>{lead.aluno}</div><div style={{ fontSize: '12px', color: textSecondary }}>{lead.responsavel}</div></div><div><span style={{ color: textSecondary, fontSize: '12px' }}>{lead.status === 'lost' ? lead.lostReason : lead.status}</span></div><div style={{ fontSize: '12px', color: textSecondary }}>{lead.origem}</div><div style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={(e) => handleTrashClick(e, lead.id)} style={{ background: 'transparent', border: `1px solid ${border}`, padding: '6px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></div></>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>

            <AnimatePresence>
                {/* Modais de Ação */}
                {actionModal === 'schedule' && (
                    <ModalWrapper onClose={() => setActionModal(null)} theme={theme} title="Agendar Visita" maxWidth="450px">
                        <div style={{ marginBottom: '25px' }}><label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: textSecondary, marginBottom: '8px' }}>DATA E HORA</label><div style={{ display: 'flex', gap: '15px' }}><input type="date" value={scheduleData.date} onChange={e => setScheduleData({ ...scheduleData, date: e.target.value })} style={inputStyle(border, textPrimary, theme === 'dark' ? '#0f172a' : '#f8fafc')} /><input type="time" value={scheduleData.time} onChange={e => setScheduleData({ ...scheduleData, time: e.target.value })} style={inputStyle(border, textPrimary, theme === 'dark' ? '#0f172a' : '#f8fafc')} /></div></div><button onClick={confirmSchedule} style={btnPrimaryStyle}>Confirmar</button>
                    </ModalWrapper>
                )}
                {actionModal === 'negotiate' && (
                    <ModalWrapper onClose={() => setActionModal(null)} theme={theme} title="Proposta Comercial" maxWidth="500px">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <InputGroup label="Matrícula" value={negotiationValues.matricula} onChange={e => setNegotiationValues({ ...negotiationValues, matricula: formatarMoeda(e.target.value) })} theme={theme} placeholder="R$ 0,00" />
                            <InputGroup label="Mensalidade" value={negotiationValues.mensalidade} onChange={e => setNegotiationValues({ ...negotiationValues, mensalidade: formatarMoeda(e.target.value) })} theme={theme} placeholder="R$ 0,00" />
                            <InputGroup label="Material Didático" value={negotiationValues.material} onChange={e => setNegotiationValues({ ...negotiationValues, material: formatarMoeda(e.target.value) })} theme={theme} placeholder="R$ 0,00" />
                            {showIntegralNegotiation ? (<InputGroup label="Integral" value={negotiationValues.integral} onChange={e => setNegotiationValues({ ...negotiationValues, integral: formatarMoeda(e.target.value) })} theme={theme} placeholder="R$ 0,00" />) : (<div style={{ display: 'flex', alignItems: 'flex-end' }}><button onClick={() => setShowIntegralNegotiation(true)} style={{ width: '100%', height: '45px', borderRadius: '10px', border: `1px dashed ${primaryColor}`, background: 'transparent', color: primaryColor, fontWeight: 'bold', cursor: 'pointer' }}>+ Add Integral</button></div>)}
                        </div>
                        <button onClick={confirmNegotiation} style={btnPrimaryStyle}>Salvar Proposta</button>
                    </ModalWrapper>
                )}
                {actionModal === 'delete_choice' && (
                    <ModalWrapper onClose={() => setActionModal(null)} theme={theme} title="Remover" maxWidth="450px">
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <button onClick={() => setActionModal('lost_reason')} style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${border}`, background: bgColumn, cursor: 'pointer', fontWeight: 'bold', color: textPrimary, fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Perda (Desistência)</span> <ArrowRightCircle size={20} />
                            </button>
                            <button onClick={() => setActionModal('delete_confirm')} style={{ padding: '20px', borderRadius: '12px', border: `1px solid ${border}`, background: '#fee2e2', cursor: 'pointer', fontWeight: 'bold', color: '#ef4444', fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Exclusão (Erro de Cadastro)</span> <Trash2 size={20} />
                            </button>
                        </div>
                    </ModalWrapper>
                )}
                {actionModal === 'lost_reason' && (
                    <ModalWrapper onClose={() => setActionModal(null)} theme={theme} title="Motivo da Perda" maxWidth="500px">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>{listas.motivosPerda.map(m => (<button key={m} onClick={() => setTempLostReason(m)} style={{ padding: '12px', borderRadius: '10px', border: tempLostReason === m ? `2px solid #ef4444` : `1px solid ${border}`, background: tempLostReason === m ? '#fef2f2' : 'transparent', color: textPrimary, fontSize: '13px', cursor: 'pointer', fontWeight: tempLostReason === m ? 'bold' : 'normal' }}>{m}</button>))}</div>
                        {tempLostReason === 'Outros' && (<textarea placeholder="Descreva o motivo (Obrigatório)..." value={lostDetail} onChange={e => setLostDetail(e.target.value)} style={{ ...inputStyle(border, textPrimary, theme === 'dark' ? '#0f172a' : '#f8fafc'), height: '80px', paddingTop: '10px', marginBottom: '20px' }} />)}
                        <button onClick={confirmLost} style={{ ...btnPrimaryStyle, background: '#ef4444', color: 'white' }}>Confirmar Perda</button>
                    </ModalWrapper>
                )}
                {actionModal === 'delete_confirm' && (
                    <ModalWrapper onClose={() => setActionModal(null)} theme={theme} title="Exclusão Permanente" maxWidth="450px">
                        <p style={{ color: textSecondary, marginBottom: '20px', fontSize: '14px' }}>Digite <b>excluir</b> abaixo para confirmar.</p>
                        <input type="text" value={deleteConfirmation} onChange={e => setDeleteConfirmation(e.target.value)} style={{ ...inputStyle(border, textPrimary, theme === 'dark' ? '#0f172a' : '#f8fafc'), marginBottom: '20px' }} />
                        <button onClick={confirmErrorDelete} disabled={deleteConfirmation !== 'excluir'} style={{ ...btnPrimaryStyle, background: deleteConfirmation === 'excluir' ? '#ef4444' : border, color: 'white' }}>Apagar Definitivamente</button>
                    </ModalWrapper>
                )}
                {/* FORMULÁRIOS DE EDIÇÃO E FICHA COMPLETA (MANTIDOS E APLICADOS Z-INDEX CORRETO) */}
                {/* ... (O código anterior para showModal e expandedLead permanece igual, apenas garantindo o z-index do ModalWrapper que já foi ajustado para 9999) */}
                {showModal && (
                    <ModalWrapper onClose={() => setShowModal(false)} theme={theme} title={editingId ? 'Editar Lead' : 'Novo Cadastro Completo'} maxWidth="800px">
                        <form onSubmit={handleSaveForm}>
                            <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, marginBottom: '25px', gap: '15px' }}>
                                {['dados', 'responsaveis', 'endereco', 'marketing', 'negociacao'].map(tab => (
                                    <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{ padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: activeTab === tab ? primaryColor : textSecondary, borderBottom: activeTab === tab ? `3px solid ${primaryColor}` : '3px solid transparent', fontSize: '13px', textTransform: 'uppercase' }}>
                                        {tab === 'dados' ? 'DADOS ALUNO' : tab}
                                    </button>
                                ))}
                            </div>

                            <div style={{ paddingRight: '5px' }}>
                                {activeTab === 'dados' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* ALUNOS (ARRAY) */}
                                        {formData.alunos.map((aluno, index) => (
                                            <div key={index} style={{ padding: '15px', border: `1px dashed ${border}`, borderRadius: '12px', position: 'relative' }}>
                                                {index > 0 && <button type="button" onClick={() => removeArrayItem('alunos', index)} style={{ position: 'absolute', top: 5, right: 5, border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>}
                                                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: textSecondary }}>ALUNO {index + 1}</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '10px' }}>
                                                    <InputGroup label="Nome Completo" value={aluno.nome} onChange={e => updateArray('alunos', index, 'nome', e.target.value)} theme={theme} />
                                                    <InputGroup label="Nascimento" type="date" value={aluno.nasc} onChange={e => updateArray('alunos', index, 'nasc', e.target.value)} theme={theme} />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '6px', color: textSecondary, fontSize: '12px', fontWeight: 'bold' }}>SÉRIE</label>
                                                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${border}`, borderRadius: '10px', padding: '0 12px', height: '45px' }}>
                                                            <select value={aluno.serie} onChange={e => updateArray('alunos', index, 'serie', e.target.value)} style={{ width: '100%', height: '100%', outline: 'none', fontSize: '14px', backgroundColor: 'transparent', border: 'none', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                                                                <option value="">Selecione...</option>
                                                                {listas.turmas.map(t => <option key={t} value={t}>{t}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <InputGroup label="Escola Anterior" value={aluno.escola_anterior} onChange={e => updateArray('alunos', index, 'escola_anterior', e.target.value)} theme={theme} />
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addItem('alunos', { nome: '', nasc: '', escola_anterior: '', serie: '' })} style={{ width: '100%', padding: '12px', border: `2px dashed ${primaryColor}`, background: 'transparent', color: primaryColor, fontWeight: 'bold', borderRadius: '12px', cursor: 'pointer' }}>+ Adicionar Irmão</button>
                                    </div>
                                )}

                                {activeTab === 'responsaveis' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {formData.responsaveis.map((resp, index) => (
                                            <div key={index} style={{ padding: '15px', border: `1px dashed ${border}`, borderRadius: '12px', position: 'relative' }}>
                                                {index > 0 && <button type="button" onClick={() => removeArrayItem('responsaveis', index)} style={{ position: 'absolute', top: 5, right: 5, border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>}
                                                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: textSecondary }}>RESPONSÁVEL {index + 1} {index === 0 && '(FINANCEIRO)'}</h4>
                                                <InputGroup label="Nome Completo" value={resp.nome} onChange={e => updateArray('responsaveis', index, 'nome', e.target.value)} theme={theme} />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                                    <InputGroup label="Parentesco" value={resp.parentesco} onChange={e => updateArray('responsaveis', index, 'parentesco', e.target.value)} theme={theme} />
                                                    <InputGroup label="Telefone" value={resp.telefone} onChange={e => updateArray('responsaveis', index, 'telefone', e.target.value)} theme={theme} />
                                                    <InputGroup label="Email" value={resp.email} onChange={e => updateArray('responsaveis', index, 'email', e.target.value)} theme={theme} />
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addItem('responsaveis', { nome: '', parentesco: '', telefone: '', email: '' })} style={{ width: '100%', padding: '12px', border: `2px dashed ${primaryColor}`, background: 'transparent', color: primaryColor, fontWeight: 'bold', borderRadius: '12px', cursor: 'pointer' }}>+ Adicionar Responsável</button>
                                    </div>
                                )}

                                {activeTab === 'endereco' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                            <InputGroup label="CEP" value={formData.endereco.cep} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, cep: e.target.value } })} theme={theme} icon={<MapPin size={16} />} />
                                            <InputGroup label="Rua" value={formData.endereco.rua} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, rua: e.target.value } })} theme={theme} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                            <InputGroup label="Número" value={formData.endereco.numero} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })} theme={theme} />
                                            <InputGroup label="Bairro" value={formData.endereco.bairro} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })} theme={theme} />
                                        </div>
                                        <InputGroup label="Cidade" value={formData.endereco.cidade} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })} theme={theme} />
                                    </div>
                                )}

                                {activeTab === 'marketing' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: textSecondary, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Como conheceu a escola? (Origem)</label>
                                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, borderRadius: '12px', padding: '0 16px', height: '50px' }}>
                                                <select value={formData.origem} onChange={e => setFormData({ ...formData, origem: e.target.value })} style={{ width: '100%', height: '100%', outline: 'none', fontSize: '15px', backgroundColor: 'transparent', border: 'none', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                                                    <option value="">Selecione...</option>
                                                    {listas.origens.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        {formData.origem === 'Indicação' && (
                                            <div style={{ padding: '15px', backgroundColor: '#ecfccb', borderRadius: '12px', border: '1px solid #bef264' }}>
                                                <h4 style={{ color: '#3f6212', fontSize: '13px', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}><Users size={16} /> Quem Indicou?</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                                                    <InputGroup label="Nome do Aluno que Indicou" value={formData.indicacao_aluno} onChange={e => setFormData({ ...formData, indicacao_aluno: e.target.value })} theme={theme} />
                                                    <InputGroup label="Turma dele" value={formData.indicacao_turma} onChange={e => setFormData({ ...formData, indicacao_turma: e.target.value })} theme={theme} />
                                                </div>
                                            </div>
                                        )}

                                        <hr style={{ border: `1px dashed ${border}`, margin: '10px 0' }} />

                                        <InputGroup label="O QUE MAIS VALORIZA? (Pontos Positivos)" value={formData.o_que_valoriza} onChange={e => setFormData({ ...formData, o_que_valoriza: e.target.value })} theme={theme} borderColor="#86efac" placeholder="Ex: Segurança, Disciplina..." />
                                        <InputGroup label="MOTIVO DE SAÍDA DA ANTERIOR (Pontos de Dor)" value={formData.motivo_saida} onChange={e => setFormData({ ...formData, motivo_saida: e.target.value })} theme={theme} borderColor="#fca5a5" placeholder="Ex: Bullying, Falta de Professores..." />
                                        <InputGroup label="Motivo da Procura (Geral)" value={formData.motivo_troca} onChange={e => setFormData({ ...formData, motivo_troca: e.target.value })} theme={theme} />
                                    </div>
                                )}

                                {activeTab === 'negociacao' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <InputGroup label="Valor de Matrícula" value={formData.valor_matricula} onChange={e => setFormData({ ...formData, valor_matricula: formatarMoeda(e.target.value) })} theme={theme} placeholder="R$ 0,00" icon={<DollarSign size={18} />} />
                                            <InputGroup label="Mensalidade Padrão" value={formData.valor_mensalidade} onChange={e => setFormData({ ...formData, valor_mensalidade: formatarMoeda(e.target.value) })} theme={theme} placeholder="R$ 0,00" icon={<Calendar size={18} />} />
                                            <InputGroup label="Material Didático" value={formData.valor_material} onChange={e => setFormData({ ...formData, valor_material: formatarMoeda(e.target.value) })} theme={theme} placeholder="R$ 0,00" icon={<BookOpen size={18} />} />
                                        </div>

                                        {/* Toggle Integral */}
                                        <div style={{ background: bgColumn, padding: '15px', borderRadius: '12px', border: `1px solid ${border}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showIntegral ? '15px' : '0' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: textPrimary }}>Período Integral</span>
                                                <button type="button" onClick={() => setShowIntegral(!showIntegral)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: showIntegral ? '#ef4444' : primaryColor, fontWeight: 'bold' }}>{showIntegral ? <ToggleRight size={24} /> : <ToggleLeft size={24} />} {showIntegral ? 'Remover' : 'Adicionar'}</button>
                                            </div>
                                            {showIntegral && (<InputGroup label="Valor do Integral" value={formData.valor_integral} onChange={e => setFormData({ ...formData, valor_integral: formatarMoeda(e.target.value) })} theme={theme} placeholder="R$ 0,00" icon={<Clock size={18} />} />)}
                                        </div>

                                        <div><label style={{ display: 'block', marginBottom: '8px', color: textSecondary, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Anotação Comercial (Para Coordenação)</label><textarea value={formData.anotacao_comercial} onChange={e => setFormData({ ...formData, anotacao_comercial: e.target.value })} placeholder="Recado específico para a Sheila/Diretoria..." style={{ ...inputStyle(border, textPrimary, theme === 'dark' ? '#0f172a' : '#f8fafc'), minHeight: '80px', paddingTop: '15px', height: 'auto', border: `1px solid ${primaryColor}` }} /></div>
                                        <div><label style={{ display: 'block', marginBottom: '8px', color: textSecondary, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Observações Gerais</label><textarea value={formData.obs} onChange={e => setFormData({ ...formData, obs: e.target.value })} style={{ ...inputStyle(border, textPrimary, theme === 'dark' ? '#0f172a' : '#f8fafc'), minHeight: '100px', paddingTop: '15px', height: 'auto' }} /></div>
                                        {!editingId && (<div style={{ marginTop: '10px', padding: '15px', background: bgColumn, borderRadius: '12px', border: `1px solid ${border}` }}><label style={{ display: 'block', marginBottom: '8px', color: textSecondary, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Status Inicial do Lead:</label><div style={{ display: 'flex', alignItems: 'center', backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, borderRadius: '12px', padding: '0 16px', height: '50px' }}><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', height: '100%', outline: 'none', fontSize: '15px', backgroundColor: 'transparent', border: 'none', color: theme === 'dark' ? '#fff' : '#0f172a' }}><option value="novo">Novo Lead (Ainda não visitou)</option><option value="negociando">Em Atendimento (Já está na escola)</option></select></div></div>)}
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: `1px solid ${border}`, paddingTop: '20px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: `1px solid ${border}`, background: 'transparent', color: textSecondary, cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                                <button type="submit" style={btnPrimaryStyle}>Salvar e Sincronizar</button>
                            </div>
                        </form>
                    </ModalWrapper>
                )}
                {expandedLead && (
                    <ModalWrapper onClose={() => setExpandedLead(null)} theme={theme} title="Ficha Completa do Aluno" maxWidth="750px">
                        <div style={{ paddingRight: '10px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '20px', borderBottom: `1px solid ${border}`, marginBottom: '20px' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: theme === 'dark' ? '#0f172a' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: primaryColor, border: `2px solid ${primaryColor}` }}>
                                    {expandedLead.aluno?.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ color: textPrimary, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{expandedLead.aluno}</h3>
                                    <p style={{ color: textSecondary, fontSize: '16px', margin: 0 }}>
                                        {expandedLead.ano} • <span style={{ textTransform: 'uppercase', color: primaryColor, fontWeight: 'bold' }}>{getStatusLabel(expandedLead.status).text}</span>
                                    </p>
                                </div>
                            </div>
                            <SectionTitle title="Alunos Cadastrados" color={primaryColor} border={border} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(expandedLead.perfil_completo?.alunos || [{ nome: expandedLead.aluno, nasc: expandedLead.data_nascimento, serie: expandedLead.ano, escola_anterior: expandedLead.escola_atual }]).map((aluno, i) => (
                                    <div key={i} style={{ padding: '10px', border: `1px dashed ${border}`, borderRadius: '10px', backgroundColor: bgColumn }}>
                                        <div style={{ fontWeight: 'bold', color: textPrimary, fontSize: '14px' }}>{aluno.nome} <span style={{ fontWeight: 'normal', fontSize: '12px', color: textSecondary }}>({aluno.serie})</span></div>
                                        <div style={{ fontSize: '12px', color: textSecondary, marginTop: '4px' }}>Nasc: {formatDataBr(aluno.nasc)} | Esc. Anterior: {aluno.escola_anterior || '-'}</div>
                                    </div>
                                ))}
                            </div>
                            <SectionTitle title="Responsáveis e Contato" color={primaryColor} border={border} />
                            {expandedLead.perfil_completo?.endereco && (expandedLead.perfil_completo.endereco.rua || expandedLead.bairro) && (
                                <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: bgColumn, borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <Home size={18} color={textSecondary} style={{ marginTop: '2px' }} />
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: textPrimary }}>
                                            {expandedLead.perfil_completo.endereco.rua ? `${expandedLead.perfil_completo.endereco.rua}, ${expandedLead.perfil_completo.endereco.numero}` : 'Endereço não detalhado'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: textSecondary }}>
                                            {expandedLead.perfil_completo.endereco.bairro || expandedLead.bairro} - {expandedLead.perfil_completo.endereco.cidade} {expandedLead.perfil_completo.endereco.cep && `(${expandedLead.perfil_completo.endereco.cep})`}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(expandedLead.perfil_completo?.responsaveis || [{ nome: expandedLead.responsavel, parentesco: expandedLead.parentesco, telefone: expandedLead.telefone, email: expandedLead.email }]).map((resp, i) => (
                                    <div key={i} style={{ padding: '10px', border: `1px solid ${border}`, borderRadius: '10px', backgroundColor: bgCard }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 'bold', color: textPrimary, fontSize: '14px' }}>{resp.nome}</span>
                                            <span style={{ fontSize: '12px', color: textSecondary, backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{resp.parentesco || 'Responsável'}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: textSecondary, marginTop: '4px', display: 'flex', gap: '15px' }}>
                                            {resp.telefone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {resp.telefone}</span>}
                                            {resp.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {resp.email}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <SectionTitle title="Inteligência Comercial" color={primaryColor} border={border} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <InfoBox label="Origem" value={expandedLead.origem} theme={theme} />
                                <InfoBox label="Motivo Procura" value={formatarLista(expandedLead.motivo_troca || expandedLead.perfil_completo?.motivos)} theme={theme} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <InfoBox label="O Que Valoriza" value={expandedLead.o_que_valoriza || formatarLista(expandedLead.perfil_completo?.valores)} theme={theme} icon={<ThumbsUp size={14} />} iconColor="#22c55e" borderColor="#86efac" />
                                <InfoBox label="Motivo Saída (Dor)" value={expandedLead.motivo_saida || 'Não informado'} theme={theme} icon={<AlertCircle size={14} />} iconColor="#ef4444" borderColor="#fca5a5" />
                            </div>
                            <SectionTitle title="Proposta Financeira" color={primaryColor} border={border} />
                            <div style={{ background: bgColumn, padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                                <div style={{ textAlign: 'center', padding: '10px', background: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '8px' }}><div style={{ fontSize: '10px', color: textSecondary, fontWeight: 'bold' }}>MATRÍCULA</div><div style={{ fontSize: '14px', fontWeight: 'bold', color: textPrimary }}>{expandedLead.valor_matricula || formatarValorReais(expandedLead.proposta_comercial?.matricula || '') || '-'}</div></div>
                                <div style={{ textAlign: 'center', padding: '10px', background: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '8px', border: `1px solid ${primaryColor}` }}><div style={{ fontSize: '10px', color: primaryColor, fontWeight: 'bold' }}>MENSALIDADE</div><div style={{ fontSize: '14px', fontWeight: 'bold', color: primaryColor }}>{expandedLead.valor_mensalidade || formatarValorReais(expandedLead.proposta_comercial?.mensalidade || '') || '-'}</div></div>
                                <div style={{ textAlign: 'center', padding: '10px', background: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '8px' }}><div style={{ fontSize: '10px', color: textSecondary, fontWeight: 'bold' }}>MATERIAL</div><div style={{ fontSize: '14px', fontWeight: 'bold', color: textPrimary }}>{expandedLead.valor_material || formatarValorReais(expandedLead.proposta_comercial?.material || '') || '-'}</div></div>
                                <div style={{ textAlign: 'center', padding: '10px', background: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '8px' }}><div style={{ fontSize: '10px', color: textSecondary, fontWeight: 'bold' }}>INTEGRAL</div><div style={{ fontSize: '14px', fontWeight: 'bold', color: textPrimary }}>{expandedLead.valor_integral || formatarValorReais(expandedLead.proposta_comercial?.integral || '') || '-'}</div></div>
                            </div>
                            <SectionTitle title="Passagem de Bastão (Comercial -> Pedagógico)" color="#eab308" border={border} />
                            {expandedLead.anotacao_comercial && (<div style={{ backgroundColor: '#fef9c3', borderLeft: '4px solid #eab308', padding: '15px', borderRadius: '4px', marginBottom: '15px', color: '#854d0e', fontSize: '14px' }}><div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><MessageSquare size={16} /> NOTA COMERCIAL</div>{expandedLead.anotacao_comercial}</div>)}
                            <div style={{ background: theme === 'dark' ? '#0f172a' : '#f8fafc', padding: '15px', borderRadius: '12px', border: `1px solid ${border}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', color: textSecondary, fontSize: '12px', fontWeight: 'bold' }}><FileText size={14} /> OBSERVAÇÕES GERAIS</div><p style={{ fontSize: '14px', color: textPrimary, whiteSpace: 'pre-line', lineHeight: '1.5' }}>{expandedLead.obs || 'Nenhuma observação.'}</p></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: `1px solid ${border}`, paddingTop: '15px' }}>
                            {expandedLead.status !== 'matriculado' && expandedLead.status !== 'arquivado' && (<button onClick={(e) => handleEditClick(e, expandedLead)} style={{ background: 'transparent', border: `1px solid ${border}`, padding: '10px 20px', borderRadius: '10px', color: textPrimary, cursor: 'pointer', fontWeight: 'bold' }}>Editar Dados</button>)}
                            <button onClick={() => setExpandedLead(null)} style={{ background: primaryColor, border: 'none', padding: '10px 30px', borderRadius: '10px', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>Fechar</button>
                        </div>
                    </ModalWrapper>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Leads;