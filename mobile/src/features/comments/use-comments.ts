import { useCallback } from 'react';

import { usePagedList } from '@/hooks/use-paged-list';

import { createComment, deleteComment, getComments, type Comment } from './api';

const MESSAGES = {
  load: 'Não foi possível carregar os comentários.',
  loadMore: 'Não foi possível carregar mais comentários.',
};

const commentId = (comment: Comment) => comment.id;

/**
 * Comentários de uma postagem: primeira página, próxima página ao rolar, envio e exclusão. O
 * comentário novo entra no topo (a lista vai do mais recente para o mais antigo).
 */
export function useComments(postId: string) {
  const fetchPage = useCallback((cursor: string | null) => getComments(postId, cursor), [postId]);
  const list = usePagedList(fetchPage, commentId, MESSAGES);
  const { setItems } = list;

  /** Publica e põe no topo. Falhas sobem para quem chamou, que mantém o texto no campo. */
  const add = useCallback(
    async (content: string) => {
      const created = await createComment(postId, content);
      setItems((current) => [created, ...current.filter((comment) => comment.id !== created.id)]);
      return created;
    },
    [postId, setItems],
  );

  /** Exclui e tira da lista. Falhas sobem para quem chamou. */
  const remove = useCallback(
    async (comment: Comment) => {
      await deleteComment(postId, comment.id);
      setItems((current) => current.filter((item) => item.id !== comment.id));
    },
    [postId, setItems],
  );

  /** Tira da lista sem chamar a API (o comentário já não existia). */
  const drop = useCallback(
    (id: string) => setItems((current) => current.filter((item) => item.id !== id)),
    [setItems],
  );

  return { ...list, comments: list.items, add, remove, drop };
}
