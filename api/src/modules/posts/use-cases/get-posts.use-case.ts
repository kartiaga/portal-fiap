import type { PaginatedResult } from '@/lib/pagination'
import type { Post } from '../entities/post'
import type {
  PostListParams,
  PostRepository,
} from '../repositories/post.repository'

export class GetPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async handler(params: PostListParams = {}): Promise<PaginatedResult<Post>> {
    return this.postRepository.findPaginated(params)
  }
}
