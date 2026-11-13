import { UserRole } from './entities/user'
import { UserError } from './errors'

export type UserActor = { id: string; role: UserRole }

export function assertCanManage(actor: UserActor, targetRole: UserRole): void {
  if (actor.role === UserRole.ADMIN) return
  if (actor.role !== UserRole.TEACHER || targetRole === UserRole.ADMIN) {
    throw new UserError('Forbidden', 403)
  }
}

export function assertCanList(actor: UserActor, role?: UserRole): void {
  if (actor.role === UserRole.ADMIN) return
  if (actor.role !== UserRole.TEACHER || !role || role === UserRole.ADMIN) {
    throw new UserError('Forbidden', 403)
  }
}
