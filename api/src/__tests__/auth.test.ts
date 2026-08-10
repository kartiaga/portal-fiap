import { jest } from '@jest/globals'
import { authenticate } from '@/lib/auth'

describe('auth middleware', () => {
    it('completes successfully when jwtVerify passes', async () => {
        const request = {
            jwtVerify: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        } as any
        const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any

        await authenticate(request, reply)

        expect(request.jwtVerify).toHaveBeenCalled()
        expect(reply.status).not.toHaveBeenCalled()
    })

    it('returns 401 when jwtVerify throws', async () => {
        const request = {
            jwtVerify: jest.fn<() => Promise<void>>().mockRejectedValue(new Error('invalid')),
        } as any
        const reply = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any

        await authenticate(request, reply)

        expect(reply.status).toHaveBeenCalledWith(401)
        expect(reply.send).toHaveBeenCalledWith({ message: 'Unauthorized' })
    })
})
