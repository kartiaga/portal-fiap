import { useCallback, useRef, useState } from 'react';

import { useNotice } from '@/hooks/use-notice';
import { getErrorMessage } from '@/lib/api';
import { getPosts, searchPosts, type Post } from '@/lib/posts';

/**
 * Estado de uma lista de postagens (aba Posts e aba Gerenciar). Sem termo, usa a listagem
 * paginada; com termo, usa a busca da API, que devolve todos os resultados de uma vez.
 * Com `authorId`, a lista traz só as postagens desse autor: a listagem filtra na API e a busca
 * (que a API não filtra por autor) é filtrada aqui, já que devolve tudo de uma vez.
 */
export function usePostsFeed(term: string, authorId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [appliedTerm, setAppliedTerm] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Falha ao buscar a próxima página: aparece no rodapé da lista, com "Tentar novamente". */
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const { notice, showNotice, clearNotice } = useNotice();

  // Só a requisição mais recente pode alterar a lista. Assim, o resultado de uma busca
  // antiga não substitui o da busca que o usuário acabou de digitar, e uma resposta atrasada
  // não traz de volta uma postagem já excluída.
  const latestRequest = useRef(0);

  const reload = useCallback(
    async ({ showRefreshing = false } = {}) => {
      const request = ++latestRequest.current;
      setLoadingMore(false);
      setLoadMoreError(null);
      setRefreshing(showRefreshing);
      clearNotice();

      try {
        if (term) {
          const found = await searchPosts(term);
          if (request !== latestRequest.current) return;
          setPosts(authorId ? found.filter((post) => post.authorId === authorId) : found);
          setNextCursor(null);
        } else {
          const page = await getPosts(null, authorId);
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
    [term, authorId, clearNotice],
  );

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || refreshing) return;

    const request = ++latestRequest.current;
    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const page = await getPosts(nextCursor, authorId);
      if (request !== latestRequest.current) return;
      setPosts((current) => {
        const knownIds = new Set(current.map((post) => post.id));
        return [...current, ...page.items.filter((post) => !knownIds.has(post.id))];
      });
      setNextCursor(page.hasMore ? page.nextCursor : null);
    } catch (error) {
      if (request !== latestRequest.current) return;
      setLoadMoreError(getErrorMessage(error, 'Não foi possível carregar mais postagens.'));
    }

    setLoadingMore(false);
  }, [nextCursor, loadingMore, refreshing, authorId]);

  /** Tira uma postagem da lista na hora (depois de excluí-la) e descarta respostas em andamento. */
  const dropPost = useCallback((postId: string) => {
    latestRequest.current += 1;
    setRefreshing(false);
    setLoadingMore(false);
    setPosts((current) => current.filter((item) => item.id !== postId));
  }, []);

  return {
    posts,
    appliedTerm,
    loaded,
    refreshing,
    loadingMore,
    loadError,
    loadMoreError,
    notice,
    showNotice,
    clearNotice,
    reload,
    loadMore,
    dropPost,
  };
}
