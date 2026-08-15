import type { Post } from '../entities/post'
import type { PostRepository } from '../repositories/post.repository'

export class GetPostByIdUseCase {
  private readonly postRepository: PostRepository

  constructor(postRepository: PostRepository) {
    this.postRepository = postRepository
  }

  async handler(id: string): Promise<Post | undefined> {
    return this.postRepository.findById(id)
  }
}
