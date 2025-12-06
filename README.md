<div align="center">

![FinControl](https://img.shields.io/badge/FinControl-Finanças%20Pessoais-0ea5e9?style=for-the-badge)

![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-7460f0?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-3c873a?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

# FinControl – Sistema de Controle Financeiro Completo

FinControl é um sistema full stack para gestão financeira pessoal e familiar. O projeto entrega um dashboard rico, cadastro completo de transações (incluindo recorrência), relatórios visuais e utilitários como calculadora de porcentagem e juros compostos. O backend em Node.js + PostgreSQL garante persistência, autenticação e geração de recorrências, enquanto o frontend em React oferece uma experiência moderna, responsiva e acessível.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Principais Recursos](#principais-recursos)
4. [Stack Tecnológica](#stack-tecnológica)
5. [Pré-requisitos](#pré-requisitos)
6. [Como começar](#como-começar)
7. [Scripts & Utilitários](#scripts--utilitários)
8. [Testes e Qualidade](#testes-e-qualidade)
9. [Dicas e Troubleshooting](#dicas-e-troubleshooting)
10. [Contribuindo](#contribuindo)
11. [Roadmap](#roadmap)
12. [Licença](#licença)

---

## Visão Geral

- **Dashboard interativo** com cartões de resumo, gráficos (linha, barras, pizza) e transações recentes.
- **Gerenciamento de transações** com filtros, busca, categorização e suporte completo a transações recorrentes.
- **Calculadoras financeiras** embutidas (porcentagem, juros compostos) com design premium e animações.
- **Administração de categorias**, metas e preferências do usuário.
- **APIs REST** protegidas por JWT (middleware) e construídas em Express + TypeORM.
- **Scripts operacionais** para migrações, limpeza de dados, geração de usuários de demonstração e backups.

---

## Arquitetura

```
fincontrol/
├── src/                     # Frontend (React + Vite)
│   ├── components/          # UI compartilhada (cards, charts, layout, modais)
│   ├── pages/               # Páginas (Dashboard, Transações, Categorias, Calculadoras, etc.)
│   ├── store/               # Zustand store com persistência por usuário
│   ├── services/            # HTTP clients (Axios) para backend
│   └── types/               # Modelos TypeScript compartilhados
├── backend/
│   ├── src/                 # API Node.js/Express
│   │   ├── controllers/     # Camada de entrada (REST)
│   │   ├── services/        # Regra de negócio (transações, recorrência, categorias)
│   │   ├── validators/      # Schemas Joi
│   │   └── models/          # Entidades TypeORM
│   ├── database/            # Migrations e seeds
│   ├── scripts/             # Utilidades (migrações, criação de usuários, etc.)
│   └── dist/                # Build de produção
├── scripts/                 # Ferramentas auxiliares (backup, encoding, diagnósticos)
└── README.md
```

---

## Principais Recursos

| Área | Destaques |
|------|-----------|
| **Dashboard** | Resumo mensal (receitas, despesas, saldo), visão anual, gráficos detalhados e atalhos rápidos. |
| **Transações** | CRUD completo, filtros por período/categoria/tipo, busca por descrição, parcelas recorrentes e sincronização com backend. |
| **Categorias** | Criação/edição com ícones e cores personalizados, prevenção de exclusão com transações vinculadas. |
| **Relatórios** | Gráficos de composição por categoria, evolução mensal/ anual e exportação de dados. |
| **Calculadoras** | Porcentagem e juros compostos com campos inteligentes, validações e feedback instantâneo. |
| **Scripts** | Migrações, verificação de dados, criação de usuários demo, correção de encoding e **backup completo** (`scripts/backup-project.ps1`). |

---

## Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| Frontend | React 18, TypeScript 5, Vite 5, React Router, Zustand, React Hook Form, Zod, TailwindCSS, Recharts, Lucide Icons |
| Backend | Node.js 20, Express, TypeORM, PostgreSQL, Joi, JWT, Winston logger |
| Qualidade | ESLint, Prettier, Vitest + Testing Library |
| DevOps / Scripts | PowerShell, Docker Compose, robocopy, Compress-Archive |

---

## Pré-requisitos

- Node.js **18+** (recomendado 20.x)
- npm (ou pnpm/yarn adaptando os comandos)
- PostgreSQL 14+ (local ou em container)
- PowerShell 7+ para executar scripts `.ps1` no Windows
- Git

---

## Como começar

### 1. Clonar o repositório

```bash
git clone https://github.com/<sua-org>/fincontrol.git
cd fincontrol
```

### 2. Configurar variáveis de ambiente comuns

```bash
cp .env.example .env        # frontend
cp backend/.env.example backend/.env
```

Atualize os arquivos `.env` com as credenciais do banco e segredos JWT.

### 3. Instalar dependências

```bash
npm install                  # instala dependências do frontend
cd backend && npm install    # instala dependências do backend
```

### 4. Preparar banco de dados

```bash
# dentro de backend/
npm run typeorm migration:run
# ou utilize os scripts prontos em backend/scripts (ex: executar-migration.js)
```

### 5. Executar em desenvolvimento

```bash
# terminal 1 – frontend
npm run dev

# terminal 2 – backend
cd backend
npm run dev     # ou npm run start:dev caso use ts-node-dev
```

Acesse o app em `http://localhost:5173` (Vite). O backend fica em `http://localhost:3333` por padrão.

### 6. Usuário de demonstração

Utilize os scripts `backend/scripts/create-demo-user.js` ou `backend/scripts/criar-usuario-teste.ps1` para popular usuários e dados de exemplo.

---

## Scripts & Utilitários

| Local | Script | Descrição |
|-------|--------|-----------|
| `scripts/backup-project.ps1` | `powershell -ExecutionPolicy Bypass -File .\scripts\backup-project.ps1` | Gera um `.zip` completo do projeto (exclui `node_modules` por padrão). |
| `fix-encoding.bat` / `fix-all-files-utf8.ps1` | Corrige caracteres corrompidos após importações com encoding errado. |
| `backend/scripts/executar-migration-*.js` | Rodam migrações específicas (recorrência, metas, notificações). |
| `backend/scripts/create-demo-user.js` | Cria usuário e dados demo para testar rapidamente. |
| `backend/scripts/test-*.ps1` | Coleção de testes rápidos (login, transações, categorias, preferências). |

> Consulte a pasta `backend/IMPLEMENTATION-*.md` para guias detalhados de setup e depuração.

---

## Testes e Qualidade

```bash
# Frontend
npm run lint
npm run test
npm run test:ui
npm run test:coverage

# Backend
cd backend
npm run lint
npm run test           # se habilitado
```

- **Vitest + Testing Library** garantem cobertura dos componentes.
- **ESLint** mantém o padrão de código consistente (config em `.eslintrc.cjs`).
- **Logger estruturado** (`backend/src/utils/logger.ts`) facilita diagnósticos em produção.

---

## Dicas e Troubleshooting

| Problema | Solução |
|----------|---------|
| Caracteres `�` em Categorias | Execute `.\fix-encoding.bat` ou `.\fix-all-files-utf8.ps1`. Detalhes em `FIX-ENCODING-NOW.md`. |
| Datas das transações deslocadas | Ajuste `TIMEZONE_DATE_OFFSET` no backend `.env`. O serviço já normaliza datas para evitar UTC-3. |
| Parcelas recorrentes sumindo | Certifique-se de executar o sync completo (`financialStore.syncAllTransactions`) após login. |
| Cancelar recorrência não remove parcelas | API agora remove filhos quando a transação pai é excluída (ver `backend/src/services/transaction.service.ts`). |
| Backup automático | Use `scripts/backup-project.ps1` regularmente (pode agendar via Task Scheduler). |

---

## Contribuindo

1. Faça o fork do projeto.
2. Crie uma branch de feature: `git checkout -b feature/minha-feature`.
3. Siga os padrões de commit e passe os linters/testes.
4. Abra o Pull Request descrevendo o contexto e screenshots/gifs quando pertinente.

Diretrizes extras em `CONTRIBUTING.md` (adicione caso ainda não exista).

---

## Roadmap

- [ ] Autenticação social (OAuth / OpenID Connect)
- [ ] PWA completo e suporte offline
- [ ] Multi-idioma (i18n)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Integração com Open Banking / Webhooks bancários
- [ ] App mobile (React Native ou Expo)
- [ ] Alertas inteligentes e notificações push

Sinta-se livre para abrir issues com sugestões!

---

## Licença

Distribuído sob licença **MIT**. Consulte [LICENSE](LICENSE) para detalhes.

---

## Créditos

Projeto desenvolvido com dedicação por **[Pedro Kstro / Equipe]**.  
Se esse repositório te ajudou, deixe uma ⭐ no GitHub e compartilhe com a comunidade!
