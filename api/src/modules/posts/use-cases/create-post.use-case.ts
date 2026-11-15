import { UserRole } from '@/modules/users/entities/user'
import type { Post } from '../entities/post'
import { ForbiddenPostAuthorError, InvalidPostAuthorError } from '../errors'
import type { PostRepository } from '../repositories/post.repository'

export type PostRequester = { id: string; role: UserRole }

/** O que o caso de uso precisa saber de outra conta: só o perfil. */
export type AuthorLookup = {
  findById(id: string): Promise<{ role: UserRole } | undefined>
}

export type CreatePostInput = {
  title: string
  content: string
  /** Ausente (ou igual a quem pede), a postagem sai em nome de quem está logado. */
  authorId?: string | undefined
}

/**
 * Cria uma postagem. O autor é quem está logado; o administrador pode publicar em nome de um
 * professor, que precisa existir e ter o perfil de professor. O professor nunca publica em nome
 * de outra pessoa.
 */
export class CreatePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly authors: AuthorLookup,
  ) {}

  async handler(
    input: CreatePostInput,
    requester: PostRequester,
  ): Promise<Post | undefined> {
    const authorId = input.authorId ?? requester.id

    if (authorId !== requester.id) {
      if (requester.role !== UserRole.ADMIN)
        throw new ForbiddenPostAuthorError()

      const author = await this.authors.findById(authorId)
      if (author?.role !== UserRole.TEACHER) throw new InvalidPostAuthorError()
    }

    return this.postRepository.create({
      title: input.title,
      content: input.content,
      authorId,
    })
  }
}
