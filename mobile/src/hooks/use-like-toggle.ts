import { useCallback, useRef } from 'react';

import { getErrorMessage } from '@/lib/api';
import { likePost, unlikePost, type LikeSummary, type Post } from '@/lib/posts';

type LikeTarget = Pick<Post, 'id' | 'likeCount' | 'likedByMe'>;

/**
 * Curtir e descurtir com resposta imediata: `apply` recebe o novo estado na hora, depois o total
 * que a API devolveu ou, se ela falhar, o estado anterior (e `onError`, a mensagem). Enquanto
 * uma postagem espera a resposta, novos toques nela são ignorados.
 */
export function useLikeToggle(
  apply: (postId: string, summary: LikeSummary) => void,
  onError: (message: string) => void,
) {
  const pending = useRef(new Set<string>());

  return useCallback(
    async (post: LikeTarget) => {
      if (pending.current.has(post.id)) return;
      pending.current.add(post.id);

      const previous = { likeCount: post.likeCount ?? 0, likedByMe: post.likedByMe ?? false };
      const liked = !previous.likedByMe;
      apply(post.id, {
        likedByMe: liked,
        likeCount: Math.max(0, previous.likeCount + (liked ? 1 : -1)),
      });

      try {
        apply(post.id, liked ? await likePost(post.id) : await unlikePost(post.id));
      } catch (error) {
        apply(post.id, previous);
        onError(
          getErrorMessage(
            error,
            liked ? 'Não foi possível curtir a postagem.' : 'Não foi possível remover a curtida.',
          ),
        );
      } finally {
        pending.current.delete(post.id);
      }
    },
    [apply, onError],
  );
}
