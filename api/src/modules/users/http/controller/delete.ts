import type { FastifyReply, FastifyRequest } from 'fastify'
import { UserRepository } from '../../repositories/user.repository'
import { DeleteUserUseCase } from '../../use-cases/delete-user.use-case'
import { getActor, getUserId, sendUserError } from './shared'

export async function remove(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await new DeleteUserUseCase(new UserRepository()).handler(
      getUserId(request),
      getActor(request),
    )
    return reply.status(200).send({ message: 'User deleted successfully' })
  } catch (error) {
    if (sendUserError(reply, error)) return
    throw error
  }
}
