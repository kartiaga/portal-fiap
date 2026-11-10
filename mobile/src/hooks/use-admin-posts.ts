import { useCallback, useRef, useState } from 'react';

import { ApiError, getErrorMessage } from '@/lib/api';
import { deletePost, getPosts, type Post } from '@/lib/posts';

export type Notice = { kind: 'success' | 'error'; text: string };

export function useAdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Só a requisição mais recente pode alterar a lista. Assim, uma resposta atrasada
  // não desfaz uma atualização nem traz de volta uma postagem já excluída.
  const latestRequest = useRef(0);
  const deleting = useRef(false);

  const reload = useCallback(async ({ showRefreshing = false } = {}) => {
    const request = ++latestRequest.current;
    setLoadingMore(false);
    setRefreshing(showRefreshing);

    try {
      const page = await getPosts();
      if (request !== latestRequest.current) return;
      setPosts(page.items);
      setNextCursor(page.hasMore ? page.nextCursor : null);
      setLoadError(null);
    } catch (error) {
      if (request !== latestRequest.current) return;
      setLoadError(getErrorMessage(error, 'Não foi possível carregar as postagens.'));
    }

    setLoaded(true);
    setRefreshing(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || refreshing) return;

    const request = ++latestRequest.current;
    setLoadingMore(true);

    try {
      const page = await getPosts(nextCursor);
      if (request !== latestRequest.current) return;
      setPosts((current) => {
        const knownIds = new Set(current.map((post) => post.id));
        return [...current, ...page.items.filter((post) => !knownIds.has(post.id))];
      });
      setNextCursor(page.hasMore ? page.nextCursor : null);
    } catch (error) {
      if (request !== latestRequest.current) return;
      setNotice({
        kind: 'error',
        text: getErrorMessage(error, 'Não foi possível carregar mais postagens.'),
      });
    }

    setLoadingMore(false);
  }, [nextCursor, loadingMore, refreshing]);

  const remove = useCallback(async (post: Post) => {
    if (deleting.current) return;
    deleting.current = true;
    setDeletingId(post.id);
    setNotice(null);

    const removeFromList = () => {
      latestRequest.current += 1;
      setRefreshing(false);
      setLoadingMore(false);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    };

    try {
      await deletePost(post.id);
      removeFromList();
      setNotice({ kind: 'success', text: 'Postagem excluída.' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        removeFromList();
        setNotice({ kind: 'error', text: 'Esta postagem já havia sido excluída.' });
      } else if (error instanceof ApiError && error.status === 403) {
        setNotice({ kind: 'error', text: 'Você não tem permissão para excluir esta postagem.' });
      } else {
        setNotice({
          kind: 'error',
          text: getErrorMessage(error, 'Não foi possível excluir a postagem.'),
        });
      }
    } finally {
      deleting.current = false;
      setDeletingId(null);
    }
  }, []);

  return {
    posts,
    loaded,
    refreshing,
    loadingMore,
    deletingId,
    loadError,
    notice,
    reload,
    loadMore,
    remove,
  };
}
