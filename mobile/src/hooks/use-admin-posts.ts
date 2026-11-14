import { useCallback, useRef, useState } from 'react';

import { usePostsFeed } from '@/hooks/use-posts-feed';
import { ApiError, getErrorMessage } from '@/lib/api';
import { deletePost, type Post } from '@/lib/posts';

/**
 * Lista da aba Gerenciar: a mesma do feed (com busca) mais a exclusão direto do cartão.
 * `authorId` limita a lista às postagens de um autor (o professor só vê as próprias).
 */
export function useAdminPosts(term: string, authorId?: string) {
  const feed = usePostsFeed(term, authorId);
  const { showNotice, clearNotice, dropPost } = feed;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleting = useRef(false);

  const remove = useCallback(
    async (post: Post) => {
      if (deleting.current) return;
      deleting.current = true;
      setDeletingId(post.id);
      clearNotice();

      try {
        await deletePost(post.id);
        dropPost(post.id);
        showNotice({ kind: 'success', text: 'Postagem excluída.' });
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          dropPost(post.id);
          showNotice({ kind: 'error', text: 'Esta postagem já havia sido excluída.' });
        } else if (error instanceof ApiError && error.status === 403) {
          showNotice({ kind: 'error', text: 'Você não tem permissão para excluir esta postagem.' });
        } else {
          showNotice({
            kind: 'error',
            text: getErrorMessage(error, 'Não foi possível excluir a postagem.'),
          });
        }
      } finally {
        deleting.current = false;
        setDeletingId(null);
      }
    },
    [clearNotice, dropPost, showNotice],
  );

  return { ...feed, deletingId, remove };
}
