import { assertCanManage, type UserActor } from '../access'
import { UserError } from '../errors'
import type { UserRepository } from '../repositories/user.repository'

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async handler(id: string, actor: UserActor): Promise<void> {
    const existing = await this.userRepository.findById(id)
    if (!existing) throw new UserError('User not found', 404)
    assertCanManage(actor, existing.role)
    if (actor.role === 'TEACHER' && actor.id === id) {
      throw new UserError('Cannot delete your own account', 403)
    }
    const result = await this.userRepository.deleteWithoutPosts(id)
    if (result === 'has_posts') throw new UserError('User has posts', 409)
    if (result === 'missing') throw new UserError('User not found', 404)
  }
}
