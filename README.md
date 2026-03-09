# 🎓 Papa Mike CRM - Sistema de Gestão Escolar & Automação de Matrículas

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Orchestration-2496ED?style=for-the-badge&logo=docker)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Design-38B2AC?style=for-the-badge&logo=tailwind-css)

O **Papa Mike CRM** é uma plataforma personalizada desenvolvida para otimizar o Pipeline de Vendas e a integração entre os setores Comercial e de Coordenação Pedagógica da Escola Papa Mike. Ele centraliza a operação, garantindo que nenhum aluno em potencial seja perdido por falhas de processo ou atrasos na comunicação.

Desenvolvido para substituir processos manuais, automatizar cálculos financeiros complexos e oferecer uma experiência de fechamento de matrícula (UX) inovadora e focada em dispositivos móveis.

---

## 🚀 Principais Funcionalidades (O Cérebro do Sistema)

### 1. 🔄 Pipeline Inteligente e Triagem Pedagógica
O sistema organiza o funil de vendas em colunas dinâmicas: **Novos Leads, Visita Agendada, Em Negociação, Fechados e Matriculados**. Possui um fluxo exclusivo de **Check-in Pedagógico**, onde leads podem ser encaminhados para uma fila de espera da coordenação para avaliação antes da liberação comercial.

### 2. 📱 Modo Apresentação 180º (Blackout UX)
Desenvolvido sob a filosofia *Mobile-First*, o sistema utiliza unidades de viewport dinâmicas (`100dvh`) para assegurar estabilidade visual absoluta em tablets. Possui uma funcionalidade de **rotação de software em 180 graus**: com um toque, a proposta comercial entra em modo de alto contraste e inverte a orientação, permitindo que o consultor apresente os valores ao responsável sem precisar girar o dispositivo fisicamente.

### 3. 💰 Motor Financeiro e Blindagem de Descontos
O sistema implementa uma **trava lógica rigorosa** onde os descontos percentuais incidem **exclusivamente sobre a mensalidade**. Isso preserva os valores integrais de matrícula e material didático, eliminando erros operacionais e garantindo a saúde financeira da instituição.

### 4. 🤖 Automação Proativa via Evolution API (WhatsApp)
Através da integração com a **Evolution API**, o CRM monitora a agenda e o status dos leads para disparar notificações e lembretes de visitas automáticos via WhatsApp. O sistema também inclui indicadores visuais de urgência que mudam a cor das bordas dos cards conforme o tempo de inatividade.

### 5. 🐳 Infraestrutura Resiliente em Docker
Todo o ecossistema (Frontend, Backend e Banco de Dados) é orquestrado via **Docker e Docker Compose**. Isso garante que a aplicação seja totalmente portável entre servidores VPS Linux, facilitando deploys rápidos e isolamento de dependências.

---

## 🛠️ Arquitetura e Tecnologias

- **Frontend:** React.js (Vite) + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Integração:** Evolution API (WhatsApp)
- **Infraestrutura:** Docker & Docker Compose
- **Hospedagem:** VPS Linux (HostGator/Hostinger)

---

## ⚙️ Como rodar o projeto localmente

### 1. Clone o repositório
```bash
git clone [https://github.com/KauaAlvs/papamike-crm.git](https://github.com/KauaAlvs/papamike-crm.git)
cd papamike-crm
```

### 2. Configure as Variáveis de Ambiente
```bash
Crie um arquivo .env na raiz do backend e do frontend seguindo o modelo:

Snippet de código
PORT=3000
DATABASE_URL="postgresql://usuario:senha@db:5432/papamike"
EVOLUTION_API_URL="http://evolution_api:8080"
EVOLUTION_API_KEY="sua_chave_secreta"
```

### 3. Suba o ambiente com Docker
```bash
docker compose up -d --build
```

### 4. Acesso ao Sistema
```bash
Frontend: http://localhost:5173

Backend API: http://localhost:3000
```

### Desenvolvido com foco em alta performance e experiência do usuário educacional.
