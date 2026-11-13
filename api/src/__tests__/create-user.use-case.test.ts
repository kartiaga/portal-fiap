import type { ProfileRepository } from '@/modules/profiles/repositories/profile.repository'
import { UserRole } from '@/modules/users/entities/user'
import type { UserRepository } from '@/modules/users/repositories/user.repository'
import { CreateUserUseCase } from '@/modules/users/use-cases/create-user.use-case'
import { comparePassword } from '@/lib/password'

describe('CreateUserUseCase', () => {
  it('hashes a password and creates both user and profile', async () => {
    const userRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        password: 'hashed-password',
        role: 'STUDENT',
      }),
    } as unknown as UserRepository

    const profileRepository = {
      create: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProfileRepository

    const useCase = new CreateUserUseCase(userRepository, profileRepository)

    const result = await useCase.handler(
      {
        email: 'user@example.com',
        password: 'secret123',
        role: UserRole.STUDENT,
        name: 'Jane Doe',
      },
      { id: 'admin-1', role: UserRole.ADMIN },
    )

    expect(userRepository.create).toHaveBeenCalled()
    const savedPassword = jest.mocked(userRepository.create).mock.calls[0]?.[0]
      .password
    expect(savedPassword).not.toBe('secret123')
    expect(await comparePassword('secret123', savedPassword ?? '')).toBe(true)
    expect(profileRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Jane Doe',
    })
    expect(result).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      password: 'hashed-password',
      role: 'STUDENT',
    })
  })

  it('throws when the user repository fails to return an id', async () => {
    const userRepository = {
      create: jest.fn().mockResolvedValue({ email: 'user@example.com' }),
    } as unknown as UserRepository
    const profileRepository = {
      create: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProfileRepository
    const useCase = new CreateUserUseCase(userRepository, profileRepository)

    await expect(
      useCase.handler(
        {
          email: 'user@example.com',
          password: 'secret123',
          role: UserRole.STUDENT,
          name: 'Jane Doe',
        },
        { id: 'admin-1', role: UserRole.ADMIN },
      ),
    ).rejects.toThrow('Failed to create user')
  })
})
