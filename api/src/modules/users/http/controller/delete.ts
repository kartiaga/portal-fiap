import type { FastifyReply, FastifyRequest } from 'fastify'
import { findAvatarStorage } from '@/lib/storage'
import { ProfileRepository } from '@/modules/profiles/repositories/profile.repository'
import { UserRepository } from '../../repositories/user.repository'
import { DeleteUserUseCase } from '../../use-cases/delete-user.use-case'
import { getActor, getUserId, sendUserError } from './shared'

export async function remove(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const storage = findAvatarStorage()
    const avatars = storage
      ? { profiles: new ProfileRepository(), storage }
      : undefined
    await new DeleteUserUseCase(new UserRepository(), avatars).handler(
      getUserId(request),
      getActor(request),
    )
    return reply.status(200).send({ message: 'User deleted successfully' })
  } catch (error) {
    if (sendUserError(reply, error)) return
    throw error
  }
}
