import type { PaginatedResult, PaginationParams } from '@/lib/pagination'
import type { User } from '../entities/user'
import type { UserRepository } from '../repositories/user.repository'

export type UserListItem = {
  id: string
  email: string
  role: User['role']
  createdAt?: Date | undefined
  updatedAt?: Date | undefined
}

export type GetUsersParams = PaginationParams & {
  search?: string | undefined
}

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async handler(
    params: GetUsersParams = {},
  ): Promise<PaginatedResult<UserListItem>> {
    const result = await this.userRepository.findPaginated(params)

    return {
      ...result,
      items: result.items.map((user) => ({
        id: user.id!,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    }
  }
}
