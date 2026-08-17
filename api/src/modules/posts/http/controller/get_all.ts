import { paginationQuerySchema } from '@/lib/pagination'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetPostsUseCase } from '../../use-cases/get-posts.use-case'
import { PostRepository } from '../../repositories/post.repository'

export async function get(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = paginationQuerySchema.safeParse(request.query)

  if (!parsed.success) {
    return reply.status(400).send({
      message: 'Invalid pagination parameters',
    })
  }

  try {
    const postRepository = new PostRepository()
    const getPostsUseCase = new GetPostsUseCase(postRepository)

    const result = await getPostsUseCase.handler(parsed.data)

    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid cursor') {
      return reply.status(400).send({ message: 'Invalid cursor' })
    }

    console.error(error)
    throw new Error('Failed to get posts')
  }
}
