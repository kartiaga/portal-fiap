# Portal FIAP

API REST do **Tech Challenge 2 — Fase 2 (FIAP)**, projeto de desenvolvimento em grupo que integra os conhecimentos da fase e corresponde a **90% da nota final** das disciplinas.

> **Status:** API funcional com autenticação, gerenciamento de usuários, CRUD e busca de posts, frontend Next.js com listagem e gestão de publicações, testes automatizados, documentação via Swagger/OpenAPI, containerização (Docker), CI e CD com GitHub Actions.

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

### Requisitos funcionais — Frontend

| Página | Descrição | Status |
|---|---|---|
| `/login` | Login de professores, alunos e administradores | Implementado |
| `/posts/admin` | Página administrativa: lista todas as postagens com opções de editar e excluir | Implementado |
| `/posts/new` | Criação de postagens (docentes) | Implementado |
| `/posts/:id/edit` | Edição de postagens (docentes) | Implementado |
| Controle de acesso | Criação, edição e administração de postagens restritas a usuários autenticados | Implementado |

### Funcionalidades extras (fora do escopo mínimo do desafio)

Estas rotas foram adicionadas para suportar autenticação e gestão de usuários, necessárias ao controle de acesso entre alunos e docentes:

| Endpoint | Descrição | Status |
|---|---|---|
| `POST /login` | Autenticação com JWT | Implementado |
| `POST /users` | Cadastro de usuários (admin) | Implementado |

### Telas do frontend

Após o login, a tela inicial do sistema é a listagem de posts em `/posts`.

| Rota | Descrição | Acesso |
|---|---|---|
| `/login` | Autenticação com e-mail e senha | Público |
| `/` | Redireciona usuários autenticados para `/posts` | Autenticado |
| `/posts` | Listagem paginada de publicações | Usuários autenticados |
| `/posts/[id]` | Visualização de uma publicação | Usuários autenticados |
| `/posts/new` | Criação de publicação | `TEACHER`, `ADMIN` |
| `/posts/[id]/edit` | Edição de publicação existente | `TEACHER`, `ADMIN` |
| `/users/list` | Listagem e busca de usuários | `ADMIN` |
| `/users/new` | Cadastro de usuários | `ADMIN` |

Na tela `/posts`, usuários com papel `TEACHER` ou `ADMIN` podem:

- acessar **Criar post** no topo direito;
- editar cada publicação pelo botão **Editar**;
- excluir cada publicação pelo botão **Excluir**;
- confirmar a exclusão em um modal próprio da aplicação, sem utilizar a caixa nativa do navegador.

Na tela de detalhes `/posts/[id]`, usuários com papel `TEACHER` ou `ADMIN` também podem editar ou excluir a publicação. A exclusão utiliza o mesmo modal personalizado e, após a confirmação, retorna para `/posts` com o feedback de sucesso.

Usuários com papel `STUDENT` visualizam as publicações, mas não veem os controles de criação, edição e exclusão.

Após criar ou editar uma publicação, a aplicação navega imediatamente para `/posts` e exibe uma mensagem de sucesso. Após excluir uma publicação na listagem ou nos detalhes, o usuário também retorna para `/posts` com o feedback correspondente. As mensagens desaparecem automaticamente após alguns segundos com uma animação.

Os formulários de criação e edição validam títulos com no mínimo 3 e no máximo 255 caracteres, conforme o limite `varchar(255)` definido no banco de dados.

### Requisitos técnicos

| Requisito | Decisão / status |
|---|---|
| Back-end em Node.js | Implementado (TypeScript + Fastify) |
| Persistência de dados | Implementado (PostgreSQL + migrations) |
| Containerização com Docker | Implementado (`Dockerfile` em `api/` e `frontend/` + `docker-compose.yaml`) |
| GitHub Actions (CI) | Implementado — API e frontend validados automaticamente em Pull Requests |
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
| Mobile | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) |
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

O projeto é um **monorepo** com backend, frontend e aplicativo mobile separados:

```
portal-fiap/
├── api/                # API REST (Node.js + Fastify + PostgreSQL)
├── frontend/           # Frontend (Next.js + React)
├── mobile/             # Aplicativo mobile (React Native + Expo)
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

## Arquitetura do frontend

O frontend é uma aplicação **Next.js (App Router)** que consome a API REST. Não há acesso direto ao banco: toda leitura e escrita passa pelos endpoints documentados neste README.

```
frontend/src/
├── app/
│   ├── layout.tsx      # Layout raiz (fontes e tema)
│   ├── page.tsx        # Home autenticada, com atalhos por papel
│   ├── actions.ts      # Server Action de logout
│   ├── globals.css     # Tokens e componentes do design system (Tailwind)
│   ├── login/          # Tela de login
│   ├── posts/          # Postagens
│   │   ├── actions.ts      # Server Actions que consomem /posts
│   │   ├── post-form.tsx   # Formulário compartilhado entre criar e editar
│   │   ├── admin/          # Página administrativa
│   │   ├── new/            # Criação
│   │   └── [id]/edit/      # Edição
│   └── users/          # Cadastro e listagem de usuários (admin)
├── components/         # Header e menu de usuário
├── lib/                # Helpers de API e de sessão (JWT/cookie)
└── proxy.ts            # Middleware de rotas (Next.js 16)
```

As chamadas à API ficam em **Server Actions** (`"use server"`), nunca no navegador. Assim o token JWT não fica exposto ao JavaScript do cliente: o componente envia o formulário para a action, e é a action que monta o cabeçalho `Authorization: Bearer <token>` e chama a API.

### Rotas do frontend

| Rota | Acesso | Descrição |
|---|---|---|
| `/login` | Público | Autenticação com e-mail e senha |
| `/` | Autenticado | Home com o papel da sessão e atalhos |
| `/posts/:id` | Usuários autenticados | Leitura do conteúdo completo de uma publicação |
| `/posts/admin` | `TEACHER`, `ADMIN` | Página administrativa de postagens |
| `/posts/new` | `TEACHER`, `ADMIN` | Criação de postagem |
| `/posts/:id/edit` | `TEACHER`, `ADMIN` | Edição de postagem |
| `/users/list` | `ADMIN` | Listagem de usuários |
| `/users/new` | `ADMIN` | Cadastro de usuários |

## Autenticação e autorização

O login é feito em `/login` e vale para os três papéis — professores usam as mesmas credenciais cadastradas na API (ver [contas do seed](#6-criar-contas-iniciais-seed)).

### Fluxo de login

1. O formulário chama a Server Action `loginAction`, que envia e-mail e senha para `POST /login`.
2. Com o token JWT devolvido pela API, a action grava o cookie de sessão e redireciona para `/`.
3. O cookie é `httpOnly`, `sameSite=lax`, com validade de 15 dias e `secure` habilitado em produção. Como é `httpOnly`, o JavaScript do navegador não consegue lê-lo.
4. O logout (`logoutAction`) apaga o cookie e devolve o usuário para `/login`.

### Camadas de proteção

O controle de acesso acontece em três níveis, do mais barato ao mais confiável:

| Camada | Onde | O que verifica |
|---|---|---|
| Middleware | `frontend/src/proxy.ts` | Checagem otimista: se não existe cookie de sessão, redireciona para `/login` antes de renderizar qualquer rota. Se o usuário já está logado e acessa `/login`, redireciona para `/` |
| Server Component | Cada `page.tsx` protegida | `getSession()` decodifica o JWT, confere a expiração e redireciona para `/login` se o token não for mais válido. Em seguida valida o papel e redireciona para `/` quem não tiver permissão |
| API | `preHandler` das rotas | Valida a assinatura do JWT (`authenticate`) e o papel (`requireTeacherOrAdmin`, `requireAdmin`). É a única camada que confere a assinatura do token |

> O frontend apenas **decodifica** o payload do JWT para exibir o papel na interface sem uma chamada de rede extra. Toda operação sensível reenvia o token para a API, que é quem valida a assinatura — nenhuma decisão de segurança depende só do cliente.

As páginas de **criação**, **edição** e **administração** de postagens exigem sessão válida e papel `TEACHER` ou `ADMIN`. Um aluno autenticado que acessar essas URLs diretamente é redirecionado para `/`, e os atalhos correspondentes não aparecem no menu do usuário nem na home.

## Página administrativa de postagens

Disponível em `/posts/admin` para `TEACHER` e `ADMIN`, acessível pelo menu do usuário ou pelo atalho da home.

### Funcionalidades

| Funcionalidade | Endpoint consumido |
|---|---|
| Listagem de todas as postagens, com título, trecho do conteúdo e datas de criação e atualização | `GET /posts` |
| Botão **Carregar mais**, que busca a próxima página pelo cursor devolvido pela API | `GET /posts?cursor=&limit=` |
| Busca por palavra-chave no título ou no conteúdo | `GET /posts/search?term=` |
| Botão **Editar** por postagem, que abre `/posts/:id/edit` com o formulário preenchido | `GET /posts/:id` e `PUT /posts/:id` |
| Botão **Excluir** por postagem, com confirmação em duas etapas antes de enviar a requisição | `DELETE /posts/:id` |
| Atalho para criar uma nova postagem | `POST /posts` |

Detalhes de comportamento:

- **Exclusão em duas etapas** — o primeiro clique em *Excluir* abre uma confirmação na própria linha (*Cancelar* / *Confirmar exclusão*), evitando remoções acidentais. Após a confirmação, a postagem some da lista e um aviso de sucesso é exibido.
- **Paginação preservada** — ao excluir, a postagem é removida localmente em vez de recarregar a lista, para não descartar as páginas já trazidas pelo *Carregar mais*.
- **Busca sem paginação** — `GET /posts/search` devolve uma lista simples. A Server Action normaliza a resposta no mesmo formato paginado das demais chamadas, então o botão *Carregar mais* simplesmente não aparece em resultados de busca.
- **Validação espelhada** — os formulários de criação e edição aplicam as mesmas regras da API (título com no mínimo 3 caracteres e conteúdo com no mínimo 10), para o erro aparecer antes da chamada de rede.
- **Autoria** — postagens criadas pelo usuário da sessão recebem a marcação *Sua postagem*.

## Aplicativo mobile

O aplicativo do **Tech Challenge da Fase 4** fica em `mobile/`. Ele é feito em **React Native com Expo**, usa componentes funcionais e hooks, e consome os mesmos endpoints REST do frontend web.

### Setup do aplicativo

Pré-requisitos: Node.js 22.13+ ou 24.3+ e o app **Expo Go** no celular, ou um simulador iOS ou emulador Android.

1. Suba a API e crie as [contas de desenvolvimento](#6-criar-contas-iniciais-seed).
2. Instale as dependências e inicie o app:

```bash
cd mobile
npm install
npm start
```

O `mobile/` não faz parte dos workspaces npm da raiz e tem o próprio `package-lock.json`, então o `npm install` precisa ser executado dentro dessa pasta.

Por padrão, o app chama a porta `3001` da máquina que está rodando o Metro. Para usar outro endereço, copie `mobile/.env.example` para `mobile/.env`, defina `EXPO_PUBLIC_API_URL` e reinicie o Metro.

### Arquitetura do aplicativo

```
mobile/src/
├── app/                     # Rotas (Expo Router): cada arquivo é uma tela
│   ├── _layout.tsx          # Provider da sessão e guard de autenticação
│   ├── login.tsx            # Tela de login
│   └── (app)/               # Exige usuário autenticado
│       ├── _layout.tsx      # Guard de perfil
│       ├── index.tsx        # Tela inicial: lista de postagens com busca
│       ├── posts/[id].tsx   # Leitura de uma postagem
│       └── (teacher)/       # Exige perfil TEACHER ou ADMIN
│           ├── admin.tsx    # Página administrativa de postagens
│           ├── posts/new.tsx       # Criação de postagem
│           └── posts/[id]/edit.tsx # Edição de postagem
├── auth/session-context.tsx # Estado da sessão (Context API) e hook useSession
├── components/              # Componentes reutilizáveis
├── hooks/                   # Estado de telas (use-posts-feed, use-post, use-admin-posts, use-debounced-value)
├── lib/
│   ├── api.ts               # Cliente HTTP (apiFetch) e mensagens de erro
│   ├── format.ts            # Formatação de datas
│   ├── jwt.ts               # Leitura dos dados do token
│   ├── notice.ts            # Aviso de sucesso entregue à tela para onde o usuário volta
│   ├── posts.ts             # Chamadas à API de postagens
│   └── permissions.ts       # Regras de permissão por perfil
└── theme/                   # Cores e raios, espelhando o frontend web
```

### Tela de login

É a primeira tela para quem não tem sessão. Vale para os três perfis, porque a API exige token até para listar postagens. O perfil define o que cada usuário pode fazer depois de entrar.

#### Como usar

1. Informe o **e-mail**. Espaços no início e no fim são ignorados.
2. Informe a **senha**. O ícone de olho mostra ou oculta os caracteres.
3. Toque em **Entrar** ou use a tecla de envio do teclado. Enquanto a requisição está em andamento, o botão fica desabilitado e exibe um indicador de carregamento.

Em caso de sucesso, o usuário vai direto para a tela inicial. Para testar, use as [contas de desenvolvimento](#6-criar-contas-iniciais-seed).

| Perfil | E-mail | Senha |
|---|---|---|
| Professor | `teacher@fiap.com.br` | `12345678` |
| Administrador | `admin@fiap.com.br` | `12345678` |
| Estudante | `student@fiap.com.br` | `12345678` |

#### Validações e mensagens

Os campos são validados antes da chamada à API, com as mesmas regras do endpoint `POST /login`.

| Situação | Mensagem exibida |
|---|---|
| E-mail vazio ou em formato inválido | Informe um e-mail válido. |
| Senha com menos de 8 caracteres | A senha deve ter pelo menos 8 caracteres. |
| Credenciais recusadas pela API (`401`) | E-mail ou senha incorretos. |
| API inacessível ou sem resposta em 15 segundos | Não foi possível conectar à API. Tente novamente em instantes. |
| Qualquer outra falha | Não foi possível entrar. Tente novamente. |

A mensagem de credenciais recusadas é a mesma para e-mail inexistente e senha incorreta, assim a tela não revela quais e-mails estão cadastrados.

#### Fluxo de autenticação

```mermaid
sequenceDiagram
    actor U as Usuário
    participant L as Tela de login
    participant S as SessionProvider
    participant A as API
    participant K as SecureStore

    U->>L: Informa e-mail e senha
    L->>L: Valida os campos
    L->>S: signIn(email, senha)
    S->>A: POST /login
    alt Credenciais válidas
        A-->>S: 200 com token JWT
        S->>S: Valida o token e lê id, perfil e expiração
        S->>K: Salva o token
        S-->>U: Guard abre a área logada
    else Credenciais inválidas
        A-->>S: 401
        S-->>L: Erro
        L-->>U: Exibe a mensagem na tela
    end
```

#### Sessão

| Evento | Comportamento |
|---|---|
| Login | O token é salvo no armazenamento seguro do aparelho |
| Abertura do app | O token salvo é lido, e o usuário entra sem digitar a senha |
| Token expirado ou malformado | O token é apagado, e o usuário volta ao login |
| API responde `401` a uma chamada autenticada | A sessão é encerrada, e o usuário volta ao login |
| Botão **Sair** | O token é apagado, e o usuário volta ao login |

O token gerado pela API vale por 15 dias.

### Autorização no aplicativo

A navegação usa `Stack.Protected` do Expo Router. Uma rota protegida não fica disponível quando a condição não é atendida, mesmo se aberta por link direto, e quem tenta acessá-la é redirecionado.

| Área | Quem acessa |
|---|---|
| `login` | Apenas quem não tem sessão |
| `(app)` | Qualquer usuário autenticado |
| `(app)/(teacher)` | `TEACHER` e `ADMIN` |

Toda tela criada em `(app)/(teacher)` herda essa proteção, e opções indisponíveis para o perfil não são exibidas.

#### Decisões de segurança

- **Armazenamento:** o token fica no `expo-secure-store`, que usa o Keychain no iOS e o Keystore no Android. A senha não é salva no aparelho.
- **Validação do token:** o app apenas lê os dados do JWT para decidir o que exibir. A assinatura e as permissões são verificadas pela API em cada endpoint protegido, então os guards do app não substituem essa validação.
- **Transporte:** builds de produção devem usar uma API com HTTPS, porque a senha e o token trafegam nas requisições.

### Lista de postagens do aplicativo

É a tela inicial depois do login, para os três perfis.

#### Como usar

1. Role a lista para ver mais postagens. Cada item mostra título, autor, data de publicação e um trecho do conteúdo. Toque em um item para lê-lo por completo.
2. Digite uma palavra-chave em **Buscar postagens** para filtrar por título, conteúdo ou nome do autor. A busca começa sozinha meio segundo depois que você para de digitar.
3. Apague o termo para voltar à lista completa.
4. Puxe a lista para baixo para atualizá-la.
5. Toque em **Sair**, no cabeçalho, para encerrar a sessão.

Professores e administradores também veem os botões **Nova postagem** e **Administrar postagens**.

#### Funcionalidades

| Funcionalidade | Endpoint consumido |
|---|---|
| Lista de todas as postagens (20 por vez, com a próxima página carregada ao rolar) | `GET /posts?cursor=&limit=` |
| Busca por palavra-chave | `GET /posts/search?term=` |
| Atualização ao puxar a lista e ao voltar para a tela | `GET /posts` ou a busca ativa |

Detalhes de comportamento:

- **Busca com espera:** a chamada só acontece 500 ms depois da última tecla, como no frontend web, para não disparar uma requisição a cada letra.
- **Busca sem paginação:** a API devolve todos os resultados da busca de uma vez, então a lista não pede próxima página enquanto há um termo.
- **Respostas atrasadas:** só a requisição mais recente altera a lista, então o resultado de uma busca antiga não substitui o da busca atual.

#### Validações e mensagens

| Situação | Mensagem exibida |
|---|---|
| Nenhuma postagem cadastrada | Nenhuma postagem publicada. |
| Busca sem resultados | Nenhuma postagem encontrada para esta busca. |
| Falha ao carregar a lista | Não foi possível carregar as postagens. |
| Falha na busca | Não foi possível buscar as postagens. |
| Falha ao carregar a próxima página | Não foi possível carregar mais postagens. |
| API inacessível ou sem resposta em 15 segundos | Não foi possível conectar à API. Tente novamente em instantes. |

Se a primeira carga falhar, a tela exibe o botão **Tentar novamente**. Se a lista já estiver na tela, ela é mantida e o erro aparece acima dela.

### Leitura de postagem no aplicativo

Disponível para os três perfis, ao tocar em uma postagem da lista.

#### Como usar

1. Na tela inicial, toque em uma postagem.
2. Leia o conteúdo completo. O texto pode ser selecionado e copiado.
3. Use o botão de voltar do cabeçalho para retornar à lista.

#### Funcionalidades

| Funcionalidade | Endpoint consumido |
|---|---|
| Título, autor, data de publicação, data da última atualização e conteúdo completo | `GET /posts/:id` |
| Atualização ao voltar para a tela, para refletir uma edição | `GET /posts/:id` |

A data de atualização só aparece quando é diferente da data de publicação. A API não tem endpoints de comentários, então o item opcional de comentários do desafio não foi implementado.

#### Validações e mensagens

| Situação | Mensagem exibida | Ação oferecida |
|---|---|---|
| A postagem não existe (`404`) | Postagem não encontrada. Ela pode ter sido excluída. | **Voltar para a lista** |
| Falha ao carregar | Não foi possível carregar a postagem. | **Tentar novamente** |
| API inacessível ou sem resposta em 15 segundos | Não foi possível conectar à API. Tente novamente em instantes. | **Tentar novamente** |

Se a postagem já estiver na tela e uma atualização falhar, ela continua visível e o erro aparece acima do título.

### Criação de postagem no aplicativo

Disponível para `TEACHER` e `ADMIN` pelo botão **Nova postagem** da tela inicial. Estudantes não veem o botão e não abrem o formulário, mesmo por link direto.

#### Como usar

1. Na tela inicial, toque em **Nova postagem**.
2. Preencha o **título** e o **conteúdo**. O campo **Autor** é apenas informativo: a API registra como autor o usuário da sessão.
3. Toque em **Publicar postagem**. Enquanto a requisição está em andamento, o botão exibe um indicador de carregamento.
4. Para desistir, toque em **Cancelar** ou no botão de voltar do cabeçalho.

Ao publicar, o app volta para a lista, que é recarregada e exibe *Postagem publicada.*

#### Funcionalidades

| Funcionalidade | Endpoint consumido |
|---|---|
| Envio da nova postagem, com o autor definido pelo token | `POST /posts` |
| Lista atualizada ao voltar, com o aviso de sucesso | `GET /posts` |

O formulário é o mesmo usado na edição (`components/post-form.tsx`).

#### Validações e mensagens

As regras são as mesmas da API e do frontend web, verificadas antes do envio e ignorando espaços no início e no fim dos campos.

| Situação | Mensagem exibida |
|---|---|
| Título com menos de 3 caracteres | O título deve ter pelo menos 3 caracteres. |
| Título com mais de 255 caracteres | O título deve ter no máximo 255 caracteres. |
| Conteúdo com menos de 10 caracteres | O conteúdo deve ter pelo menos 10 caracteres. |
| Usuário sem permissão (`403`) | Você não tem permissão para publicar postagens. |
| Falha ao publicar | Não foi possível publicar a postagem. |
| API inacessível ou sem resposta em 15 segundos | Não foi possível conectar à API. Tente novamente em instantes. |
| Postagem publicada | Postagem publicada. |

O campo de título também limita a digitação a 255 caracteres. Em caso de erro, o formulário continua preenchido para uma nova tentativa.

### Edição de postagem no aplicativo

Disponível para `TEACHER` e `ADMIN` pelo botão **Editar**, que aparece na leitura da postagem e na página administrativa.

#### Como usar

1. Abra uma postagem pela lista, ou acesse a página administrativa, e toque em **Editar**.
2. O formulário abre preenchido com o título e o conteúdo atuais. O campo **Autor** mostra o autor original e não pode ser alterado.
3. Altere os campos e toque em **Salvar alterações**.
4. Para desistir, toque em **Cancelar** ou no botão de voltar do cabeçalho.

Ao salvar, o app volta para a tela de onde a edição foi aberta, que é recarregada e exibe *Postagem atualizada.*

#### Funcionalidades

| Funcionalidade | Endpoint consumido |
|---|---|
| Carregamento dos dados atuais da postagem | `GET /posts/:id` |
| Envio das alterações | `PUT /posts/:id` |
| Tela anterior atualizada, com o aviso de sucesso | `GET /posts/:id` ou `GET /posts` |

Detalhes de comportamento:

- **Permissões por postagem:** seguindo a regra da API, o `ADMIN` edita qualquer postagem, e o `TEACHER`, apenas as próprias. O botão **Editar** só aparece para quem pode usá-lo, e um professor que abra a edição de uma postagem alheia por link direto vê o aviso de permissão no lugar do formulário.
- **Formulário compartilhado:** a edição usa o mesmo formulário e as mesmas validações da criação.
- **Dados preservados:** a postagem é carregada só ao abrir a tela, para que voltar ao app depois de trocar de aplicativo não apague o que foi digitado.
- **Link direto:** sem tela anterior para onde voltar, o app abre a leitura da postagem depois de salvar.

#### Validações e mensagens

As validações de título e conteúdo são as mesmas da [criação de postagem](#criação-de-postagem-no-aplicativo).

| Situação | Mensagem exibida |
|---|---|
| A postagem não existe ao abrir (`404`) | Postagem não encontrada. Ela pode ter sido excluída. |
| Falha ao carregar a postagem | Não foi possível carregar a postagem. |
| Postagem de outro autor (professor) ou `403` ao salvar | Você não tem permissão para editar esta postagem. |
| A postagem foi excluída antes de salvar (`404`) | Esta postagem não existe mais. Ela pode ter sido excluída. |
| Falha ao salvar | Não foi possível salvar as alterações. |
| API inacessível ou sem resposta em 15 segundos | Não foi possível conectar à API. Tente novamente em instantes. |
| Alterações salvas | Postagem atualizada. |

#### Fluxo de edição

```mermaid
sequenceDiagram
    actor U as Usuário
    participant E as Tela de edição
    participant A as API
    participant T as Tela anterior

    U->>E: Toca em Editar
    E->>A: GET /posts/:id
    A-->>E: Postagem atual
    E-->>U: Formulário preenchido
    U->>E: Altera e toca em Salvar alterações
    E->>E: Valida os campos
    E->>A: PUT /posts/:id
    alt Alteração autorizada
        A-->>E: 200
        E->>T: Volta e deixa o aviso de sucesso
        T->>A: Recarrega a postagem ou a lista
        T-->>U: Exibe Postagem atualizada.
    else Recusada ou com falha
        A-->>E: 403, 404 ou erro
        E-->>U: Exibe a mensagem e mantém o que foi digitado
    end
```

### Página administrativa do aplicativo

Disponível para `TEACHER` e `ADMIN` pelo botão **Administrar postagens** da tela inicial. Estudantes não veem o botão e não acessam a rota, mesmo por link direto.

#### Como usar

1. Na tela inicial, toque em **Administrar postagens**.
2. Role a lista para carregar mais postagens ou puxe para baixo para atualizá-la.
3. Toque em **Excluir** e confirme para apagar uma postagem. A exclusão não pode ser desfeita.
4. Toque em **Editar** para abrir o formulário de edição da postagem. Ao salvar, o app volta para esta página, que é recarregada e exibe *Postagem atualizada.*

#### Funcionalidades

| Funcionalidade | Endpoint consumido |
|---|---|
| Lista de todas as postagens, com título, autor, data de atualização e trecho do conteúdo | `GET /posts` |
| Próxima página, carregada ao rolar a lista (20 postagens por vez) | `GET /posts?cursor=&limit=` |
| Atualização ao puxar a lista e ao voltar para a tela | `GET /posts` |
| Exclusão com confirmação | `DELETE /posts/:id` |

Detalhes de comportamento:

- **Permissões por postagem:** seguindo a regra da API, o `ADMIN` altera qualquer postagem, e o `TEACHER`, apenas as próprias. As postagens de outros autores continuam na lista, sem os botões.
- **Autoria:** postagens do usuário da sessão recebem a marcação *Sua postagem*. Se a API não informar o nome do autor, a lista mostra *Autor não informado*.
- **Paginação preservada na exclusão:** a postagem é removida localmente, sem recarregar a lista, para não descartar as páginas já carregadas.
- **Respostas atrasadas:** só a requisição mais recente altera a lista, então uma resposta antiga não traz de volta uma postagem já excluída.

#### Validações e mensagens

| Situação | Mensagem exibida |
|---|---|
| Postagem excluída | Postagem excluída. |
| A postagem já não existe (`404`) | Esta postagem já havia sido excluída. |
| Sem permissão para excluir (`403`) | Você não tem permissão para excluir esta postagem. |
| Falha ao excluir | Não foi possível excluir a postagem. |
| Falha ao carregar a lista | Não foi possível carregar as postagens. |
| Falha ao carregar a próxima página | Não foi possível carregar mais postagens. |
| API inacessível ou sem resposta em 15 segundos | Não foi possível conectar à API. Tente novamente em instantes. |
| Nenhuma postagem cadastrada | Nenhuma postagem cadastrada. |

Se a primeira carga falhar, a tela exibe o botão **Tentar novamente**.

#### Fluxo de exclusão

```mermaid
sequenceDiagram
    actor U as Usuário
    participant T as Página administrativa
    participant A as API

    U->>T: Toca em Excluir
    T-->>U: Pede confirmação
    alt Usuário confirma
        U->>T: Confirma
        T->>A: DELETE /posts/:id
        alt Exclusão autorizada
            A-->>T: 200
            T-->>U: Remove da lista e exibe o aviso
        else Recusada ou com falha
            A-->>T: 403, 404 ou erro
            T-->>U: Exibe a mensagem correspondente
        end
    else Usuário cancela
        U->>T: Cancela
        T-->>U: Mantém a postagem
    end
```

### Testes do aplicativo

```bash
cd mobile
npm test           # Testes automatizados
npm run typecheck  # Verificação de tipos
npm run lint       # ESLint
```

Os testes cobrem o login, as mensagens de erro, a restauração e o encerramento da sessão, os redirecionamentos, o acesso por perfil, a lista de postagens com busca, a leitura, a criação e a edição de postagem e a página administrativa, incluindo paginação, permissões por postagem e exclusão. O workflow `Mobile CI` executa esses três comandos em todo PR que altera `mobile/`.

### Solução de problemas do aplicativo

| Sintoma | O que verificar |
|---|---|
| Não foi possível conectar à API | Confirme que a API está no ar com `docker ps`. Em um celular físico, use a mesma rede do computador. Se o endereço detectado não funcionar, defina `EXPO_PUBLIC_API_URL` com o IP da máquina e reinicie o Metro |
| E-mail ou senha incorretos com uma conta de teste | Crie as contas com `npm run seed`, na raiz do repositório |
| Erro na instalação ou ao iniciar o Metro | Confirme a versão do Node.js e se o comando foi executado dentro de `mobile/` |

Mais detalhes para quem desenvolve novas telas estão em [mobile/README.md](mobile/README.md).

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

### Validação do frontend

O frontend possui uma pipeline separada em `.github/workflows/frontend-ci.yml`. Ela é executada em Pull Requests e pode ser acionada manualmente pelo GitHub Actions.

As etapas são:

```bash
npm run test --workspace frontend --if-present
npm run lint --workspace frontend
npm run build --workspace frontend
```

Atualmente o frontend ainda não possui testes automatizados configurados. Por isso, a etapa de testes é condicional e será executada automaticamente quando um script `test` for adicionado ao workspace `frontend`. O lint e o build são executados sempre.

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

O campo `title` deve conter entre 3 e 255 caracteres. O campo `content` deve conter pelo menos 10 caracteres.

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

Os campos `title` e `content` seguem as mesmas validações da criação: o título deve conter entre 3 e 255 caracteres e o conteúdo deve conter pelo menos 10 caracteres.

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

Durante o desenvolvimento do projeto, a equipe dividiu as atividades entre os integrantes, trabalhando de forma colaborativa por meio de branches e Pull Requests. A comunicação constante facilitou a integração das funcionalidades, a revisão do código e a troca de conhecimento.

Um dos principais desafios foi a adaptação às tecnologias utilizadas, especialmente Node.js, Fastify, PostgreSQL e Next.js, além da organização da aplicação em camadas.

Durante os testes, foram identificados e corrigidos problemas relacionados à paginação por cursor, principalmente na precisão do campo created_at entre PostgreSQL e JavaScript e no controle da paginação no frontend. Os problemas foram investigados com testes manuais, análise do código e consultas ao banco de dados.

A experiência contribuiu para o aprimoramento dos conhecimentos da equipe em desenvolvimento full stack, integração entre frontend e API, banco de dados, autenticação e trabalho colaborativo.


## Licença

ISC
