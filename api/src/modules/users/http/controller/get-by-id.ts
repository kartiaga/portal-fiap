import type { FastifyReply, FastifyRequest } from 'fastify'
import { UserRepository } from '../../repositories/user.repository'
import { GetUserByIdUseCase } from '../../use-cases/get-user-by-id.use-case'
import { getActor, getUserId, sendUserError } from './shared'

export async function getById(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const user = await new GetUserByIdUseCase(new UserRepository()).handler(
      getUserId(request),
      getActor(request),
    )
    return reply.status(200).send(user)
  } catch (error) {
    if (sendUserError(reply, error)) return
    throw error
  }
}
