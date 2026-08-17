import type { Post } from '../entities/post'
import type { PostRepository } from '../repositories/post.repository'

export class DeletePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async handler(id: string): Promise<Post | undefined> {
    return this.postRepository.delete(id)
  }
}
