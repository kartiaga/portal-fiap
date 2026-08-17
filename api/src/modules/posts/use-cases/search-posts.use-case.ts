import type { Post } from '../entities/post'
import type { PostRepository } from '../repositories/post.repository'

export class SearchPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async handler(term: string): Promise<Post[]> {
    return this.postRepository.search(term)
  }
}
