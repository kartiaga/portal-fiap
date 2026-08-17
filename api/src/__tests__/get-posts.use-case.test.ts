import type { PostRepository } from '@/modules/posts/repositories/post.repository'
import { GetPostsUseCase } from '@/modules/posts/use-cases/get-posts.use-case'

describe('GetPostsUseCase', () => {
  it('returns paginated posts from the repository', async () => {
    const paginatedResult = {
      items: [
        {
          id: 'post-1',
          title: 'Hello World',
          content: 'This is a new post that has enough content.',
          authorId: 'user-1',
        },
        {
          id: 'post-2',
          title: 'Second Post',
          content: 'Another post with enough content to be valid.',
          authorId: 'user-2',
        },
      ],
      nextCursor: 'cursor-abc',
      hasMore: true,
    }

    const postRepository = {
      findPaginated: jest.fn().mockResolvedValue(paginatedResult),
    } as unknown as PostRepository

    const useCase = new GetPostsUseCase(postRepository)
    const result = await useCase.handler({ limit: 2 })

    expect(postRepository.findPaginated).toHaveBeenCalledWith({ limit: 2 })
    expect(result).toEqual(paginatedResult)
  })

  it('returns empty paginated result when there are no posts', async () => {
    const paginatedResult = {
      items: [],
      nextCursor: null,
      hasMore: false,
    }

    const postRepository = {
      findPaginated: jest.fn().mockResolvedValue(paginatedResult),
    } as unknown as PostRepository

    const useCase = new GetPostsUseCase(postRepository)
    const result = await useCase.handler()

    expect(postRepository.findPaginated).toHaveBeenCalledWith({})
    expect(result).toEqual(paginatedResult)
  })
})
