import { apiFetch } from '@/lib/api';

/** Mesmo limite da API (api/src/modules/posts/dto/comment.dto.ts). */
export const COMMENT_MAX_LENGTH = 1000;

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string | null;
  /** Endereço público da foto do autor; `null` ou ausente sem foto. */
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
};

export type CommentsPage = {
  items: Comment[];
  nextCursor: string | null;
  hasMore: boolean;
};

const PAGE_SIZE = 20;

function commentsPath(postId: string): string {
  return `/posts/${encodeURIComponent(postId)}/comments`;
}

/** Comentários de uma postagem, dos mais recentes para os mais antigos. */
export function getComments(postId: string, cursor?: string | null): Promise<CommentsPage> {
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) query.set('cursor', cursor);
  return apiFetch<CommentsPage>(`${commentsPath(postId)}?${query.toString()}`);
}

export function createComment(postId: string, content: string): Promise<Comment> {
  return apiFetch<Comment>(commentsPath(postId), {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await apiFetch(`${commentsPath(postId)}/${encodeURIComponent(commentId)}`, { method: 'DELETE' });
}
