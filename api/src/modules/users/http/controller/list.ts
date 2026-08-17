import { listUsersQuerySchema } from '@/modules/users/dto/list-users.dto'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetUsersUseCase } from '../../use-cases/get-users.use-case'
import { UserRepository } from '../../repositories/user.repository'

export async function list(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = listUsersQuerySchema.safeParse(request.query)

  if (!parsed.success) {
    return reply.status(400).send({
      message: 'Invalid pagination parameters',
    })
  }

  try {
    const userRepository = new UserRepository()
    const getUsersUseCase = new GetUsersUseCase(userRepository)

    const result = await getUsersUseCase.handler(parsed.data)

    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid cursor') {
      return reply.status(400).send({ message: 'Invalid cursor' })
    }

    console.error(error)
    throw new Error('Failed to get users')
  }
}
