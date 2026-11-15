import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/lib/auth'
import { requireAdmin, requireTeacherOrAdmin } from '@/lib/authorization'
import { create } from './controller/create'
import { list } from './controller/list'
import { getById } from './controller/get-by-id'
import { update } from './controller/update'
import { remove } from './controller/delete'
import {
  createAvatarUpload,
  removeAvatar,
  setAvatar,
} from './controller/avatar'
import { AVATAR_CONTENT_TYPES } from '@/lib/avatar'

const userResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    name: { type: ['string', 'null'] },
    avatarUrl: { type: ['string', 'null'] },
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
          'ADMIN lista todos os perfis. TEACHER lista TEACHER e STUDENT (sem role, os dois juntos) e não pode pedir ADMIN.',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            cursor: {
              type: 'string',
              description: 'Cursor opaco da página anterior',
            },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
            search: { type: 'string', description: 'Busca parcial por nome ou e-mail' },
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
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Users'],
        summary: 'Cria um novo usuário',
        description: 'Apenas ADMIN cadastra usuários, de qualquer papel.',
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
      preHandler: [authenticate],
      schema: {
        tags: ['Users'],
        summary: 'Consulta usuário por ID',
        description:
          'Qualquer usuário consulta a própria conta. ADMIN consulta qualquer conta; TEACHER consulta TEACHER e STUDENT.',
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
        description:
          'ADMIN edita qualquer usuário. TEACHER edita apenas a própria conta (nome, e-mail e senha).',
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
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Users'],
        summary: 'Exclui usuário sem postagens',
        description:
          'Apenas ADMIN exclui usuários, e ninguém exclui a própria conta.',
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

  const avatarParams = idParams
  const avatarResponse = {
    type: 'object',
    properties: { avatarUrl: { type: ['string', 'null'] } },
  } as const

  app.post(
    '/users/:id/avatar/upload',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users'],
        summary: 'Autoriza o envio da foto de perfil',
        description:
          'Passo 1 da troca de foto. Devolve um formulário assinado: o app envia o arquivo direto ao armazenamento com POST multipart (os campos de fields primeiro, o arquivo por último, no campo file). Aceita JPEG, PNG e WebP de até maxBytes. Cada usuário troca a própria foto; ADMIN troca a de qualquer um.',
        security: [{ bearerAuth: [] }],
        params: avatarParams,
        body: {
          type: 'object',
          required: ['contentType'],
          additionalProperties: false,
          properties: {
            contentType: { type: 'string', enum: [...AVATAR_CONTENT_TYPES] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              fields: {
                type: 'object',
                additionalProperties: { type: 'string' },
              },
              key: { type: 'string' },
              maxBytes: { type: 'integer' },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          503: errorResponse,
        },
      },
    },
    createAvatarUpload,
  )

  app.put(
    '/users/:id/avatar',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users'],
        summary: 'Confirma a foto de perfil enviada',
        description:
          'Passo 2 da troca de foto: informa a key devolvida no passo 1, depois de enviar o arquivo. A API confere que o arquivo existe e é uma imagem aceita, passa o perfil a usá-lo e apaga a foto anterior.',
        security: [{ bearerAuth: [] }],
        params: avatarParams,
        body: {
          type: 'object',
          required: ['key'],
          additionalProperties: false,
          properties: { key: { type: 'string', maxLength: 200 } },
        },
        response: {
          200: avatarResponse,
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          503: errorResponse,
        },
      },
    },
    setAvatar,
  )

  app.delete(
    '/users/:id/avatar',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users'],
        summary: 'Remove a foto de perfil',
        security: [{ bearerAuth: [] }],
        params: avatarParams,
        response: {
          200: avatarResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          503: errorResponse,
        },
      },
    },
    removeAvatar,
  )
}
