import React, { useState, useEffect } from 'react';
import { Save, Globe, Building, Target, CheckCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TEMA ---
const getTheme = (theme) => ({
    isDark: theme === 'dark',
    bgCard: theme === 'dark' ? '#1e293b' : '#ffffff',
    bgInput: theme === 'dark' ? '#0f172a' : '#f8fafc',
    textPrimary: theme === 'dark' ? '#f1f5f9' : '#0f172a',
    textSecondary: theme === 'dark' ? '#94a3b8' : '#64748b',
    border: theme === 'dark' ? '#334155' : '#e2e8f0',
    primary: '#fbbf24',
    success: '#10b981'
});

const Configuracoes = ({ theme, user }) => {
    const styles = getTheme(theme);
    const [showSuccess, setShowSuccess] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    // Estado local das metas
    const [localGoals, setLocalGoals] = useState({
        leads: 0, matriculas: 0, visitas: 0, receita: 0
    });

    useEffect(() => {
        // 1. VERIFICA PERMISSÃO
        if (user) {
            const role = (user.cargo || user.role || '').toLowerCase();
            const allowed = ['mantenedor', 'developer', 'admin'];
            if (allowed.includes(role)) {
                setCanEdit(true);
            }
        }

        // 2. BUSCA METAS DO BANCO DE DADOS
        const fetchGoals = async () => {
            try {
                const res = await fetch('http://localhost:3000/metas');
                if (res.ok) {
                    const data = await res.json();
                    setLocalGoals(data);
                }
            } catch (error) { console.error("Erro ao buscar metas", error); }
        };
        fetchGoals();
    }, [user]);

    // 3. SALVA NO BANCO DE DADOS
    const handleSave = async () => {
        if (!canEdit) return;
        try {
            const res = await fetch('http://localhost:3000/metas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localGoals)
            });
            if (res.ok) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                alert("Erro ao salvar.");
            }
        } catch (error) { alert("Erro de conexão."); }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px' }}>

            {/* CSS PARA REMOVER AS SETAS PADRÃO DO INPUT NUMBER */}
            <style>{`
                /* Chrome, Safari, Edge, Opera */
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                /* Firefox */
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 20, right: 20, backgroundColor: styles.success, color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 100 }}
                    >
                        <CheckCircle size={20} /> Metas atualizadas no sistema!
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: styles.textPrimary, margin: 0, letterSpacing: '-1px' }}>Configurações</h1>
                <p style={{ color: styles.textSecondary, fontSize: '16px', marginTop: '5px' }}>Defina os objetivos globais da equipe.</p>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>

                {/* --- SEÇÃO: METAS (KPIs) --- */}
                <Section title="Metas Mensais (KPIs)" icon={<Target size={22} />} styles={styles}>
                    {!canEdit && (
                        <div style={{ padding: '15px', backgroundColor: '#fee2e2', borderRadius: '10px', color: '#b91c1c', fontSize: '13px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Lock size={16} /> Apenas Mantenedores podem alterar as metas.
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <InputGroup
                            label="Meta de Leads"
                            type="number"
                            value={localGoals.leads}
                            onChange={(e) => setLocalGoals({ ...localGoals, leads: parseInt(e.target.value) })}
                            styles={styles}
                            disabled={!canEdit}
                        />
                        <InputGroup
                            label="Meta de Matrículas"
                            type="number"
                            value={localGoals.matriculas}
                            onChange={(e) => setLocalGoals({ ...localGoals, matriculas: parseInt(e.target.value) })}
                            styles={styles}
                            disabled={!canEdit}
                        />
                        <InputGroup
                            label="Meta de Visitas"
                            type="number"
                            value={localGoals.visitas}
                            onChange={(e) => setLocalGoals({ ...localGoals, visitas: parseInt(e.target.value) })}
                            styles={styles}
                            disabled={!canEdit}
                        />
                        <InputGroup
                            label="Meta Financeira (x1000)"
                            type="number"
                            value={localGoals.receita}
                            onChange={(e) => setLocalGoals({ ...localGoals, receita: parseInt(e.target.value) })}
                            styles={styles}
                            suffix="k"
                            disabled={!canEdit}
                        />
                    </div>
                </Section>

                {/* --- SEÇÃO: DADOS --- */}
                <Section title="Dados da Instituição" icon={<Building size={22} />} styles={styles}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <InputGroup label="Nome da Escola" value="Colégio Papa Mike" styles={styles} disabled />
                        <InputGroup label="CNPJ" value="00.000.000/0001-99" styles={styles} disabled />
                    </div>
                    <InputGroup label="Endereço Completo" value="Rua Exemplo, 123 - Osasco, SP" styles={styles} disabled />
                </Section>

                {/* --- SEÇÃO: INTEGRAÇÕES --- */}
                <Section title="Integrações (API)" icon={<Globe size={22} />} styles={styles}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '16px', backgroundColor: styles.isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', border: '1px solid #10b981' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Globe color="white" size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', color: styles.isDark ? '#34d399' : '#065f46', fontSize: '15px' }}>WhatsApp API</div>
                                <div style={{ fontSize: '13px', color: styles.isDark ? '#6ee7b7' : '#047857', fontWeight: '500' }}>Status: Conectado</div>
                            </div>
                        </div>
                        <button style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                            Testar
                        </button>
                    </div>
                </Section>

                {/* BOTÃO SALVAR (Só aparece se puder editar) */}
                {canEdit && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingBottom: '40px' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: styles.primary, border: 'none', padding: '16px 32px', borderRadius: '16px', fontWeight: '800', color: '#451a03', cursor: 'pointer', fontSize: '16px', boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.4)' }}
                        >
                            <Save size={20} /> Salvar Alterações
                        </motion.button>
                    </div>
                )}

            </div>
        </div>
    );
};

// Componentes Auxiliares
const Section = ({ title, icon, children, styles }) => (
    <div style={{ backgroundColor: styles.bgCard, padding: '30px', borderRadius: '24px', border: `1px solid ${styles.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', borderBottom: `1px solid ${styles.border}`, paddingBottom: '15px' }}>
            <div style={{ color: styles.textPrimary, backgroundColor: styles.bgInput, padding: '8px', borderRadius: '10px' }}>{icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: styles.textPrimary, margin: 0 }}>{title}</h3>
        </div>
        {children}
    </div>
);

// CORREÇÃO NO INPUT GROUP
const InputGroup = ({ label, value, onChange, type = "text", styles, suffix, disabled }) => (
    <div>
        <label style={{ display: 'block', marginBottom: '8px', color: styles.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                style={{
                    width: '100%',
                    // Aumentei o paddingRight se tiver sufixo para não sobrepor
                    padding: suffix ? '14px 35px 14px 14px' : '14px',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '15px',
                    backgroundColor: styles.bgInput,
                    border: `2px solid ${styles.border}`,
                    color: styles.textPrimary,
                    fontWeight: '600',
                    transition: 'border-color 0.2s',
                    opacity: disabled ? 0.6 : 1,
                    cursor: disabled ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => !disabled && (e.target.style.borderColor = styles.primary)}
                onBlur={(e) => !disabled && (e.target.style.borderColor = styles.border)}
            />
            {suffix && <span style={{ position: 'absolute', right: '15px', top: '14px', color: styles.textSecondary, fontWeight: 'bold' }}>{suffix}</span>}
        </div>
    </div>
);

export default Configuracoes;