import type { Page } from '@/hooks/use-paged-list';
import { apiFetch } from '@/lib/api';

/** Uma pessoa que curtiu a postagem. */
export type Liker = {
  userId: string;
  name?: string | null;
  /** Endereço público da foto de perfil; `null` ou ausente sem foto. */
  avatarUrl?: string | null;
  likedAt: string;
};

const PAGE_SIZE = 30;

/** Quem curtiu, das curtidas mais recentes para as mais antigas. */
export function getLikers(postId: string, cursor?: string | null): Promise<Page<Liker>> {
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) query.set('cursor', cursor);
  return apiFetch<Page<Liker>>(`/posts/${encodeURIComponent(postId)}/likes?${query.toString()}`);
}
