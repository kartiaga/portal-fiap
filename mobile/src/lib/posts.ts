import { apiFetch } from './api';

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostsPage = {
  items: Post[];
  nextCursor: string | null;
  hasMore: boolean;
};

const PAGE_SIZE = 20;

export function getPosts(cursor?: string | null): Promise<PostsPage> {
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) query.set('cursor', cursor);
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

export async function deletePost(id: string): Promise<void> {
  await apiFetch(`/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
