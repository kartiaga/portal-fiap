import { hashPassword } from '@/lib/password'
import { assertCanEdit, type UserActor } from '../access'
import { UserError } from '../errors'
import type {
  PublicUser,
  UserRepository,
} from '../repositories/user.repository'

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async handler(
    id: string,
    data: { email: string; name: string; password?: string | undefined },
    actor: UserActor,
  ): Promise<PublicUser> {
    // A permissão vem antes da consulta: quem não pode editar não descobre se o id existe.
    assertCanEdit(actor, id)
    const existing = await this.userRepository.findById(id)
    if (!existing) throw new UserError('User not found', 404)
    const password = data.password
      ? await hashPassword(data.password)
      : undefined
    const updated = await this.userRepository.update(id, { ...data, password })
    if (!updated) throw new UserError('User not found', 404)
    return updated
  }
}
