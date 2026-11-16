import type { UserRole } from '@/modules/users/entities/user'
import { UserRepository } from '@/modules/users/repositories/user.repository'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createPostSchema } from '../../dto/create-post.dto'
import { ForbiddenPostAuthorError, InvalidPostAuthorError } from '../../errors'
import { CreatePostUseCase } from '../../use-cases/create-post.use-case'
import { PostRepository } from '../../repositories/post.repository'

export async function create(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { title, content, authorId } = createPostSchema.parse(request.body)

  try {
    const createPostUseCase = new CreatePostUseCase(
      new PostRepository(),
      new UserRepository(),
    )

    const post = await createPostUseCase.handler(
      { title, content, authorId },
      { id: request.user.sub, role: request.user.role as UserRole },
    )

    return reply.status(201).send(post)
  } catch (error) {
    if (error instanceof ForbiddenPostAuthorError) {
      return reply.status(403).send({ message: error.message })
    }
    if (error instanceof InvalidPostAuthorError) {
      return reply.status(422).send({ message: error.message })
    }

    console.error(error)
    throw new Error('Failed to create post')
  }
}
