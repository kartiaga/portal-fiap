import { paginationQuerySchema } from '@/lib/pagination'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { PostNotFoundError } from '../../errors'
import { PostLikeRepository } from '../../repositories/post-like.repository'
import { PostRepository } from '../../repositories/post.repository'
import {
  LikePostUseCase,
  ListLikesUseCase,
} from '../../use-cases/like-post.use-case'

function toggleLike(liked: boolean) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const { id } = request.params as { id: string }

    try {
      const useCase = new LikePostUseCase(
        new PostRepository(),
        new PostLikeRepository(),
      )
      const summary = await useCase.handler(id, request.user.sub, liked)
      return reply.status(200).send(summary)
    } catch (error) {
      if (error instanceof PostNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      console.error(error)
      throw new Error(liked ? 'Failed to like post' : 'Failed to unlike post')
    }
  }
}

export const like = toggleLike(true)
export const unlike = toggleLike(false)

export async function listLikes(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string }
  const parsed = paginationQuerySchema.safeParse(request.query)

  if (!parsed.success) {
    return reply.status(400).send({ message: 'Invalid pagination parameters' })
  }

  try {
    const useCase = new ListLikesUseCase(
      new PostRepository(),
      new PostLikeRepository(),
    )
    return reply.status(200).send(await useCase.handler(id, parsed.data))
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    if (error instanceof Error && error.message === 'Invalid cursor') {
      return reply.status(400).send({ message: 'Invalid cursor' })
    }

    console.error(error)
    throw new Error('Failed to list likes')
  }
}
