import type { Post } from '../entities/post'
import type { PostRepository } from '../repositories/post.repository'

export class SearchPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async handler(term: string, viewerId?: string): Promise<Post[]> {
    return viewerId
      ? this.postRepository.search(term, viewerId)
      : this.postRepository.search(term)
  }
}
