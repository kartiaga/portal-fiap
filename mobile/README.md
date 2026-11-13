# Portal FIAP — Mobile

Aplicativo React Native (Expo) do Tech Challenge da Fase 4. Consome a mesma API REST do frontend web.

## Setup

Pré-requisitos: Node.js 22.13+ ou 24.3+ e o app **Expo Go** no celular, ou um simulador iOS/emulador Android.

1. Suba a API, na raiz do repositório, e crie as contas iniciais (ver o [README principal](../README.md#6-criar-contas-iniciais-seed)).

2. Instale as dependências e inicie o app:

   ```bash
   cd mobile
   npm install
   npm start
   ```

O `mobile/` é um pacote independente: ele não faz parte dos workspaces npm da raiz e tem o próprio `package-lock.json`, então o `npm install` precisa ser executado dentro desta pasta.

### Endereço da API

Por padrão, o app chama a porta `3001` da máquina que está rodando o Metro, o que funciona no simulador e em um celular na mesma rede. Para usar outro endereço, copie `.env.example` para `.env` e defina `EXPO_PUBLIC_API_URL`.

Builds de produção precisam de uma API com HTTPS.

### Contas de teste

| E-mail                | Senha      | Perfil    |
| --------------------- | ---------- | --------- |
| `teacher@fiap.com.br` | `12345678` | Professor |
| `admin@fiap.com.br`   | `12345678` | Admin     |
| `student@fiap.com.br` | `12345678` | Estudante |

## Scripts

| Comando             | O que faz                    |
| ------------------- | ---------------------------- |
| `npm start`         | Inicia o Metro               |
| `npm run ios`       | Abre no simulador iOS        |
| `npm run android`   | Abre no emulador Android     |
| `npm test`          | Executa os testes            |
| `npm run lint`      | Executa o ESLint             |
| `npm run typecheck` | Verifica os tipos            |

## Arquitetura

```
src/
├── app/                    Rotas (Expo Router): cada arquivo é uma tela
│   ├── _layout.tsx         Provider da sessão e guard de autenticação
│   ├── login.tsx           Pública, disponível apenas sem sessão
│   └── (app)/              Exige usuário autenticado
│       ├── _layout.tsx     Guard de perfil
│       ├── index.tsx       Tela inicial: lista de postagens com busca
│       ├── posts/[id].tsx  Leitura de uma postagem
│       └── (teacher)/      Exige professor ou administrador
│           ├── admin.tsx   Página administrativa de postagens
│           ├── posts/new.tsx        Criação de postagem
│           └── posts/[id]/edit.tsx  Edição de postagem
├── auth/session-context.tsx  Estado da sessão (Context API) e o hook useSession
├── components/             Componentes reutilizáveis
├── hooks/                  Estado de telas (use-posts-feed, use-post, use-admin-posts, use-debounced-value)
├── lib/
│   ├── api.ts              Cliente HTTP (apiFetch) e mensagens de erro
│   ├── format.ts           Formatação de datas
│   ├── jwt.ts              Leitura dos dados do token
│   ├── notice.ts           Aviso de sucesso entregue à tela para onde o usuário volta
│   ├── posts.ts            Chamadas à API de postagens
│   └── permissions.ts      Regras de permissão por perfil
└── theme/                  Cores e raios, espelhando o frontend web
```

## Autenticação e autorização

O guia de uso da tela de login, as mensagens de erro e o fluxo completo estão no [README principal](../README.md#tela-de-login).

1. O login envia e-mail e senha para `POST /login`. O token retornado fica no `expo-secure-store` (Keychain/Keystore).
2. Ao abrir o app, o token salvo é lido. Se estiver expirado ou malformado, ele é apagado e o usuário volta ao login.
3. O `apiFetch` envia o token em toda chamada. Se a API responder `401` para o token atual, a sessão é encerrada e o usuário volta ao login.

| Área                  | Quem acessa                    |
| --------------------- | ------------------------------ |
| `login`               | Apenas quem não tem sessão     |
| `(app)`               | Qualquer usuário autenticado   |
| `(app)/(teacher)`     | Professores e administradores  |

Os guards usam `Stack.Protected` e controlam apenas a navegação. Quem garante a permissão é a API, que valida o token e o perfil em cada endpoint protegido.

## Lista de postagens

É a tela inicial para todos os perfis. Cada item mostra título, autor, data de publicação e um trecho do conteúdo.

| Funcionalidade | Endpoint |
| ------------------------------------------------------- | --------------------------- |
| Lista de todas as postagens, com próxima página ao rolar | `GET /posts?cursor=&limit=` |
| Busca por palavra-chave no título, no conteúdo ou no autor | `GET /posts/search?term=` |
| Atualizar ao puxar a lista e ao voltar para a tela       | `GET /posts` ou a busca ativa |

A busca é feita 500 ms depois que o usuário para de digitar, como no frontend web. Como a API não pagina a busca, todos os resultados chegam de uma vez. Apagar o termo volta para a lista paginada.

O botão **Sair** fica no cabeçalho, e o botão **Administrar postagens** aparece apenas para professores e administradores.

## Leitura de postagem

Tocar em um item da lista abre `/posts/:id`, que busca a postagem em `GET /posts/:id` e mostra título, autor, data de publicação, data da última atualização (quando houver) e o conteúdo completo, que pode ser selecionado e copiado.

A tela recarrega ao voltar para ela, para refletir uma edição. Se a postagem não existir mais (`404`), a tela oferece **Voltar para a lista**; em outras falhas, **Tentar novamente**.

A API não tem endpoints de comentários, então o item opcional de comentários não foi implementado.

## Criação de postagem

Professores e administradores abrem `/posts/new` pelo botão **Nova postagem** da tela inicial. O formulário (`components/post-form.tsx`) é compartilhado com a edição e tem:

- **Autor**, apenas para leitura: a API define o autor pelo token, então o campo mostra *Você*;
- **Título**, de 3 a 255 caracteres;
- **Conteúdo**, com pelo menos 10 caracteres.

As regras são as mesmas da API e são verificadas antes do envio, ignorando espaços nas pontas. Ao publicar (`POST /posts`), o app volta para a lista, que recarrega e mostra *Postagem publicada.* Em caso de erro, o formulário continua preenchido.

## Edição de postagem

`/posts/:id/edit` é aberta pelo botão **Editar** da leitura da postagem ou da página administrativa. Ela carrega os dados atuais com `GET /posts/:id`, preenche o mesmo `PostForm` da criação e salva com `PUT /posts/:id`. O autor aparece apenas para leitura.

O botão **Editar** só aparece para quem pode alterar a postagem (`canModifyPost`): administradores, em qualquer postagem, e professores, nas próprias. Um professor que abra a edição de uma postagem alheia por link direto vê *Você não tem permissão para editar esta postagem.*, sem o formulário. A API faz a mesma verificação e responde `403`.

Ao salvar, o app volta para a tela que abriu a edição, que recarrega e mostra *Postagem atualizada.* Sem histórico (link direto), vai para a leitura da postagem. Os dados são carregados só ao abrir a tela, para não apagar o que já foi digitado ao voltar do segundo plano.

O aviso de sucesso passa de uma tela para outra por `lib/notice.ts`: a tela que fecha chama `setFlashNotice`, e a que volta a aparecer chama `takeFlashNotice` ao receber foco.

## Página administrativa

Disponível para professores e administradores pelo botão **Administrar postagens** da tela inicial.

| Funcionalidade | Endpoint |
| ------------------------------------------------------- | --------------------------- |
| Lista de todas as postagens, com próxima página ao rolar | `GET /posts?cursor=&limit=` |
| Atualizar ao puxar a lista e ao voltar para a tela       | `GET /posts`                |
| Excluir, com confirmação                                 | `DELETE /posts/:id`         |
| Editar, que abre `/posts/:id/edit`                       | `GET /posts/:id` e `PUT /posts/:id` |

Os botões seguem a regra da API: administradores alteram qualquer postagem, e professores, apenas as próprias. As postagens de outros autores continuam na lista, sem os botões.

## Como adicionar telas

- **Exclusiva de professores** (criar ou editar post, gerenciar usuários): crie o arquivo em `src/app/(app)/(teacher)/`, por exemplo `posts/new.tsx`. O guard já se aplica.
- **Para qualquer usuário logado** (lista ou leitura de posts): crie o arquivo em `src/app/(app)/`.

```tsx
import { useSession } from '@/auth/session-context';
import { apiFetch } from '@/lib/api';
import { canManagePosts } from '@/lib/permissions';

const { user, signOut } = useSession();
const posts = await apiFetch('/posts'); // o token é enviado automaticamente
const showEditButton = canManagePosts(user?.role);
```

## Gerenciamento de professores e estudantes — Requisitos 5 a 8

Implementação das funcionalidades de gerenciamento de professores e estudantes no aplicativo mobile, com componentes reutilizáveis em React Native, Expo e TypeScript, integrados à API REST do Portal FIAP.

### Funcionalidades

| Requisito | Descrição |
|---|---|
| 5 | Cadastro de professores |
| 6 | Edição de professores |
| 7 | Listagem paginada e exclusão de professores |
| 8 | Cadastro, edição, listagem paginada e exclusão de estudantes |

As funcionalidades incluem:

- Formulários reutilizáveis para professores e estudantes.
- Validação de nome, e-mail e senha (mínimo de 8 caracteres no cadastro; opcional na edição).
- Cadastro por `POST /users` e edição por `PUT /users/:id`, sem alterar o perfil.
- Listagem por `GET /users?role=TEACHER` ou `GET /users?role=STUDENT`, com `limit=20` e `cursor` opcional; filtro e paginação são feitos no backend, sem filtrar páginas no app.
- Consulta de usuários para edição com `GET /users/:id`.
- Atualização da listagem após operações.
- Confirmação antes de excluir um cadastro por `DELETE /users/:id`.
- Cancelamento da exclusão sem modificar os dados.
- Bloqueio da exclusão da própria conta para `TEACHER`.
- Mensagens de sucesso e erro após as operações, incluindo conflito `409` na exclusão de usuário com postagens.

### Arquitetura

Os componentes compartilhados estão em `src/features/people/`:

| Arquivo | Responsabilidade |
|---|---|
| `api.ts` | Comunicação com a API |
| `person-list.tsx` | Listagem e gerenciamento |
| `person-form.tsx` | Cadastro |
| `person-edit.tsx` | Edição |
| `form-fields.tsx` | Campos reutilizáveis |
| `form-validation.ts` | Validação dos formulários |
| `permissions.ts` | Controle de permissões |

As telas de gerenciamento são disponibilizadas aos perfis `ADMIN` e `TEACHER`; `STUDENT` não pode acessá-las. A API valida as permissões em cada operação.

### Testes e validação

Verificações automatizadas realizadas:

- 28 testes mobile aprovados.
- Typecheck aprovado.
- ESLint aprovado.

Testes manuais registrados anteriormente no emulador Android Pixel 6, com API e PostgreSQL ativos (não reexecutados nesta revisão):

- Login com perfil `TEACHER`.
- Listagem de professores e estudantes.
- Cadastro de professores e estudantes.
- Edição de dados e confirmação da atualização na lista.
- Exclusão com confirmação.
- Cancelamento de exclusão sem remover o cadastro.
- Exibição de mensagem de sucesso após exclusão.

Testes adicionais pendentes:

- Paginação com múltiplas páginas de dados reais.
- Resposta HTTP `409` ao excluir usuário com postagens.
- Validação completa com os demais perfis de acesso.

### Testes automatizados específicos

- `src/__tests__/people-api.test.ts`
- `src/__tests__/people-flow.test.tsx`

Para executar as verificações:

```bash
cd mobile
npm test
npm run typecheck
npm run lint
```
