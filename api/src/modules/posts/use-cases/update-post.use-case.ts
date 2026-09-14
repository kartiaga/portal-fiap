import { UserRole } from '@/modules/users/entities/user'
import type { Post } from '../entities/post'
import { ForbiddenPostAccessError } from '../errors'
import type { PostRepository } from '../repositories/post.repository'

export type PostRequester = {
  id: string
  role: UserRole
}

export class UpdatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async handler(
    id: string,
    data: Pick<Post, 'title' | 'content'>,
    requester: PostRequester,
  ): Promise<Post | undefined> {
    const post = await this.postRepository.findById(id)

    if (!post) {
      return undefined
    }

    if (requester.role !== UserRole.ADMIN && post.authorId !== requester.id) {
      throw new ForbiddenPostAccessError()
    }

    return this.postRepository.update(id, data)
  }
}
