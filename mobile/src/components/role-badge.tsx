import { Badge, type BadgeTone } from '@/components/badge';
import type { UserRole } from '@/lib/jwt';
import { ROLE_LABEL } from '@/lib/roles';

const ROLE_TONE: Record<UserRole, BadgeTone> = {
  ADMIN: 'brand',
  TEACHER: 'info',
  STUDENT: 'success',
};

/** Selo do perfil. O nome vem escrito, então a cor não é o único sinal. */
export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge label={ROLE_LABEL[role]} tone={ROLE_TONE[role]} />;
}
