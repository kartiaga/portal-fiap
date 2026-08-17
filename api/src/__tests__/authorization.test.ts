import { jest } from '@jest/globals'
import {
  requireAdmin,
  requireRole,
  requireTeacherOrAdmin,
} from '@/lib/authorization'
import { UserRole } from '@/modules/users/entities/user'
import type { FastifyReply, FastifyRequest } from 'fastify'

describe('authorization middleware', () => {
  const makeReply = () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  })

  it('allows a user with the allowed role', async () => {
    const request = {
      user: { role: UserRole.ADMIN },
    } as unknown as FastifyRequest
    const reply = makeReply() as unknown as FastifyReply

    await requireAdmin(request, reply)

    expect(reply.status).not.toHaveBeenCalled()
    expect(reply.send).not.toHaveBeenCalled()
  })

  it('denies a user with an unauthorized role', async () => {
    const request = {
      user: { role: UserRole.STUDENT },
    } as unknown as FastifyRequest
    const reply = makeReply() as unknown as FastifyReply

    await requireAdmin(request, reply)

    expect(reply.status).toHaveBeenCalledWith(403)
    expect(reply.send).toHaveBeenCalledWith({ message: 'Forbidden' })
  })

  it('allows teacher or admin roles', async () => {
    const reply = makeReply() as unknown as FastifyReply
    await requireTeacherOrAdmin(
      { user: { role: UserRole.TEACHER } } as unknown as FastifyRequest,
      reply,
    )
    expect(reply.status).not.toHaveBeenCalled()
  })

  it('denies when no allowed role matches', async () => {
    const request = {
      user: { role: UserRole.STUDENT },
    } as unknown as FastifyRequest
    const reply = makeReply() as unknown as FastifyReply

    await requireRole(UserRole.TEACHER, UserRole.ADMIN)(request, reply)

    expect(reply.status).toHaveBeenCalledWith(403)
  })
})
