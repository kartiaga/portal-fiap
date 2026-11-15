import type { AvatarStorage } from '@/lib/avatar'
import type { ProfileRepository } from '@/modules/profiles/repositories/profile.repository'
import { assertCanManage, type UserActor } from '../access'
import { UserError } from '../errors'
import type { UserRepository } from '../repositories/user.repository'

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly avatars?: {
      profiles: Pick<ProfileRepository, 'findAvatarKey'>
      storage: AvatarStorage
    },
  ) {}

  async handler(id: string, actor: UserActor): Promise<void> {
    assertCanManage(actor)
    const existing = await this.userRepository.findById(id)
    if (!existing) throw new UserError('User not found', 404)
    if (actor.id === id) {
      throw new UserError('Cannot delete your own account', 403)
    }
    // O perfil some junto com o usuário, então a chave precisa ser lida antes.
    const avatarKey = await this.avatars?.profiles.findAvatarKey(id)
    const result = await this.userRepository.deleteWithoutPosts(id)
    if (result === 'has_posts') throw new UserError('User has posts', 409)
    if (result === 'missing') throw new UserError('User not found', 404)
    if (avatarKey)
      await this.avatars?.storage.remove(avatarKey).catch(() => undefined)
  }
}
