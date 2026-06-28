import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/lib/auth'
import { create } from './controller/create'
import { update } from './controller/update'
import { getPostById } from './controller/get_by_id'
import { get } from './controller/get_all'
import { requireTeacherOrAdmin } from '@/lib/authorization'

export async function postsRoutes(app: FastifyInstance) {
    app.post(
        '/posts',
        { preHandler: [authenticate, requireTeacherOrAdmin] },
        create,
    )
    app.put(
        '/posts/:id',
        { preHandler: [authenticate, requireTeacherOrAdmin] },
        update,
    )
    app.get('/posts/:id', getPostById)
    app.get('/posts', { preHandler: [authenticate] }, get)
}
