import { comparePassword } from '@/lib/password'
import { UserRole } from '@/modules/users/entities/user'
import { CreateUserUseCase } from '@/modules/users/use-cases/create-user.use-case'
import { GetUserByIdUseCase } from '@/modules/users/use-cases/get-user-by-id.use-case'
import { GetUsersUseCase } from '@/modules/users/use-cases/get-users.use-case'
import { UpdateUserUseCase } from '@/modules/users/use-cases/update-user.use-case'
import { DeleteUserUseCase } from '@/modules/users/use-cases/delete-user.use-case'
import type { UserRepository } from '@/modules/users/repositories/user.repository'
import type { ProfileRepository } from '@/modules/profiles/repositories/profile.repository'
import { listUsersQuerySchema } from '@/modules/users/dto/list-users.dto'
import { updateUserSchema } from '@/modules/users/dto/update-user.dto'
import { sendUserError } from '@/modules/users/http/controller/shared'
import type { FastifyReply } from 'fastify'

const admin = { id: 'admin-1', role: UserRole.ADMIN }
const teacher = { id: 'teacher-1', role: UserRole.TEACHER }
const student = { id: 'student-1', role: UserRole.STUDENT }
const target = {
  id: 'teacher-2',
  email: 'teacher@fiap.com.br',
  name: 'Ana',
  role: UserRole.TEACHER,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('user management authorization and data', () => {
  it('allows teacher to create teacher/student, but not admin; denies student', async () => {
    const users = {
      create: jest.fn().mockResolvedValue({ ...target, id: 'new-1' }),
    } as unknown as UserRepository
    const profiles = {
      create: jest.fn().mockResolvedValue({}),
    } as unknown as ProfileRepository
    const useCase = new CreateUserUseCase(users, profiles)
    for (const role of [UserRole.TEACHER, UserRole.STUDENT]) {
      await useCase.handler(
        { email: 'new@fiap.com.br', password: '12345678', name: 'Novo', role },
        teacher,
      )
    }
    await expect(
      useCase.handler(
        {
          email: 'new@fiap.com.br',
          password: '12345678',
          name: 'Novo',
          role: UserRole.ADMIN,
        },
        teacher,
      ),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      useCase.handler(
        {
          email: 'new@fiap.com.br',
          password: '12345678',
          name: 'Novo',
          role: UserRole.STUDENT,
        },
        student,
      ),
    ).rejects.toMatchObject({ status: 403 })
    expect(users.create).toHaveBeenCalledTimes(2)
  })

  it('requires teacher to filter list by manageable role and returns names without passwords', async () => {
    const users = {
      findPaginated: jest.fn().mockResolvedValue({
        items: [target],
        nextCursor: null,
        hasMore: false,
      }),
    } as unknown as UserRepository
    const useCase = new GetUsersUseCase(users)
    await expect(useCase.handler(teacher)).rejects.toMatchObject({
      status: 403,
    })
    await expect(
      useCase.handler(teacher, { role: UserRole.ADMIN }),
    ).rejects.toMatchObject({ status: 403 })
    const result = await useCase.handler(teacher, {
      role: UserRole.TEACHER,
      limit: 10,
    })
    expect(users.findPaginated).toHaveBeenCalledWith({
      role: UserRole.TEACHER,
      limit: 10,
    })
    expect(result.items[0]).toMatchObject({
      name: 'Ana',
      role: UserRole.TEACHER,
    })
    expect(result.items[0]).not.toHaveProperty('password')
    await expect(
      useCase.handler(student, { role: UserRole.STUDENT }),
    ).rejects.toMatchObject({ status: 403 })
    await expect(useCase.handler(admin)).resolves.toHaveProperty('items')
  })

  it('protects individual lookup and returns 404 for missing user', async () => {
    const users = {
      findById: jest.fn().mockResolvedValue(target),
    } as unknown as UserRepository
    const useCase = new GetUserByIdUseCase(users)
    expect(await useCase.handler(target.id, teacher)).toEqual(target)
    expect(await useCase.handler(target.id, admin)).not.toHaveProperty(
      'password',
    )
    jest
      .mocked(users.findById)
      .mockResolvedValueOnce({ ...target, role: UserRole.ADMIN })
    await expect(useCase.handler(target.id, teacher)).rejects.toMatchObject({
      status: 403,
    })
    jest.mocked(users.findById).mockResolvedValueOnce(undefined)
    await expect(useCase.handler('missing', admin)).rejects.toMatchObject({
      status: 404,
    })
  })

  it('hashes a new password on edit and rejects role changes in the DTO', async () => {
    const users = {
      findById: jest.fn().mockResolvedValue(target),
      update: jest.fn().mockResolvedValue({ ...target, name: 'Ana Maria' }),
    } as unknown as UserRepository
    const useCase = new UpdateUserUseCase(users)
    const updated = await useCase.handler(
      target.id,
      { email: target.email, name: 'Ana Maria', password: 'newpass123' },
      teacher,
    )
    expect(updated.name).toBe('Ana Maria')
    expect(updated).not.toHaveProperty('password')
    const data = jest.mocked(users.update).mock.calls[0]?.[1]
    expect(data?.password).not.toBe('newpass123')
    expect(await comparePassword('newpass123', data?.password ?? '')).toBe(true)
    expect(
      updateUserSchema.safeParse({
        email: target.email,
        name: 'Ana',
        role: 'ADMIN',
      }).success,
    ).toBe(false)
    jest
      .mocked(users.findById)
      .mockResolvedValueOnce({ ...target, role: UserRole.ADMIN })
    await expect(
      useCase.handler(target.id, { email: target.email, name: 'Ana' }, teacher),
    ).rejects.toMatchObject({ status: 403 })
    expect(users.update).toHaveBeenCalledTimes(1)
  })

  it('blocks self-deletion and users with posts; deletes only eligible users', async () => {
    const users = {
      findById: jest.fn().mockResolvedValue(target),
      deleteWithoutPosts: jest.fn().mockResolvedValue('deleted'),
    } as unknown as UserRepository
    const useCase = new DeleteUserUseCase(users)
    await useCase.handler(target.id, teacher)
    expect(users.deleteWithoutPosts).toHaveBeenCalledWith(target.id)
    await expect(useCase.handler('teacher-1', teacher)).rejects.toMatchObject({
      status: 403,
    })
    jest.mocked(users.deleteWithoutPosts).mockResolvedValueOnce('has_posts')
    await expect(useCase.handler(target.id, admin)).rejects.toMatchObject({
      status: 409,
    })
    jest
      .mocked(users.findById)
      .mockResolvedValueOnce({ ...target, role: UserRole.ADMIN })
    await expect(useCase.handler(target.id, teacher)).rejects.toMatchObject({
      status: 403,
    })
    expect(users.deleteWithoutPosts).toHaveBeenCalledTimes(2)
  })

  it('rejects invalid role filters', () => {
    expect(listUsersQuerySchema.safeParse({ role: 'INVALID' }).success).toBe(
      false,
    )
  })

  it('maps duplicate email to 409', () => {
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply
    expect(sendUserError(reply, { code: '23505' })).toBe(true)
    expect(reply.status).toHaveBeenCalledWith(409)
    expect(reply.send).toHaveBeenCalledWith({ message: 'Email already in use' })
  })
})
