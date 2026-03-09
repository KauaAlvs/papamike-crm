const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'papamike_dev',
    password: 'admin',
    port: 5432,
});

const sql = `
    -- 1. LIMPEZA TOTAL (Garante que vamos recriar do jeito certo)
    DROP TABLE IF EXISTS tb_atendimentos CASCADE;
    DROP TABLE IF EXISTS tb_eventos CASCADE;
    DROP TABLE IF EXISTS tb_leads CASCADE;
    DROP TABLE IF EXISTS tb_usuarios CASCADE;

    -- 2. TABELA USUÁRIOS
    CREATE TABLE tb_usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        login VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(100) NOT NULL,
        cargo VARCHAR(50) NOT NULL, -- 'developer', 'mantenedor', 'secretaria', etc
        status VARCHAR(20) DEFAULT 'ativo',
        avatar TEXT,
        ultimo_acesso TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. TABELA LEADS (CRM) - Sincronizada com o Backend
    CREATE TABLE tb_leads (
        id SERIAL PRIMARY KEY,
        aluno VARCHAR(100) NOT NULL,
        data_nascimento VARCHAR(20),
        ano VARCHAR(50),
        escola_anterior VARCHAR(100),
        responsavel VARCHAR(100),
        parentesco VARCHAR(50),
        responsavel2 VARCHAR(100),
        telefone VARCHAR(50), -- Aumentado para prevenir erros com máscaras longas
        email VARCHAR(100),
        bairro VARCHAR(100),
        origem VARCHAR(50),
        motivo_troca TEXT,
        fator_decisao TEXT,
        nivel_interesse VARCHAR(50),
        status VARCHAR(50) DEFAULT 'novo',
        valor VARCHAR(50),
        obs TEXT,
        data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        visit_date VARCHAR(20),
        visit_time VARCHAR(10),
        matricula_date VARCHAR(20),
        lost_reason VARCHAR(100),
        lost_detail TEXT,
        is_recovered BOOLEAN DEFAULT FALSE
    );

    -- 4. TABELA EVENTOS (AGENDA)
    CREATE TABLE tb_eventos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        data_evento VARCHAR(20) NOT NULL,
        hora_evento VARCHAR(10),
        tipo VARCHAR(20), 
        detalhes TEXT,
        criado_por INTEGER, 
        participantes JSONB 
    );

    -- 5. TABELA DE ATENDIMENTOS (KPIs)
    CREATE TABLE IF NOT EXISTS tb_atendimentos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER, 
        lead_id INTEGER, 
        tipo VARCHAR(50), 
        nota_atendimento INTEGER, 
        origem VARCHAR(50), 
        data_atendimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- DADOS INICIAIS (Roles atualizadas conforme pedido)
    INSERT INTO tb_usuarios (nome, login, senha, cargo, status) VALUES
    ('Kauã Alves',        'dev',             '123', 'developer',   'ativo'),
    ('Pedro Gomes',       'pedro.papamike',  '123', 'mantenedor',  'ativo'),
    ('Marcos',            'marcos.papamike', '123', 'mantenedor',  'ativo'),
    ('Nicoly',            'nicoly.papamike', '123', 'secretaria',  'ativo'),
    ('Thiely',            'thiely.papamike', '123', 'secretaria',  'ativo'),
    ('Thaís',             'thais.papamike',  '123', 'financeiro',  'ativo'),
    ('Sheila',            'sheila.papamike', '123', 'coordenacao', 'ativo');
`;

async function atualizarBanco() {
    try {
        console.log("⏳ Recriando tabelas...");
        await pool.query(sql);
        console.log("✅ BANCO ATUALIZADO COM SUCESSO!");
        console.log("   - Usuários criados: Dev, Mantenedores e Equipe.");
        console.log("   - Tabela Leads: Colunas sincronizadas.");
        console.log("   - Demais tabelas: OK.");
    } catch (error) {
        console.error("❌ Erro no setup:", error);
    } finally {
        await pool.end();
    }
}

atualizarBanco();