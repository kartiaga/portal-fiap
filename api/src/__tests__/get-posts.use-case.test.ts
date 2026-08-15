import type { PostRepository } from '@/modules/posts/repositories/post.repository'
import { GetPostsUseCase } from '@/modules/posts/use-cases/get-posts.use-case'

describe('GetPostsUseCase', () => {
  it('returns the list of posts from the repository', async () => {
    const posts = [
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
    ]

    const postRepository = {
      findAll: jest.fn().mockResolvedValue(posts),
    } as unknown as PostRepository

    const useCase = new GetPostsUseCase(postRepository)
    const result = await useCase.handler()

    expect(postRepository.findAll).toHaveBeenCalledTimes(1)
    expect(result).toEqual(posts)
  })

  it('returns an empty list when there are no posts', async () => {
    const postRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    } as unknown as PostRepository

    const useCase = new GetPostsUseCase(postRepository)
    const result = await useCase.handler()

    expect(postRepository.findAll).toHaveBeenCalledTimes(1)
    expect(result).toEqual([])
  })
})
