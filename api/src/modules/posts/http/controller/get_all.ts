import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetPostsUseCase } from '../../use-cases/get-posts.use-case'
import { PostRepository } from '../../repositories/post.repository'

export async function get(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> {
    try {
        const postRepository = new PostRepository()
        const getPostsUseCase = new GetPostsUseCase(postRepository)

        const posts = await getPostsUseCase.handler()

        return reply.status(200).send(posts)
    } catch (error) {
        console.error(error)
        throw new Error('Failed to get posts')
    }
}
