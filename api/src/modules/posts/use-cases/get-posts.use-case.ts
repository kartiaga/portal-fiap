import type { PaginatedResult, PaginationParams } from '@/lib/pagination'
import type { Post } from '../entities/post'
import type { PostRepository } from '../repositories/post.repository'

export class GetPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async handler(
    params: PaginationParams = {},
  ): Promise<PaginatedResult<Post>> {
    return this.postRepository.findPaginated(params)
  }
}
