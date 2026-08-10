import type { FastifyReply, FastifyRequest } from "fastify";
import { SearchPostsUseCase } from '../../use-cases/search-posts.use-case'
import { PostRepository } from '../../repositories/post.repository'

export async function search(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> {
    const { term } = request.query as { term?: string }

    if (!term) {
        return reply.status(400).send({ message: 'Search term is required' })
    }

    try {
        const postRepository = new PostRepository()
        const searchPostsUseCase = new SearchPostsUseCase(postRepository)

        const posts = await searchPostsUseCase.handler(term)

        return reply.status(200).send(posts)
    } catch (error) {
        console.error(error)
        throw new Error('Failed to search posts')
    }
}