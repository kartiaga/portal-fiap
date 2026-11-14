import { UserRole } from './entities/user'
import { UserError } from './errors'

export type UserActor = { id: string; role: UserRole }

/** Ver uma conta: o administrador vê todas; o professor vê professores e estudantes. */
export function assertCanView(actor: UserActor, targetRole: UserRole): void {
  if (actor.role === UserRole.ADMIN) return
  if (actor.role !== UserRole.TEACHER || targetRole === UserRole.ADMIN) {
    throw new UserError('Forbidden', 403)
  }
}

/** Cadastrar e excluir contas é atribuição só do administrador. */
export function assertCanManage(actor: UserActor): void {
  if (actor.role !== UserRole.ADMIN) {
    throw new UserError('Forbidden', 403)
  }
}

/**
 * Editar uma conta: o administrador edita qualquer uma; os demais, só a própria (nome, e-mail
 * e senha), nunca a de outra pessoa.
 */
export function assertCanEdit(actor: UserActor, targetId: string): void {
  if (actor.role === UserRole.ADMIN || actor.id === targetId) return
  throw new UserError('Forbidden', 403)
}

/** O professor lista professores e estudantes, nunca administradores. */
export function assertCanList(actor: UserActor, role?: UserRole): void {
  if (actor.role === UserRole.ADMIN) return
  if (actor.role !== UserRole.TEACHER || role === UserRole.ADMIN) {
    throw new UserError('Forbidden', 403)
  }
}

/** Perfis que a listagem devolve quando nenhum perfil foi pedido (administrador: todos). */
export function listableRoles(actor: UserActor): UserRole[] | undefined {
  return actor.role === UserRole.ADMIN
    ? undefined
    : [UserRole.TEACHER, UserRole.STUDENT]
}
