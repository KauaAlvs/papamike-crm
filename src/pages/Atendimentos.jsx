import React, { useState } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, CheckCheck, Bot } from 'lucide-react';

const Atendimentos = ({ theme }) => {
    const bgBase = theme === 'dark' ? '#0f172a' : '#f8fafc';
    const bgPaper = theme === 'dark' ? '#1e293b' : '#ffffff';
    const textPrimary = theme === 'dark' ? '#f1f5f9' : '#0f172a';
    const textSecondary = theme === 'dark' ? '#94a3b8' : '#64748b';
    const border = theme === 'dark' ? '#334155' : '#e2e8f0';
    const inputBg = theme === 'dark' ? '#334155' : '#f1f5f9';
    const myMsgBg = '#fbbf24';
    const otherMsgBg = theme === 'dark' ? '#334155' : '#ffffff';

    const [activeChat, setActiveChat] = useState(0);
    const [msgInput, setMsgInput] = useState('');

    const contacts = [
        { id: 0, name: 'Mãe do Pedro (5º Ano)', lastMsg: 'Vou ver com meu marido e aviso.', time: '10:42', unread: 0, avatar: null, status: 'Em atendimento' },
        { id: 1, name: 'Pai da Sofia (Novo)', lastMsg: 'Gostaria de saber valores do 1º ano.', time: '09:15', unread: 2, avatar: null, status: 'IA Atendendo' },
        { id: 2, name: 'Lucas Silva (Interessado)', lastMsg: 'A visita está confirmada?', time: 'Ontem', unread: 0, avatar: null, status: 'Agendado' },
    ];

    const messages = [
        { id: 1, sender: 'bot', text: 'Olá! Bem-vindo ao Colégio Papa Mike. Sou a assistente virtual. Como posso ajudar?', time: '10:30' },
        { id: 2, sender: 'client', text: 'Bom dia, gostaria de saber se tem vaga para o 5º ano.', time: '10:32' },
        { id: 3, sender: 'bot', text: 'Temos sim! Para o 5º ano do Ensino Fundamental, temos vagas no período da manhã. Gostaria de agendar uma visita para conhecer a estrutura?', time: '10:32' },
        { id: 4, sender: 'client', text: 'Sim, mas queria falar com uma pessoa sobre valores.', time: '10:35' },
        { id: 5, sender: 'system', text: 'Chat transferido para Secretária Nicoly', time: '10:35' },
        { id: 6, sender: 'me', text: 'Bom dia, mãe! Aqui é a Nicoly. Tudo bem? O valor da mensalidade é R$ 850,00, mas temos desconto para matrícula antecipada.', time: '10:38' },
        { id: 7, sender: 'client', text: 'Entendi. Vou ver com meu marido e aviso.', time: '10:42' },
    ];

    const handleSend = (e) => {
        e.preventDefault();
        if (!msgInput.trim()) return;
        setMsgInput('');
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)', gap: '20px', overflow: 'hidden' }}>
            <div style={{ width: '350px', backgroundColor: bgPaper, borderRadius: '16px', display: 'flex', flexDirection: 'column', border: `1px solid ${border}`, flexShrink: 0 }}>
                <div style={{ padding: '20px', borderBottom: `1px solid ${border}` }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: textPrimary, marginBottom: '15px' }}>Atendimentos</h2>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: inputBg, padding: '10px', borderRadius: '10px' }}>
                        <Search size={18} color={textSecondary} />
                        <input type="text" placeholder="Buscar aluno ou pai..." style={{ border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', color: textPrimary, width: '100%' }} />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {contacts.map((contact) => (
                        <div key={contact.id} onClick={() => setActiveChat(contact.id)} style={{ padding: '15px 20px', display: 'flex', gap: '12px', cursor: 'pointer', backgroundColor: activeChat === contact.id ? (theme === 'dark' ? '#334155' : '#eff6ff') : 'transparent', borderBottom: `1px solid ${border}` }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold', fontSize: '18px', color: '#475569' }}>{contact.name.charAt(0)}</div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 'bold', color: textPrimary, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{contact.name}</span>
                                    <span style={{ fontSize: '11px', color: textSecondary }}>{contact.time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{contact.id === 0 ? '✓✓ ' : ''}{contact.lastMsg}</span>
                                    {contact.unread > 0 && (<div style={{ background: '#fbbf24', color: '#0f172a', fontSize: '10px', fontWeight: 'bold', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{contact.unread}</div>)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, backgroundColor: bgPaper, borderRadius: '16px', border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme === 'dark' ? '#1e293b' : '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{contacts[activeChat].name.charAt(0)}</div>
                        <div><div style={{ fontWeight: 'bold', color: textPrimary }}>{contacts[activeChat].name}</div><div style={{ fontSize: '12px', color: '#10b981' }}>Online no WhatsApp</div></div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}><Phone size={20} color={textSecondary} style={{ cursor: 'pointer' }} /><Video size={20} color={textSecondary} style={{ cursor: 'pointer' }} /><MoreVertical size={20} color={textSecondary} style={{ cursor: 'pointer' }} /></div>
                </div>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: theme === 'dark' ? '#0f172a' : '#e5e5f7' }}>
                    {messages.map((msg) => (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : (msg.sender === 'system' ? 'center' : 'flex-start'), marginBottom: '15px' }}>
                            {msg.sender === 'system' ? (<div style={{ backgroundColor: theme === 'dark' ? '#334155' : '#e2e8f0', padding: '5px 12px', borderRadius: '10px', fontSize: '11px', color: textSecondary, fontWeight: '600' }}>{msg.text}</div>) : (
                                <div style={{ maxWidth: '70%', backgroundColor: msg.sender === 'me' ? myMsgBg : otherMsgBg, color: msg.sender === 'me' ? '#0f172a' : textPrimary, padding: '12px 16px', borderRadius: msg.sender === 'me' ? '12px 0 12px 12px' : '0 12px 12px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', position: 'relative' }}>
                                    {msg.sender === 'bot' && (<div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Bot size={12} /> IA Papa Mike</div>)}
                                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{msg.text}</div>
                                    <div style={{ fontSize: '10px', marginTop: '4px', textAlign: 'right', opacity: 0.7, display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>{msg.time}{msg.sender === 'me' && <CheckCheck size={14} />}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ padding: '15px', backgroundColor: bgPaper, borderTop: `1px solid ${border}` }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Paperclip size={20} color={textSecondary} style={{ cursor: 'pointer' }} /><input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder="Digite uma mensagem..." style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: inputBg, color: textPrimary, outline: 'none' }} /><button type="submit" style={{ backgroundColor: '#fbbf24', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={20} color="#0f172a" /></button></form>
                </div>
            </div>
        </div>
    );
};

export default Atendimentos;