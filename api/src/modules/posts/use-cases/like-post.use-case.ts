import type { PaginatedResult, PaginationParams } from '@/lib/pagination'
import type { LikeSummary, Liker } from '../entities/comment'
import { isForeignKeyViolation, PostNotFoundError } from '../errors'
import type { PostLikeRepository } from '../repositories/post-like.repository'
import type { PostRepository } from '../repositories/post.repository'

/** Curte ou desfaz a curtida. As duas operações são idempotentes e devolvem o total atualizado. */
export class LikePostUseCase {
  constructor(
    private readonly postRepository: Pick<PostRepository, 'findAuthorId'>,
    private readonly likeRepository: PostLikeRepository,
  ) {}

  async handler(
    postId: string,
    userId: string,
    liked: boolean,
  ): Promise<LikeSummary> {
    if (!(await this.postRepository.findAuthorId(postId))) {
      throw new PostNotFoundError()
    }

    try {
      if (liked) await this.likeRepository.like(postId, userId)
      else await this.likeRepository.unlike(postId, userId)
    } catch (error) {
      if (isForeignKeyViolation(error)) throw new PostNotFoundError()
      throw error
    }

    return this.likeRepository.summary(postId, userId)
  }
}

/** Quem curtiu a postagem, das curtidas mais recentes para as mais antigas. */
export class ListLikesUseCase {
  constructor(
    private readonly postRepository: Pick<PostRepository, 'findAuthorId'>,
    private readonly likeRepository: Pick<PostLikeRepository, 'findLikers'>,
  ) {}

  async handler(
    postId: string,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<Liker>> {
    if (!(await this.postRepository.findAuthorId(postId))) {
      throw new PostNotFoundError()
    }
    return this.likeRepository.findLikers(postId, params)
  }
}
