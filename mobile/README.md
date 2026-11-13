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
│       ├── index.tsx       Tela inicial
│       └── (teacher)/      Exige professor ou administrador
│           └── admin.tsx
├── auth/session-context.tsx  Estado da sessão (Context API) e o hook useSession
├── components/             Componentes reutilizáveis
├── lib/
│   ├── api.ts              Cliente HTTP (apiFetch)
│   ├── jwt.ts              Leitura dos dados do token
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

### Como adicionar telas

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
