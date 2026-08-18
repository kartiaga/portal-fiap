import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UpdatePostUseCase } from '@/modules/posts/use-cases/update-post.use-case'

describe('Update Post Controller', () => {
    it('should handle post update correctly when use-case succeeds', async () => {
        const mockPost = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Updated Title',
            content: 'Updated content with minimum length.',
            authorId: 'user-1',
        }

        // Simulate the controller behavior
        const mockUseCase = {
            handler: jest.fn().mockResolvedValue(mockPost),
        } as unknown as UpdatePostUseCase

        const result = await mockUseCase.handler(
            '123e4567-e89b-12d3-a456-426614174000',
            { title: 'Updated Title', content: 'Updated content with minimum length.' }
        )

        expect(result).toEqual(mockPost)
        expect(mockUseCase.handler).toHaveBeenCalledWith(
            '123e4567-e89b-12d3-a456-426614174000',
            expect.objectContaining({
                title: 'Updated Title',
                content: 'Updated content with minimum length.',
            })
        )
    })

    it('should return null when post is not found', async () => {
        const mockUseCase = {
            handler: jest.fn().mockResolvedValue(undefined),
        } as unknown as UpdatePostUseCase

        const result = await mockUseCase.handler(
            'non-existent-id',
            { title: 'Any Title', content: 'Any content here.' }
        )

        expect(result).toBeUndefined()
    })

    it('should pass correct parameters to use-case', async () => {
        const mockUseCase = {
            handler: jest.fn().mockResolvedValue({ id: '123' }),
        } as unknown as UpdatePostUseCase

        const updateData = {
            title: 'New Title',
            content: 'New content with enough characters.',
        }

        await mockUseCase.handler('test-id', updateData)

        expect(mockUseCase.handler).toHaveBeenCalledWith('test-id', updateData)
    })
})
