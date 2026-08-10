import { CreatePostUseCase } from '@/modules/posts/use-cases/create-post.use-case'

describe('CreatePostUseCase', () => {
    it('delegates creation to the repository', async () => {
        const post = {
            id: 'post-1',
            title: 'Hello World',
            content: 'This is a new post that has enough content.',
            authorId: 'user-1',
        }

        const postRepository = {
            create: jest.fn().mockResolvedValue(post),
        } as any

        const useCase = new CreatePostUseCase(postRepository)
        const result = await useCase.handler(post)

        expect(postRepository.create).toHaveBeenCalledWith(post)
        expect(result).toEqual(post)
    })
})
