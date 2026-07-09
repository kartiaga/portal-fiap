# Portal FIAP

API REST do **Tech Challenge 2 — Fase 2 (FIAP)**, projeto de desenvolvimento em grupo que integra os conhecimentos da fase e corresponde a **90% da nota final** das disciplinas.

> **Status:** O projeto encontra-se em estágio avançado de desenvolvimento. 
Os principais requisitos funcionais já foram implementados, incluindo autenticação, gerenciamento de usuários e operações completas de CRUD para postagens, além da funcionalidades de busca. O projeto também possui testes automatizados, documentação via Swagger/OpenAPI e integração contínua para execução dos testes em Pull Requests. Permacem pendentes apenas melhorias relacionadas à containerização da aplicação e evolução do pipeline de CI/CD.

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
| Containerização com Docker | Parcial — apenas o banco via `docker-compose.yaml` |
| Dockerfile da aplicação | pendente |
| GitHub Actions (CI/CD) | Parcial - execução automática de testes em Pull Requests |
| Cobertura de testes (≥ 20%) | Implementado - 100% nos arquivos cobertos pelo Jest |
| Documentação técnica | Implementado (README + Swagger/OpenAPI) |

### Entregáveis finais

- [ ] Código-fonte no GitHub (com Dockerfile e workflows de CI/CD)
- [ ] Apresentação gravada demonstrando o funcionamento
- [X] Documentação com arquitetura, uso da API e relato de experiências da equipe

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

### 6. Criar contas iniciais (seed)

Após aplicar as migrations, execute o script de seed para criar as três contas padrão de desenvolvimento:

```bash
npm run seed
```

O script `scripts/seed.ts` insere **somente** registros na tabela `users`. Ele não cria perfis nem postagens.

| E-mail | Senha | Papel |
|---|---|---|
| `admin@fiap.com.br` | `12345678` | `ADMIN` |
| `student@fiap.com.br` | `12345678` | `STUDENT` |
| `teacher@fiap.com.br` | `12345678` | `TEACHER` |

O comando é idempotente: se as contas já existirem, nada é alterado. Pode ser executado mais de uma vez sem duplicar usuários.

### 7. Iniciar a aplicação

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build
npm start
```

A API estará disponível em `http://localhost:3000`.

### 8. Testar a aplicação

Com o servidor rodando, autentique-se com uma das contas criadas pelo seed:

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@fiap.com.br","password":"12345678"}'
```

A resposta inclui um `token` JWT e os dados do usuário. Use o token nas rotas protegidas:

```bash
# Criar um post (TEACHER ou ADMIN)
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Primeira aula","content":"Conteúdo da publicação com pelo menos 10 caracteres."}'

# Criar um usuário (somente ADMIN)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"email":"novo@fiap.com.br","password":"12345678","name":"Novo Aluno","role":"STUDENT"}'
```

**Resumo do fluxo completo (do zero):**

```bash
npm install
docker compose up -d
cp .env.example .env   # ajuste JWT_SECRET se necessário
npm run migrate:up
npm run seed
npm run dev
```

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
| `npm run seed` | Cria as 3 contas padrão de desenvolvimento na tabela `users` |
| `npm test` | Executa os testes unitários com jest|

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

> Use as contas criadas por `npm run seed` (`admin@fiap.com.br`, `student@fiap.com.br`, `teacher@fiap.com.br`), todas com senha `12345678`.

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

1. Criar `Dockerfile` para a aplicação.
2. Evoluir o pepeline de GitHub Actions para incluir build e demais validações necessárias? -- se necessario.
3. Gravar apresentação final do projeto.
4. Realizar ajustes identificados durante a homologação. -- se houver.

## Integrantes

- Júlia Luciane - RM372341
- Kaique Artiga Luz - RM371882
- Marcus Urani - RM372080
- Regiane Julia Pereira - RM370623

## Experiência da equipe e desafios do desenvolvimento.

  Durante o desenvolvimento do projeto, a equipe optou por dividir as atividades em partes menores e distribuir
as responsabilidades entre os integrantes em comum acordo, permitindo que cada funcionalidade fosse desenvolvida
de forma independente e organizada.
  Para a integração das funcionalidades foi adotado um fluxo baseado em branches e Pull Requests, permitindo revisão
das implentações e reduzindo conflitos durante o desenvolvimento.
A comunicação entre os integrantes foi mantida de forma ativa durante todo o projeto, possibilitando troca de conhecimento,
esclarecimento de dúvidas e apoio mútuo sempre que necessário. 
  Como ocorre em grande parte dos projetos de desenvolvimento, a adoção de novas tecnologias representou um desefio inicial
para a equipe, especialmente em relação ao ecossistema Node.js, ao framework Fastify, à utilização do PostegreSQL e à
organização da aplicação urtilizando arquitetura em camadas.
  Ao longo do desenvolvimento, a familiariadade com as ferramentas almentou gradualmente e as difuculdades iniciais foram
 sendo superadas conforme as funcionalidades eram implementadas  e integradas ao projeto.
  Ao final do processo, a equipe considera ques os objetivos propostos foram atingidos e avalia positivamente a experiencia
 obtida durante o desenvolvimento da solução. 

 ## Licença

ISC

