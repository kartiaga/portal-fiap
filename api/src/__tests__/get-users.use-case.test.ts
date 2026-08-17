import type { UserRepository } from '@/modules/users/repositories/user.repository'
import { UserRole } from '@/modules/users/entities/user'
import { GetUsersUseCase } from '@/modules/users/use-cases/get-users.use-case'

describe('GetUsersUseCase', () => {
  it('returns paginated users without password', async () => {
    const paginatedResult = {
      items: [
        {
          id: 'user-1',
          email: 'admin@fiap.com.br',
          password: 'hashed',
          role: UserRole.ADMIN,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      nextCursor: 'cursor-abc',
      hasMore: true,
    }

    const userRepository = {
      findPaginated: jest.fn().mockResolvedValue(paginatedResult),
    } as unknown as UserRepository

    const useCase = new GetUsersUseCase(userRepository)
    const result = await useCase.handler({ search: 'admin' })

    expect(userRepository.findPaginated).toHaveBeenCalledWith({
      search: 'admin',
    })
    expect(result).toEqual({
      items: [
        {
          id: 'user-1',
          email: 'admin@fiap.com.br',
          role: UserRole.ADMIN,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      nextCursor: 'cursor-abc',
      hasMore: true,
    })
  })
})
