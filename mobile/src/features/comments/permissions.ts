import type { SessionUser } from '@/lib/jwt';

// Mesma regra de DeleteCommentUseCase na API: só quem escreveu ou o administrador.
// O autor da postagem não apaga comentários dos outros.
export function canDeleteComment(user: SessionUser | null, comment: { authorId: string }): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.id === comment.authorId;
}
