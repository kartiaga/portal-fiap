import type { UserRole } from './jwt';

// Mesma regra de requireTeacherOrAdmin na API (api/src/lib/authorization.ts).
export function canManagePosts(role: UserRole | undefined): boolean {
  return role === 'TEACHER' || role === 'ADMIN';
}
