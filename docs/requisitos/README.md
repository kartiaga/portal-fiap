# Requisitos do Tech Challenge

Esta pasta guarda os enunciados originais do Tech Challenge da FIAP (Pós Tech Full Stack Development) e o que o projeto fez de diferente, com o motivo de cada mudança. Ela serve para quem for avaliar ou continuar o projeto conferir o que foi pedido e o que foi entregue.

| Fase | Entrega | Enunciado e mudanças |
|---|---|---|
| 1 | Aplicação de blogging na plataforma low-code OutSystems | Não faz parte deste repositório |
| 2 | Back-end em Node.js (`api/`) | [fase-2-backend.md](fase-2-backend.md) |
| 3 | Front-end web em React (`frontend/`) | [fase-3-frontend.md](fase-3-frontend.md) |
| 4 | Aplicativo mobile em React Native (`mobile/`) | [fase-4-mobile.md](fase-4-mobile.md) |

Os enunciados foram transcritos dos PDFs entregues pela FIAP, sem alterar o texto. Só a numeração da fase 4, que saiu embaralhada na extração do PDF, foi refeita.

## Orientação do professor sobre os requisitos

Em 15/11/2026, o grupo perguntou ao professor da fase 4 se podia manter soluções diferentes do texto em requisitos que, num sistema real, criariam falhas de permissão ou telas duplicadas. A resposta, resumida:

- Os requisitos priorizam praticar rotas, telas e CRUDs separados, e não modelar um sistema real. As críticas fazem sentido para um sistema real.
- Editar contas de outras pessoas pode ficar só com o administrador.
- O autor da postagem deve ser quem está logado. O administrador pode criar postagens em nome de outro professor.
- A recomendação é não remover campos dos formulários.
- Juntar telas (por exemplo, professores e alunos numa lista só) é permitido, desde que o README explique em detalhe, para que outro avaliador não fique com dúvidas.
- O grupo tem liberdade para melhorar o que foi pedido, desde que documente as alterações.

As mudanças descritas nos arquivos de cada fase seguem essa orientação.

## Resumo das mudanças

| Pedido no enunciado | O que o projeto faz | Por quê |
|---|---|---|
| Autor informado no corpo de `POST /posts` (fase 2) e campo "autor" no formulário (fases 3 e 4) | O autor é quem está logado, lido do token. No app, o campo **Autor** mostra esse nome só para leitura; o administrador pode escolher um professor | Um campo livre deixaria qualquer professor publicar em nome de outro. Segue a orientação do professor |
| Professores cadastram, editam e excluem professores e alunos (fase 4, req. 5 a 8) | Só o administrador cadastra, edita e exclui contas. O professor consulta a lista e edita apenas a própria conta | Editar uma conta inclui trocar e-mail e senha: qualquer professor poderia tomar a conta de outro. Segue a orientação do professor |
| Páginas separadas para professores e para alunos (fase 4, req. 8) | Uma lista de pessoas com filtro por perfil e um cadastro com o campo **Perfil** | As telas seriam iguais. Juntar foi permitido pelo professor, com documentação |
| Login para professores (fases 3 e 4) | Login para todos os perfis | O próprio enunciado da fase 4 pede validar a permissão de alunos, o que exige que eles entrem; curtidas e comentários também |
| Perfis de professor e aluno | Há também o perfil administrador | Alguém precisa gerenciar as contas sem dar esse poder a todos os professores |
