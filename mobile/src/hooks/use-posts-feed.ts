import { useCallback, useRef, useState } from 'react';

import type { Notice } from '@/hooks/use-admin-posts';
import { getErrorMessage } from '@/lib/api';
import { getPosts, searchPosts, type Post } from '@/lib/posts';

/**
 * Estado da lista de postagens da tela inicial. Sem termo, usa a listagem paginada;
 * com termo, usa a busca da API, que devolve todos os resultados de uma vez.
 */
export function usePostsFeed(term: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [appliedTerm, setAppliedTerm] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Só a requisição mais recente pode alterar a lista. Assim, o resultado de uma busca
  // antiga não substitui o da busca que o usuário acabou de digitar.
  const latestRequest = useRef(0);

  const reload = useCallback(
    async ({ showRefreshing = false } = {}) => {
      const request = ++latestRequest.current;
      setLoadingMore(false);
      setRefreshing(showRefreshing);
      setNotice(null);

      try {
        if (term) {
          const found = await searchPosts(term);
          if (request !== latestRequest.current) return;
          setPosts(found);
          setNextCursor(null);
        } else {
          const page = await getPosts();
          if (request !== latestRequest.current) return;
          setPosts(page.items);
          setNextCursor(page.hasMore ? page.nextCursor : null);
        }
        setAppliedTerm(term);
        setLoadError(null);
      } catch (error) {
        if (request !== latestRequest.current) return;
        setLoadError(
          getErrorMessage(
            error,
            term ? 'Não foi possível buscar as postagens.' : 'Não foi possível carregar as postagens.',
          ),
        );
      }

      setLoaded(true);
      setRefreshing(false);
    },
    [term],
  );

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

  return {
    posts,
    appliedTerm,
    loaded,
    refreshing,
    loadingMore,
    loadError,
    notice,
    reload,
    loadMore,
  };
}
