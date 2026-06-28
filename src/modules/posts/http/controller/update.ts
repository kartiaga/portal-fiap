import type { FastifyReply, FastifyRequest } from 'fastify'
import { updatePostSchema } from '../../dto/update-post.dto'
import { UpdatePostUseCase } from '../../use-cases/update-post.use-case'
import { PostRepository } from '../../repositories/post.repository'

export async function update(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> {
    const rawId = (request.params as { id: string }).id
    const id = rawId?.trim().replace(/^"|"$/g, '')
    const { title, content } = updatePostSchema.parse(request.body)

    try {
        const postRepository = new PostRepository()
        const updatePostUseCase = new UpdatePostUseCase(postRepository)

        const post = await updatePostUseCase.handler(id, { title, content })

        if (!post) {
            return reply.status(404).send({ message: 'Post not found' })
        }

        return reply.status(200).send(post)
    } catch (error) {
        console.error(error)
        throw new Error('Failed to update post')
    }
}
