import type { Post } from '../entities/post'
import type { PostRepository } from '../repositories/post.repository'

export class GetPostByIdUseCase {
  private readonly postRepository: PostRepository

  constructor(postRepository: PostRepository) {
    this.postRepository = postRepository
  }

  /** `viewerId` (quem está conectado, se alguém) define `likedByMe`. */
  async handler(id: string, viewerId?: string): Promise<Post | undefined> {
    return viewerId
      ? this.postRepository.findById(id, viewerId)
      : this.postRepository.findById(id)
  }
}
