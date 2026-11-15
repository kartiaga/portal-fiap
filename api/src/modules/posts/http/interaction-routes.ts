import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/lib/auth'
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@/lib/pagination'
import { COMMENT_MAX_LENGTH } from '../dto/comment.dto'
import {
  createComment,
  deleteComment,
  listComments,
} from './controller/comments'
import { like, listLikes, unlike } from './controller/likes'

const messageSchema = {
  type: 'object',
  properties: { message: { type: 'string' } },
} as const

const postParams = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid', description: 'ID da postagem' },
  },
} as const

const likeSummarySchema = {
  type: 'object',
  properties: {
    likeCount: { type: 'integer' },
    likedByMe: { type: 'boolean' },
  },
} as const

const paginationQuerystring = {
  type: 'object',
  properties: {
    cursor: { type: 'string', description: 'Cursor opaco da página anterior' },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: MAX_PAGE_SIZE,
      default: DEFAULT_PAGE_SIZE,
    },
  },
} as const

const likerSchema = {
  type: 'object',
  properties: {
    userId: { type: 'string', format: 'uuid' },
    name: { type: ['string', 'null'] },
    avatarUrl: { type: ['string', 'null'] },
    likedAt: { type: 'string', format: 'date-time' },
  },
} as const

const commentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    postId: { type: 'string', format: 'uuid' },
    authorId: { type: 'string', format: 'uuid' },
    authorName: { type: ['string', 'null'] },
    authorAvatarUrl: { type: ['string', 'null'] },
    content: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const

/** Curtidas e comentários. Qualquer pessoa conectada pode curtir e comentar. */
export async function interactionRoutes(app: FastifyInstance) {
  const likeResponses = {
    200: likeSummarySchema,
    401: messageSchema,
    404: messageSchema,
  }

  app.post(
    '/posts/:id/like',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Curtidas'],
        summary: 'Curte uma postagem',
        description:
          'Registra a curtida de quem está conectado. Curtir de novo não muda nada. Devolve o total atualizado.',
        security: [{ bearerAuth: [] }],
        params: postParams,
        response: likeResponses,
      },
    },
    like,
  )

  app.delete(
    '/posts/:id/like',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Curtidas'],
        summary: 'Desfaz a curtida de uma postagem',
        description:
          'Remove a curtida de quem está conectado, se houver. Devolve o total atualizado.',
        security: [{ bearerAuth: [] }],
        params: postParams,
        response: likeResponses,
      },
    },
    unlike,
  )

  app.get(
    '/posts/:id/likes',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Curtidas'],
        summary: 'Lista quem curtiu uma postagem',
        description:
          'Pessoas que curtiram, das curtidas mais recentes para as mais antigas, com paginação por cursor.',
        security: [{ bearerAuth: [] }],
        params: postParams,
        querystring: paginationQuerystring,
        response: {
          200: {
            type: 'object',
            properties: {
              items: { type: 'array', items: likerSchema },
              nextCursor: { type: ['string', 'null'] },
              hasMore: { type: 'boolean' },
            },
          },
          400: messageSchema,
          401: messageSchema,
          404: messageSchema,
        },
      },
    },
    listLikes,
  )

  app.get(
    '/posts/:id/comments',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Comentários'],
        summary: 'Lista os comentários de uma postagem',
        description:
          'Comentários dos mais recentes para os mais antigos, com paginação por cursor.',
        security: [{ bearerAuth: [] }],
        params: postParams,
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
              maximum: MAX_PAGE_SIZE,
              default: DEFAULT_PAGE_SIZE,
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              items: { type: 'array', items: commentSchema },
              nextCursor: { type: ['string', 'null'] },
              hasMore: { type: 'boolean' },
            },
          },
          400: messageSchema,
          401: messageSchema,
          404: messageSchema,
        },
      },
    },
    listComments,
  )

  app.post(
    '/posts/:id/comments',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Comentários'],
        summary: 'Comenta uma postagem',
        description: `Publica um comentário de até ${COMMENT_MAX_LENGTH} caracteres em nome de quem está conectado.`,
        security: [{ bearerAuth: [] }],
        params: postParams,
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              minLength: 1,
              maxLength: COMMENT_MAX_LENGTH,
            },
          },
        },
        response: {
          201: commentSchema,
          400: messageSchema,
          401: messageSchema,
          404: messageSchema,
        },
      },
    },
    createComment,
  )

  app.delete(
    '/posts/:id/comments/:commentId',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Comentários'],
        summary: 'Exclui um comentário',
        description:
          'Só quem escreveu o comentário ou um ADMIN pode excluí-lo.',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id', 'commentId'],
          properties: {
            id: postParams.properties.id,
            commentId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do comentário',
            },
          },
        },
        response: {
          200: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
        },
      },
    },
    deleteComment,
  )
}
