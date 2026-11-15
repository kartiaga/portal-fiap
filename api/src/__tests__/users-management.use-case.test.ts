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
import type { AvatarStorage } from '@/lib/avatar'

const admin = { id: 'admin-1', role: UserRole.ADMIN }
const teacher = { id: 'teacher-1', role: UserRole.TEACHER }
const student = { id: 'student-1', role: UserRole.STUDENT }
const target = {
  id: 'teacher-2',
  email: 'teacher@fiap.com.br',
  name: 'Ana',
  avatarUrl: null,
  role: UserRole.TEACHER,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('user management authorization and data', () => {
  it('lets only the admin create users, of any role', async () => {
    const users = {
      create: jest.fn().mockResolvedValue({ ...target, id: 'new-1' }),
    } as unknown as UserRepository
    const profiles = {
      create: jest.fn().mockResolvedValue({}),
    } as unknown as ProfileRepository
    const useCase = new CreateUserUseCase(users, profiles)
    const payload = {
      email: 'new@fiap.com.br',
      password: '12345678',
      name: 'Novo',
    }

    for (const role of [UserRole.TEACHER, UserRole.STUDENT, UserRole.ADMIN]) {
      await useCase.handler({ ...payload, role }, admin)
    }
    expect(users.create).toHaveBeenCalledTimes(3)

    // Professor e estudante não cadastram ninguém, nem estudante nem professor.
    for (const actor of [teacher, student]) {
      for (const role of [UserRole.TEACHER, UserRole.STUDENT]) {
        await expect(
          useCase.handler({ ...payload, role }, actor),
        ).rejects.toMatchObject({ status: 403 })
      }
    }
    expect(users.create).toHaveBeenCalledTimes(3)
  })

  it('limits the teacher list to teachers and students when no role is requested', async () => {
    const users = {
      findPaginated: jest.fn().mockResolvedValue({
        items: [target],
        nextCursor: null,
        hasMore: false,
      }),
    } as unknown as UserRepository
    const useCase = new GetUsersUseCase(users)

    await useCase.handler(teacher, { search: 'ana' })
    expect(users.findPaginated).toHaveBeenLastCalledWith({
      search: 'ana',
      roles: [UserRole.TEACHER, UserRole.STUDENT],
    })

    // Admin sem perfil: sem restrição de perfis.
    await useCase.handler(admin, { search: 'ana' })
    expect(users.findPaginated).toHaveBeenLastCalledWith({ search: 'ana' })

    // Com perfil escolhido, o filtro é só o perfil pedido.
    await useCase.handler(teacher, { role: UserRole.STUDENT })
    expect(users.findPaginated).toHaveBeenLastCalledWith({
      role: UserRole.STUDENT,
    })

    await expect(useCase.handler(student)).rejects.toMatchObject({
      status: 403,
    })
  })

  it('keeps administrators out of the teacher list and returns names without passwords', async () => {
    const users = {
      findPaginated: jest.fn().mockResolvedValue({
        items: [target],
        nextCursor: null,
        hasMore: false,
      }),
    } as unknown as UserRepository
    const useCase = new GetUsersUseCase(users)
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

  it("lets anyone see their own account, but not other people's", async () => {
    const users = {
      findById: jest.fn().mockResolvedValue({
        ...target,
        id: student.id,
        role: UserRole.STUDENT,
      }),
    } as unknown as UserRepository
    const useCase = new GetUserByIdUseCase(users)

    // O estudante vê a própria conta (nome, e-mail e foto), mas não a de outra pessoa.
    await expect(useCase.handler(student.id, student)).resolves.toMatchObject({
      id: student.id,
    })
    await expect(
      useCase.handler(student.id, { ...student, id: 'outro' }),
    ).rejects.toMatchObject({
      status: 403,
    })
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
      admin,
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
  })

  it('lets the admin edit anyone, but others only their own account', async () => {
    const users = {
      findById: jest.fn().mockResolvedValue(target),
      update: jest.fn().mockResolvedValue({ ...target, name: 'Novo Nome' }),
    } as unknown as UserRepository
    const useCase = new UpdateUserUseCase(users)
    const data = { email: target.email, name: 'Novo Nome' }

    // O administrador edita qualquer conta, inclusive de outro administrador.
    await useCase.handler(target.id, data, admin)
    jest
      .mocked(users.findById)
      .mockResolvedValueOnce({ ...target, id: 'admin-2', role: UserRole.ADMIN })
    await useCase.handler('admin-2', data, admin)
    expect(users.update).toHaveBeenCalledTimes(2)

    // O professor edita só a própria conta.
    await useCase.handler(teacher.id, data, teacher)
    expect(users.update).toHaveBeenCalledTimes(3)

    // Conta de outra pessoa: 403, sem nem consultar o usuário nem atualizar.
    jest.mocked(users.findById).mockClear()
    await expect(
      useCase.handler(target.id, data, teacher),
    ).rejects.toMatchObject({
      status: 403,
    })
    await expect(
      useCase.handler(target.id, data, student),
    ).rejects.toMatchObject({
      status: 403,
    })
    expect(users.findById).not.toHaveBeenCalled()
    expect(users.update).toHaveBeenCalledTimes(3)
  })

  it('lets only the admin delete, never their own account, nor users with posts', async () => {
    const users = {
      findById: jest.fn().mockResolvedValue(target),
      deleteWithoutPosts: jest.fn().mockResolvedValue('deleted'),
    } as unknown as UserRepository
    const useCase = new DeleteUserUseCase(users)

    await useCase.handler(target.id, admin)
    expect(users.deleteWithoutPosts).toHaveBeenCalledWith(target.id)

    // Nem o professor nem o estudante excluem alguém.
    for (const actor of [teacher, student]) {
      await expect(useCase.handler(target.id, actor)).rejects.toMatchObject({
        status: 403,
      })
    }

    // Ninguém exclui a própria conta, o administrador também não.
    await expect(useCase.handler('admin-1', admin)).rejects.toMatchObject({
      status: 403,
    })

    jest.mocked(users.deleteWithoutPosts).mockResolvedValueOnce('has_posts')
    await expect(useCase.handler(target.id, admin)).rejects.toMatchObject({
      status: 409,
    })
    expect(users.deleteWithoutPosts).toHaveBeenCalledTimes(2)
  })

  it('removes the avatar file together with the deleted user', async () => {
    const users = {
      findById: jest.fn().mockResolvedValue(target),
      deleteWithoutPosts: jest.fn().mockResolvedValue('deleted'),
    } as unknown as UserRepository
    const storage = {
      remove: jest.fn().mockResolvedValue(undefined),
    } as unknown as AvatarStorage
    const profiles = {
      findAvatarKey: jest.fn().mockResolvedValue('avatars/teacher-2/x.jpg'),
    }
    const useCase = new DeleteUserUseCase(users, { profiles, storage })

    await useCase.handler(target.id, admin)
    expect(storage.remove).toHaveBeenCalledWith('avatars/teacher-2/x.jpg')

    // Usuário com postagens não é excluído, então a foto fica.
    jest.mocked(storage.remove).mockClear()
    jest.mocked(users.deleteWithoutPosts).mockResolvedValueOnce('has_posts')
    await expect(useCase.handler(target.id, admin)).rejects.toMatchObject({
      status: 409,
    })
    expect(storage.remove).not.toHaveBeenCalled()

    // Falha no armazenamento não impede a exclusão.
    jest.mocked(storage.remove).mockRejectedValueOnce(new Error('storage down'))
    await expect(useCase.handler(target.id, admin)).resolves.toBeUndefined()
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
