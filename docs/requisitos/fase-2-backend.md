# Fase 2: back-end em Node.js

Código em [`api/`](../../api). Detalhes de uso no [README da raiz](../../README.md) e no Swagger (`/docs`).

## Enunciado original

> **O problema**
>
> Atualmente, a maioria de professores e professoras da rede pública de educação não têm plataformas onde postar suas aulas e transmitir conhecimento para alunos e alunas de forma prática, centralizada e tecnológica.
>
> Para solucionar esse problema, nós utilizamos os conhecimentos adquiridos na última fase para auxiliar a nossa comunidade com a criação de uma aplicação de blogging dinâmico, utilizando a plataforma OutSystems. A plataforma foi um sucesso e, agora, nossa aplicação escalará para um panorama nacional. Portanto, precisaremos refatorar nosso Back-end, utilizando a plataforma de desenvolvimento node.js, e precisaremos persistir esses dados em um banco de dados, seja ele SQL ou NoSQL, conforme a decisão do grupo.
>
> **Requisitos funcionais**
>
> Os seguintes endpoints REST serão implementados para a aplicação de blogging:
>
> - **GET /posts - Lista de Posts:** Este endpoint permitirá aos alunos visualizarem uma lista de todos os posts disponíveis na página principal.
> - **GET /posts/:id - Leitura de Posts:** Ao acessar este endpoint com um ID específico de post, os alunos poderão ler o conteúdo completo desse post.
> - **POST /posts - Criação de Postagens:** Permite que docentes criem novas postagens. Este endpoint aceitará dados como título, conteúdo e autor no corpo da requisição.
> - **PUT /posts/:id - Edição de Postagens:** Usado para editar uma postagem existente. Professores deverão fornecer o ID do post que desejam editar e os novos dados no corpo da requisição.
> - **GET /posts - Listagem de Todas as Postagens:** Este endpoint permitirá que professores vejam todas as postagens criadas, facilitando a gestão do conteúdo.
> - **DELETE /posts/:id - Exclusão de Postagens:** Permite que docentes excluam uma postagem específica, usando o ID do post como parâmetro.
> - **GET /posts/search - Busca de Posts:** Este endpoint permitirá a busca de posts por palavras-chave. Os usuários poderão passar uma query string com o termo de busca e o sistema retornará uma lista de posts que contêm esse termo no título ou conteúdo.
>
> **Requisitos técnicos**
>
> - **Back-end em Node.js:** Implementação do servidor usando Node.js. Utilização de frameworks como Express para roteamento e middleware.
> - **Persistência de Dados:** Utilização de um sistema de banco de dados (por exemplo, MongoDB, PostgreSQL). Implementação de modelos de dados adequados para as postagens.
> - **Containerização com Docker:** Desenvolvimento e implantação usando contêineres Docker para garantir consistência entre ambientes de desenvolvimento e produção.
> - **Automação com GitHub Actions:** Configuração de workflows de CI/CD para automação de testes e deploy.
> - **Documentação:** Documentação técnica detalhada do projeto, incluindo setup inicial, arquitetura da aplicação e guia de uso das APIs.
> - **Cobertura de Testes:** O projeto deve garantir que pelo menos 20% do código seja coberto por testes unitários. Essa medida é essencial para assegurar a qualidade e a estabilidade do código, especialmente em funções críticas como criação, edição e exclusão de postagens.
>
> **Entrega**
>
> - **Código-Fonte:** repositório GitHub com o código do projeto, incluindo Dockerfiles e scripts de CI/CD.
> - **Apresentação Gravada:** demonstração em vídeo do funcionamento da aplicação, incluindo detalhes técnicos de implementação.
> - **Documentação:** documento descrevendo a arquitetura do sistema, uso da aplicação e relato de experiências e desafios enfrentados pela equipe durante o desenvolvimento, esta documentação deve ser entregue em arquivo de texto da preferência do grupo ou no readme do github.

## Como foi atendido

| Requisito | Situação | Observação |
|---|---|---|
| `GET /posts` | Atendido | Paginação por cursor (`limit`, `cursor`) e filtro opcional `authorId` |
| `GET /posts/:id` | Atendido | Pública; traz também curtidas e comentários |
| `POST /posts` | Atendido, com mudança | O autor vem do token (ver abaixo) |
| `PUT /posts/:id` | Atendido | O professor edita as próprias postagens; o administrador, qualquer uma |
| `GET /posts` para professores | Atendido | O mesmo endpoint da lista; o filtro `authorId` mostra só as de um autor |
| `DELETE /posts/:id` | Atendido | Mesma regra da edição |
| `GET /posts/search` | Atendido, ampliado | Busca no título, no conteúdo e também no nome do autor |
| Node.js com framework | Atendido | TypeScript com Fastify (o enunciado cita Express como exemplo) |
| Banco de dados | Atendido | PostgreSQL, com migrations (`node-pg-migrate`) |
| Docker | Atendido | `Dockerfile` da API e `docker-compose.yaml` na raiz |
| GitHub Actions | Atendido | CI em pull requests e CD com a imagem da API publicada no GHCR |
| Documentação | Atendido | README da raiz e Swagger/OpenAPI |
| Cobertura mínima de 20% | Atendido | Testes com Jest; ver a seção de testes do README da raiz |

## Mudanças em relação ao enunciado

### Autor da postagem

**Pedido:** `POST /posts` aceita título, conteúdo e autor no corpo.

**Feito:** o autor é quem está logado, lido do token JWT. O corpo aceita `authorId` opcional, e com regras:

- Ausente, ou igual a quem está logado: a postagem sai em nome de quem está logado.
- Outra pessoa: só o administrador pode informar, e ela precisa ser um professor. O professor recebe `403`. Um `authorId` que não seja de um professor cadastrado recebe `422`.

**Por quê:** com o autor livre no corpo, qualquer professor publicaria em nome de outro. O administrador publicar em nome de um professor segue a orientação do professor da fase 4 (ver o [README desta pasta](README.md)).

### Autenticação e perfis

O enunciado não pede autenticação, mas diz que docentes criam, editam e excluem, e que alunos leem. Para garantir isso, a API tem login com JWT (`POST /login`) e três perfis: `STUDENT`, `TEACHER` e `ADMIN`. As permissões ficam em `api/src/lib/authorization.ts` e nos casos de uso.

### O que foi além do enunciado

Estes recursos foram adicionados nas fases seguintes, para o frontend e o aplicativo:

- Gerenciamento de contas (`/users`), usado pelos requisitos 5 a 8 da fase 4.
- Foto de perfil, guardada no MinIO (compatível com S3).
- Curtidas e comentários nas postagens.
