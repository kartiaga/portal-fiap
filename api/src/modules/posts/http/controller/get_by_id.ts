import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetPostByIdUseCase } from '../../use-cases/get-post-by-id.use-case'
import { PostRepository } from '../../repositories/post.repository'

export async function getPostById(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const rawId = (request.params as { id: string }).id
    const id = rawId?.trim().replace(/^"|"$/g, '')
    const postRepository = new PostRepository()
    const getPostByIdUseCase = new GetPostByIdUseCase(postRepository)

    const post = await getPostByIdUseCase.handler(id)

    if (!post) {
      return reply.status(404).send({ message: 'Post not found' })
    }

    return reply.status(200).send(post)
  } catch (error) {
    console.error(error)
    throw new Error('Failed to get post')
  }
}
