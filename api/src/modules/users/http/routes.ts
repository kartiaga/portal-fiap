import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/lib/auth'
import { requireTeacherOrAdmin } from '@/lib/authorization'
import { create } from './controller/create'
import { list } from './controller/list'
import { getById } from './controller/get-by-id'
import { update } from './controller/update'
import { remove } from './controller/delete'

const userResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    name: { type: ['string', 'null'] },
    role: { type: 'string', enum: ['STUDENT', 'TEACHER', 'ADMIN'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const

const errorResponse = {
  type: 'object',
  properties: { message: { type: 'string' } },
} as const
const idParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
} as const

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/users',
    {
      preHandler: [authenticate, requireTeacherOrAdmin],
      schema: {
        tags: ['Users'],
        summary: 'Lista usuários com paginação por cursor',
        description:
          'ADMIN pode listar todos; TEACHER deve filtrar por TEACHER ou STUDENT.',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            cursor: {
              type: 'string',
              description: 'Cursor opaco da página anterior',
            },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
            search: { type: 'string', description: 'Busca parcial por e-mail' },
            role: { type: 'string', enum: ['STUDENT', 'TEACHER', 'ADMIN'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              items: { type: 'array', items: userResponse },
              nextCursor: { type: ['string', 'null'] },
              hasMore: { type: 'boolean' },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    list,
  )

  app.post(
    '/users',
    {
      preHandler: [authenticate, requireTeacherOrAdmin],
      schema: {
        tags: ['Users'],
        summary: 'Cria um novo usuário',
        description:
          'ADMIN pode criar qualquer papel; TEACHER pode criar TEACHER ou STUDENT.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string', minLength: 2 },
            role: {
              type: 'string',
              enum: ['STUDENT', 'TEACHER', 'ADMIN'],
              default: 'STUDENT',
            },
          },
        },
        response: {
          201: {
            type: 'string',
            description: 'Mensagem de confirmação com o e-mail criado',
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          409: errorResponse,
        },
      },
    },
    create,
  )

  app.get(
    '/users/:id',
    {
      preHandler: [authenticate, requireTeacherOrAdmin],
      schema: {
        tags: ['Users'],
        summary: 'Consulta usuário por ID',
        security: [{ bearerAuth: [] }],
        params: idParams,
        response: {
          200: userResponse,
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    getById,
  )

  app.put(
    '/users/:id',
    {
      preHandler: [authenticate, requireTeacherOrAdmin],
      schema: {
        tags: ['Users'],
        summary: 'Atualiza usuário e perfil',
        security: [{ bearerAuth: [] }],
        params: idParams,
        body: {
          type: 'object',
          required: ['email', 'name'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 2 },
            password: { type: 'string', minLength: 8 },
          },
        },
        response: {
          200: userResponse,
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    update,
  )

  app.delete(
    '/users/:id',
    {
      preHandler: [authenticate, requireTeacherOrAdmin],
      schema: {
        tags: ['Users'],
        summary: 'Exclui usuário sem postagens',
        security: [{ bearerAuth: [] }],
        params: idParams,
        response: {
          200: { type: 'object', properties: { message: { type: 'string' } } },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    remove,
  )
}
