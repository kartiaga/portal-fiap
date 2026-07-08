import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/lib/auth'
import { create } from './controller/create'
import { update } from './controller/update'
import { getPostById } from './controller/get_by_id'
import { get } from './controller/get_all'
import { requireTeacherOrAdmin } from '@/lib/authorization'
import { search } from './controller/search'
import { remove } from './controller/delete'

export async function postsRoutes(app: FastifyInstance) {
    app.post('/posts', {
        preHandler: [authenticate, requireTeacherOrAdmin],
        schema: {
            tags: ['Posts'],
            summary: 'Cria um novo post',
            description: 'Cadastra um post. Requer token JWT com papel TEACHER ou ADMIN.',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                    title: { type: 'string', minLength: 3 },
                    content: { type: 'string', minLength: 10 },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        authorId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                401: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
                403: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
    },
        create,)

    app.get(
        '/posts/search',
        {
            preHandler: [authenticate],
            schema: {
                tags: ['Posts'],
                summary: 'Busca postagens',
                description: 'Busca postagens por palavra-cha=ve no título ou conteúdo.',
                security: [{ bearerAuth: [] }],
                querystring: {
                    type: 'object',
                    required: ['term'],
                    properties: {
                        term: {
                            type: 'string',
                            description: 'Palavra-chave utilizada na busca',
                        },
                    },
                },
                response: {
                    200: {
                        type: 'array',
                        item: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                createdAt: {
                                    type: 'string',
                                    format: 'date-time',
                                },
                                updatedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                },
                            },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        search,
    )

    app.put(
        '/posts/:id',
        { preHandler: [authenticate, requireTeacherOrAdmin] },
        update,
    )
    app.delete(
        '/posts/:id',
        {
            preHandler: [authenticate, requireTeacherOrAdmin],
            schema: {
                tags: ['Posts'],
                summary: 'Exclui uma postagem',
                description:
                    'Remove uma postagem existente pelo ID. Requer token JWT com papel TEACHER ou ADMIN.',
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID da postagem',
                        },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    403: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
            },
        },
        remove,
    )

    app.get('/posts/:id', getPostById)
    app.get('/posts', { preHandler: [authenticate] }, get)
}


