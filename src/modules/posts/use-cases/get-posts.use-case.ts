import type { Post } from '../entities/post'
import type { PostRepository } from '../repositories/post.repository'

export class GetPostsUseCase {
    constructor(private readonly postRepository: PostRepository) { }

    async handler(): Promise<Post[]> {
        return this.postRepository.findAll()
    }
}
