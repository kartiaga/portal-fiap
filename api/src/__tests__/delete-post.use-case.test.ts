import type { PostRepository } from '@/modules/posts/repositories/post.repository'
import { DeletePostUseCase } from '@/modules/posts/use-cases/delete-posts.use-case'
import { ForbiddenPostAccessError } from '@/modules/posts/errors'
import { UserRole } from '@/modules/users/entities/user'

describe('DeletePostUseCase', () => {
  it('deletes a post through the repository when the requester is the author', async () => {
    const post = {
      id: 'post-1',
      title: 'Hello World',
      content: 'This is a new post has enough content.',
      authorId: 'user-1',
    }

    const postRepository = {
      findById: jest.fn().mockResolvedValue(post),
      delete: jest.fn().mockResolvedValue(post),
    } as unknown as PostRepository

    const useCase = new DeletePostUseCase(postRepository)
    const result = await useCase.handler('post-1', {
      id: 'user-1',
      role: UserRole.TEACHER,
    })

    expect(postRepository.delete).toHaveBeenCalledWith('post-1')
    expect(result).toEqual(post)
  })

  it('allows an ADMIN to delete a post authored by someone else', async () => {
    const post = {
      id: 'post-1',
      title: 'Hello World',
      content: 'This is a new post has enough content.',
      authorId: 'teacher-1',
    }

    const postRepository = {
      findById: jest.fn().mockResolvedValue(post),
      delete: jest.fn().mockResolvedValue(post),
    } as unknown as PostRepository

    const useCase = new DeletePostUseCase(postRepository)
    const result = await useCase.handler('post-1', {
      id: 'admin-1',
      role: UserRole.ADMIN,
    })

    expect(postRepository.delete).toHaveBeenCalledWith('post-1')
    expect(result).toEqual(post)
  })

  it('throws ForbiddenPostAccessError when a TEACHER tries to delete a post they do not own', async () => {
    const post = {
      id: 'post-1',
      title: 'Hello World',
      content: 'This is a new post has enough content.',
      authorId: 'teacher-1',
    }

    const postRepository = {
      findById: jest.fn().mockResolvedValue(post),
      delete: jest.fn(),
    } as unknown as PostRepository

    const useCase = new DeletePostUseCase(postRepository)

    await expect(
      useCase.handler('post-1', { id: 'teacher-2', role: UserRole.TEACHER }),
    ).rejects.toThrow(ForbiddenPostAccessError)

    expect(postRepository.delete).not.toHaveBeenCalled()
  })

  it('returns undefined when the post does not exist', async () => {
    const postRepository = {
      findById: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn(),
    } as unknown as PostRepository

    const useCase = new DeletePostUseCase(postRepository)
    const result = await useCase.handler('post-999', {
      id: 'teacher-1',
      role: UserRole.TEACHER,
    })

    expect(result).toBeUndefined()
    expect(postRepository.delete).not.toHaveBeenCalled()
  })
})
