import { assertCanManage, type UserActor } from '../access'
import { UserError } from '../errors'
import type {
  PublicUser,
  UserRepository,
} from '../repositories/user.repository'

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async handler(id: string, actor: UserActor): Promise<PublicUser> {
    const user = await this.userRepository.findById(id)
    if (!user) throw new UserError('User not found', 404)
    assertCanManage(actor, user.role)
    return user
  }
}
