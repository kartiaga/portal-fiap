# Portal FIAP

API REST do **Tech Challenge 2 — Fase 2 (FIAP)**, projeto de desenvolvimento em grupo que integra os conhecimentos da fase e corresponde a **90% da nota final** das disciplinas.

> **Status:** API funcional com autenticação, gerenciamento de usuários, CRUD e busca de posts, testes automatizados, documentação via Swagger/OpenAPI, containerização (Docker) e CI com GitHub Actions. Deploy automatizado (CD) ainda pendente.

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
| Containerização com Docker | Implementado (`Dockerfile` + `docker-compose.yaml`) |
| GitHub Actions (CI) | Implementado (testes em pull requests) |
| GitHub Actions (CD / deploy) | Pendente |
| Cobertura de testes (≥ 20%) | Implementado — 100% nos arquivos cobertos pelo Jest |
| Documentação técnica | Implementado (README + Swagger/OpenAPI) |

### Entregáveis finais

- [x] Código-fonte no GitHub (com Dockerfile e workflow de CI)
- [ ] Apresentação gravada demonstrando o funcionamento
- [x] Documentação com arquitetura, uso da API e relato de experiências da equipe

## Tecnologias

| Camada | Tecnologia |
|---|---|
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

```bash
npm install
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
cp .env.example .env
```

Preencha o `.env` com os valores abaixo para desenvolvimento local:

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

O script `scripts/seed.ts` insere **somente** registros na tabela `users`. Ele não cria perfis nem postagens.

| E-mail | Senha | Papel |
|---|---|---|
| `admin@fiap.com.br` | `12345678` | `ADMIN` |
| `student@fiap.com.br` | `12345678` | `STUDENT` |
| `teacher@fiap.com.br` | `12345678` | `TEACHER` |

O comando é idempotente: se as contas já existirem, nada é alterado.

#### 7. Iniciar a aplicação

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção local (build + start)
npm run build
npm start
```

A API estará disponível em `http://localhost:3000`.

**Resumo rápido (do zero):**

```bash
npm install
docker compose up postgres -d
cp .env.example .env   # ajuste JWT_SECRET
npm run migrate:up
npm run seed
npm run dev
```

---

### Opção B — Docker completo (API + banco)

Sobe a API e o PostgreSQL em containers. As migrations rodam automaticamente na inicialização da API.

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
cp .env.example .env   # use POSTGRES_HOST=localhost e POSTGRES_PORT=5431
npm run seed
```

#### 4. Verificar se está funcionando

```bash
# Status dos containers
docker ps

# Logs da API (migrations + startup)
docker compose logs api

# Swagger UI no navegador
open http://localhost:3000/docs
```

#### Serviços no Docker Compose

| Serviço | Container | Porta no host | Descrição |
|---|---|---|---|
| `postgres` | `portal-fiap-db` | `5431` | Banco PostgreSQL 16 |
| `api` | `portal-fiap-api` | `3000` | API Node.js (migrations automáticas no startup) |

#### Variáveis de ambiente no Docker

No modo Docker, a API usa as variáveis definidas em `docker-compose.yaml`:

| Variável | Valor no container |
|---|---|
| `POSTGRES_HOST` | `postgres` (nome do serviço na rede Docker) |
| `POSTGRES_PORT` | `5432` (porta interna do container) |
| `DATABASE_URL` | `postgres://postgres:postgres@postgres:5432/portal-fiap` |

> **Atenção:** o `.env` local aponta para `localhost:5431` (desenvolvimento fora do Docker). Não substitua as variáveis de rede do compose sem ajustar o host/porta.

---

## Testar a aplicação

### Documentação interativa (Swagger)

Com a API rodando, acesse:

**http://localhost:3000/docs**

### Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@fiap.com.br","password":"12345678"}'
```

A resposta inclui um `token` JWT e os dados do usuário.

### Rotas protegidas

```bash
# Criar um post (TEACHER ou ADMIN)
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Primeira aula","content":"Conteúdo da publicação com pelo menos 10 caracteres."}'

# Listar posts
curl http://localhost:3000/posts \
  -H "Authorization: Bearer <token>"

# Criar um usuário (somente ADMIN)
curl -X POST http://localhost:3000/users \
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

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (hot reload) |
| `npm run build` | Compila `src/server.ts` para ESM em `build/` |
| `npm start` | Inicia o servidor compilado (`build/server.js`) |
| `npm run migrate:up` | Aplica migrations pendentes |
| `npm run migrate:down` | Reverte a última migration |
| `npm run migrate:create` | Cria uma nova migration |
| `npm run lint` | Executa o ESLint |
| `npm run lint:fix` | Corrige problemas de lint automaticamente |
| `npm run seed` | Cria as 3 contas padrão de desenvolvimento na tabela `users` |
| `npm test` | Executa a suíte de testes com Jest |

---

## Solução de problemas

### `Error connecting to the database: AggregateError`

O PostgreSQL não está acessível. Verifique:

```bash
docker ps                          # container portal-fiap-db deve estar Up
docker compose up postgres -d      # subir o banco
```

No modo local, confirme que o `.env` usa `POSTGRES_HOST=localhost` e `POSTGRES_PORT=5431`.

### Build do Docker falha com `Top-level await`

O projeto usa ESM em produção. Certifique-se de que o `package.json` contém:

```json
"build": "tsup src/server.ts --format esm --out-dir build --clean",
"start": "node build/server.js"
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

### Posts

| Método | Rota | Quem acessa | Descrição |
|---|---|---|---|
| `GET` | `/posts` | Autenticado | Lista todos os posts |
| `GET` | `/posts/:id` | Público | Retorna o conteúdo completo de um post |
| `POST` | `/posts` | TEACHER / ADMIN | Cria uma nova publicação |
| `PUT` | `/posts/:id` | TEACHER / ADMIN | Edita título e conteúdo de um post |
| `DELETE` | `/posts/:id` | TEACHER / ADMIN | Remove um post pelo ID |
| `GET` | `/posts/search?q=termo` | Autenticado | Busca posts por palavra-chave |

Consulte a documentação completa em **http://localhost:3000/docs**.

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

1. Configurar pipeline de deploy (CD) no GitHub Actions
2. Gravar apresentação final do projeto
3. Realizar ajustes identificados durante a homologação

## Integrantes

- Júlia Luciane — RM372341
- Kaique Artiga Luz — RM371882
- Marcus Urani — RM372080
- Regiane Julia Pereira — RM370623

## Experiência da equipe e desafios do desenvolvimento

Durante o desenvolvimento do projeto, a equipe optou por dividir as atividades em partes menores e distribuir as responsabilidades entre os integrantes em comum acordo, permitindo que cada funcionalidade fosse desenvolvida de forma independente e organizada.

Para a integração das funcionalidades foi adotado o Git Flow, permitindo revisão das implementações e reduzindo conflitos durante o desenvolvimento. A comunicação entre os integrantes foi mantida de forma ativa durante todo o projeto, possibilitando troca de conhecimento, esclarecimento de dúvidas e apoio mútuo sempre que necessário.

Como ocorre em grande parte dos projetos de desenvolvimento, a adoção de novas tecnologias representou um desafio inicial para a equipe, especialmente em relação ao ecossistema Node.js, ao framework Fastify, à utilização do PostgreSQL e à organização da aplicação utilizando arquitetura em camadas.

Ao longo do desenvolvimento, a familiaridade com as ferramentas aumentou gradualmente e as dificuldades iniciais foram sendo superadas conforme as funcionalidades eram implementadas e integradas ao projeto.

Ao final do processo, a equipe considera que os objetivos propostos foram atingidos e avalia positivamente a experiência obtida durante o desenvolvimento da solução.

## Licença

ISC
