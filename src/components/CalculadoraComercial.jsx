import React, { useState } from 'react';
import { DollarSign, Send, Calculator } from 'lucide-react';

const CalculadoraComercial = ({ lead, onSave, onCancel }) => {
    const [valorBase, setValorBase] = useState(1200); // Exemplo valor
    const [descontoPerc, setDescontoPerc] = useState(0);
    const [valorExtra, setValorExtra] = useState(0); // Material, uniforme...

    const valorDesconto = (valorBase * descontoPerc) / 100;
    const valorFinal = valorBase - valorDesconto + parseFloat(valorExtra || 0);

    const handleFinalizar = () => {
        // Gera link do WhatsApp
        const msg = `Olá ${lead.responsavel}, tudo bem? Aqui é do Colégio Papa Mike. Conforme conversamos, segue a proposta para o aluno(a) ${lead.aluno}:\n\n*Valor Mensalidade:* R$ ${valorFinal.toFixed(2)}\n(Desconto aplicado de ${descontoPerc}%)\n\nPodemos prosseguir com a matrícula?`;
        const linkZap = `https://wa.me/55${lead.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;

        // Abre WhatsApp em nova aba
        window.open(linkZap, '_blank');

        // Salva no sistema
        onSave({
            valor_base: valorBase,
            desconto_percentual: descontoPerc,
            valor_final: valorFinal,
            link_enviado: true
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#64748b' }}>Resumo do Lead</h3>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{lead.aluno}</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Turma: {lead.ano} | Resp: {lead.responsavel}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Valor Base (R$)</label>
                    <input type="number" value={valorBase} onChange={e => setValorBase(parseFloat(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Material/Extras (R$)</label>
                    <input type="number" value={valorExtra} onChange={e => setValorExtra(parseFloat(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }} />
                </div>
            </div>

            <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Aplicar Desconto</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[0, 5, 10, 15, 20].map(d => (
                        <button key={d} onClick={() => setDescontoPerc(d)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: descontoPerc === d ? '2px solid #fbbf24' : '1px solid #cbd5e1', backgroundColor: descontoPerc === d ? '#fffbeb' : 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                            {d}%
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '12px', textAlign: 'center', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '14px', color: '#047857', marginBottom: '5px' }}>Valor Final Mensal</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#047857' }}>R$ {valorFinal.toFixed(2)}</div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button onClick={onCancel} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #94a3b8', background: 'transparent', fontWeight: 'bold' }}>Cancelar</button>
                <button onClick={handleFinalizar} style={{ flex: 2, padding: '15px', borderRadius: '10px', border: 'none', background: '#25D366', color: 'white', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Send size={20} /> Enviar no WhatsApp
                </button>
            </div>
        </div>
    );
};

export default CalculadoraComercial;