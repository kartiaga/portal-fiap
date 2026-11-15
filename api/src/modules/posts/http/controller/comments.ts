import type { UserRole } from '@/modules/users/entities/user'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  createCommentSchema,
  listCommentsQuerySchema,
} from '../../dto/comment.dto'
import {
  CommentNotFoundError,
  ForbiddenCommentAccessError,
  PostNotFoundError,
} from '../../errors'
import { CommentRepository } from '../../repositories/comment.repository'
import { PostRepository } from '../../repositories/post.repository'
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ListCommentsUseCase,
} from '../../use-cases/comments.use-cases'

export async function listComments(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string }
  const parsed = listCommentsQuerySchema.safeParse(request.query)

  if (!parsed.success) {
    return reply.status(400).send({ message: 'Invalid pagination parameters' })
  }

  try {
    const useCase = new ListCommentsUseCase(
      new PostRepository(),
      new CommentRepository(),
    )
    const result = await useCase.handler(id, parsed.data)
    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    if (error instanceof Error && error.message === 'Invalid cursor') {
      return reply.status(400).send({ message: 'Invalid cursor' })
    }

    console.error(error)
    throw new Error('Failed to list comments')
  }
}

export async function createComment(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string }
  const parsed = createCommentSchema.safeParse(request.body)

  if (!parsed.success) {
    return reply.status(400).send({ message: 'Invalid comment content' })
  }

  try {
    const useCase = new CreateCommentUseCase(
      new PostRepository(),
      new CommentRepository(),
    )
    const comment = await useCase.handler(
      id,
      request.user.sub,
      parsed.data.content,
    )
    return reply.status(201).send(comment)
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    console.error(error)
    throw new Error('Failed to create comment')
  }
}

export async function deleteComment(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id, commentId } = request.params as { id: string; commentId: string }

  try {
    const useCase = new DeleteCommentUseCase(new CommentRepository())
    await useCase.handler(id, commentId, {
      id: request.user.sub,
      role: request.user.role as UserRole,
    })
    return reply.status(200).send({ message: 'Comment deleted successfully' })
  } catch (error) {
    if (error instanceof CommentNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    if (error instanceof ForbiddenCommentAccessError) {
      return reply.status(403).send({ message: error.message })
    }

    console.error(error)
    throw new Error('Failed to delete comment')
  }
}
