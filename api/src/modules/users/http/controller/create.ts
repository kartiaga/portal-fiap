import { createUserSchema } from '@/modules/users/dto/create-user.dto'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { CreateUserUseCase } from '../../use-cases/create-user.use-case'
import { UserRepository } from '../../repositories/user.repository'
import { ProfileRepository } from '@/modules/profiles/repositories/profile.repository'

export async function create(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { email, password, name, role } = createUserSchema.parse(request.body)

  try {
    const userRepository = new UserRepository()
    const profileRepository = new ProfileRepository()
    const createUserUseCase = new CreateUserUseCase(
      userRepository,
      profileRepository,
    )

    await createUserUseCase.handler({
      email,
      password,
      name,
      role,
    })

    return reply.status(201).send(`User created successfully ${email}`)
  } catch (error) {
    console.error(error)
    throw new Error('Failed to create user')
  }
}
