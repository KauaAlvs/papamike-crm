# 🎓 Papa Mike CRM - Sistema de Gestão Escolar & Automação de Matrículas

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Orchestration-2496ED?style=for-the-badge&logo=docker)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Design-38B2AC?style=for-the-badge&logo=tailwind-css)

O **Papa Mike CRM** não é apenas uma ferramenta de cadastro; [cite_start]é o motor comercial do Colégio e Faculdade Papa Mike[cite: 1, 23]. [cite_start]Construído para ser o ponto de convergência entre os setores Comercial e de Coordenação Pedagógica, ele elimina gargalos de comunicação e garante que o Pipeline de Vendas seja gerido com precisão cirúrgica[cite: 24].

Desenvolvido para substituir processos manuais, automatizar cálculos financeiros complexos e oferecer uma experiência de fechamento de matrícula (UX) inovadora e focada em dispositivos móveis.

---

## 🚀 Principais Funcionalidades (O Cérebro do Sistema)

### 1. 🔄 Pipeline Inteligente e Triagem Pedagógica
[cite_start]O sistema organiza o funil de vendas em colunas dinâmicas: **Novos Leads, Visita Agendada, Em Negociação, Fechados e Matriculados**[cite: 26]. [cite_start]Possui um fluxo exclusivo de **Check-in Pedagógico**, onde leads manuais são encaminhados para uma fila de espera da coordenação, garantindo que o perfil pedagógico seja avaliado antes da liberação comercial[cite: 31, 48].

### 2. 📱 Modo Apresentação 180º (Blackout UX)
Desenvolvido sob a filosofia *Mobile-First*, o sistema utiliza unidades de viewport dinâmicas (`100dvh`) para assegurar estabilidade visual absoluta em tablets. Possui uma funcionalidade de **rotação de software em 180 graus**: com um clique, a proposta comercial entra em modo de alto contraste e inverte a orientação, permitindo que o consultor apresente os valores ao responsável sem precisar girar o dispositivo fisicamente.

### 3. 💰 Motor Financeiro e Blindagem de Descontos
[cite_start]O sistema automatiza o preenchimento dos valores de material didático conforme o segmento (Fundamental I, II ou Médio)[cite: 54]. [cite_start]Implementa uma **trava lógica rigorosa** onde os descontos percentuais incidem **exclusivamente sobre a mensalidade**, preservando os valores integrais de matrícula e material didático, eliminando erros operacionais no fechamento de contratos[cite: 52, 53].

### 4. 🤖 Automação Proativa via Evolution API (WhatsApp)
A comunicação não é passiva. [cite_start]Através da integração com a **Evolution API**, o CRM monitora a agenda corporativa e o status dos leads para disparar notificações instantâneas e lembretes de visitas via WhatsApp[cite: 68]. [cite_start]O sistema inclui indicadores visuais de urgência que mudam a cor dos cards conforme o tempo de inatividade[cite: 28].

### 5. 🐳 Infraestrutura Resiliente em Docker
Todo o ecossistema (Frontend, Backend e Banco de Dados) é orquestrado via **Docker e Docker Compose**. Isso garante que a aplicação seja totalmente portável entre servidores VPS Linux, facilitando deploys rápidos, isolamento de dependências e escalabilidade do banco de dados PostgreSQL.

---

## 🛠️ Arquitetura e Tecnologias

- **Frontend:** React.js (Vite) + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Integração:** Evolution API (WhatsApp)
- **Infraestrutura:** Docker & Docker Compose
- **Hospedagem:** VPS Linux (Hostinger)

---

## ⚙️ Como rodar o projeto localmente

### 1. Clone o repositório
```bash
git clone [https://github.com/KauaAlvs/papamike-crm.git](https://github.com/KauaAlvs/papamike-crm.git)
cd crm-papa-mike
