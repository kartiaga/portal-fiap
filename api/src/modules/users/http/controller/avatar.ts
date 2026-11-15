import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '@/env'
import { getAvatarStorage } from '@/lib/storage'
import { ProfileRepository } from '@/modules/profiles/repositories/profile.repository'
import {
  CreateAvatarUploadUseCase,
  RemoveAvatarUseCase,
  SetAvatarUseCase,
} from '../../use-cases/avatar.use-cases'
import { getActor, getUserId, sendUserError } from './shared'

export async function createAvatarUpload(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { contentType } = request.body as { contentType: string }
    const result = await new CreateAvatarUploadUseCase(
      getAvatarStorage(),
    ).handler(getUserId(request), getActor(request), contentType)
    return reply.status(200).send(result)
  } catch (error) {
    if (sendUserError(reply, error)) return
    throw error
  }
}

export async function setAvatar(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { key } = request.body as { key: string }
    const result = await new SetAvatarUseCase(
      new ProfileRepository(),
      getAvatarStorage(),
      { publicUrl: env.S3_PUBLIC_URL, bucket: env.S3_BUCKET },
    ).handler(getUserId(request), getActor(request), key)
    return reply.status(200).send(result)
  } catch (error) {
    if (sendUserError(reply, error)) return
    throw error
  }
}

export async function removeAvatar(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const result = await new RemoveAvatarUseCase(
      new ProfileRepository(),
      getAvatarStorage(),
    ).handler(getUserId(request), getActor(request))
    return reply.status(200).send(result)
  } catch (error) {
    if (sendUserError(reply, error)) return
    throw error
  }
}
