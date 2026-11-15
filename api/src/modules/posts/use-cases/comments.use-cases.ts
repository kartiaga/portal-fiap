import type { PaginatedResult, PaginationParams } from '@/lib/pagination'
import { UserRole } from '@/modules/users/entities/user'

import type { Comment } from '../entities/comment'
import {
  CommentNotFoundError,
  ForbiddenCommentAccessError,
  isForeignKeyViolation,
  PostNotFoundError,
} from '../errors'
import type { CommentRepository } from '../repositories/comment.repository'
import type { PostRepository } from '../repositories/post.repository'
import type { PostRequester } from './update-post.use-case'

type PostLookup = Pick<PostRepository, 'findAuthorId'>

export class ListCommentsUseCase {
  constructor(
    private readonly postRepository: PostLookup,
    private readonly commentRepository: Pick<
      CommentRepository,
      'findPaginated'
    >,
  ) {}

  async handler(
    postId: string,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<Comment>> {
    if (!(await this.postRepository.findAuthorId(postId))) {
      throw new PostNotFoundError()
    }
    return this.commentRepository.findPaginated(postId, params)
  }
}

export class CreateCommentUseCase {
  constructor(
    private readonly postRepository: PostLookup,
    private readonly commentRepository: Pick<CommentRepository, 'create'>,
  ) {}

  async handler(
    postId: string,
    authorId: string,
    content: string,
  ): Promise<Comment> {
    if (!(await this.postRepository.findAuthorId(postId))) {
      throw new PostNotFoundError()
    }

    try {
      const comment = await this.commentRepository.create(
        postId,
        authorId,
        content,
      )
      if (!comment) throw new Error('Comment was not created')
      return comment
    } catch (error) {
      if (isForeignKeyViolation(error)) throw new PostNotFoundError()
      throw error
    }
  }
}

/**
 * Exclui um comentário. Só quem escreveu e o administrador podem excluir; o autor da postagem
 * não modera os comentários dos outros.
 */
export class DeleteCommentUseCase {
  constructor(
    private readonly commentRepository: Pick<
      CommentRepository,
      'findById' | 'delete'
    >,
  ) {}

  async handler(
    postId: string,
    commentId: string,
    requester: PostRequester,
  ): Promise<void> {
    const comment = await this.commentRepository.findById(commentId)
    if (!comment || comment.postId !== postId) {
      throw new CommentNotFoundError()
    }

    if (
      requester.role !== UserRole.ADMIN &&
      requester.id !== comment.authorId
    ) {
      throw new ForbiddenCommentAccessError()
    }

    await this.commentRepository.delete(commentId)
  }
}
