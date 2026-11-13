import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import type { UserActor } from '../../access'
import { UserRole } from '../../entities/user'
import { UserError, isUniqueViolation } from '../../errors'

export function getActor(request: FastifyRequest): UserActor {
  return { id: request.user.sub, role: request.user.role as UserRole }
}

export function getUserId(request: FastifyRequest): string {
  const result = z.uuid().safeParse((request.params as { id?: string }).id)
  if (!result.success) throw new UserError('Invalid user id', 400)
  return result.data
}

export function sendUserError(reply: FastifyReply, error: unknown): boolean {
  if (error instanceof UserError) {
    reply.status(error.status).send({ message: error.message })
    return true
  }
  if (isUniqueViolation(error)) {
    reply.status(409).send({ message: 'Email already in use' })
    return true
  }
  return false
}
