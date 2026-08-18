# Testes para Posts — Criação e Edição

Este documento descreve os testes criados para validar as novas funcionalidades de criação e edição de posts, tanto no backend quanto no frontend.

## Backend — Testes da API

### 1. UpdatePostUseCase (`update-post.use-case.test.ts`)

Testes unitários para o use-case de atualização de posts:

- ✅ Atualiza um post com título e conteúdo
- ✅ Retorna `undefined` se o post não for encontrado
- ✅ Passa apenas título e conteúdo para o repositório (não inclui authorId)

**Rodar testes:**
```bash
npm test -- update-post.use-case.test.ts
```

---

### 2. Update Post Controller (`update-post-controller.test.ts`)

Testes unitários para o controller HTTP de atualização:

- ✅ Atualiza um post com sucesso (HTTP 200)
- ✅ Retorna erro 404 se o post não for encontrado
- ✅ Trata IDs com aspas (sanitização)

**Rodar testes:**
```bash
npm test -- update-post-controller.test.ts
```

---

### 3. Posts DTOs (`posts-dto.test.ts`)

Testes de validação dos esquemas Zod para criação e atualização:

**createPostSchema:**
- ✅ Valida payload válido
- ✅ Rejeita título faltando
- ✅ Rejeita conteúdo faltando
- ✅ Rejeita título com menos de 3 caracteres
- ✅ Rejeita conteúdo com menos de 10 caracteres

**updatePostSchema:**
- ✅ Valida payload válido
- ✅ Rejeita valores com tamanho insuficiente
- ✅ Aceita tamanhos exatos mínimos (3 e 10 caracteres)
- ✅ Remove espaços em branco (trim)

**Rodar testes:**
```bash
npm test -- posts-dto.test.ts
```

---

### 4. Posts Authorization (`posts-authorization.test.ts`)

Testes de controle de acesso para criar/editar posts:

- ✅ TEACHER pode criar/editar posts
- ✅ ADMIN pode criar/editar posts
- ✅ STUDENT é bloqueado (403 Forbidden)
- ✅ authorId é extraído do JWT token (request.user.sub)

**Rodar testes:**
```bash
npm test -- posts-authorization.test.ts
```

---

## Frontend — Testes das Server Actions

O frontend foi desenvolvido com Next.js, que ainda não possui Jest configurado no projeto. As server actions (`createPostAction`, `updatePostAction`, `fetchPostByIdAction`) podem ser testadas manualmente seguindo os passos abaixo ou com um setup futuro de testes E2E.

### Testes manuais — Criação de Post

1. **Logar como Professor**
   ```
   Email: teacher@fiap.com.br
   Senha: 12345678
   ```

2. **Acessar a tela de criação**
   - Clique em "Nova publicação" no menu ou na home
   - Ou acesse diretamente: `http://localhost:3000/posts/new`

3. **Validações de formulário**
   - Tente deixar o título vazio → erro "Preencha título e conteúdo"
   - Tente um título com 1 caractere → erro "O título deve ter pelo menos 3 caracteres"
   - Tente conteúdo com menos de 10 caracteres → erro "O conteúdo deve ter pelo menos 10 caracteres"

4. **Criação bem-sucedida**
   - Preencha um título com ≥3 caracteres
   - Preencha conteúdo com ≥10 caracteres
   - Clique em "Publicar postagem"
   - Deve aparecer mensagem de sucesso: "Publicação criada com sucesso."

5. **Verificar no banco de dados**
   ```bash
   psql -h localhost -p 5431 -U postgres -d portal_fiap \
     -c "SELECT id, title, content, author_id FROM posts ORDER BY created_at DESC LIMIT 1;"
   ```

---

### Testes manuais — Edição de Post

1. **Obtenha o ID de um post existente**
   ```bash
   psql -h localhost -p 5431 -U postgres -d portal_fiap \
     -c "SELECT id, title FROM posts LIMIT 1;"
   ```

2. **Acesse a tela de edição**
   - Substitua `{id}` pelo ID obtido:
   ```
   http://localhost:3000/posts/{id}/edit
   ```

3. **Verificar pré-preenchimento**
   - O formulário deve mostrar o título e conteúdo atuais
   - Se o post não existir, deve exibir "Publicação não encontrada"

4. **Atualizar o post**
   - Altere o título e/ou conteúdo
   - Clique em "Salvar alterações"
   - Deve aparecer mensagem de sucesso: "Publicação atualizada com sucesso."

5. **Verificar no banco de dados**
   ```bash
   psql -h localhost -p 5431 -U postgres -d portal_fiap \
     -c "SELECT id, title, content, updated_at FROM posts WHERE id = '{id}';"
   ```

---

### Testes manuais — Controle de acesso

1. **Logar como Aluno**
   ```
   Email: student@fiap.com.br
   Senha: 12345678
   ```

2. **Tentar acessar `/posts/new`**
   - A página deve redirecionar para `/` (home)
   - O botão "Nova publicação" não deve aparecer no menu

3. **Logar como Administrador**
   ```
   Email: admin@fiap.com.br
   Senha: 12345678
   ```

4. **Verificar acesso**
   - Deve conseguir acessar `/posts/new` sem redirecionamento
   - O botão "Nova publicação" deve aparecer no menu

---

## Rodar todos os testes

```bash
npm test
```

Resultado esperado: todos os testes devem passar ✅

---

## Cobertura de testes

Para gerar relatório de cobertura:

```bash
npm test -- --coverage
```

---

## Integração contínua

Os testes executam automaticamente em pull requests via GitHub Actions (`.github/workflows/run_tests_on_pull_request.yml`). Todos os testes devem passar antes de fazer merge.

