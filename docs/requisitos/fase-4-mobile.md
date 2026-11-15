# Fase 4: aplicativo mobile em React Native

Código em [`mobile/`](../../mobile). Detalhes de uso e arquitetura no [README do mobile](../../mobile/README.md).

## Enunciado original

> **O problema**
>
> Após o sucesso do desenvolvimento da aplicação de blogging dinâmico com a implementação do back-end em Node.js e o front-end utilizando React, chegou a hora de criarmos uma interface gráfica mobile robusta, intuitiva e eficiente para esta aplicação. Esta atividade focará em desenvolver o front-end mobile utilizando React Native, proporcionando uma experiência de usuário excelente tanto para docentes quanto para estudantes.
>
> **Objetivo**
>
> Desenvolver uma interface gráfica para a aplicação de blogging utilizando React Native. A aplicação deve ser acessível e fácil de usar, permitindo que os docentes e alunos(as) possam interagir com os diversos endpoints REST já implementados no back-end.
>
> **Requisitos funcionais**
>
> A interface gráfica deve incluir as seguintes páginas e funcionalidades:
>
> 1. **Página principal (lista de posts)**
>    - Exibir uma lista de todos os posts disponíveis.
>    - Cada item da lista deve mostrar o título, autor e uma breve descrição do post.
>    - Incluir um campo de busca para filtrar posts por palavras-chave.
> 2. **Página de leitura de post**
>    - Exibir o conteúdo completo de um post selecionado.
>    - Permitir comentários nos posts (opcional).
> 3. **Página de criação de postagens**
>    - Formulário para que professores possam criar postagens.
>    - Campos para título, conteúdo e autor.
>    - Botão para enviar o post ao servidor.
> 4. **Página de edição de postagens**
>    - Formulário para que docentes possam editar postagens existentes.
>    - Carregar os dados atuais do post para edição.
>    - Botão para salvar as alterações.
> 5. **Página de criação de professores**
>    - Formulário para que professores possam cadastrar outros professores.
>    - Botão para enviar o post ao servidor.
> 6. **Página de edição de professores**
>    - Formulário para que professores possam editar docentes já cadastrados.
>    - Botão para salvar as alterações.
> 7. **Página de listagem de professores**
>    - Página para listagem paginada dos professores e, nas tabelas para cada professor, teremos um botão de editar que leva para a página de edição e um botão de excluir que vai deletar o docente do sistema.
> 8. **Replique os requisitos 5, 6 e 7 para estudantes**
>    - Seguindo o padrão de páginas administrativas feitas para professores, faça o mesmo para alunos.
> 9. **Página administrativa**
>    - Exibir uma lista de todas as postagens, com opções para editar e excluir cada post.
>    - Botões para editar e excluir postagens específicas.
> 10. **Autenticação e autorização**
>     - Implementar login para professores.
>     - Garantir que apenas usuários autenticados possam acessar as páginas de criação, edição e administração de postagens.
>
> **Requisitos técnicos**
>
> 1. **Desenvolvimento em React Native**
>    - Utilizar React Native para desenvolver a interface gráfica do aplicativo.
>    - Utilização de hooks e componentes funcionais.
> 2. **Estilização**
>    - Estilizar o projeto de acordo com layout definido pelo grupo.
> 3. **Integração com Back-End**
>    - Realizar chamadas aos endpoints REST para obter, criar, editar e excluir posts.
>    - Realizar chamadas aos endpoints REST para obter, criar, editar e excluir alunos.
>    - Realizar chamadas aos endpoints REST para obter, criar, editar e excluir professores.
>    - Realizar chamadas aos endpoints REST para autenticação.
>    - Validar permissão para professores e alunos, onde professores podem modificar/criar um post e os alunos podem apenas visualizar.
>    - Gerenciar o estado da aplicação com ferramentas como Context API ou Redux (opcional).
> 4. **Documentação**
>    - Documentação técnica detalhada do mobile no README do repositório, incluindo setup inicial, arquitetura da aplicação e guia de uso.
>
> **Entrega**
>
> 1. Código-Fonte: repositório GitHub com o código do projeto.
> 2. Apresentação gravada: demonstração em vídeo do funcionamento da aplicação, incluindo detalhes técnicos de implementação. O tempo máximo do vídeo é 15min.
> 3. Documentação: documento descrevendo a arquitetura do sistema, uso da aplicação e relato de experiências e desafios enfrentados pela equipe durante o desenvolvimento.

## Como foi atendido

| Requisito | Onde está no app | Situação |
|---|---|---|
| 1. Lista de posts com busca | Aba **Posts**: título, autor, resumo e busca por título, conteúdo ou autor; próxima página ao rolar | Atendido |
| 2. Leitura de post | Tela da postagem, aberta pelo cartão | Atendido |
| 2. Comentários (opcional) | Folha de comentários (e curtidas), aberta pela postagem ou pelo cartão | Atendido |
| 3. Criação de postagens | **Criar**, nas abas Posts e Gerenciar: campos **Autor**, **Título** e **Conteúdo** e o botão **Publicar postagem** | Atendido, com mudança no autor |
| 4. Edição de postagens | **Editar**, na postagem e na aba Gerenciar: dados atuais carregados e **Salvar alterações** | Atendido |
| 5. Cadastro de professores | **Adicionar**, na aba Pessoas, com o campo **Perfil** | Atendido, só para o administrador |
| 6. Edição de professores | Tocando no cartão, ou em **Editar** no menu de três pontinhos de cada pessoa | Atendido, só para o administrador |
| 7. Listagem de professores | Aba **Pessoas**: lista paginada, filtro por perfil e, em cada pessoa, um menu de três pontinhos com **Editar** e **Excluir** | Atendido, com a exclusão só para o administrador |
| 8. O mesmo para estudantes | A mesma lista, o mesmo cadastro e a mesma edição, com o perfil escolhido | Atendido, com as telas juntas |
| 9. Página administrativa | Aba **Gerenciar**: postagens com **Editar** e **Excluir** em cada uma | Atendido |
| 10. Login e rotas protegidas | Tela de login; rotas internas protegidas por `Stack.Protected` e checagem de perfil | Atendido, para todos os perfis |
| React Native com hooks | Expo SDK 58, expo-router, só componentes funcionais | Atendido |
| Estilização | Design system próprio em [`mobile/docs/design-system.md`](../../mobile/docs/design-system.md), com tema claro e escuro | Atendido |
| REST de posts | `GET`, `POST`, `PUT` e `DELETE /posts`, mais busca, curtidas e comentários | Atendido |
| REST de alunos e professores | `GET`, `POST`, `PUT` e `DELETE /users`, com filtro `role` | Atendido |
| REST de autenticação | `POST /login`, com o token guardado no `expo-secure-store` | Atendido |
| Permissões por perfil | Botões e abas aparecem conforme o perfil; a API recusa o resto com `403` | Atendido |
| Estado global (opcional) | Context API (`SessionProvider`) | Atendido |
| Documentação | [README do mobile](../../mobile/README.md) e seção do mobile no README da raiz | Atendido |

## Mudanças em relação ao enunciado

As mudanças seguem a orientação do professor da fase 4, resumida no [README desta pasta](README.md).

### Requisito 3: campo "autor"

**Pedido:** campos para título, conteúdo e autor.

**Feito:** o formulário tem o campo **Autor**, que não é digitado.

- **Professor:** o campo mostra o nome dele, só para leitura. A postagem sai sempre em nome de quem está logado.
- **Administrador:** o campo abre a folha **Autor**, com "Você" e a lista de professores (com busca). A postagem pode sair em nome do professor escolhido.
- **Edição:** o campo mostra o autor da postagem, só para leitura. O autor não muda na edição.

**Por quê:** um campo livre deixaria qualquer professor publicar em nome de outro. O professor orientou a usar o autor logado e deixar o administrador escolher outro professor, sem remover o campo.

### Requisitos 5 a 8: quem gerencia as contas

**Pedido:** professores cadastram, editam e excluem professores e alunos.

**Feito:** só o administrador cadastra, edita e exclui contas. O professor vê a lista de professores e estudantes, sem os botões de gerenciar, e edita apenas a própria conta na aba **Conta**. A API aplica a mesma regra.

**Por quê:** editar uma conta inclui trocar e-mail e senha, então qualquer professor poderia tomar a conta de outro. O professor orientou a deixar isso só com o administrador.

### Requisito 8: telas de professores e alunos juntas

**Pedido:** replicar para alunos as páginas de cadastro, edição e listagem de professores.

**Feito:** uma aba **Pessoas** com todos os perfis e um filtro por perfil (*Todos*, *Professores*, *Estudantes* e, para o administrador, *Administradores*). O cadastro tem o campo **Perfil**, que começa no filtro ativo ou, sem filtro, em *Estudante*. A edição e a exclusão são as mesmas para qualquer perfil.

**Por quê:** as telas de professores e de alunos seriam idênticas. Com uma lista só, o administrador também consegue cadastrar outro administrador. O professor permitiu juntar as telas, desde que documentado.

### Requisito 7: "tabelas"

**Pedido:** em cada professor da tabela, um botão de editar e um de excluir.

**Feito:** no celular, a lista usa cartões em vez de tabela. Os dois botões ficam num menu: os três pontinhos de cada cartão abrem uma folha nativa com o nome da pessoa, **Editar** e **Excluir**. Tocar no cartão também abre a edição. Excluir pede confirmação; depois, a folha fecha e a lista recarrega com o aviso. A própria conta não tem **Excluir**: ninguém exclui a própria conta.

**Por quê:** dois botões em cada cartão pesam numa lista longa e deixam o "Excluir" ao alcance de um toque acidental enquanto a lista rola. O menu de três pontinhos é o padrão do celular para ações de um item, e as duas ações continuam a um toque do cartão.

### Requisito 9: postagens visíveis na aba Gerenciar

**Pedido:** lista de todas as postagens, com editar e excluir.

**Feito:** o administrador vê todas as postagens, com filtro *Só as minhas*. O professor vê só as próprias, porque só pode editar e excluir essas; mostrar as dos outros seria mostrar botões que a API recusa.

### Requisito 10: login

**Pedido:** login para professores.

**Feito:** professores, estudantes e administradores entram no app. Estudantes leem, curtem e comentam, mas não veem as abas Gerenciar e Pessoas nem os botões de criar, editar e excluir postagens.

**Por quê:** o requisito técnico 3 pede validar a permissão de alunos, o que exige que eles estejam identificados.

### O que foi além do enunciado

- Curtidas e lista de quem curtiu.
- Exclusão de comentários: cada pessoa exclui os próprios; o administrador, qualquer um.
- Foto de perfil na aba **Conta**, onde professores e administradores também editam os próprios dados.
- Perfil administrador, com o filtro de autor na aba Gerenciar.
