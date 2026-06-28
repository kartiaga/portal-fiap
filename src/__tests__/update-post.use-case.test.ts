import { UpdatePostUseCase } from '@/modules/posts/use-cases/update-post.use-case'

describe('UpdatePostUseCase', () => {
    it('delegates the update to the repository', async () => {
        const data = {
            title: 'Updated title',
            content: 'This is the updated content with enough length.',
        }
        const updatedPost = {
            id: 'post-1',
            authorId: 'user-1',
            ...data,
        }

        const postRepository = {
            update: jest.fn().mockResolvedValue(updatedPost),
        } as any

        const useCase = new UpdatePostUseCase(postRepository)
        const result = await useCase.handler('post-1', data)

        expect(postRepository.update).toHaveBeenCalledWith('post-1', data)
        expect(result).toEqual(updatedPost)
    })

    it('returns undefined when the post does not exist', async () => {
        const data = {
            title: 'Updated title',
            content: 'This is the updated content with enough length.',
        }

        const postRepository = {
            update: jest.fn().mockResolvedValue(undefined),
        } as any

        const useCase = new UpdatePostUseCase(postRepository)
        const result = await useCase.handler('missing-id', data)

        expect(postRepository.update).toHaveBeenCalledWith('missing-id', data)
        expect(result).toBeUndefined()
    })
})
