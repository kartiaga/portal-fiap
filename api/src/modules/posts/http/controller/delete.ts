import type { FastifyReply, FastifyRequest } from 'fastify'
import { DeletePostUseCase } from '../../use-cases/delete-posts.use-case'
import { PostRepository } from '../../repositories/post.repository'

export async function remove(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const rawId = (request.params as { id: string }).id
  const id = rawId?.trim().replace(/^"|"$/g, '')

  try {
    const postRepository = new PostRepository()
    const deletePostUseCase = new DeletePostUseCase(postRepository)

    const post = await deletePostUseCase.handler(id)
    if (!post) {
      return reply.status(404).send({ message: 'Post not found' })
    }

    return reply.status(200).send({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error(error)
    throw new Error('Failed to delete post')
  }
}
