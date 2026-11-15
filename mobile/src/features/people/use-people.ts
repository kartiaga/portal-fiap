import { useCallback, useRef, useState } from 'react';

import { listPeoplePage, personError, type ListedRole, type Person } from './api';

/**
 * Lista paginada de pessoas (de um perfil ou de todos), com busca por nome ou e-mail. Só a requisição mais recente
 * altera a lista: trocar de aba ou digitar rápido não deixa uma resposta velha por cima.
 */
export function usePeople(role: ListedRole | undefined, search: string) {
  const [items, setItems] = useState<Person[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Falha ao buscar a próxima página: aparece no rodapé da lista, com "Tentar novamente". */
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const latestRequest = useRef(0);
  const key = `${role}:${search}`;

  const reload = useCallback(
    async ({ showRefreshing = false } = {}) => {
      const request = ++latestRequest.current;
      setLoadingMore(false);
      setLoadMoreError(null);
      setRefreshing(showRefreshing);

      try {
        const page = await listPeoplePage(role, null, search || undefined);
        if (request !== latestRequest.current) return;
        setItems(page.items);
        setCursor(page.hasMore ? page.nextCursor : null);
        setError(null);
      } catch (caught) {
        if (request !== latestRequest.current) return;
        setError(personError(caught, 'load'));
      }

      setAppliedKey(`${role}:${search}`);
      setLoaded(true);
      setRefreshing(false);
    },
    [role, search],
  );

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore || refreshing) return;

    const request = ++latestRequest.current;
    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const page = await listPeoplePage(role, cursor, search || undefined);
      if (request !== latestRequest.current) return;
      setItems((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...page.items.filter((item) => !known.has(item.id))];
      });
      setCursor(page.hasMore ? page.nextCursor : null);
    } catch (caught) {
      if (request !== latestRequest.current) return;
      setLoadMoreError(personError(caught, 'load'));
    }

    setLoadingMore(false);
  }, [cursor, loadingMore, refreshing, role, search]);

  return {
    items,
    loaded,
    /** true enquanto a lista na tela ainda é de outro perfil ou de outra busca. */
    stale: loaded && appliedKey !== key,
    refreshing,
    loadingMore,
    error,
    loadMoreError,
    reload,
    loadMore,
  };
}
