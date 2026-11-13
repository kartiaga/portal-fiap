import type { PaginatedResult, PaginationParams } from '@/lib/pagination'
import type { User, UserRole } from '../entities/user'
import type { UserRepository } from '../repositories/user.repository'
import { assertCanList, type UserActor } from '../access'

export type UserListItem = {
  id: string
  email: string
  role: User['role']
  name: string | null
  createdAt?: Date | undefined
  updatedAt?: Date | undefined
}

export type GetUsersParams = PaginationParams & {
  search?: string | undefined
  role?: UserRole | undefined
}

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async handler(
    actor: UserActor,
    params: GetUsersParams = {},
  ): Promise<PaginatedResult<UserListItem>> {
    assertCanList(actor, params.role)
    const result = await this.userRepository.findPaginated(params)

    return {
      ...result,
      items: result.items.map((user) => ({
        id: user.id!,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    }
  }
}
