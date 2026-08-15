import type { PostRepository } from '@/modules/posts/repositories/post.repository'
import { SearchPostsUseCase } from '@/modules/posts/use-cases/search-posts.use-case'
describe('SearchPostsUseCase', () => {
  it('returns posts matching the search term', async () => {
    const posts = [
      {
        id: 'post-1',
        title: 'Node.js',
        content: 'Learning Node.js',
        authorId: 'user-1',
      },
    ]

    const postRepository = {
      search: jest.fn().mockResolvedValue(posts),
    } as unknown as PostRepository
    const useCase = new SearchPostsUseCase(postRepository)
    const result = await useCase.handler('search term')

    expect(postRepository.search).toHaveBeenCalledWith('search term')
    expect(result).toEqual(posts)
  })

  it('returns an empty list when no posts are found', async () => {
    const postRepository = {
      search: jest.fn().mockResolvedValue([]),
    } as unknown as PostRepository

    const useCase = new SearchPostsUseCase(postRepository)
    const result = await useCase.handler('search term')

    expect(postRepository.search).toHaveBeenCalledWith('search term')
    expect(result).toEqual([])
  })
})
