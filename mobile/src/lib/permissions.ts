import type { SessionUser, UserRole } from './jwt';

// Mesma regra de requireTeacherOrAdmin na API (api/src/lib/authorization.ts).
export function canManagePosts(role: UserRole | undefined): boolean {
  return role === 'TEACHER' || role === 'ADMIN';
}

// Mesma regra dos casos de uso de edição e exclusão de postagens na API.
export function canModifyPost(user: SessionUser | null, post: { authorId: string }): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || (user.role === 'TEACHER' && user.id === post.authorId);
}
