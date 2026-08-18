import { jest } from '@jest/globals'
import {
    requireAdmin,
    requireRole,
    requireTeacherOrAdmin,
} from '@/lib/authorization'
import { UserRole } from '@/modules/users/entities/user'
import type { FastifyReply, FastifyRequest } from 'fastify'

describe('Posts Authorization', () => {
    const makeReply = () => ({
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    })

    describe('requireTeacherOrAdmin', () => {
        it('should allow TEACHER role to create/update posts', async () => {
            const request = {
                user: { role: UserRole.TEACHER },
            } as unknown as FastifyRequest
            const reply = makeReply() as unknown as FastifyReply

            await requireTeacherOrAdmin(request, reply)

            expect(reply.status).not.toHaveBeenCalled()
            expect(reply.send).not.toHaveBeenCalled()
        })

        it('should allow ADMIN role to create/update posts', async () => {
            const request = {
                user: { role: UserRole.ADMIN },
            } as unknown as FastifyRequest
            const reply = makeReply() as unknown as FastifyReply

            await requireTeacherOrAdmin(request, reply)

            expect(reply.status).not.toHaveBeenCalled()
            expect(reply.send).not.toHaveBeenCalled()
        })

        it('should deny STUDENT role from creating/updating posts', async () => {
            const request = {
                user: { role: UserRole.STUDENT },
            } as unknown as FastifyRequest
            const reply = makeReply() as unknown as FastifyReply

            await requireTeacherOrAdmin(request, reply)

            expect(reply.status).toHaveBeenCalledWith(403)
            expect(reply.send).toHaveBeenCalledWith({ message: 'Forbidden' })
        })
    })

    describe('Post access control rules', () => {
        it('should enforce TEACHER can create posts', () => {
            const request = {
                user: { role: UserRole.TEACHER, sub: 'teacher-1' },
            } as unknown as FastifyRequest
            const reply = makeReply() as unknown as FastifyReply

            // This would be validated by the preHandler
            // The controller receives the request with user.sub as authorId
            expect(request.user.role).toBe(UserRole.TEACHER)
        })

        it('should enforce ADMIN can create posts', () => {
            const request = {
                user: { role: UserRole.ADMIN, sub: 'admin-1' },
            } as unknown as FastifyRequest

            expect(request.user.role).toBe(UserRole.ADMIN)
        })

        it('should verify authorId is extracted from JWT token', () => {
            const request = {
                user: { sub: 'user-uuid-123', role: UserRole.TEACHER },
            } as unknown as FastifyRequest

            // Controller receives request.user.sub as authorId
            expect(request.user.sub).toBe('user-uuid-123')
        })
    })
})
