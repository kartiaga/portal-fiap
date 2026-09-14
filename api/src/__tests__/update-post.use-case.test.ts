import { UpdatePostUseCase } from '@/modules/posts/use-cases/update-post.use-case'
import { ForbiddenPostAccessError } from '@/modules/posts/errors'
import { UserRole } from '@/modules/users/entities/user'
import type { PostRepository } from '@/modules/posts/repositories/post.repository'

describe('UpdatePostUseCase', () => {
  it('delegates the update to the repository when the requester is the author', async () => {
    const post = {
      id: 'post-1',
      title: 'Updated title',
      content: 'Updated content with enough characters.',
      authorId: 'user-1',
    }
    const updateData = {
      title: post.title,
      content: post.content,
    }

    const postRepository = {
      findById: jest.fn().mockResolvedValue(post),
      update: jest.fn().mockResolvedValue(post),
    } as unknown as PostRepository

    const useCase = new UpdatePostUseCase(postRepository)
    const result = await useCase.handler(post.id, updateData, {
      id: 'user-1',
      role: UserRole.TEACHER,
    })

    expect(postRepository.update).toHaveBeenCalledWith(post.id, updateData)
    expect(result).toEqual(post)
  })

  it('allows an ADMIN to update a post authored by someone else', async () => {
    const post = {
      id: 'post-1',
      title: 'Updated title',
      content: 'Updated content with enough characters.',
      authorId: 'teacher-1',
    }
    const updateData = { title: post.title, content: post.content }

    const postRepository = {
      findById: jest.fn().mockResolvedValue(post),
      update: jest.fn().mockResolvedValue(post),
    } as unknown as PostRepository

    const useCase = new UpdatePostUseCase(postRepository)
    const result = await useCase.handler(post.id, updateData, {
      id: 'admin-1',
      role: UserRole.ADMIN,
    })

    expect(postRepository.update).toHaveBeenCalledWith(post.id, updateData)
    expect(result).toEqual(post)
  })

  it('throws ForbiddenPostAccessError when a TEACHER tries to update a post they do not own', async () => {
    const post = {
      id: 'post-1',
      title: 'Original title',
      content: 'Original content with enough characters.',
      authorId: 'teacher-1',
    }

    const postRepository = {
      findById: jest.fn().mockResolvedValue(post),
      update: jest.fn(),
    } as unknown as PostRepository

    const useCase = new UpdatePostUseCase(postRepository)

    await expect(
      useCase.handler(
        post.id,
        { title: 'New title', content: 'New content with enough characters.' },
        { id: 'teacher-2', role: UserRole.TEACHER },
      ),
    ).rejects.toThrow(ForbiddenPostAccessError)

    expect(postRepository.update).not.toHaveBeenCalled()
  })

  it('returns undefined when the post does not exist', async () => {
    const postRepository = {
      findById: jest.fn().mockResolvedValue(undefined),
      update: jest.fn(),
    } as unknown as PostRepository

    const useCase = new UpdatePostUseCase(postRepository)
    const result = await useCase.handler(
      'post-999',
      {
        title: 'Updated title',
        content: 'Updated content with enough characters.',
      },
      { id: 'teacher-1', role: UserRole.TEACHER },
    )

    expect(result).toBeUndefined()
    expect(postRepository.update).not.toHaveBeenCalled()
  })
})
