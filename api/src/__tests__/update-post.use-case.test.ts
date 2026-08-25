import { UpdatePostUseCase } from '@/modules/posts/use-cases/update-post.use-case'
import type { PostRepository } from '@/modules/posts/repositories/post.repository'

describe('UpdatePostUseCase', () => {
  it('delegates the update to the repository', async () => {
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
      update: jest.fn().mockResolvedValue(post),
    } as unknown as PostRepository

    const useCase = new UpdatePostUseCase(postRepository)
    const result = await useCase.handler(post.id, updateData)

    expect(postRepository.update).toHaveBeenCalledWith(post.id, updateData)
    expect(result).toEqual(post)
  })

  it('returns undefined when the post does not exist', async () => {
    const postRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostRepository

    const useCase = new UpdatePostUseCase(postRepository)
    const result = await useCase.handler('post-999', {
      title: 'Updated title',
      content: 'Updated content with enough characters.',
    })

    expect(postRepository.update).toHaveBeenCalledWith('post-999', {
      title: 'Updated title',
      content: 'Updated content with enough characters.',
    })
    expect(result).toBeUndefined()
  })
})
