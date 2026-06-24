import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/lib/auth'
import { create } from './controller/create'
import { getPostById } from './controller/get_by_id'
import { requireTeacherOrAdmin } from '@/lib/authorization'

export async function postsRoutes(app: FastifyInstance) {
    app.post(
        '/posts',
        { preHandler: [authenticate, requireTeacherOrAdmin] },
        create,
    )
    app.get('/posts/:id', getPostById)
}
