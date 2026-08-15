import type { FastifyInstance } from 'fastify'
import { create } from './controller/create'
import { authenticate } from '@/lib/auth'
import { requireAdmin } from '@/lib/authorization'

export async function usersRoutes(app: FastifyInstance) {
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
