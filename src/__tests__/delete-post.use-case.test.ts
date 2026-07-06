import { DeletePostUseCase } from '@/modules/posts/use-cases/delete-posts.use-case'

describe('DeletePostUseCase', () => {
    it('deletes a post through the repository', async () => {
        const post = {
            id: 'post-1',
            title: 'Hello World',
            content: 'This is a new post has enough content.',
            authorId: 'user-1',
        }

        const postRepository = {
            delete: jest.fn().mockResolvedValue(post),
        } as any

        const useCase = new DeletePostUseCase(postRepository)
        const result = await useCase.handler('post-1')

        expect(postRepository.delete).toHaveBeenCalledWith('post-1')
        expect(result).toEqual(post)
    })

    it('returns undefined when the post does not exist', async () => {
        const postRepository = {
            delete: jest.fn().mockResolvedValue(undefined),
        } as any

        const useCase = new DeletePostUseCase(postRepository)
        const result = await useCase.handler('post-999')

        expect(postRepository.delete).toHaveBeenCalledWith('post-999')
        expect(result).toBeUndefined()
    })
})