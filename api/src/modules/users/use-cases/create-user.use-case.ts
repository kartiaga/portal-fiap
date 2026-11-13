import { hashPassword } from '@/lib/password'
import type { User } from '../entities/user'
import type { UserRepository } from '../repositories/user.repository'
import type { ProfileRepository } from '@/modules/profiles/repositories/profile.repository'
import { assertCanManage, type UserActor } from '../access'

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async handler(
    user: User & { name: string },
    actor: UserActor,
  ): Promise<User | undefined> {
    assertCanManage(actor, user.role)
    const hashedPassword = await hashPassword(user.password)

    const createdUser = await this.userRepository.create({
      ...user,
      password: hashedPassword,
    })

    if (!createdUser?.id) {
      throw new Error('Failed to create user')
    }

    await this.profileRepository.create({
      userId: createdUser.id,
      name: user.name,
    })

    return createdUser
  }
}
