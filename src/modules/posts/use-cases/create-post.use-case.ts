import type { Post } from "../entities/post";
import type { PostRepository } from "../repositories/post.repository";

export class CreatePostUseCase {
    constructor(private readonly postRepository: PostRepository) {}

    async handler(post: Post): Promise<Post | undefined> {
        return this.postRepository.create(post)
    }
}
