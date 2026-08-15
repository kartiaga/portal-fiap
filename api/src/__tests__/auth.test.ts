import { jest } from '@jest/globals'
import { authenticate } from '@/lib/auth'
import type { FastifyReply, FastifyRequest } from 'fastify'

describe('auth middleware', () => {
  it('completes successfully when jwtVerify passes', async () => {
    const request = {
      jwtVerify: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    } as unknown as FastifyRequest
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply

    await authenticate(request, reply)

    expect(request.jwtVerify).toHaveBeenCalled()
    expect(reply.status).not.toHaveBeenCalled()
  })

  it('returns 401 when jwtVerify throws', async () => {
    const request = {
      jwtVerify: jest
        .fn<() => Promise<void>>()
        .mockRejectedValue(new Error('invalid')),
    } as unknown as FastifyRequest
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply

    await authenticate(request, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith({ message: 'Unauthorized' })
  })
})
