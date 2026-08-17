import type { FastifyInstance } from 'fastify'
import { create } from './controller/create'
import { list } from './controller/list'
import { authenticate } from '@/lib/auth'
import { requireAdmin } from '@/lib/authorization'

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/users',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Users'],
        summary: 'Lista usuários com paginação por cursor',
        description:
          'Retorna usuários paginados. Aceita busca parcial por e-mail. Requer token JWT com papel ADMIN.',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            cursor: {
              type: 'string',
              description: 'Cursor opaco da página anterior',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 50,
              default: 20,
              description: 'Quantidade de itens por página',
            },
            search: {
              type: 'string',
              description: 'Filtra usuários por e-mail (busca parcial)',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    email: { type: 'string', format: 'email' },
                    role: {
                      type: 'string',
                      enum: ['STUDENT', 'TEACHER', 'ADMIN'],
                    },
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
              nextCursor: {
                type: ['string', 'null'],
              },
              hasMore: {
                type: 'boolean',
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              message: { type: 'string' },
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
    list,
  )

  app.post(
    '/users',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Users'],
        summary: 'Cria um novo usuário',
        description:
          'Cadastra um usuário e seu perfil. Requer token JWT com papel ADMIN.',
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
            description:
              'Mensagem de confirmação com o e-mail do usuário criado',
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
    create,
  )
}
