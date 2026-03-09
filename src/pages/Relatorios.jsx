import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Users, DollarSign, BarChart2, Loader2,
    CheckCircle, AlertCircle, Eye, X, Printer, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ENDPOINTS ---
const API_BASE = 'http://localhost:3000';

// --- HELPERS GLOBAIS ---
const parseCurrency = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    let v = value.toString().replace('R$', '').trim();
    if (v.includes(',') && v.includes('.')) v = v.replace(/\./g, '').replace(',', '.');
    else if (v.includes(',')) v = v.replace(',', '.');
    return parseFloat(v) || 0;
};

// --- COMPONENTES VISUAIS ---
const MetricCard = ({ label, value, subtext, color = '#0f172a' }) => (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', flex: 1, textAlign: 'center', backgroundColor: '#fff', minWidth: '120px' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: color }}>{value}</div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: '#64748b', marginTop: '5px' }}>{label}</div>
        {subtext && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{subtext}</div>}
    </div>
);

// --- TOAST ---
const NotificationToast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20, x: 20 }}
            style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000, backgroundColor: type === 'success' ? '#10b981' : '#ef4444', color: 'white', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontWeight: 'bold', fontSize: '14px' }}
        >
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message}
        </motion.div>
    );
};

// =================================================================================
// O RELATÓRIO (PAPEL A4)
// =================================================================================
const ReportPreviewContent = ({ reportId, title, data }) => {
    // Estilos de Papel
    const styles = {
        paper: { backgroundColor: '#ffffff', color: '#0f172a', padding: '40px', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', minHeight: '800px', fontFamily: 'Arial, sans-serif', fontSize: '12px', position: 'relative' },
        header: { borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
        th: { borderBottom: '2px solid #000', textAlign: 'left', padding: '8px', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', backgroundColor: '#f8fafc' },
        td: { borderBottom: '1px solid #e2e8f0', padding: '8px', fontSize: '12px' },
        totalRow: { backgroundColor: '#f0fdf4', fontWeight: 'bold', fontSize: '14px', borderTop: '2px solid #000' },
        empty: { padding: '30px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', background: '#f8fafc', borderRadius: '8px' }
    };

    // Helpers de Data
    const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
    const now = new Date();

    const isSameMonth = (d) => { if (!d) return false; const date = new Date(d); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); };
    const isSameYear = (d) => { if (!d) return false; const date = new Date(d); return date.getFullYear() === now.getFullYear(); };

    // Helper Semanal (Domingo a Sábado)
    const isSameWeek = (d) => {
        if (!d) return false;
        const date = new Date(d);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return date >= startOfWeek;
    };

    const renderSpecificContent = () => {
        // --- RELATÓRIOS FINANCEIROS (Baseado em Leads Matriculados) ---
        if (reportId.startsWith('fin-')) {
            // Regra: Considera matriculado se status='matriculado' OU (arquivado + etapa concluida) OU tem data_matricula
            let alunosPagantes = data.leads.filter(l =>
                l.status === 'matriculado' ||
                (l.status === 'arquivado' && l.etapa_matricula === 'concluido') ||
                l.data_matricula
            );

            let periodLabel = "Acumulado Total";

            if (reportId === 'fin-mensal') {
                alunosPagantes = alunosPagantes.filter(l => isSameMonth(l.data_matricula || l.date));
                periodLabel = "Mês Vigente";
            }
            if (reportId === 'fin-anual') {
                alunosPagantes = alunosPagantes.filter(l => isSameYear(l.data_matricula || l.date));
                periodLabel = "Ano Vigente";
            }
            if (reportId === 'fin-semanal') {
                alunosPagantes = alunosPagantes.filter(l => isSameWeek(l.data_matricula || l.date));
                periodLabel = "Semana Atual";
            }

            // Cálculo Robusto de Receita
            const totalReceita = alunosPagantes.reduce((acc, curr) => {
                const p = curr.proposta_comercial || {};
                // Tenta pegar valor da matrícula, ou valor final, ou valor raiz
                const val = parseCurrency(p.matricula || p.valor_final || curr.valor);
                return acc + val;
            }, 0);

            return (
                <>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <MetricCard label="Receita Período" value={formatMoney(totalReceita)} color="#10b981" />
                        <MetricCard label="Contratos" value={alunosPagantes.length} subtext={periodLabel} />
                        <MetricCard label="Ticket Médio" value={formatMoney(alunosPagantes.length ? totalReceita / alunosPagantes.length : 0)} color="#3b82f6" />
                    </div>

                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>Extrato Detalhado ({periodLabel})</h4>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Data</th>
                                <th style={styles.th}>Aluno</th>
                                <th style={styles.th}>Turma/Ano</th>
                                <th style={styles.th} align="right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alunosPagantes.length > 0 ? (
                                <>
                                    {alunosPagantes.map((lead, i) => {
                                        const val = parseCurrency(lead.proposta_comercial?.matricula || lead.proposta_comercial?.valor_final || lead.valor);
                                        return (
                                            <tr key={i}>
                                                <td style={styles.td}>{formatDate(lead.data_matricula || lead.date)}</td>
                                                <td style={styles.td}>{lead.nome || lead.aluno}</td>
                                                <td style={styles.td}>{lead.turma || lead.ano || '-'}</td>
                                                <td style={{ ...styles.td, textAlign: 'right', color: '#10b981' }}>{formatMoney(val)}</td>
                                            </tr>
                                        );
                                    })}
                                    <tr style={styles.totalRow}>
                                        <td colSpan="3" style={{ ...styles.td, textAlign: 'right' }}>TOTAL:</td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>{formatMoney(totalReceita)}</td>
                                    </tr>
                                </>
                            ) : <tr><td colSpan="4" style={styles.empty}>Nenhum registro financeiro neste período.</td></tr>}
                        </tbody>
                    </table>
                </>
            );
        }

        // --- RELATÓRIOS DE MATRÍCULAS (OPERACIONAL) ---
        if (reportId.startsWith('mat-')) {
            let filtered = data.leads.filter(l => l.status === 'matriculado' || (l.status === 'arquivado' && l.etapa_matricula === 'concluido'));

            if (reportId === 'mat-mensal') filtered = filtered.filter(l => isSameMonth(l.data_matricula || l.date));
            if (reportId === 'mat-semanal') filtered = filtered.filter(l => isSameWeek(l.data_matricula || l.date));

            // Relatório de Evasão/Perda
            if (reportId === 'mat-cancel') {
                filtered = data.leads.filter(l => l.status === 'perdido');
            }

            return (
                <>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <MetricCard label="Quantidade" value={filtered.length} color="#3b82f6" />
                    </div>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Aluno</th>
                                <th style={styles.th}>Responsável</th>
                                <th style={styles.th}>Turma</th>
                                <th style={styles.th}>Data Ref.</th>
                                {reportId === 'mat-cancel' && <th style={styles.th}>Motivo Perda</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map(l => (
                                <tr key={l.id}>
                                    <td style={styles.td}>{l.aluno || l.nome}</td>
                                    <td style={styles.td}>{l.responsavel || '-'}</td>
                                    <td style={styles.td}>{l.turma || l.ano || 'Geral'}</td>
                                    <td style={styles.td}>{formatDate(l.data_matricula || l.data_perda || l.date)}</td>
                                    {reportId === 'mat-cancel' && <td style={{ ...styles.td, color: '#ef4444' }}>{l.motivo_perda || '-'}</td>}
                                </tr>
                            )) : <tr><td colSpan="5" style={styles.empty}>Nenhum registro encontrado.</td></tr>}
                        </tbody>
                    </table>
                </>
            );
        }

        // --- RELATÓRIOS DE LEADS (COMERCIAL) ---
        if (reportId.startsWith('lead-')) {
            if (reportId === 'lead-origem') {
                // Calcula origem na hora com base nos leads atuais
                const origemMap = data.leads.reduce((acc, l) => {
                    const o = l.origem || 'Não Informado';
                    acc[o] = (acc[o] || 0) + 1;
                    return acc;
                }, {});

                const chartData = Object.entries(origemMap).map(([k, v]) => ({ label: k, value: v })).sort((a, b) => b.value - a.value);

                return (
                    <>
                        <MetricCard label="Total Leads Captados" value={data.leads.length} />
                        <div style={{ marginTop: '20px' }}>

                        </div>
                        <table style={styles.table}>
                            <thead><tr><th style={styles.th}>Canal de Origem</th><th style={styles.th}>Qtd. Leads</th><th style={styles.th}>Representatividade</th></tr></thead>
                            <tbody>
                                {chartData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td style={styles.td}>{item.label}</td>
                                        <td style={styles.td}>{item.value}</td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span>{((item.value / data.leads.length) * 100).toFixed(1)}%</span>
                                                <div style={{ height: '6px', width: '50px', background: '#e2e8f0', borderRadius: '3px' }}><div style={{ height: '100%', width: `${(item.value / data.leads.length) * 100}%`, background: '#3b82f6', borderRadius: '3px' }}></div></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                );
            }
            // Leads Frios (Sem interação há mais de 30 dias ou status 'arquivado' sem sucesso)
            if (reportId === 'lead-frio') {
                const trintaDiasAtras = new Date();
                trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

                const leadsFrios = data.leads.filter(l => {
                    const dataUltima = new Date(l.date);
                    return dataUltima < trintaDiasAtras && !['matriculado', 'perdido'].includes(l.status);
                });

                return (
                    <>
                        <div style={{ padding: '15px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', color: '#b45309', marginBottom: '20px', fontSize: '13px' }}>
                            <strong>Sugestão de Ação:</strong> Estes leads estão estagnados há mais de 30 dias. Recomendamos uma campanha de repescagem via WhatsApp.
                        </div>
                        <table style={styles.table}>
                            <thead><tr><th style={styles.th}>Nome</th><th style={styles.th}>Telefone</th><th style={styles.th}>Data Entrada</th><th style={styles.th}>Status Atual</th></tr></thead>
                            <tbody>
                                {leadsFrios.length > 0 ? leadsFrios.map(l => (
                                    <tr key={l.id}>
                                        <td style={styles.td}>{l.aluno || l.nome}</td>
                                        <td style={styles.td}>{l.telefone}</td>
                                        <td style={styles.td}>{formatDate(l.date)}</td>
                                        <td style={styles.td}>{l.status}</td>
                                    </tr>
                                )) : <tr><td colSpan="4" style={styles.empty}>Nenhum lead frio encontrado.</td></tr>}
                            </tbody>
                        </table>
                    </>
                )
            }
        }

        return <div style={styles.empty}>Relatório em desenvolvimento ou não disponível.</div>;
    };

    return (
        <div id="print-area" style={styles.paper}>
            <div style={styles.header}>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' }}>COLÉGIO PAPA MIKE</h2>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Sistema de Gestão Escolar</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Emitido em: {now.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {reportId.toUpperCase()}</div>
                </div>
            </div>

            {renderSpecificContent()}

            <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                <span>Documento Confidencial - Uso Interno</span>
                <span>Página 1 de 1</span>
            </div>
        </div>
    );
};

// =================================================================================
// COMPONENTE PRINCIPAL
// =================================================================================
const Relatorios = ({ theme }) => {
    const isDark = theme === 'dark';
    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const bgCard = isDark ? '#1e293b' : '#ffffff';
    const border = isDark ? '#334155' : '#e2e8f0';

    const [activeTab, setActiveTab] = useState('matriculas');
    const [selectedReport, setSelectedReport] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false); // Mudado para Printing
    const [toast, setToast] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [resLeads] = await Promise.all([
                    fetch(`${API_BASE}/leads`)
                ]);
                if (resLeads.ok) setLeads(await resLeads.json());
            } catch (error) {
                console.error("Erro dados:", error);
                showToast("Erro ao conectar com o banco de dados.", "error");
            } finally {
                setLoadingData(false);
            }
        };
        fetchAllData();
    }, []);

    const reportsData = {
        matriculas: [
            { id: 'mat-anual', title: 'Relatório Geral Anual', desc: 'Consolidado de todas as matrículas de 2026.', highlight: true },
            { id: 'mat-mensal', title: 'Matrículas do Mês', desc: 'Entradas confirmadas no mês vigente.' },
            { id: 'mat-semanal', title: 'Matrículas da Semana', desc: 'Entradas dos últimos 7 dias.' },
            { id: 'mat-cancel', title: 'Relatório de Perdas', desc: 'Leads perdidos e motivos.' },
        ],
        financeiro: [
            { id: 'fin-anual', title: 'Receita Anual', desc: 'Soma total dos contratos do ano.', highlight: true },
            { id: 'fin-mensal', title: 'Receita Mensal', desc: 'Fechamento do mês atual.' },
            { id: 'fin-semanal', title: 'Receita Semanal', desc: 'Entradas da semana.' },
        ],
        leads: [
            { id: 'lead-origem', title: 'Origem dos Leads', desc: 'Instagram vs Google vs Indicação.' },
            { id: 'lead-frio', title: 'Leads Frios / Estagnados', desc: 'Oportunidades para repescagem.' },
        ],
        performance: [
            { id: 'rh-equipe', title: 'Performance da Equipe', desc: 'Ranking de vendas (Em Breve).' },
        ]
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print(); // CHAMA A IMPRESSORA NATIVA
            setIsPrinting(false);
            showToast(`Impressão enviada!`);
        }, 500);
    };

    return (
        <div style={{ width: '100%', paddingBottom: '40px' }}>
            <AnimatePresence>{toast && <NotificationToast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

            {/* HEADER DA TELA (Escondido na impressão) */}
            <div className="no-print" style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: textPrimary }}>Central de Relatórios</h1>
                <p style={{ color: textSecondary, marginTop: '5px' }}>Geração de documentos oficiais.</p>
            </div>

            {/* ABAS (Escondido na impressão) */}
            <div className="no-print no-scrollbar" style={{ display: 'flex', gap: '12px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '4px' }}>
                {Object.keys(reportsData).map(key => (
                    <TabButton
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        icon={key === 'financeiro' ? <DollarSign size={18} /> : key === 'leads' ? <Users size={18} /> : key === 'performance' ? <BarChart2 size={18} /> : <FileText size={18} />}
                        active={activeTab === key}
                        onClick={() => setActiveTab(key)}
                        theme={theme}
                    />
                ))}
            </div>

            {/* LISTA DE RELATÓRIOS (Escondido na impressão) */}
            {loadingData ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={30} color={textSecondary} /></div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }} className="no-print">
                        {reportsData[activeTab].map((report) => (
                            <div key={report.id} style={{ backgroundColor: bgCard, borderRadius: '16px', padding: '24px', border: `1px solid ${report.highlight ? '#fbbf24' : border}`, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                {report.highlight && <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#fffbeb', color: '#b45309', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fbbf24' }}>OFICIAL</div>}
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: textPrimary, marginBottom: '5px' }}>{report.title}</h3>
                                    <p style={{ fontSize: '13px', color: textSecondary, marginBottom: '20px' }}>{report.desc}</p>
                                </div>
                                <button onClick={() => setSelectedReport(report)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: isDark ? '#334155' : '#0f172a', color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Eye size={16} /> Visualizar
                                </button>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* MODAL DE PREVIEW (Vira Tela Cheia na Impressão) */}
            <AnimatePresence>
                {selectedReport && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedReport(null)} className="print-modal-overlay">

                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} style={{ backgroundColor: bgCard, width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: `1px solid ${border}`, overflow: 'hidden' }} className="print-modal-content">

                            {/* Header do Modal (Botoes) - SOME NA IMPRESSÃO */}
                            <div className="no-print" style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '8px', backgroundColor: '#fbbf24', borderRadius: '8px', color: '#1e293b' }}><Printer size={20} /></div>
                                    <div><h3 style={{ fontSize: '16px', fontWeight: 'bold', color: textPrimary }}>Visualização de Impressão</h3><p style={{ fontSize: '12px', color: textSecondary }}>{selectedReport.title}</p></div>
                                </div>
                                <button onClick={() => setSelectedReport(null)} style={{ background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer', padding: '5px' }}><X size={24} /></button>
                            </div>

                            {/* Conteúdo do Relatório (PAPEL) */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '30px', backgroundColor: isDark ? '#0f172a' : '#525252', display: 'flex', justifyContent: 'center' }} className="print-scroll-area">
                                <div style={{ width: '100%', maxWidth: '210mm' }} className="print-paper">
                                    <ReportPreviewContent reportId={selectedReport.id} title={selectedReport.title} data={{ leads }} />
                                </div>
                            </div>

                            {/* Footer do Modal (Botoes) - SOME NA IMPRESSÃO */}
                            <div className="no-print" style={{ padding: '20px 24px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: isDark ? '#1e293b' : '#fff' }}>
                                <button onClick={() => setSelectedReport(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: `1px solid ${border}`, background: 'transparent', color: textPrimary, fontWeight: '600', cursor: 'pointer' }}>Fechar</button>
                                <button onClick={handlePrint} disabled={isPrinting} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#fbbf24', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: isPrinting ? 'wait' : 'pointer', opacity: isPrinting ? 0.7 : 1 }}>
                                    {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />} {isPrinting ? 'Imprimindo...' : 'Imprimir / Salvar PDF'}
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ESTILOS DE IMPRESSÃO - ESSENCIAL PARA FUNCIONAR */}
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                
                @media print {
                    @page { margin: 0; size: auto; }
                    body * { visibility: hidden; }
                    .print-modal-overlay, .print-modal-overlay * { visibility: visible; }
                    .print-modal-overlay { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white !important; padding: 0 !important; display: block !important; }
                    .print-modal-content { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; max-height: none !important; border-radius: 0 !important; }
                    .print-scroll-area { padding: 0 !important; background: white !important; overflow: visible !important; display: block !important; }
                    .print-paper { max-width: 100% !important; box-shadow: none !important; padding: 20px !important; }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};

const TabButton = ({ label, icon, active, onClick, theme }) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s', backgroundColor: active ? '#fbbf24' : (theme === 'dark' ? '#1e293b' : '#fff'), color: active ? '#0f172a' : (theme === 'dark' ? '#94a3b8' : '#64748b'), border: active ? '2px solid #fbbf24' : `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`, boxShadow: active ? '0 4px 6px -1px rgba(251, 191, 36, 0.2)' : 'none' }}>
        {icon} {label}
    </button>
);

export default Relatorios;