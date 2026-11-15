import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '@/lib/api';

export type Page<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

type Messages = {
  /** Falha ao carregar a primeira página. */
  load: string;
  /** Falha ao carregar a próxima página (aparece no rodapé da lista). */
  loadMore: string;
};

/**
 * Lista paginada por cursor com "carregar mais" (comentários, curtidas). Só a requisição mais
 * recente altera a lista, como em `usePostsFeed`. `fetchPage` precisa ser estável (useCallback).
 */
export function usePagedList<T extends object>(
  fetchPage: (cursor: string | null) => Promise<Page<T>>,
  getId: (item: T) => string,
  messages: Messages,
) {
  const [items, setItems] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const request = ++latestRequest.current;
    setLoadingMore(false);
    setLoadMoreError(null);

    try {
      const page = await fetchPage(null);
      if (request !== latestRequest.current) return;
      setItems(page.items);
      setNextCursor(page.hasMore ? page.nextCursor : null);
      setLoadError(null);
    } catch (error) {
      if (request !== latestRequest.current) return;
      setLoadError(getErrorMessage(error, messages.load));
    }

    setLoaded(true);
  }, [fetchPage, messages.load]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;

    const request = ++latestRequest.current;
    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const page = await fetchPage(nextCursor);
      if (request !== latestRequest.current) return;
      setItems((current) => {
        const knownIds = new Set(current.map(getId));
        return [...current, ...page.items.filter((item) => !knownIds.has(getId(item)))];
      });
      setNextCursor(page.hasMore ? page.nextCursor : null);
    } catch (error) {
      if (request !== latestRequest.current) return;
      setLoadMoreError(getErrorMessage(error, messages.loadMore));
    }

    setLoadingMore(false);
  }, [fetchPage, getId, nextCursor, loadingMore, messages.loadMore]);

  return { items, setItems, hasMore: nextCursor !== null, loaded, loadError, loadingMore, loadMoreError, reload, loadMore };
}
