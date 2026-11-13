import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateUserSchema } from '../../dto/update-user.dto'
import { UserError } from '../../errors'
import { UserRepository } from '../../repositories/user.repository'
import { UpdateUserUseCase } from '../../use-cases/update-user.use-case'
import { getActor, getUserId, sendUserError } from './shared'

export async function update(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const id = getUserId(request)
    const parsed = updateUserSchema.safeParse(request.body)
    if (!parsed.success) throw new UserError('Invalid user data', 400)
    const user = await new UpdateUserUseCase(new UserRepository()).handler(
      id,
      parsed.data,
      getActor(request),
    )
    return reply.status(200).send(user)
  } catch (error) {
    if (sendUserError(reply, error)) return
    throw error
  }
}
