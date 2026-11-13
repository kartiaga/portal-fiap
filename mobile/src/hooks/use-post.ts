import { useCallback, useRef, useState } from 'react';

import { ApiError, getErrorMessage } from '@/lib/api';
import { getPost, type Post } from '@/lib/posts';

/** Carrega uma postagem pelo id, para as telas de leitura e de edição. */
export function usePost(id: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const request = ++latestRequest.current;

    try {
      const found = await getPost(id);
      if (request !== latestRequest.current) return;
      setPost(found);
      setNotFound(false);
      setLoadError(null);
    } catch (error) {
      if (request !== latestRequest.current) return;
      if (error instanceof ApiError && error.status === 404) {
        setPost(null);
        setNotFound(true);
        setLoadError('Postagem não encontrada. Ela pode ter sido excluída.');
      } else {
        setLoadError(getErrorMessage(error, 'Não foi possível carregar a postagem.'));
      }
    }

    setLoaded(true);
  }, [id]);

  return { post, loaded, notFound, loadError, reload };
}
