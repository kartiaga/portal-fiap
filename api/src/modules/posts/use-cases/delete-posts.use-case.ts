import { UserRole } from '@/modules/users/entities/user'
import type { Post } from '../entities/post'
import { ForbiddenPostAccessError } from '../errors'
import type { PostRepository } from '../repositories/post.repository'
import type { PostRequester } from './update-post.use-case'

export class DeletePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async handler(
    id: string,
    requester: PostRequester,
  ): Promise<Post | undefined> {
    const post = await this.postRepository.findById(id)

    if (!post) {
      return undefined
    }

    if (requester.role !== UserRole.ADMIN && post.authorId !== requester.id) {
      throw new ForbiddenPostAccessError()
    }

    return this.postRepository.delete(id)
  }
}
