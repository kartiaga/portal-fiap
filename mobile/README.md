# Portal FIAP — Mobile

Aplicativo React Native (Expo) do Tech Challenge da Fase 4. Consome a mesma API REST do frontend web.

O enunciado original, como cada requisito foi atendido e o que mudou em relação a ele (com a orientação do professor) estão em [`docs/requisitos/fase-4-mobile.md`](../docs/requisitos/fase-4-mobile.md).

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
├── app/                        Rotas (Expo Router): cada arquivo é uma tela
│   ├── _layout.tsx             Provider da sessão, tema da navegação e guard de autenticação
│   ├── +not-found.tsx          Link inexistente: "Página não encontrada"
│   ├── welcome.tsx             Abertura, só sem sessão
│   ├── login.tsx               Login, só sem sessão
│   └── (app)/                  Exige usuário autenticado (Stack)
│       ├── (tabs)/             Abas nativas
│       │   ├── index.tsx       Posts: lista com busca
│       │   ├── admin.tsx       Gerenciar: buscar, criar, editar e excluir postagens (professor e admin)
│       │   ├── people.tsx      Pessoas: lista de professores e estudantes (professor e admin veem; só admin cadastra, edita e exclui)
│       │   └── account.tsx     Conta: perfil, "Editar meus dados" e sair
│       ├── posts/[id].tsx      Leitura de uma postagem
│       └── (teacher)/          Exige professor ou administrador
│           ├── posts/new.tsx, posts/[id]/edit.tsx
│           ├── people/create.tsx, people/[id]/edit.tsx   Cadastro e edição de pessoas
│           ├── account/edit.tsx    "Meus dados": a própria conta
│           └── filters/people.tsx, filters/posts.tsx     Folhas de filtro (formSheet nativo)
├── auth/session-context.tsx    Estado da sessão (Context API) e o hook useSession
├── components/                 Componentes do design system (Button, TextField, cartões, estados)
├── features/people/            API, hook de lista, formulários e permissões de pessoas
├── hooks/                      Estado de telas e useTheme
├── lib/                        Cliente HTTP, JWT, datas, avisos, posts, permissões, rótulos de perfil
└── theme/                      Tokens: cores claro/escuro, tipografia, espaçamento e raio
```

A interface segue [`docs/design-system.md`](docs/design-system.md). Leia antes de criar ou alterar uma tela.

## Autenticação e autorização

O guia de uso da tela de login, as mensagens de erro e o fluxo completo estão no [README principal](../README.md#tela-de-login).

1. O login envia e-mail e senha para `POST /login`. O token retornado fica no `expo-secure-store` (Keychain/Keystore).
2. Ao abrir o app, o token salvo é lido. Se estiver expirado ou malformado, ele é apagado e o app abre na tela de boas-vindas.
3. O `apiFetch` envia o token em toda chamada. Se a API responder `401` para o token atual, ou se a validade do token vencer com o app aberto (conferida também ao voltar do segundo plano), a sessão é encerrada e o login mostra *Sua sessão expirou. Entre novamente para continuar.*
4. **Sair** (aba Conta) pede confirmação, apaga o token e leva direto ao login.

| Área                  | Quem acessa                    |
| --------------------- | ------------------------------ |
| `welcome`, `login`    | Apenas quem não tem sessão     |
| `(app)`               | Qualquer usuário autenticado   |
| `(app)/(teacher)`     | Professores e administradores  |

Sem sessão, qualquer rota protegida leva à abertura na primeira vez; depois de sair ou de a sessão expirar na mesma execução, leva direto ao login (`endReason` em `session-context.tsx`). Com sessão, a abertura e o login levam aos posts. Um link inexistente mostra *Página não encontrada* com **Voltar para Posts**. As abas Gerenciar e Pessoas ficam ocultas para estudantes, e as telas redirecionam para os posts se abertas por link direto.

Os guards usam `Stack.Protected` e controlam apenas a navegação. Quem garante a permissão é a API, que valida o token e o perfil em cada endpoint protegido.

## Lista de postagens

É a tela inicial para todos os perfis. Cada item mostra título, autor, data de publicação, um trecho do conteúdo e, no rodapé, o botão de curtir e o total de comentários.

| Funcionalidade | Endpoint |
| ------------------------------------------------------- | --------------------------- |
| Lista de todas as postagens, com próxima página ao rolar | `GET /posts?cursor=&limit=` |
| Busca por palavra-chave no título, no conteúdo ou no autor | `GET /posts/search?term=` |
| Atualizar ao puxar a lista e ao voltar para a tela       | `GET /posts` ou a busca ativa |
| Curtir (coração), ver quem curtiu (número) e abrir os comentários (balão) direto do cartão | `POST` / `DELETE /posts/:id/like`, folhas de curtidas e comentários |

A busca é feita 500 ms depois que o usuário para de digitar, como no frontend web. Como a API não pagina a busca, todos os resultados chegam de uma vez. Apagar o termo volta para a lista paginada. Se a próxima página falhar, o erro aparece no rodapé da lista com **Tentar novamente**.

O botão **Criar** (com +) aparece no título da aba apenas para professores e administradores. Avisos de sucesso (*Postagem publicada.*) somem sozinhos depois de 4 segundos. **Sair** fica na aba Conta.

## Leitura de postagem

Tocar em um item da lista abre `/posts/:id`, que busca a postagem em `GET /posts/:id` e mostra título, autor, data de publicação, data da última atualização (quando houver) e o conteúdo completo, que pode ser selecionado e copiado.

Para quem pode alterar a postagem, o cabeçalho tem **Editar**; excluir fica no fim da edição. A tela recarrega ao voltar para ela, para refletir uma edição. Se a postagem não existir mais (`404`), a tela oferece **Voltar para a lista**; em outras falhas, **Tentar novamente**.

### Curtidas e comentários

Abaixo do conteúdo ficam o coração, o total de curtidas, o balão de comentários e o link **Ver os N comentários** (ou **Adicionar um comentário**). Os comentários não aparecem na leitura: abrem numa folha, como no Instagram. Todos os perfis curtem e comentam.

| Funcionalidade | Endpoint |
| --- | --- |
| Tocar no coração: curtir e descurtir | `POST` / `DELETE /posts/:id/like` |
| Tocar no número de curtidas: folha com quem curtiu | `GET /posts/:id/likes?cursor=` |
| Tocar no balão ou no link: folha de comentários, dos mais recentes para os mais antigos, com a próxima página ao rolar | `GET /posts/:id/comments?cursor=` |
| Publicar um comentário (até 1000 caracteres) | `POST /posts/:id/comments` |
| Excluir um comentário, depois de confirmar | `DELETE /posts/:id/comments/:commentId` |

- As folhas são rotas `formSheet` nativas (`posts/[id]/comments` e `posts/[id]/likes`), abertas do feed ou da leitura, com altura fixa (`lib/sheets.ts`) e arrastar para fechar.
- O campo de comentário fica fixo no pé da folha: começa com uma linha, cresce com o texto até cinco e depois rola por dentro. O botão de enviar fica dentro do campo e só fica vermelho com texto. No iOS a folha sobe com o teclado sozinha; no Android, `useSheetKeyboardInset` soma ao recuo a parte que o teclado ainda cobriria.
- A curtida muda na hora e volta ao estado anterior, com um aviso, se a API falhar (`useLikeToggle`).
- Ao fechar uma folha aberta do feed, só os totais daquela postagem são atualizados (`GET /posts/:id`), sem recarregar a lista. Na leitura, a postagem recarrega ao voltar.
- **Excluir** aparece só para quem escreveu o comentário e para o administrador, a mesma regra da API (`features/comments/permissions.ts`). O autor da postagem não apaga comentários dos outros.
- O código fica em `src/features/comments/` e `src/features/likes/`; o coração e o balão ficam em `src/components/post-engagement.tsx`.

## Criação de postagem

Professores e administradores abrem `/posts/new` (em modal) pelo botão **Criar** da aba Posts ou da aba Gerenciar. O formulário (`components/post-form.tsx`) é compartilhado com a edição e tem:

- **Título**, de 3 a 255 caracteres, em até 3 linhas; o contador *n/255* aparece a partir de 200 caracteres;
- **Conteúdo**, com pelo menos 10 caracteres.

No topo fica o campo **Autor** (`components/author-field.tsx`), que não é digitado: a API define o autor pelo login.

- **Professor:** o campo mostra o próprio nome (lido com `GET /users/:id`), só para leitura, e a postagem sai em nome dele.
- **Administrador:** tocar no campo abre a folha **Autor** (`/posts/author-picker`, nativa), com *Você* e a lista de professores, com busca e próxima página ao rolar. A escolha volta para o formulário nos parâmetros da rota (`authorId` e `authorName`), sem perder o que foi digitado, e vai no corpo de `POST /posts` como `authorId`. O aviso passa a ser *Postagem publicada em nome de Fulano.*
- Se o professor escolhido deixou de existir, a API responde `422` e o formulário mostra *O autor escolhido não é mais um professor cadastrado. Escolha outro.*

As regras de título e conteúdo são as mesmas da API e são verificadas antes do envio, ignorando espaços nas pontas; cada erro aparece abaixo do seu campo. Ao publicar (`POST /posts`), o app volta para a lista, que recarrega e mostra *Postagem publicada.* Em caso de erro, o formulário continua preenchido.

Sair é pelo **Cancelar** do cabeçalho (iOS) ou pelo voltar (Android). Com algo digitado, o app pergunta *Descartar alterações?* antes de fechar, e o arrasto do modal fica desligado (`hooks/use-discard-guard.ts`, com `usePreventRemove`). O mesmo vale para a edição de postagem e para o cadastro e a edição de pessoas.

## Edição de postagem

`/posts/:id/edit` é aberta pelo botão **Editar** da leitura da postagem ou da aba Gerenciar. Ela carrega os dados atuais com `GET /posts/:id`, preenche o mesmo `PostForm` da criação e salva com `PUT /posts/:id`. **Salvar alterações** só fica ativo depois de alguma alteração. O campo **Autor** mostra quem escreveu, só para leitura: o autor não muda na edição. Quando o administrador edita a postagem de outra pessoa, o campo avisa *Você está editando a postagem de outra pessoa. O autor não muda.*

No fim da tela fica a zona **Excluir postagem** (`DELETE /posts/:id`, com confirmação). Depois de excluir, o app volta para a lista de onde a leitura ou a edição foi aberta e mostra *Postagem excluída.*

O botão **Editar** só aparece para quem pode alterar a postagem (`canModifyPost`): administradores, em qualquer postagem, e professores, nas próprias. Um professor que abra a edição de uma postagem alheia por link direto vê *Você não tem permissão para editar esta postagem.*, sem o formulário. A API faz a mesma verificação e responde `403`.

Ao salvar, o app volta para a tela que abriu a edição, que recarrega e mostra *Postagem atualizada.* Sem histórico (link direto), vai para as abas, que ficam por baixo de toda tela interna (`unstable_settings.anchor`). Os dados são carregados só ao abrir a tela, para não apagar o que já foi digitado ao voltar do segundo plano.

O aviso de sucesso passa de uma tela para outra por `lib/notice.ts`: a tela que fecha chama `setFlashNotice`, e a que volta a aparecer chama `takeFlashNotice` ao receber foco.

## Aba Gerenciar

Disponível para professores e administradores.

| Funcionalidade | Endpoint |
| ------------------------------------------------------- | --------------------------- |
| Lista de postagens, com próxima página ao rolar          | `GET /posts?cursor=&limit=&authorId=` |
| Busca, a mesma da aba Posts                              | `GET /posts/search?term=`   |
| Atualizar ao puxar a lista e ao voltar para a tela       | `GET /posts`                |
| **Criar**, no cabeçalho                                  | `POST /posts`               |
| Ler, tocando no cartão                                   | `GET /posts/:id`            |
| Excluir, com confirmação                                 | `DELETE /posts/:id`         |
| Editar, que abre `/posts/:id/edit`                       | `GET /posts/:id` e `PUT /posts/:id` |

Os botões seguem a regra da API: administradores alteram qualquer postagem, e professores, apenas as próprias. Por isso:

- **Professor:** vê só as postagens que publicou (`GET /posts?authorId=<id>`, filtrado e paginado pela API). Não há filtro nem selo *Você*, porque a lista inteira é dele. A busca da API (`/posts/search`) procura em todas as postagens, então o app mostra só os resultados dele.
- **Administrador:** vê todas. O ícone de filtro ao lado da busca abre a folha **Autor** (*Todas as postagens* ou *Só as minhas*). Com o filtro ligado, aparece a etiqueta *Autor: só as minhas ×* abaixo da busca e um ponto no ícone; o selo *Você* marca as postagens dele na lista completa.

O filtro vive no parâmetro da rota (`/admin?author=me`), então a folha só escolhe e volta com `router.dismissTo`.

## Aba Conta

Mostra nome, e-mail, perfil e foto (`GET /users/:id` na própria conta, que a API libera para qualquer perfil, estudante inclusive) e a validade da sessão. Tocar no avatar abre o menu **Foto de perfil**: *Escolher da galeria* (recorte quadrado) e, havendo foto, *Remover foto*. O fluxo (`features/profile/avatar.ts`) é: `POST /users/:id/avatar/upload` (autorização), envio do arquivo direto ao MinIO (`POST multipart`) e `PUT /users/:id/avatar` (confirmação). A foto aparece no avatar da Conta, das listas de Pessoas e dos cartões de postagem (`authorAvatarUrl`); sem foto, ou se ela não carregar, valem as iniciais. Aceita JPEG, PNG e WebP de até 5 MB. Usa `expo-image-picker`, que só pede acesso à galeria (o app não usa a câmera). O endereço do MinIO que a API devolve costuma ser `localhost`; o app o troca pelo host que usa para a API (`reachableUrl` em `lib/api.ts`), então funciona também no celular físico e no emulador do Android sem configurar nada. Veja `S3_PUBLIC_URL` no README da raiz. Professores e administradores têm **Editar meus dados** (`/account/edit`, `GET` e `PUT /users/:id` na própria conta, sem exclusão). **Sair** pede confirmação.

## Filtros (folha nativa)

O ícone de filtro ao lado da busca (`FilterButton`) abre uma folha nativa (`presentation: 'formSheet'`, do tamanho do conteúdo, sem biblioteca de bottom sheet). A folha (`FilterSheet`) lista uma escolha por grupo e tem **Limpar** e **Aplicar**; as escolhas só valem ao aplicar. Elas voltam para a aba como parâmetro da rota (`/people?role=STUDENT`), e a aba mostra a etiqueta do filtro ativo (`FilterTag`, com × para remover) e um ponto no ícone. Hoje há dois filtros: perfil em Pessoas e autor em Gerenciar (só administrador).

## Melhorias futuras

Fora do escopo dos requisitos, mas no radar:

- Tela de abertura nativa (splash) com a identidade do app: depende do plugin `expo-splash-screen`, que não está instalado (ver `docs/design-system.md`).

## Como adicionar telas

- **Exclusiva de professores e administradores** (criar ou editar post): crie o arquivo em `src/app/(app)/(teacher)/` e declare a tela dentro do `Stack.Protected` de `src/app/(app)/_layout.tsx`.
- **Para qualquer usuário logado** (leitura de posts): crie o arquivo em `src/app/(app)/`.
- **Nova aba**: crie o arquivo em `src/app/(app)/(tabs)/` e o `NativeTabs.Trigger` em `(tabs)/_layout.tsx`.

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

Duas diferenças em relação ao enunciado, combinadas com o professor e explicadas em [`docs/requisitos/fase-4-mobile.md`](../docs/requisitos/fase-4-mobile.md): só o administrador cadastra, edita e exclui contas (o enunciado diz professores), e professores e estudantes ficam numa lista só, com filtro por perfil, em vez de páginas separadas.

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
- Aba **Pessoas** com uma lista única, cada cartão com o selo do perfil acima do nome e, para o administrador, os três pontinhos, que abrem uma folha nativa com **Editar** e **Excluir** (requisito 7; `/people/:id/actions`), busca por e-mail e filtro por perfil na folha (*Todos*, *Professores*, *Estudantes* e, só para o administrador, *Administradores*). Listagem por `GET /users`, com `role`, `limit=20`, `cursor` e `search` opcionais; sem `role`, o professor recebe professores e estudantes e o administrador, todos. Filtro, busca e paginação são feitos no backend.
- **Adicionar** abre o cadastro em modal. O campo **Perfil**, no topo, lista *Estudante*, *Professor* e *Administrador*, cada um com uma frase sobre o que pode fazer; já vem o perfil do filtro ativo e, sem filtro, *Estudante* (o de menor acesso).
- Consulta de usuários para edição com `GET /users/:id`.
- Atualização da listagem após operações.
- Exclusão pelo **Excluir** da folha de três pontinhos ou pela tela de edição, sempre com confirmação (`Alert` nativo), por `DELETE /users/:id`. Pela folha, ela fecha, a lista recarrega e o aviso aparece no topo da aba; se a API recusar (por exemplo, `409`), o erro aparece na própria folha.
- Cancelamento da exclusão sem modificar os dados.
- Pessoa inexistente: a edição oferece **Voltar** em vez de tentar de novo. Nenhum perfil exclui a própria conta.
- Bloqueio da exclusão da própria conta, para qualquer perfil.
- Mensagens de sucesso e erro após as operações, incluindo conflito `409` na exclusão de usuário com postagens.

### Arquitetura

Os componentes compartilhados estão em `src/features/people/`:

| Arquivo | Responsabilidade |
|---|---|
| `api.ts` | Comunicação com a API |
| `use-people.ts` | Estado da lista (paginação, busca, atualização) usada pela aba Pessoas |
| `person-form.tsx` | Cadastro |
| `person-edit.tsx` | Edição e exclusão |
| `form-fields.tsx` | Campos reutilizáveis |
| `form-validation.ts` | Validação dos formulários |
| `permissions.ts` | Controle de permissões |

**Permissões:** `ADMIN` e `TEACHER` veem a lista de professores e estudantes (a aba **Pessoas**); só o `ADMIN` cadastra, edita e exclui contas. Para o professor, a aba não tem **Adicionar**, os cartões não têm os três pontinhos nem abrem a edição, e as rotas `/people/create` e `/people/:id/edit` o levam de volta aos posts. O professor edita apenas a própria conta, em **Editar meus dados** (aba Conta). `STUDENT` não acessa nada disso. A API valida as permissões em cada operação (`POST` e `DELETE /users` só para `ADMIN`; `PUT /users/:id` para `ADMIN` ou a própria conta).

### Testes e validação

**Testes automatizados** (`npm test`, com chamadas HTTP simuladas): 238 testes em 17 suítes, além de typecheck e ESLint, rodados também na CI (`.github/workflows/mobile-ci.yml`). Para pessoas, cobrem:

- listagem, busca, filtro por perfil e próxima página pelo cursor, sem repetir pessoas;
- cadastro com o campo **Perfil**, edição e exclusão pela folha de três pontinhos e pela tela de edição, com confirmação e cancelamento;
- erro `409` ao excluir quem tem postagens e bloqueio da exclusão da própria conta;
- o que cada perfil vê: o administrador gerencia; o professor só consulta; o estudante não abre a aba.

**Validação contra a API real** (15/11/2026, API e PostgreSQL no Docker, com uma conta e postagens descartáveis, apagadas no fim). As 20 verificações passaram:

| Verificação | Resultado |
|---|---|
| Administrador cadastra professor | `201` |
| Professor cadastra conta, edita conta alheia ou exclui conta | `403` |
| Estudante lista contas | `403` |
| Professor lista contas: só professores e estudantes; pedir administradores | `200` sem administradores; `403` |
| Paginação real de `GET /users` (`limit=1` e `cursor`) | Segunda página com outra pessoa |
| Paginação real de comentários | Duas páginas, sem repetir |
| Excluir conta que tem postagens | `409` |
| Professor publica; estudante tenta publicar | `201`; `403` |
| Professor publica em nome de outro; administrador em nome de estudante | `403`; `422` |
| Administrador publica em nome de professor | `201`, com o professor como autor |
| Professor edita ou exclui postagem alheia; administrador edita qualquer uma | `403`; `200` |

**Testes manuais**: a equipe testou no emulador Android (Pixel 6), com API e PostgreSQL ativos, o login, a listagem de professores e estudantes, o cadastro, a edição com a atualização na lista, a exclusão com confirmação, o cancelamento da exclusão e as mensagens de sucesso.

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
