import type { Post } from '../entities/post'
import type { PostRepository } from '../repositories/post.repository'

export class UpdatePostUseCase {
    constructor(private readonly postRepository: PostRepository) {}

    async handler(
        id: string,
        data: Pick<Post, 'title' | 'content'>,
    ): Promise<Post | undefined> {
        return this.postRepository.update(id, data)
    }
}
