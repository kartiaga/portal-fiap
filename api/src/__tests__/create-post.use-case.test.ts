import {
  ForbiddenPostAuthorError,
  InvalidPostAuthorError,
} from '@/modules/posts/errors'
import {
  CreatePostUseCase,
  type AuthorLookup,
} from '@/modules/posts/use-cases/create-post.use-case'
import type { PostRepository } from '@/modules/posts/repositories/post.repository'
import { UserRole } from '@/modules/users/entities/user'

const input = {
  title: 'Hello World',
  content: 'This is a new post that has enough content.',
}

const teacher = { id: 'teacher-1', role: UserRole.TEACHER }
const admin = { id: 'admin-1', role: UserRole.ADMIN }

function setup(roles: Record<string, UserRole> = {}) {
  const postRepository = {
    create: jest.fn(async (post) => ({ id: 'post-1', ...post })),
  } as unknown as PostRepository
  const authors: AuthorLookup = {
    findById: jest.fn(async (id: string) =>
      roles[id] ? { role: roles[id] } : undefined,
    ),
  }
  return {
    postRepository,
    authors,
    useCase: new CreatePostUseCase(postRepository, authors),
  }
}

describe('CreatePostUseCase', () => {
  it('publishes as the requester when no author is given', async () => {
    const { postRepository, authors, useCase } = setup()

    const result = await useCase.handler(input, teacher)

    expect(postRepository.create).toHaveBeenCalledWith({
      ...input,
      authorId: teacher.id,
    })
    expect(result).toEqual({ id: 'post-1', ...input, authorId: teacher.id })
    expect(authors.findById).not.toHaveBeenCalled()
  })

  it('lets a teacher name themselves as the author', async () => {
    const { postRepository, useCase } = setup()

    await useCase.handler({ ...input, authorId: teacher.id }, teacher)

    expect(postRepository.create).toHaveBeenCalledWith({
      ...input,
      authorId: teacher.id,
    })
  })

  it('keeps a teacher from publishing on behalf of someone else', async () => {
    const { postRepository, useCase } = setup({ 'teacher-2': UserRole.TEACHER })

    await expect(
      useCase.handler({ ...input, authorId: 'teacher-2' }, teacher),
    ).rejects.toBeInstanceOf(ForbiddenPostAuthorError)
    expect(postRepository.create).not.toHaveBeenCalled()
  })

  it('lets the admin publish on behalf of a teacher', async () => {
    const { postRepository, useCase } = setup({ 'teacher-2': UserRole.TEACHER })

    await useCase.handler({ ...input, authorId: 'teacher-2' }, admin)

    expect(postRepository.create).toHaveBeenCalledWith({
      ...input,
      authorId: 'teacher-2',
    })
  })

  it.each([
    ['a student', { 'student-1': UserRole.STUDENT }, 'student-1'],
    ['another admin', { 'admin-2': UserRole.ADMIN }, 'admin-2'],
    ['a missing account', {}, 'nobody'],
  ])(
    'keeps the admin from publishing on behalf of %s',
    async (_label, roles, authorId) => {
      const { postRepository, useCase } = setup(roles)

      await expect(
        useCase.handler({ ...input, authorId }, admin),
      ).rejects.toBeInstanceOf(InvalidPostAuthorError)
      expect(postRepository.create).not.toHaveBeenCalled()
    },
  )
})
