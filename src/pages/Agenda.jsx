import React, { useState, useEffect } from 'react';
import {
    Calendar as CalIcon, Clock, Users, Plus, X, Check, Loader2, Trash2, Edit,
    CheckCircle, AlertCircle, MapPin, ChevronRight, ChevronLeft, Search,
    DollarSign, BookOpen, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURAÇÕES DE CATEGORIAS ---
const CATEGORIES = {
    reuniao: { label: 'Reunião', color: '#8b5cf6', icon: Users, bg: 'rgba(139, 92, 246, 0.15)' },
    tarefa: { label: 'Tarefa', color: '#3b82f6', icon: CheckCircle, bg: 'rgba(59, 130, 246, 0.15)' },
    financeiro: { label: 'Financeiro', color: '#10b981', icon: DollarSign, bg: 'rgba(16, 185, 129, 0.15)' },
    pedagogico: { label: 'Pedagógico', color: '#f59e0b', icon: BookOpen, bg: 'rgba(245, 158, 11, 0.15)' },
    lembrete: { label: 'Lembrete', color: '#ec4899', icon: Bell, bg: 'rgba(236, 72, 153, 0.15)' },
    visita: { label: 'Visita Comercial', color: '#f97316', icon: MapPin, bg: 'rgba(249, 115, 22, 0.15)' },
    evento: { label: 'Evento', color: '#ef4444', icon: AlertCircle, bg: 'rgba(239, 68, 68, 0.15)' }
};

// --- TEMA ---
const getTheme = (theme) => {
    const isDark = theme === 'dark';
    return {
        isDark,
        bgMain: isDark ? '#0f172a' : '#f8fafc',
        bgCard: isDark ? '#1e293b' : '#ffffff',
        bgGlass: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        textPrimary: isDark ? '#f1f5f9' : '#0f172a',
        textSecondary: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? '#334155' : '#e2e8f0',
        primary: '#fbbf24',
        primaryText: '#451a03',
        danger: '#ef4444',
        shadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        shadowHover: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    };
};

// --- HELPERS ---
const monthsName = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

// --- TOAST ---
const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
                position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
                color: 'white', padding: '14px 24px', borderRadius: '16px',
                display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)', fontWeight: '600', fontSize: '15px'
            }}
        >
            {type === 'success' ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
            {message}
        </motion.div>
    );
};

// --- MODAL WRAPPER ---
const ModalWrapper = ({ children, onClose, styles, title, width = '500px' }) => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
                backgroundColor: styles.bgGlass,
                width: width, maxWidth: '95%',
                padding: '25px', borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                border: `1px solid ${styles.border}`,
                maxHeight: '90vh', overflowY: 'auto'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: `1px solid ${styles.border}` }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: styles.textPrimary }}>{title}</h2>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: styles.textSecondary }}><X size={24} /></button>
            </div>
            {children}
        </motion.div>
    </div>
);

// --- CONFIRM MODAL ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, styles }) => {
    if (!isOpen) return null;
    return (
        <ModalWrapper onClose={onClose} styles={styles} title={title} width="400px">
            <p style={{ margin: '0 0 25px 0', color: styles.textSecondary, lineHeight: '1.6' }}>{message}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: `1px solid ${styles.border}`, background: 'transparent', color: styles.textPrimary, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={onConfirm} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: styles.danger, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar</button>
            </div>
        </ModalWrapper>
    );
};

// --- EVENT CARD ---
const EventCard = ({ evt, onClick, onEdit, onDelete, styles, isLast }) => {
    const catConfig = CATEGORIES[evt.type] || CATEGORIES.tarefa;
    const cleanDate = (evt.date || '').split('T')[0];
    const dateParts = cleanDate.split('-');
    const day = dateParts.length === 3 ? dateParts[2] : '00';
    const month = monthsName[parseInt(dateParts[1]) - 1]?.substring(0, 3).toUpperCase() || '';
    const Icon = catConfig.icon;

    return (
        <div style={{ display: 'flex', gap: '15px', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: catConfig.color, border: `2px solid ${styles.bgCard}`, outline: `2px solid ${catConfig.bg}`, marginTop: '15px' }}></div>
                {!isLast && <div style={{ width: '2px', flex: 1, backgroundColor: styles.border, marginTop: '5px', marginBottom: '5px' }}></div>}
            </div>

            <motion.div
                whileHover={{ scale: 1.01, x: 2 }}
                onClick={onClick}
                style={{
                    flex: 1, display: 'flex', backgroundColor: styles.bgCard, borderRadius: '16px',
                    border: `1px solid ${styles.border}`, borderLeft: `4px solid ${catConfig.color}`,
                    marginBottom: '15px', overflow: 'hidden',
                    cursor: 'pointer', boxShadow: styles.shadow, transition: 'all 0.2s ease'
                }}
            >
                <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: styles.bgMain, minWidth: '60px', borderRight: `1px solid ${styles.border}` }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: styles.textPrimary }}>{day}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: styles.textSecondary }}>{month}</span>
                </div>

                <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: catConfig.color, backgroundColor: catConfig.bg, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon size={10} /> {catConfig.label}
                        </span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(evt); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: styles.textSecondary, padding: '4px' }}><Edit size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(evt); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: styles.danger, padding: '4px' }}><Trash2 size={14} /></button>
                        </div>
                    </div>
                    <h4 style={{ margin: '4px 0', fontSize: '14px', fontWeight: '700', color: styles.textPrimary }}>{evt.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: styles.textSecondary }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {evt.time?.substring(0, 5)}</span>
                        {evt.participantesIds?.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {evt.participantesIds.length}</span>}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ==================================================================================
// AGENDA PRINCIPAL
// ==================================================================================
const Agenda = ({ theme, user }) => {
    const styles = getTheme(theme);
    const [events, setEvents] = useState([]);
    const [leads, setLeads] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [viewDate, setViewDate] = useState(new Date());

    // Modais
    const [modalType, setModalType] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const apiUrl = 'http://localhost:3000';
    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    // --- FETCH DATA ---
    const fetchData = async () => {
        if (!user || !user.id) return;
        try {
            setLoading(true);

            // 1. Busca Agenda Unificada (Visitas + Tarefas + Eventos)
            const resAgenda = await fetch(`${apiUrl}/agenda?userId=${user.id}`);
            if (resAgenda.ok) {
                const data = await resAgenda.json();
                setEvents(data);
            }

            // 2. Busca Leads (Para o formulário de Agendar Visita)
            const resLeads = await fetch(`${apiUrl}/leads`);
            if (resLeads.ok) {
                const data = await resLeads.json();
                // Filtra leads ativos para agendamento
                setLeads(data.filter(l => l.status !== 'lost' && l.status !== 'matriculado' && l.status !== 'fechado'));
            }

            // 3. Busca Usuários
            const resUsers = await fetch(`${apiUrl}/usuarios`);
            if (resUsers.ok) setUsersList(await resUsers.json());

        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    // --- CALENDAR NAV ---
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const goToToday = () => setViewDate(new Date());

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfWeek = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const getSafeFullDate = (day) => {
        const year = viewDate.getFullYear();
        const month = String(viewDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    };

    const getEventsForDay = (day) => {
        const targetDate = getSafeFullDate(day);
        return events.filter(e => e.date && e.date.substring(0, 10) === targetDate).sort((a, b) => a.time.localeCompare(b.time));
    };

    // --- ACTIONS ---
    const handleCreateVisit = async (payload) => {
        try {
            const dateForLeads = `${payload.date}T12:00:00`;
            await fetch(`${apiUrl}/leads/${payload.leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'visita_agendada',
                    visitDate: dateForLeads,
                    visitTime: payload.time
                })
            });
            showToast("Visita Agendada!");
            setModalType(null);
            fetchData();
        } catch (e) { showToast("Erro ao agendar.", "error"); }
    };

    const handleCreateEvent = async (payload) => {
        try {
            const bodyData = {
                ...payload,
                criadorId: user.id,
                participantesIds: [...new Set([...payload.participantes, String(user.id)])]
            };
            const endpoint = payload.type === 'tarefa' ? 'tarefas' : 'eventos';
            await fetch(`${apiUrl}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            showToast("Atividade criada!");
            setModalType(null);
            fetchData();
        } catch (e) { showToast("Erro ao criar.", "error"); }
    };

    const handleEditSave = async (newData) => {
        try {
            if (itemToEdit.type === 'visita') {
                const rawId = itemToEdit.originalId || String(itemToEdit.id).replace('visita-', '');
                const dateForLeads = `${newData.date}T12:00:00`;
                await fetch(`${apiUrl}/leads/${rawId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ visitDate: dateForLeads, visitTime: newData.time })
                });
            } else if (itemToEdit.type === 'tarefa') {
                const rawId = String(itemToEdit.id).replace('task-', '');
                await fetch(`${apiUrl}/tarefas/${rawId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: newData.date, hora: newData.time })
                });
            } else {
                const rawId = String(itemToEdit.id).replace('evt-', '');
                await fetch(`${apiUrl}/eventos/${rawId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: newData.date, time: newData.time })
                });
            }
            showToast("Atualizado!");
            setItemToEdit(null);
            fetchData();
        } catch (e) { showToast("Erro ao editar.", "error"); }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            if (itemToDelete.type === 'visita') {
                // LÓGICA DE CANCELAMENTO DE VISITA
                // 1. Pega o ID original do lead
                const rawId = itemToDelete.originalId || String(itemToDelete.id).replace('visita-', '');

                // 2. Reseta o status para 'novo' e limpa as datas
                await fetch(`${apiUrl}/leads/${rawId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        visitDate: null,
                        visitTime: null,
                        status: 'novo'
                    })
                });

                showToast("Visita desmarcada. Lead voltou para 'Novo'.");
            } else if (itemToDelete.type === 'tarefa') {
                const rawId = String(itemToDelete.id).replace('task-', '');
                await fetch(`${apiUrl}/tarefas/${rawId}`, { method: 'DELETE' });
                showToast("Tarefa excluída.");
            } else {
                const rawId = String(itemToDelete.id).replace('evt-', '');
                await fetch(`${apiUrl}/eventos/${rawId}`, { method: 'DELETE' });
                showToast("Evento excluído.");
            }

            setItemToDelete(null);
            fetchData();
        } catch (e) {
            console.error(e);
            showToast("Erro ao remover.", "error");
        }
    };

    const toggleTaskStatus = async (task) => {
        const newStatus = task.status === 'pendente' ? 'concluida' : 'pendente';
        const rawId = String(task.id).replace('task-', '');
        try {
            await fetch(`${apiUrl}/tarefas/${rawId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    if (loading) return <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader2 className="animate-spin" size={40} color={styles.primary} /></div>;

    const daysInMonth = getDaysInMonth(viewDate);
    const startDay = getFirstDayOfWeek(viewDate);
    const realToday = new Date();
    const isCurrentMonth = realToday.getMonth() === viewDate.getMonth() && realToday.getFullYear() === viewDate.getFullYear();

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Inter', sans-serif", padding: '10px' }}>
            <AnimatePresence>{toast && <NotificationToast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

            <ConfirmModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title={itemToDelete?.type === 'visita' ? "Desmarcar Visita" : "Excluir Atividade"}
                message={itemToDelete?.type === 'visita' ? `Deseja desmarcar a visita de ${itemToDelete.title.replace('Visita: ', '')}? O lead voltará para a lista de "Novos".` : "Tem certeza que deseja excluir esta atividade permanentemente?"}
                styles={styles}
            />

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: styles.textPrimary, letterSpacing: '-0.5px', margin: 0 }}>
                        Agenda Corporativa
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: styles.bgCard, borderRadius: '12px', border: `1px solid ${styles.border}`, padding: '4px' }}>
                            <button onClick={prevMonth} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: styles.textPrimary, borderRadius: '8px' }}><ChevronLeft size={20} /></button>
                            <span style={{ padding: '0 15px', fontWeight: 'bold', color: styles.textPrimary, fontSize: '15px', minWidth: '140px', textAlign: 'center' }}>
                                {monthsName[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </span>
                            <button onClick={nextMonth} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: styles.textPrimary, borderRadius: '8px' }}><ChevronRight size={20} /></button>
                        </div>
                        <button onClick={goToToday} style={{ fontSize: '13px', fontWeight: 'bold', color: styles.primaryText, backgroundColor: styles.primary, padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Hoje</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedDay(realToday.getDate()); setModalType('create_event'); }} style={{ backgroundColor: styles.isDark ? '#334155' : '#0f172a', color: styles.primary, border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 20px -5px rgba(15, 23, 42, 0.3)' }}>
                        <Plus size={20} /> Nova Atividade
                    </motion.button>
                </div>
            </div>

            <div className="agenda-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', flex: 1, minHeight: 0 }}>
                {/* LISTA LATERAL */}
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: styles.bgMain }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: styles.textPrimary }}>Próximas Atividades</h3>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: styles.textSecondary, backgroundColor: styles.bgCard, padding: '4px 12px', borderRadius: '20px', border: `1px solid ${styles.border}` }}>
                            {events.length}
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                        {events.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: styles.textSecondary, border: `2px dashed ${styles.border}`, borderRadius: '20px' }}>
                                <CalIcon size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                <p>Sem atividades agendadas.</p>
                            </div>
                        ) : (
                            events.sort((a, b) => (a.date || '').localeCompare(b.date || '')).map((evt, idx, arr) => (
                                <EventCard
                                    key={evt.id}
                                    evt={evt}
                                    styles={styles}
                                    isLast={idx === arr.length - 1}
                                    onClick={() => {
                                        const d = new Date(evt.date);
                                        const evtDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
                                        setViewDate(evtDate);
                                        setSelectedDay(evtDate.getDate());
                                        setModalType('day_details');
                                    }}
                                    onEdit={setItemToEdit}
                                    onDelete={setItemToDelete}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* CALENDÁRIO */}
                <div style={{ backgroundColor: styles.bgCard, borderRadius: '24px', border: `1px solid ${styles.border}`, padding: '25px', display: 'flex', flexDirection: 'column', boxShadow: styles.shadow }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '10px', borderBottom: `1px solid ${styles.border}`, paddingBottom: '10px' }}>
                        {weekDays.map((d, i) => (
                            <div key={i} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '800', color: styles.textSecondary, letterSpacing: '1px' }}>{d}</div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: '10px', flex: 1 }}>
                        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayEvents = getEventsForDay(day);
                            const isToday = isCurrentMonth && day === realToday.getDate();

                            return (
                                <motion.div
                                    key={day}
                                    whileHover={{ scale: 1.05, boxShadow: styles.shadowHover }}
                                    onClick={() => { setSelectedDay(day); setModalType('day_details'); }}
                                    style={{
                                        borderRadius: '16px',
                                        border: isToday ? `2px solid ${styles.primary}` : `1px solid ${styles.border}`,
                                        padding: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                        backgroundColor: isToday ? (styles.isDark ? 'rgba(251, 191, 36, 0.1)' : '#fffbeb') : styles.bgMain,
                                        position: 'relative', overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <span style={{ fontSize: '14px', fontWeight: isToday ? '900' : '600', color: isToday ? styles.primary : styles.textPrimary }}>{day}</span>
                                        {isToday && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: styles.primary }}></span>}
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: 'auto' }}>
                                        {dayEvents.slice(0, 4).map((evt, idx) => {
                                            const catColor = (CATEGORIES[evt.type] || CATEGORIES.tarefa).color;
                                            return <div key={idx} title={evt.title} style={{ width: '100%', height: '5px', borderRadius: '3px', backgroundColor: catColor, opacity: 0.8 }}></div>
                                        })}
                                        {dayEvents.length > 4 && <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: styles.textSecondary }}></div>}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <style>{`@media (max-width: 1024px) { .agenda-grid { grid-template-columns: 1fr !important; } }`}</style>

            {/* --- MODAIS --- */}
            <AnimatePresence>
                {modalType === 'day_details' && (
                    <ModalWrapper onClose={() => setModalType(null)} styles={styles} title={`Dia ${selectedDay} de ${monthsName[viewDate.getMonth()]}`}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setModalType('create_visit')} style={{ padding: '15px', borderRadius: '16px', border: 'none', backgroundColor: styles.primary, color: styles.primaryText, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                <MapPin size={24} />
                                <span style={{ fontWeight: '800', fontSize: '13px' }}>Agendar Visita</span>
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setModalType('create_event')} style={{ padding: '15px', borderRadius: '16px', border: 'none', backgroundColor: styles.textPrimary, color: styles.bgCard, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                <Plus size={24} />
                                <span style={{ fontWeight: '800', fontSize: '13px' }}>Nova Tarefa/Evento</span>
                            </motion.button>
                        </div>

                        <h4 style={{ color: styles.textSecondary, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Atividades do dia</h4>
                        <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {getEventsForDay(selectedDay).length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: styles.textSecondary, fontSize: '13px' }}>Nada agendado.</div>}
                            {getEventsForDay(selectedDay).map((e, i) => {
                                const cat = CATEGORIES[e.type] || CATEGORIES.tarefa;
                                return (
                                    <div key={i} style={{ padding: '15px', borderRadius: '12px', backgroundColor: styles.bgMain, border: `1px solid ${styles.border}`, borderLeft: `4px solid ${cat.color}`, display: 'flex', flexDirection: 'column', gap: '5px', opacity: e.status === 'concluida' ? 0.6 : 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: cat.color, textTransform: 'uppercase' }}>
                                                {e.time.substring(0, 5)} • {cat.label}
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                {e.type === 'tarefa' && (
                                                    <button onClick={() => toggleTaskStatus(e)} style={{ padding: '5px', borderRadius: '6px', border: 'none', background: e.status === 'concluida' ? styles.success : '#f59e0b', color: 'white', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>
                                                        {e.status === 'concluida' ? 'Reabrir' : 'Concluir'}
                                                    </button>
                                                )}
                                                <button onClick={() => { setModalType(null); setItemToEdit(e); }} style={{ padding: '5px', borderRadius: '6px', border: `1px solid ${styles.border}`, background: styles.bgCard, cursor: 'pointer', color: styles.textSecondary }}><Edit size={14} /></button>
                                                <button onClick={() => { setModalType(null); setItemToDelete(e); }} style={{ padding: '5px', borderRadius: '6px', border: 'none', background: '#fee2e2', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '700', color: styles.textPrimary, fontSize: '14px', textDecoration: e.status === 'concluida' ? 'line-through' : 'none' }}>{e.title}</div>
                                        {e.details && <div style={{ fontSize: '12px', color: styles.textSecondary, fontStyle: 'italic' }}>{e.details}</div>}
                                        {e.participantesIds?.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '11px', color: styles.textSecondary, borderTop: `1px dashed ${styles.border}`, paddingTop: '5px' }}>
                                                <Users size={12} /> {e.participantesIds.length} envolvidos
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </ModalWrapper>
                )}

                {itemToEdit && (
                    <ModalWrapper onClose={() => setItemToEdit(null)} styles={styles} title="Editar Horário">
                        <FormEditDate item={itemToEdit} styles={styles} onSave={handleEditSave} />
                    </ModalWrapper>
                )}

                {modalType === 'create_visit' && (
                    <ModalWrapper onClose={() => setModalType(null)} styles={styles} title={`Agendar Visita (${selectedDay}/${monthsName[viewDate.getMonth()]})`}>
                        <FormSelectLead leads={leads} styles={styles} onSave={(data) => handleCreateVisit({ ...data, date: getSafeFullDate(selectedDay) })} />
                    </ModalWrapper>
                )}

                {modalType === 'create_event' && (
                    <ModalWrapper onClose={() => setModalType(null)} styles={styles} title={`Nova Atividade (${selectedDay}/${monthsName[viewDate.getMonth()]})`}>
                        <FormCreateEvent users={usersList} styles={styles} onSave={(data) => handleCreateEvent({ ...data, date: getSafeFullDate(selectedDay) })} />
                    </ModalWrapper>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- SUB-COMPONENTES ---

const InputStyle = (styles) => ({
    width: '100%', padding: '12px', borderRadius: '10px',
    border: `2px solid ${styles.border}`, backgroundColor: styles.bgMain,
    color: styles.textPrimary, fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s', fontWeight: '500'
});

const FormEditDate = ({ item, styles, onSave }) => {
    const initialDate = (item.date || '').split('T')[0];
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(item.time || '09:00');
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '10px', backgroundColor: styles.bgMain, borderRadius: '10px', borderLeft: `4px solid ${styles.primary}` }}>
                <p style={{ margin: 0, fontSize: '12px', color: styles.textSecondary }}>Item:</p>
                <p style={{ margin: 0, fontWeight: 'bold', color: styles.textPrimary }}>{item.title}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={InputStyle(styles)} />
                <input type="time" value={time} onChange={e => setTime(e.target.value)} style={InputStyle(styles)} />
            </div>
            <button onClick={() => onSave({ date, time })} style={{ padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: styles.primary, color: styles.primaryText, fontWeight: '800', cursor: 'pointer', width: '100%' }}>Salvar</button>
        </div>
    );
};

const FormSelectLead = ({ leads, styles, onSave }) => {
    const [leadId, setLeadId] = useState('');
    const [time, setTime] = useState('09:00');
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <select value={leadId} onChange={e => setLeadId(e.target.value)} style={InputStyle(styles)}>
                <option value="">Selecione o Lead...</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.aluno}</option>)}
            </select>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={InputStyle(styles)} />
            <button onClick={() => { if (!leadId) return alert('Selecione!'); onSave({ leadId, time }); }} style={{ padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: styles.primary, color: styles.primaryText, fontWeight: '800', cursor: 'pointer', width: '100%' }}>Agendar</button>
        </div>
    );
};

const FormCreateEvent = ({ users, styles, onSave }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('tarefa');
    const [time, setTime] = useState('14:00');
    const [details, setDetails] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleUser = (id) => {
        if (selectedUsers.includes(id)) setSelectedUsers(selectedUsers.filter(u => u !== id));
        else setSelectedUsers([...selectedUsers, id]);
    };

    const filteredUsers = users.filter(u => u.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* TIPO DE ATIVIDADE */}
            <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: styles.textSecondary, textTransform: 'uppercase' }}>Tipo</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '5px' }}>
                    {Object.keys(CATEGORIES).filter(k => k !== 'visita').map(key => (
                        <button
                            key={key}
                            onClick={() => setType(key)}
                            style={{
                                padding: '8px', borderRadius: '8px',
                                border: type === key ? `2px solid ${CATEGORIES[key].color}` : `1px solid ${styles.border}`,
                                backgroundColor: type === key ? CATEGORIES[key].bg : 'transparent',
                                color: type === key ? CATEGORIES[key].color : styles.textSecondary,
                                fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            {CATEGORIES[key].label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: styles.textSecondary, textTransform: 'uppercase' }}>Título</label>
                <input type="text" placeholder="Ex: Boleto João Pedro 1ª Série" value={title} onChange={e => setTitle(e.target.value)} style={InputStyle(styles)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: styles.textSecondary, textTransform: 'uppercase' }}>Horário</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} style={InputStyle(styles)} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: styles.textSecondary, textTransform: 'uppercase' }}>Envolvidos ({selectedUsers.length})</label>
                    <div style={{ border: `2px solid ${styles.border}`, borderRadius: '10px', backgroundColor: styles.bgMain, overflow: 'hidden' }}>
                        <div style={{ padding: '6px', borderBottom: `1px solid ${styles.border}`, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Search size={12} color={styles.textSecondary} />
                            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: styles.textPrimary, fontSize: '12px' }} />
                        </div>
                        <div style={{ height: '100px', overflowY: 'auto', padding: '5px' }}>
                            {filteredUsers.map(u => (
                                <div key={u.id} onClick={() => toggleUser(u.id)} style={{ padding: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '6px', backgroundColor: selectedUsers.includes(String(u.id)) ? (styles.isDark ? '#334155' : '#e0f2fe') : 'transparent' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `1px solid ${selectedUsers.includes(String(u.id)) ? '#3b82f6' : styles.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: selectedUsers.includes(String(u.id)) ? '#3b82f6' : 'transparent' }}>
                                        {selectedUsers.includes(String(u.id)) && <Check size={10} color="#fff" />}
                                    </div>
                                    <span style={{ fontSize: '12px', color: styles.textPrimary }}>{u.nome}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: styles.textSecondary, textTransform: 'uppercase' }}>Observações</label>
                <textarea placeholder="Detalhes da tarefa..." value={details} onChange={e => setDetails(e.target.value)} style={{ ...InputStyle(styles), minHeight: '60px', fontFamily: 'inherit' }} />
            </div>

            <button onClick={() => { if (!title) return alert('Título?'); onSave({ title, type, time, details, participantes: selectedUsers }); }} style={{ padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: styles.textPrimary, color: styles.bgCard, fontWeight: '800', cursor: 'pointer', width: '100%' }}>
                Salvar Atividade
            </button>
        </div>
    );
};

export default Agenda;