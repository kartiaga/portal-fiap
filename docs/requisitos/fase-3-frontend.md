# Fase 3: front-end web em React

Código em [`frontend/`](../../frontend). Detalhes no [README do frontend](../../frontend/README.md) e no [README da raiz](../../README.md).

## Enunciado original

> **O problema**
>
> Após o sucesso do desenvolvimento da aplicação de blogging dinâmico utilizando a plataforma OutSystems e a implementação do back-end em Node.js, chegou a hora de criarmos uma interface gráfica robusta, intuitiva e eficiente para esta aplicação. Este desafio focará em desenvolver o front-end, proporcionando uma experiência de usuário excelente tanto para professores(as) quanto para estudantes.
>
> **Objetivo**
>
> Desenvolver uma interface gráfica para a aplicação de blogging utilizando React. A aplicação deve ser responsiva, acessível e fácil de usar, permitindo aos docentes e alunos(as) interagir com os diversos endpoints REST já implementados no back-end.
>
> **Requisitos funcionais**
>
> A interface gráfica deve incluir as seguintes páginas e funcionalidades:
>
> 1. **Página principal (Lista de posts)**
>    - Exibir uma lista de todos os posts disponíveis.
>    - Cada item da lista deve mostrar o título, autor e uma breve descrição do post.
>    - Incluir um campo de busca para filtrar posts por palavras-chave.
> 2. **Página de leitura de post**
>    - Exibir o conteúdo completo de um post selecionado.
>    - Permitir comentários nos posts (opcional).
> 3. **Página de criação de postagens**
>    - Formulário para que docentes possam criar postagens.
>    - Campos para título, conteúdo e autor.
>    - Botão para enviar o post ao servidor.
> 4. **Página de edição de postagens**
>    - Formulário para que os(as) professores(as) possam editar postagens existentes.
>    - Carregar os dados atuais do post para edição.
>    - Botão para salvar as alterações.
> 5. **Página administrativa**
>    - Exibir uma lista de todas as postagens, com opções para editar e excluir cada post.
>    - Botões para editar e excluir postagens específicas.
> 6. **Autenticação e autorização**
>    - Implementar login para professores.
>    - Garantir que apenas usuários autenticados possam acessar as páginas de criação, edição e administração de postagens.
>
> **Requisitos técnicos**
>
> 1. **Desenvolvimento em React**
>    - Utilizar React para desenvolver a interface gráfica.
>    - Utilização de hooks e componentes funcionais.
> 2. **Estilização e responsividade**
>    - Utilizar Styled Components ou outro método de estilização.
>    - Garantir que a aplicação seja responsiva, funcionando bem em dispositivos móveis e desktops.
> 3. **Integração com Back-End**
>    - Realizar chamadas aos endpoints REST para obter, criar, editar e excluir posts.
>    - Gerenciar o estado da aplicação com ferramentas como Context API ou Redux (opcional).
> 4. **Documentação**
>    - Documentação técnica detalhada do front-end no README do repositório, incluindo setup inicial, arquitetura da aplicação e guia de uso.
>
> **Entrega**
>
> 1. Código-fonte: repositório GitHub com o código do projeto, incluindo Dockerfiles e scripts de CI/CD.
> 2. Apresentação gravada: demonstração em vídeo do funcionamento da aplicação, incluindo detalhes técnicos de implementação.
> 3. Documentação: documento descrevendo a arquitetura do sistema, uso da aplicação e relato de experiências e desafios enfrentados pela equipe durante o desenvolvimento.

## Como foi atendido

| Requisito | Situação | Observação |
|---|---|---|
| 1. Lista de posts com busca | Atendido | `/posts`, com paginação; a busca procura no título, no conteúdo e no autor |
| 2. Leitura de post | Atendido | `/posts/[id]` |
| 2. Comentários (opcional) | Não implementado no web | Existem na API e no aplicativo mobile |
| 3. Criação de postagens | Atendido, com mudança | `/posts/new`; o autor vem do login (ver abaixo) |
| 4. Edição de postagens | Atendido | `/posts/[id]/edit`, com os dados atuais carregados |
| 5. Página administrativa | Atendido | `/posts/admin`, com **Editar** e **Excluir** em cada postagem |
| 6. Login e rotas protegidas | Atendido, ampliado | Login para todos os perfis; `src/proxy.ts` redireciona quem não está logado |
| React com hooks | Atendido | Next.js 16 com React 19 (App Router) e componentes funcionais |
| Estilização e responsividade | Atendido | Tailwind CSS 4; design system em `frontend/docs/design-system.html` |
| Integração com o back-end | Atendido | Server actions chamando os endpoints REST de posts e de login |
| Documentação | Atendido | READMEs do frontend e da raiz |

## Mudanças em relação ao enunciado

### Campo "autor" na criação

**Pedido:** campos para título, conteúdo e autor.

**Feito:** o formulário web tem título e conteúdo; o autor é registrado pela API a partir do login. O aplicativo mobile, feito depois, mostra o campo **Autor** só para leitura e deixa o administrador escolher um professor (ver [fase 4](fase-4-mobile.md)).

**Por quê:** um campo de autor livre deixaria um professor publicar em nome de outro.

### Login para todos os perfis

**Pedido:** login para professores.

**Feito:** professores, alunos e administradores entram com e-mail e senha. Alunos só veem as postagens; os controles de criar, editar e excluir aparecem apenas para professores e administradores.

**Por quê:** a validação de permissão de alunos pedida na fase 4 depende de eles estarem identificados.

### Páginas a mais

O web também tem `/users/list` e `/users/new`, para o administrador consultar e cadastrar contas.
