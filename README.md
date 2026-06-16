# Portal FIAP

API REST do **Tech Challenge 2 — Fase 2 (FIAP)**, projeto de desenvolvimento em grupo que integra os conhecimentos da fase e corresponde a **90% da nota final** das disciplinas.

> **Status:** o projeto está em estágio inicial. A base de arquitetura, autenticação e criação de posts já existe; a maior parte dos endpoints de posts, testes, CI/CD e containerização da aplicação ainda está pendente.

## Sobre o desafio

### O problema

Professores e professoras da rede pública de educação frequentemente não têm plataformas centralizadas para publicar aulas e compartilhar conhecimento com alunos de forma prática e tecnológica.

Na fase anterior, o grupo desenvolveu uma aplicação de blogging dinâmico na plataforma **OutSystems**. Com a necessidade de escalar para um panorama nacional, o back-end está sendo **refatorado em Node.js**, com persistência em banco de dados relacional (**PostgreSQL**).

### Objetivo desta aplicação

Oferecer uma API de blogging onde:

- **Alunos** visualizam e leem postagens na página principal
- **Docentes** criam, editam, listam, excluem e buscam postagens
- O sistema garante controle de acesso por papel de usuário

## Status do projeto

### Requisitos funcionais — Posts

| Endpoint | Descrição | Status |
|---|---|---|
| `GET /posts` | Lista de posts para alunos | Pendente |
| `GET /posts/:id` | Leitura de um post específico | Pendente |
| `POST /posts` | Criação de postagens (docentes) | Implementado |
| `PUT /posts/:id` | Edição de postagens | Pendente |
| `DELETE /posts/:id` | Exclusão de postagens | Pendente |
| `GET /posts/search` | Busca por palavra-chave no título ou conteúdo | Pendente |

### Funcionalidades extras (fora do escopo mínimo do desafio)

Estas rotas foram adicionadas para suportar autenticação e gestão de usuários, necessárias ao controle de acesso entre alunos e docentes:

| Endpoint | Descrição | Status |
|---|---|---|
| `POST /login` | Autenticação com JWT | Implementado |
| `POST /users` | Cadastro de usuários (admin) | Implementado |

### Requisitos técnicos

| Requisito | Decisão / status |
|---|---|
| Back-end em Node.js | Implementado (TypeScript + Fastify) |
| Persistência de dados | Implementado (PostgreSQL + migrations) |
| Containerização com Docker | Parcial — apenas o banco via `docker-compose.yaml` |
| Dockerfile da aplicação | Pendente |
| GitHub Actions (CI/CD) | Pendente |
| Cobertura de testes (≥ 20%) | Pendente |
| Documentação técnica | Em andamento (este README) |

### Entregáveis finais

- [ ] Código-fonte no GitHub (com Dockerfile e workflows de CI/CD)
- [ ] Apresentação gravada demonstrando o funcionamento
- [ ] Documentação com arquitetura, uso da API e relato de experiências da equipe

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | [Node.js](https://nodejs.org/) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Framework HTTP | [Fastify](https://fastify.dev/) |
| Banco de dados | [PostgreSQL](https://www.postgresql.org/) |
| Migrations | [node-pg-migrate](https://github.com/salsita/node-pg-migrate) |
| Autenticação | [@fastify/jwt](https://github.com/fastify/fastify-jwt) |
| Validação | [Zod](https://zod.dev/) |
| Senhas | [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| Containerização | [Docker Compose](https://docs.docker.com/compose/) (PostgreSQL) |

## Arquitetura

O projeto segue uma estrutura modular inspirada em Clean Architecture, com separação de responsabilidades por domínio:

```
src/
├── app.ts              # Configuração do Fastify e registro de módulos
├── server.ts           # Ponto de entrada da aplicação
├── env/                # Validação de variáveis de ambiente
├── lib/                # Utilitários compartilhados (auth, db, password)
└── modules/
    ├── auth/           # Autenticação (login)
    ├── users/          # Cadastro de usuários
    ├── profiles/       # Perfis vinculados aos usuários
    └── posts/          # Publicações
```

Cada módulo contém:

- **entities** — modelos de domínio
- **dto** — schemas de validação (Zod)
- **repositories** — acesso ao banco de dados
- **use-cases** — regras de negócio
- **http** — rotas e controllers

### Papéis de usuário

| Papel | Descrição |
|---|---|
| `STUDENT` | Visualiza e lê postagens |
| `TEACHER` | Cria, edita, exclui e gerencia postagens |
| `ADMIN` | Gerencia usuários e postagens |

## Pré-requisitos

- Node.js 18+
- npm
- Docker e Docker Compose

## Configuração

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd portal-fiap
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Subir o banco de dados

```bash
docker compose up -d
```

O PostgreSQL ficará disponível em `localhost:5431`:

| Variável | Valor |
|---|---|
| Banco | `portal-fiap` |
| Usuário | `postgres` |
| Senha | `postgres` |
| Porta | `5431` |

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Exemplo para desenvolvimento local:

```env
PORT=3000
NODE_ENV=development

POSTGRES_HOST=localhost
POSTGRES_PORT=5431
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=portal-fiap

DATABASE_URL=postgres://postgres:postgres@localhost:5431/portal-fiap

JWT_SECRET=sua-chave-secreta-com-pelo-menos-32-caracteres
```

> **Importante:** `JWT_SECRET` deve ter no mínimo 32 caracteres. `DATABASE_URL` é utilizada pelas migrations.

### 5. Executar migrations

```bash
npm run migrate:up
```

### 6. Iniciar a aplicação

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build
npm start
```

A API estará disponível em `http://localhost:3000`.

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm start` | Inicia o servidor compilado |
| `npm run migrate:up` | Aplica migrations pendentes |
| `npm run migrate:down` | Reverte a última migration |
| `npm run migrate:create` | Cria uma nova migration |
| `npm run lint` | Executa o ESLint |
| `npm run lint:fix` | Corrige problemas de lint automaticamente |

## API — Endpoints implementados

### `POST /login`

Autentica um usuário e retorna um token JWT (validade de 15 dias).

**Body:**

```json
{
  "email": "usuario@email.com",
  "password": "senha1234"
}
```

**Resposta (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "role": "STUDENT"
  }
}
```

---

### `POST /users`

Cria um novo usuário e seu perfil. Requer token com papel `ADMIN`.

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "email": "novo@email.com",
  "password": "senha1234",
  "name": "Nome do Usuário",
  "role": "STUDENT"
}
```

O campo `role` é opcional (`STUDENT`, `TEACHER` ou `ADMIN`; padrão: `STUDENT`).

---

### `POST /posts`

Cria uma nova publicação. Requer token com papel `TEACHER` ou `ADMIN`. O autor é identificado automaticamente pelo token.

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "title": "Título da publicação",
  "content": "Conteúdo com no mínimo 10 caracteres"
}
```

**Resposta (201):** objeto da publicação criada.

## API — Endpoints planejados

Conforme os requisitos funcionais do Tech Challenge:

| Método | Rota | Quem acessa | Descrição |
|---|---|---|---|
| `GET` | `/posts` | Alunos | Lista todos os posts na página principal |
| `GET` | `/posts/:id` | Alunos | Retorna o conteúdo completo de um post |
| `PUT` | `/posts/:id` | Docentes | Edita título e conteúdo de um post existente |
| `DELETE` | `/posts/:id` | Docentes | Remove um post pelo ID |
| `GET` | `/posts/search?q=termo` | Todos | Busca posts por palavra-chave no título ou conteúdo |

## Modelo de dados

### users

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único |
| email | varchar | E-mail (único) |
| password | varchar | Senha hasheada |
| role | enum | `STUDENT`, `TEACHER` ou `ADMIN` |

### profiles

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único |
| user_id | UUID | Referência ao usuário |
| name | varchar | Nome do perfil |
| avatar_url | varchar | URL do avatar (opcional) |

### posts

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único |
| title | varchar | Título |
| content | text | Conteúdo |
| author_id | UUID | Referência ao autor |

## Próximos passos

Ordem sugerida para evoluir o projeto em direção à entrega:

1. Implementar os endpoints restantes de posts (`GET`, `PUT`, `DELETE`, `search`)
2. Adicionar testes unitários (meta: ≥ 20% de cobertura)
3. Criar `Dockerfile` para a aplicação
4. Configurar GitHub Actions (lint, testes e deploy)
5. Gravar apresentação e complementar documentação com relato da equipe

## Licença

ISC
