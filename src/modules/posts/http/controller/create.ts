import type { FastifyReply, FastifyRequest } from "fastify";
import { createPostSchema } from "../../dto/create-post.dto";
import { CreatePostUseCase } from "../../use-cases/create-post.use-case";
import { PostRepository } from "../../repositories/post.repository";

export async function create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { title, content } = createPostSchema.parse(request.body)

    try {
        const postRepository = new PostRepository()
        const createPostUseCase = new CreatePostUseCase(postRepository)

        const post = await createPostUseCase.handler({
            title,
            content,
            authorId: request.user.sub,
        })

        return reply.status(201).send(post)
    } catch (error) {
        console.error(error)
        throw new Error("Failed to create post")
    }
}
