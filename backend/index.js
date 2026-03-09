const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// AUMENTO DE LIMITE PARA 50MB (Para aceitar desenhos da lousa/fotos/arquivos futuros)
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const DB_FILE = path.join(__dirname, 'database.json');

// --- ESTRUTURA PADRÃO E EXPANDIDA ---
const defaultData = {
    "usuarios": [
        { "id": "1", "nome": "Kauã Alves", "login": "dev", "senha": "123", "cargo": "developer", "status": "ativo" },
        { "id": "2", "nome": "Pedro Gomes", "login": "pedro.papamike", "senha": "123", "cargo": "mantenedor", "status": "ativo" },
        { "id": "3", "nome": "Marcos", "login": "marcos.papamike", "senha": "123", "cargo": "mantenedor", "status": "ativo" },
        { "id": "4", "nome": "Nicoly", "login": "nicoly.papamike", "senha": "123", "cargo": "secretaria", "status": "ativo" },
        { "id": "5", "nome": "Thiely", "login": "thiely.papamike", "senha": "123", "cargo": "secretaria", "status": "ativo" },
        { "id": "6", "nome": "Thaís", "login": "thais.papamike", "senha": "123", "cargo": "financeiro", "status": "ativo" },
        { "id": "7", "nome": "Sheila", "login": "sheila.papamike", "senha": "123", "cargo": "coordenacao", "status": "ativo" }
    ],
    // Módulos Atuais
    "leads": [],
    "financeiro": [],
    "atendimentos": [],
    "pedagogico": [], // NOVA FILA: Central de Atendimentos Pedagógicos
    "eventos": [],
    "metas": { "leads": 150, "matriculas": 20, "visitas": 30, "receita": 50 },

    // --- NOVOS CAMINHOS ---
    "tarefas": [],       // Agenda Corporativa
    "turmas": [],
    "cursos": [],
    "contratos": [],
    "notificacoes": [],
    "arquivos": [],
    "logs": []
};

// --- FUNÇÕES AUXILIARES ---
const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const json = JSON.parse(data);

        // Garante que novos campos existam em bancos antigos
        let modified = false;
        Object.keys(defaultData).forEach(key => {
            if (!json[key]) {
                json[key] = defaultData[key];
                modified = true;
            }
        });

        if (modified) writeDB(json);
        return json;
    } catch (error) { return defaultData; }
};

const writeDB = (data) => {
    try { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); return true; }
    catch (error) { return false; }
};

const formatarDataBR = (isoDate) => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};

const limparValorMoeda = (valor) => {
    if (!valor) return 0;
    if (typeof valor === 'number') return valor;
    let v = valor.toString().replace('R$', '').trim();
    // Lógica para tratar formatos brasileiros (1.000,00) vs americanos (1000.00)
    if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.');
    else if ((v.match(/\./g) || []).length === 1 && v.length > 4) v = v.replace(/\./g, ''); // Caso sem virgula
    return parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
};

// Gera lançamento financeiro automático ao matricular
const gerarFinanceiroMatricula = (db, lead, valorPersonalizado) => {
    const jaCobrado = db.financeiro.some(f => f.leadId === String(lead.id) && f.categoria === 'Matrícula');
    if (!jaCobrado) {
        let valorReal = limparValorMoeda(valorPersonalizado);
        if (valorReal <= 0) valorReal = 350.00; // Valor fallback se não vier nada

        db.financeiro.push({
            id: Date.now().toString() + "-auto",
            leadId: String(lead.id),
            descricao: `Matrícula: ${lead.nome || lead.aluno}`,
            categoria: 'Matrícula',
            tipo: 'entrada',
            valor: valorReal,
            data: new Date().toISOString(),
            status: 'pendente' // Entra como pendente até confirmar pgto
        });
    }
};

// --- LIMPEZA AUTOMÁTICA (> 1 ANO) ---
const limparLeadsAntigos = () => {
    const db = readDB();
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

    const leadsIniciais = db.leads.length;
    db.leads = db.leads.filter(l => new Date(l.date) >= umAnoAtras);

    if (db.leads.length < leadsIniciais) {
        console.log(`🧹 Limpeza Automática: ${leadsIniciais - db.leads.length} leads antigos removidos.`);
        writeDB(db);
    }
};
limparLeadsAntigos();

// ============================================================================
// 1. ROTAS DE LOGIN E USUÁRIOS
// ============================================================================
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    const db = readDB();
    const user = db.usuarios.find(u => u.login === login && u.senha === senha);
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });
    if (user.status === 'inativo') return res.status(403).json({ message: 'Usuário inativo.' });

    user.ultimo_acesso = new Date().toISOString();
    writeDB(db);
    res.json({ message: 'Login realizado', user: { ...user, id: String(user.id), ultimo_acesso_fmt: formatarDataBR(user.ultimo_acesso) } });
});

app.get('/usuarios', (req, res) => {
    const db = readDB();
    const usuariosFmt = db.usuarios.map(u => ({
        id: String(u.id),
        nome: u.nome,
        login: u.login,
        cargo: u.cargo,
        status: u.status,
        ultimo_acesso_fmt: u.ultimo_acesso ? formatarDataBR(u.ultimo_acesso) : 'Nunca'
    }));
    res.json(usuariosFmt);
});

app.post('/usuarios', (req, res) => {
    const db = readDB();
    const { nome, login, senha, cargo } = req.body;
    if (db.usuarios.some(u => u.login === login)) return res.status(400).json({ message: 'Login já existe' });
    const newUser = { id: Date.now().toString(), nome, login, senha, cargo: cargo || 'secretaria', status: 'ativo' };
    db.usuarios.push(newUser);
    writeDB(db);
    res.json({ message: 'Usuário criado', user: newUser });
});

app.patch('/usuarios/:id', (req, res) => {
    const db = readDB();
    const idx = db.usuarios.findIndex(u => String(u.id) === String(req.params.id));
    if (idx !== -1) {
        db.usuarios[idx] = { ...db.usuarios[idx], ...req.body };
        writeDB(db);
        res.json(db.usuarios[idx]);
    } else res.status(404).json({});
});

app.delete('/usuarios/:id', (req, res) => {
    const db = readDB();
    db.usuarios = db.usuarios.filter(u => String(u.id) !== String(req.params.id));
    writeDB(db);
    res.json({ message: 'Usuário excluído' });
});

// ============================================================================
// 2. METAS
// ============================================================================
app.get('/metas', (req, res) => res.json(readDB().metas || defaultData.metas));
app.post('/metas', (req, res) => {
    const db = readDB();
    db.metas = { ...db.metas, ...req.body };
    writeDB(db);
    res.json({ message: 'Metas atualizadas' });
});

// ============================================================================
// 3. ATENDIMENTOS E CRIAÇÃO DE LEADS
// ============================================================================
app.post('/atendimentos', (req, res) => {
    const db = readDB();
    const body = req.body;

    db.atendimentos.push({
        id: Date.now().toString(),
        data: new Date().toISOString(),
        atendente: body.atendente || 'Sistema',
        tipo: body.tipo,
        resumo: body.notasComerciais || 'Formulário inicial'
    });

    let leadIdAssociado = body.leadId;

    if (body.tipo === 'novo') {
        const nomeAluno = body.alunos?.[0]?.nome || 'Novo Aluno';
        let origemReal = body.canal || 'Balcão';
        if (origemReal === 'Indicação' && body.detalheCanal) detalheIndicacao = body.detalheCanal;
        if (origemReal === 'Outros' && body.detalheCanal) origemReal = `Outros: ${body.detalheCanal}`;

        const statusInicial = body.status || 'novo';
        // Se já começa visitando, já entra na fila pedagógica
        const pedStatus = (statusInicial === 'visita_agendada' || statusInicial === 'visitando') ? 'waiting_interview' : null;

        const newLead = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status: statusInicial,
            atendente: body.atendente || 'Sistema',

            // Dados Agendamento
            visitDate: body.visitDate || null,
            visitTime: body.visitTime || null,

            // DADOS PRINCIPAIS
            aluno: nomeAluno,
            responsavel: body.responsaveis?.[0]?.nome || 'Responsável',
            telefone: body.contatos?.[0]?.numero || '',
            email: body.contatos?.[0]?.email || '',
            origem: origemReal,
            indicacao_aluno: body.indicacao_aluno || '',

            ano: body.alunos?.[0]?.serie || '',
            bairro: body.endereco?.bairro || '',

            // ESTRUTURA COMPLETA
            perfil_completo: {
                responsaveis: body.responsaveis,
                alunos: body.alunos,
                endereco: body.endereco,
                motivos: body.motivoTroca,
                valores: body.valoriza, // "O que mais valoriza"
                conheceu: body.conheceu,
                notas: body.notasComerciais,
                marketing: { canal: origemReal }
            },

            // Fluxo
            pedagogical_status: pedStatus,
            lousa_pedagogica: null,
            notas_pedagogicas: '',
            proposta_comercial: null,
            valor: 0
        };
        db.leads.push(newLead);
        leadIdAssociado = newLead.id;
    }

    writeDB(db);
    res.json({ message: 'Atendimento iniciado', leadId: leadIdAssociado });
});

app.get('/atendimentos', (req, res) => {
    const db = readDB();
    const historico = db.atendimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
    res.json(historico);
});

// ============================================================================
// 4. LEADS E FLUXO (PEDAGÓGICO / COMERCIAL)
// ============================================================================
app.get('/leads', (req, res) => res.json(readDB().leads.sort((a, b) => b.id - a.id)));

app.post('/leads', (req, res) => {
    const db = readDB();
    const newLead = {
        ...req.body,
        id: req.body.id || Date.now().toString(),
        date: new Date().toISOString()
    };
    if (!newLead.status) newLead.status = 'novo';
    db.leads.push(newLead);
    writeDB(db);
    res.json(newLead);
});

// ROTA CENTRAL DE EDIÇÃO DO LEAD (CORE DO CRM)
app.patch('/leads/:id', (req, res) => {
    const db = readDB();
    const idx = db.leads.findIndex(l => String(l.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({});

    const updates = req.body;
    const currentLead = db.leads[idx];

    // Tratamento de valores financeiros
    if (updates.valor !== undefined) updates.valor = limparValorMoeda(updates.valor);

    // --- AUTOMACAO: AGENDOU VISITA -> CRIA TAREFA NA AGENDA ---
    if ((updates.visitDate || updates.status === 'visita_agendada') && currentLead.status !== 'visita_agendada' && currentLead.status !== 'visitando') {
        const novaTarefa = {
            id: Date.now().toString(),
            titulo: `Visita: ${currentLead.aluno}`,
            data: updates.visitDate || new Date().toISOString().split('T')[0],
            hora: updates.visitTime || "09:00",
            observacao: `Responsável: ${currentLead.responsavel}. Tel: ${currentLead.telefone}`,
            status: 'pendente',
            tipo: 'visita'
        };
        if (!db.tarefas) db.tarefas = [];
        db.tarefas.push(novaTarefa);
    }

    // --- AUTOMACAO: MATRÍCULA -> FINANCEIRO ---
    if (updates.status === 'matriculado' && currentLead.status !== 'matriculado') {
        updates.data_matricula = new Date().toISOString();
        const vMatricula = currentLead.proposta_comercial?.matricula || updates.valor || currentLead.valor;
        gerarFinanceiroMatricula(db, { ...currentLead, ...updates }, vMatricula);
    }

    // Merge seguro de objetos aninhados (Integridade de Dados)
    db.leads[idx] = { ...currentLead, ...updates };

    if (updates.proposta_comercial) {
        db.leads[idx].proposta_comercial = {
            ...(currentLead.proposta_comercial || {}),
            ...updates.proposta_comercial
        };
    }

    if (updates.perfil_completo) {
        db.leads[idx].perfil_completo = {
            ...(currentLead.perfil_completo || {}),
            ...updates.perfil_completo
        };
    }

    writeDB(db);
    res.json(db.leads[idx]);
});

// NOVA ROTA: FILA PEDAGÓGICA (Cria item na central da coordenação)
app.post('/atendimentos-pedagogicos', (req, res) => {
    const db = readDB();
    const item = {
        id: Date.now().toString(),
        leadId: req.body.lead_id,
        aluno: req.body.aluno,
        turma: req.body.turma,
        responsavel: req.body.responsavel,
        status: 'aguardando', // aguardando, em_atendimento, concluido
        data_entrada: new Date().toISOString(),
        prioridade: 'normal'
    };
    if (!db.pedagogico) db.pedagogico = [];
    db.pedagogico.push(item);

    // Atualiza o lead para saber que está na fila
    const idx = db.leads.findIndex(l => String(l.id) === String(req.body.lead_id));
    if (idx !== -1) {
        db.leads[idx].pedagogical_status = 'waiting_interview';
    }

    writeDB(db);
    res.json(item);
});

// ROTA PEDAGÓGICA (Conclusão da Entrevista)
app.patch('/leads/:id/pedagogico', (req, res) => {
    const db = readDB();
    const idx = db.leads.findIndex(l => String(l.id) === String(req.params.id));

    if (idx !== -1) {
        db.leads[idx].lousa_pedagogica = req.body.imagem;
        db.leads[idx].notas_pedagogicas = req.body.notas;
        if (req.body.avaliacao_atendimento) db.leads[idx].avaliacao_atendimento = req.body.avaliacao_atendimento;

        // Sai da fila pedagógica, vai para comercial
        db.leads[idx].pedagogical_status = 'interview_done';
        db.leads[idx].status = 'negociando'; // Avança no Kanban

        writeDB(db);
        res.json({ message: 'Pedagógico concluído' });
    } else res.status(404).json({ message: 'Lead não encontrado' });
});

// ROTA COMERCIAL (FECHAMENTO)
app.patch('/leads/:id/comercial', (req, res) => {
    const db = readDB();
    const idx = db.leads.findIndex(l => String(l.id) === String(req.params.id));

    if (idx !== -1) {
        // Salva a proposta completa (Matrícula, Mensalidade, Material)
        db.leads[idx].proposta_comercial = req.body.proposta;
        db.leads[idx].valor = limparValorMoeda(req.body.proposta.valor_final); // Valor principal para dashboard
        db.leads[idx].status = 'matriculado';
        db.leads[idx].data_matricula = new Date().toISOString();

        // Gera financeiro
        gerarFinanceiroMatricula(db, db.leads[idx], req.body.proposta.matricula);

        writeDB(db);
        res.json({ message: 'Matrícula realizada com sucesso' });
    } else res.status(404).json({ message: 'Lead não encontrado' });
});

app.delete('/leads/:id', (req, res) => {
    const db = readDB();
    const id = String(req.params.id);
    db.leads = db.leads.filter(l => String(l.id) !== id);
    // Opcional: remover financeiro associado ou manter como histórico? Mantendo por segurança.
    writeDB(db);
    res.json({ message: 'Excluído' });
});

// ============================================================================
// 5. FINANCEIRO E AGENDA
// ============================================================================
app.get('/financeiro', (req, res) => res.json(readDB().financeiro));
app.post('/financeiro', (req, res) => {
    const db = readDB();
    const item = { id: Date.now().toString(), ...req.body, valor: limparValorMoeda(req.body.valor), data: req.body.data || new Date().toISOString() };
    db.financeiro.push(item);
    writeDB(db);
    res.json(item);
});

app.get('/agenda', (req, res) => {
    const db = readDB();
    const { userId } = req.query;

    const visitas = db.leads
        .filter(l => l.visitDate && ['visita_agendada', 'visitando'].includes(l.status))
        .map(l => ({
            id: `visita-${l.id}`,
            title: `Visita: ${l.aluno}`,
            start: `${l.visitDate.split('T')[0]}T${l.visitTime || '09:00'}:00`,
            type: 'visita',
            descricao: `Resp: ${l.responsavel}`
        }));

    
    const tarefasUsuario = db.tarefas || [];
    res.json([...visitas, ...tarefasUsuario]);
});

app.post('/tarefas', (req, res) => {
    const db = readDB();
    const novaTarefa = { id: Date.now().toString(), status: 'pendente', ...req.body };
    if (!db.tarefas) db.tarefas = [];
    db.tarefas.push(novaTarefa);
    writeDB(db);
    res.json(novaTarefa);
});

app.delete('/tarefas/:id', (req, res) => {
    const db = readDB();
    db.tarefas = db.tarefas.filter(t => String(t.id) !== String(req.params.id));
    writeDB(db);
    res.json({ message: "Tarefa excluída" });
});

// ============================================================================
// 6. ROTAS FUTURAS E COMPATIBILIDADE
// ============================================================================
app.get('/turmas', (req, res) => res.json(readDB().turmas || []));
app.post('/turmas', (req, res) => { const db = readDB(); const item = { id: Date.now().toString(), ...req.body }; db.turmas.push(item); writeDB(db); res.json(item); });
app.get('/notificacoes', (req, res) => { const db = readDB(); res.json(db.notificacoes || []); });

app.listen(3000, () => console.log('✅ BACKEND 3000 RODANDO - INTEGRADO COM PEDAGÓGICO E FINANCEIRO'));