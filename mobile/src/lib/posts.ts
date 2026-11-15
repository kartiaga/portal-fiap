import { apiFetch } from './api';

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string | null;
  /** Endereço público da foto do autor; `null` ou ausente sem foto. */
  authorAvatarUrl?: string | null;
  /**
   * Curtidas, comentários e se o usuário conectado curtiu. Vêm nas leituras (lista, busca e por
   * id), mas não nas respostas de criação e edição: ausentes, valem 0 e `false`.
   */
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Curtidas de uma postagem depois de curtir ou descurtir. */
export type LikeSummary = {
  likeCount: number;
  likedByMe: boolean;
};

export type PostsPage = {
  items: Post[];
  nextCursor: string | null;
  hasMore: boolean;
};

/** Campos que o usuário informa. O autor é definido pela API a partir do token. */
export type PostInput = {
  title: string;
  content: string;
};

const PAGE_SIZE = 20;

/** `authorId` pede só as postagens desse autor (filtro feito pela API, com paginação normal). */
export function getPosts(cursor?: string | null, authorId?: string): Promise<PostsPage> {
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) query.set('cursor', cursor);
  if (authorId) query.set('authorId', authorId);
  return apiFetch<PostsPage>(`/posts?${query.toString()}`);
}

export function getPost(id: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${encodeURIComponent(id)}`);
}

// A busca da API procura no título, no conteúdo e no nome do autor, e não é paginada.
export function searchPosts(term: string): Promise<Post[]> {
  const query = new URLSearchParams({ term });
  return apiFetch<Post[]>(`/posts/search?${query.toString()}`);
}

export function createPost(input: PostInput): Promise<Post> {
  return apiFetch<Post>('/posts', { method: 'POST', body: JSON.stringify(input) });
}

export function updatePost(id: string, input: PostInput): Promise<Post> {
  return apiFetch<Post>(`/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deletePost(id: string): Promise<void> {
  await apiFetch(`/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Curtir e descurtir são idempotentes na API e devolvem o total atualizado.
export function likePost(id: string): Promise<LikeSummary> {
  return apiFetch<LikeSummary>(`/posts/${encodeURIComponent(id)}/like`, { method: 'POST' });
}

export function unlikePost(id: string): Promise<LikeSummary> {
  return apiFetch<LikeSummary>(`/posts/${encodeURIComponent(id)}/like`, { method: 'DELETE' });
}
