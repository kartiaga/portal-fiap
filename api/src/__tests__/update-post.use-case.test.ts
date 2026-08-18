import { UpdatePostUseCase } from '@/modules/posts/use-cases/update-post.use-case'
import type { PostRepository } from '@/modules/posts/repositories/post.repository'

describe('UpdatePostUseCase', () => {
    it('should update a post with title and content', async () => {
        const postId = 'post-1'
        const updateData = {
            title: 'Updated Title',
            content: 'This is the updated content with enough characters.',
        }
        const updatedPost = {
            id: postId,
            ...updateData,
            authorId: 'user-1',
        }

        const postRepository = {
            update: jest.fn().mockResolvedValue(updatedPost),
        } as unknown as PostRepository

        const useCase = new UpdatePostUseCase(postRepository)
        const result = await useCase.handler(postId, updateData)

        expect(postRepository.update).toHaveBeenCalledWith(postId, updateData)
        expect(result).toEqual(updatedPost)
    })

    it('should return undefined if post not found', async () => {
        const postId = 'non-existent-post'
        const updateData = {
            title: 'Updated Title',
            content: 'Updated content.',
        }

        const postRepository = {
            update: jest.fn().mockResolvedValue(undefined),
        } as unknown as PostRepository

        const useCase = new UpdatePostUseCase(postRepository)
        const result = await useCase.handler(postId, updateData)

        expect(postRepository.update).toHaveBeenCalledWith(postId, updateData)
        expect(result).toBeUndefined()
    })

    it('should pass only title and content to repository', async () => {
        const postId = 'post-1'
        const updateData = {
            title: 'New Title',
            content: 'New content here with minimum length.',
        }
        const updatedPost = {
            id: postId,
            ...updateData,
            authorId: 'user-1',
        }

        const postRepository = {
            update: jest.fn().mockResolvedValue(updatedPost),
        } as unknown as PostRepository

        const useCase = new UpdatePostUseCase(postRepository)
        await useCase.handler(postId, updateData)

        expect(postRepository.update).toHaveBeenCalledWith(postId, {
            title: updateData.title,
            content: updateData.content,
        })
        expect(postRepository.update).not.toHaveBeenCalledWith(postId, expect.objectContaining({ authorId: expect.anything() }))
    })
})
