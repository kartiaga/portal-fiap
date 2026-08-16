# Portal FIAP

API REST do **Tech Challenge 2 — Fase 2 (FIAP)**, projeto de desenvolvimento em grupo que integra os conhecimentos da fase e corresponde a **90% da nota final** das disciplinas.

> **Status:** API funcional com autenticação, gerenciamento de usuários, CRUD e busca de posts, frontend Next.js, testes automatizados, documentação via Swagger/OpenAPI, containerização (Docker), CI e CD com GitHub Actions.

## Sobre o desafio

### O problema

Professores e professoras da rede pública de educação frequentemente não têm plataformas centralizadas para publicar aulas e compartilhar conhecimento com alunos de forma prática e tecnológica.

Na fase anterior, o grupo desenvolveu uma aplicação de blogging dinâmico na plataforma **OutSystems**. Com a necessidade de escalar para um panorama nacional, o back-end está sendo **refatorado em Node.js**, com persistência em banco de dados relacional (**PostgreSQL**).

### Objetivo desta aplicação

Oferecer uma API de blogging onde:

- **Alunos** visualizam e leem postagens na página principal
- **Docentes** criam, editam, listam, excluem e buscam postagens
- O sistema garante controle de acesso por papel de usuário

### Requisitos funcionais — Posts

| Endpoint | Descrição | Status |
|---|---|---|
| `GET /posts` | Lista de posts para alunos | Implementado |
| `GET /posts/:id` | Leitura de um post específico | Implementado |
| `POST /posts` | Criação de postagens (docentes) | Implementado |
| `PUT /posts/:id` | Edição de postagens | Implementado |
| `DELETE /posts/:id` | Exclusão de postagens | Implementado |
| `GET /posts/search` | Busca por palavra-chave no título ou conteúdo | Implementado |

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
| Containerização com Docker | Implementado (`Dockerfile` em `api/` e `frontend/` + `docker-compose.yaml`) |
| GitHub Actions (CI) | Implementado — execução automática de testes em Pull Requests |
| GitHub Actions (CD / deploy) | Implementado (build e push da imagem da API para o GHCR) |
| Cobertura de testes (≥ 20%) | Implementado — 100% nos arquivos cobertos pelo Jest |
| Documentação técnica | Implementado (README + Swagger/OpenAPI) |

### Entregáveis finais

- [x] Código-fonte no GitHub (com Dockerfile e workflows de CI)
- [x] Apresentação gravada demonstrando o funcionamento
- [x] Documentação com arquitetura, uso da API e relato de experiências da equipe

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | [Next.js](https://nextjs.org/) 16 + [React](https://react.dev/) 19 |
| Runtime | [Node.js](https://nodejs.org/) 20+ |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Framework HTTP | [Fastify](https://fastify.dev/) |
| Banco de dados | [PostgreSQL](https://www.postgresql.org/) 16 |
| Migrations | [node-pg-migrate](https://github.com/salsita/node-pg-migrate) |
| Autenticação | [@fastify/jwt](https://github.com/fastify/fastify-jwt) |
| Documentação API | [@fastify/swagger](https://github.com/fastify/fastify-swagger) + [Swagger UI](https://github.com/fastify/fastify-swagger-ui) |
| Validação | [Zod](https://zod.dev/) |
| Senhas | [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| Containerização | [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/) |
| Testes | [Jest](https://jestjs.io/) |
| CI | [GitHub Actions](https://github.com/features/actions) |

## Estrutura do repositório

O projeto é um **monorepo** com backend e frontend separados:

```
portal-fiap/
├── api/                # API REST (Node.js + Fastify + PostgreSQL)
├── frontend/           # Frontend (Next.js + React)
├── docker-compose.yaml # Orquestração local (API + frontend + banco)
└── package.json        # Scripts de conveniência na raiz
```

## Arquitetura da API

O projeto segue uma estrutura modular inspirada em Clean Architecture, com separação de responsabilidades por domínio:

```
api/src/
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

- [Node.js](https://nodejs.org/) 20+ (recomendado)
- npm
- [Docker](https://www.docker.com/) e Docker Compose

## Configuração do ambiente

Existem **duas formas** de rodar o projeto. Escolha a que fizer mais sentido para você:

| Modo | Quando usar |
|---|---|
| **Desenvolvimento local** | Dia a dia de desenvolvimento, com hot reload (`npm run dev`) |
| **Docker completo** | Simular produção, validar containerização ou rodar sem instalar Node na máquina |

---

### Opção A — Desenvolvimento local (recomendado para codar)

#### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd portal-fiap
```

#### 2. Instalar dependências

Na raiz do monorepo (instala `api` e `frontend`):

```bash
npm install
```

Ou apenas na API:

```bash
cd api && npm install
```

#### 3. Subir apenas o banco de dados

```bash
docker compose up postgres -d
```

O PostgreSQL ficará disponível em `localhost:5431`:

| Variável | Valor |
|---|---|
| Banco | `portal-fiap` |
| Usuário | `postgres` |
| Senha | `postgres` |
| Porta (host) | `5431` |

#### 4. Configurar variáveis de ambiente

```bash
cp api/.env.example api/.env
```

Preencha o `api/.env` com os valores abaixo para desenvolvimento local:

```env
PORT=3001
NODE_ENV=development

POSTGRES_HOST=localhost
POSTGRES_PORT=5431
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=portal-fiap

DATABASE_URL=postgres://postgres:postgres@localhost:5431/portal-fiap

JWT_SECRET=sua-chave-secreta-com-pelo-menos-32-caracteres
```

> **Importante:**
> - `JWT_SECRET` deve ter no mínimo 32 caracteres.
> - `DATABASE_URL` é utilizada pelas migrations (`node-pg-migrate`).
> - Evite usar o caractere `$` no `JWT_SECRET` se for referenciar variáveis no `docker-compose.yaml` (o Compose interpreta `$` como interpolação).

#### 5. Executar migrations

```bash
npm run migrate:up
```

#### 6. Criar contas iniciais (seed)

```bash
npm run seed
```

O script `api/scripts/seed.ts` insere **somente** registros na tabela `users`. Ele não cria perfis nem postagens.

| E-mail | Senha | Papel |
|---|---|---|
| `admin@fiap.com.br` | `12345678` | `ADMIN` |
| `student@fiap.com.br` | `12345678` | `STUDENT` |
| `teacher@fiap.com.br` | `12345678` | `TEACHER` |

O comando é idempotente: se as contas já existirem, nada é alterado.

#### 7. Iniciar a aplicação

```bash
# Desenvolvimento (com hot reload)
npm run dev:api

# Produção local (build + start)
npm run build:api
npm run start:api
```

A API estará disponível em `http://localhost:3001`.

#### 8. Iniciar o frontend (opcional)

Com a API rodando, inicie o frontend em outro terminal:

```bash
npm run dev:frontend
```

O frontend estará disponível em `http://localhost:3000`.

**Resumo rápido (do zero):**

```bash
npm install
docker compose up postgres -d
cp api/.env.example api/.env   # ajuste JWT_SECRET
npm run migrate:up
npm run seed
npm run dev:api
```

---

### Opção B — Docker completo (API + frontend + banco)

Sobe a API, o frontend e o PostgreSQL em containers. As migrations são executadas automaticamente durante a inicialização do container da API por meio do script `docker-entrypoint.sh`, garantindo que a estrutura do banco esteja atualizada antes da aplicação iniciar.

#### 1. Clonar e entrar no projeto

```bash
git clone <url-do-repositorio>
cd portal-fiap
```

#### 2. Subir todos os serviços

```bash
# Primeira vez ou sem mudanças no código
docker compose up -d

# Após alterar código, Dockerfile ou dependências
docker compose up -d --build
```

#### 3. Criar contas iniciais (seed)

O seed **não** roda automaticamente no container. Execute na sua máquina (o banco fica exposto em `localhost:5431`):

```bash
npm install
cp api/.env.example api/.env   # use POSTGRES_HOST=localhost e POSTGRES_PORT=5431
npm run seed
```

#### 4. Verificar se está funcionando

```bash
# Status dos containers
docker ps

# Logs da API (migrations + startup)
docker compose logs api

# Logs do frontend
docker compose logs frontend

# Swagger UI no navegador
open http://localhost:3001/docs

# Frontend no navegador
open http://localhost:3000
```

#### Serviços no Docker Compose

| Serviço | Container | Porta no host | Descrição |
|---|---|---|---|
| `postgres` | `portal-fiap-db` | `5431` | Banco PostgreSQL 16 |
| `api` | `portal-fiap-api` | `3001` | API Node.js (migrations automáticas no startup) |
| `frontend` | `portal-fiap-frontend` | `3000` | Frontend Next.js (porta interna `3000`) |

#### Variáveis de ambiente no Docker

No modo Docker, a API usa as variáveis definidas em `docker-compose.yaml`:

| Variável | Valor no container |
|---|---|
| `POSTGRES_HOST` | `postgres` (nome do serviço na rede Docker) |
| `POSTGRES_PORT` | `5432` (porta interna do container) |
| `DATABASE_URL` | `postgres://postgres:postgres@postgres:5432/portal-fiap` |

O frontend recebe:

| Variável | Valor | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` (build arg) | `http://localhost:3001` | Chamadas do browser para a API no host |
| `API_URL` | `http://api:3000` | Comunicação server-side dentro da rede Docker |

> **Atenção:** o `api/.env` local aponta para `localhost:5431` (desenvolvimento fora do Docker). Não substitua as variáveis de rede do compose sem ajustar o host/porta.

---

## Testar a aplicação

### Documentação interativa (Swagger)

Com a API rodando, acesse:

**http://localhost:3001/docs**

### Login

```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@fiap.com.br","password":"12345678"}'
```

A resposta inclui um `token` JWT e os dados do usuário.

### Rotas protegidas

```bash
# Criar um post (TEACHER ou ADMIN)
curl -X POST http://localhost:3001/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Primeira aula","content":"Conteúdo da publicação com pelo menos 10 caracteres."}'

# Listar posts
curl http://localhost:3001/posts \
  -H "Authorization: Bearer <token>"

# Criar um usuário (somente ADMIN)
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"email":"novo@fiap.com.br","password":"12345678","name":"Novo Aluno","role":"STUDENT"}'
```

### Verificar o banco de dados

```bash
# Conexão com o banco
docker compose exec postgres pg_isready -U postgres -d portal-fiap

# Listar tabelas
docker compose exec postgres psql -U postgres -d portal-fiap -c "\dt"

# Ver usuários do seed
docker compose exec postgres psql -U postgres -d portal-fiap -c "SELECT email, role FROM users;"
```

### Rodar testes

```bash
npm test
```

Os testes também rodam automaticamente em pull requests via GitHub Actions (`.github/workflows/run_tests_on_pull_request.yml`).

---

## Scripts disponíveis

Scripts na **raiz** do monorepo:

| Script | Descrição |
|---|---|
| `npm run dev:api` | Inicia a API em modo desenvolvimento (hot reload) |
| `npm run dev:frontend` | Inicia o frontend em modo desenvolvimento (porta `3000`) |
| `npm run build:api` | Compila a API para ESM em `api/build/` |
| `npm run build:frontend` | Gera o build de produção do Next.js |
| `npm run start:api` | Inicia a API compilada |
| `npm run start:frontend` | Inicia o frontend compilado (porta `3000`) |
| `npm run migrate:up` | Aplica migrations pendentes |
| `npm run migrate:down` | Reverte a última migration |
| `npm run seed` | Cria as 3 contas padrão de desenvolvimento |
| `npm test` | Executa a suíte de testes da API |
| `npm run lint` | Executa o ESLint na API |

Os mesmos scripts também podem ser executados dentro de `api/` (ex.: `cd api && npm run dev`, `npm run lint:fix`, `npm run migrate:create` ou `npm test -- --coverage`).

---

## Solução de problemas

### `Error connecting to the database: AggregateError`

O PostgreSQL não está acessível. Verifique:

```bash
docker ps                          # container portal-fiap-db deve estar Up
docker compose up postgres -d      # subir o banco
```

No modo local, confirme que o `api/.env` usa `POSTGRES_HOST=localhost` e `POSTGRES_PORT=5431`.

### Build do Docker falha com `Dockerfile: no such file or directory`

Confirme que existem os arquivos `api/Dockerfile` e `frontend/Dockerfile`. O build do frontend usa `output: "standalone"` no `frontend/next.config.ts`.

### Build do Docker falha com `Top-level await`

O projeto usa ESM em produção. Certifique-se de que o `api/package.json` contém:

```json
"build": "tsup src/server.ts --format esm --out-dir build --clean",
"start": "node build/server.cjs"
```

### Aviso `The "sibdob" variable is not set` no Docker Compose

O Compose interpreta `$` como variável de ambiente. Se o `JWT_SECRET` contiver `$`, escape com `$$` no `docker-compose.yaml` ou remova o caractere do secret.

### Login retorna erro após subir o Docker

Rode o seed — as contas padrão não são criadas automaticamente no container:

```bash
npm run seed
```

### Alterei o código mas o container não reflete a mudança

Rebuild a imagem:

```bash
docker compose up -d --build
```

---

## API — Endpoints implementados

A aplicação disponibiliza documentação por meio do Swagger/OpenAPI.
Com o servidor em execução, acesse:
http://localhost:3001/docs
A interface permite consultar os endpoints, parâmetros, requisitos de autenticação e formatos de resposta. 


### `POST /login`

Autentica um usuário e retorna um token JWT (validade de 15 dias).

**Body:**

```json
{
  "email": "student@fiap.com.br",
  "password": "12345678"
}
```

**Resposta (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "student@fiap.com.br",
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

## API — Endpoints de postagens

### `POST /posts`

Cria uma nova publicação. Requer autenticação com papel `TEACHER` ou `ADMIN`. O autor é identificado automaticamente por meio do token JWT.

**Headers:**

```text
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "title": "Título da publicação",
  "content": "Conteúdo com no mínimo 10 caracteres"
}
```

**Resposta (201):**

```json
{
  "id": "uuid",
  "title": "Título da publicação",
  "content": "Conteúdo com no mínimo 10 caracteres",
  "authorId": "uuid",
  "createdAt": "2026-07-09T18:00:00.000Z",
  "updatedAt": "2026-07-09T18:00:00.000Z"
}
```

**Possíveis erros:**

- `401 Unauthorized` — token ausente ou inválido.
- `403 Forbidden` — usuário sem papel `TEACHER` ou `ADMIN`.

---

### `GET /posts/search?term=termo`

Busca postagens por palavra-chave no título ou no conteúdo. Requer autenticação.

**Headers:**

```text
Authorization: Bearer <token>
```

**Query string:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `term` | string | Sim | Palavra-chave utilizada na busca |

**Exemplo de requisição:**

```text
GET /posts/search?term=node
```

**Resposta (200):**

```json
[
  {
    "id": "uuid",
    "title": "Introdução ao Node.js",
    "content": "Conteúdo da publicação",
    "authorId": "uuid",
    "createdAt": "2026-07-09T18:00:00.000Z",
    "updatedAt": "2026-07-09T18:00:00.000Z"
  }
]
```

Quando nenhuma postagem é encontrada, o endpoint retorna:

```json
[]
```

**Resposta (400):**

```json
{
  "message": "Search term is required"
}
```

---

### `PUT /posts/:id`

Atualiza o título e o conteúdo de uma publicação existente. Requer autenticação com papel `TEACHER` ou `ADMIN`.

**Headers:**

```text
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetro da rota:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador da publicação |

**Body:**

```json
{
  "title": "Título atualizado",
  "content": "Conteúdo atualizado da publicação"
}
```

**Resposta (200):**

```json
{
  "id": "uuid",
  "title": "Título atualizado",
  "content": "Conteúdo atualizado da publicação",
  "authorId": "uuid",
  "createdAt": "2026-07-09T18:00:00.000Z",
  "updatedAt": "2026-07-09T19:00:00.000Z"
}
```

**Resposta (404):**

```json
{
  "message": "Post not found"
}
```

---

### `DELETE /posts/:id`

Remove uma publicação existente. Requer autenticação com papel `TEACHER` ou `ADMIN`.

**Headers:**

```text
Authorization: Bearer <token>
```

**Parâmetro da rota:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador da publicação |

**Resposta (200):**

```json
{
  "message": "Post deleted successfully"
}
```

**Resposta (404):**

```json
{
  "message": "Post not found"
}
```

**Possíveis erros:**

- `401 Unauthorized` — token ausente ou inválido.
- `403 Forbidden` — usuário sem papel `TEACHER` ou `ADMIN`.

---

### `GET /posts/:id`

Retorna uma publicação específica utilizando o ID informado na rota.

**Parâmetro da rota:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador da publicação |

**Resposta (200):**

```json
{
  "id": "uuid",
  "title": "Título da publicação",
  "content": "Conteúdo da publicação",
  "authorId": "uuid",
  "createdAt": "2026-07-09T18:00:00.000Z",
  "updatedAt": "2026-07-09T18:00:00.000Z"
}
```

**Resposta (404):**

```json
{
  "message": "Post not found"
}
```

> Atualmente, essa rota não possui `preHandler` de autenticação no arquivo de rotas.

---

### `GET /posts`

Retorna a lista de todas as postagens cadastradas. Requer autenticação.

**Headers:**

```text
Authorization: Bearer <token>
```

**Resposta (200):**

```json
[
  {
    "id": "uuid",
    "title": "Título da publicação",
    "content": "Conteúdo da publicação",
    "authorId": "uuid",
    "createdAt": "2026-07-09T18:00:00.000Z",
    "updatedAt": "2026-07-09T18:00:00.000Z"
  }
]
```

Quando não existem postagens cadastradas, o endpoint retorna:

```json
[]
```

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

1. Evoluir telas e integrações do frontend com a API
2. Incluir o frontend no pipeline de CD
3. Gravar apresentação final do projeto
4. Realizar ajustes identificados durante a homologação

## Integrantes

- Júlia Luciani de Oliveira — RM372341
- Kaique Artiga Luz — RM371882
- Marcus Vinícius Gomes Urani — RM372080
- Regiane Julia Pereira — RM370623

## Experiência da equipe e desafios do desenvolvimento

Durante o desenvolvimento do projeto, a equipe optou por dividir as atividades em partes menores e distribuir as responsabilidades entre os integrantes em comum acordo. Essa organização permitiu que cada funcionalidade fosse desenvolvida de forma independente e estruturada.

Para a integração das funcionalidades, foi adotado um fluxo de trabalho baseado em branches e Pull Requests, permitindo a revisão das implementações e reduzindo a ocorrência de conflitos durante o desenvolvimento.

A comunicação entre os integrantes foi mantida de forma ativa durante todo o projeto, possibilitando a troca de conhecimento, o esclarecimento de dúvidas e o apoio mútuo sempre que necessário.

Como ocorre em muitos projetos de desenvolvimento de software, a adoção de novas tecnologias representou um desafio inicial para a equipe, especialmente em relação ao ecossistema Node.js, ao framework Fastify, ao PostgreSQL e à organização da aplicação em camadas.

Ao longo do desenvolvimento, a familiaridade com as ferramentas aumentou gradualmente, e as dificuldades iniciais foram sendo superadas conforme as funcionalidades eram implementadas, testadas e integradas ao projeto.

Ao final do processo, a equipe considera que os objetivos propostos foram atingidos e avalia positivamente a experiência adquirida durante o desenvolvimento da solução.

## Licença

ISC
