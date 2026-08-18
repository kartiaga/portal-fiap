import type { FastifyRequest } from 'fastify'
import { createPostSchema } from '@/modules/posts/dto/create-post.dto'
import { updatePostSchema } from '@/modules/posts/dto/update-post.dto'

describe('Post DTOs', () => {
    describe('createPostSchema', () => {
        it('should validate a valid post creation payload', () => {
            const payload = {
                title: 'Test Post Title',
                content: 'This is a test post with sufficient content length.',
            }

            const result = createPostSchema.parse(payload)

            expect(result.title).toBe(payload.title)
            expect(result.content).toBe(payload.content)
        })

        it('should reject a post with missing title', () => {
            const payload = {
                content: 'This is a test post with sufficient content length.',
            }

            expect(() => createPostSchema.parse(payload)).toThrow()
        })

        it('should reject a post with missing content', () => {
            const payload = {
                title: 'Test Post Title',
            }

            expect(() => createPostSchema.parse(payload)).toThrow()
        })

        it('should reject a post with title shorter than 3 characters', () => {
            const payload = {
                title: 'ab',
                content: 'This is a test post with sufficient content length.',
            }

            expect(() => createPostSchema.parse(payload)).toThrow()
        })

        it('should reject a post with content shorter than 10 characters', () => {
            const payload = {
                title: 'Test Post Title',
                content: 'short',
            }

            expect(() => createPostSchema.parse(payload)).toThrow()
        })
    })

    describe('updatePostSchema', () => {
        it('should validate a valid post update payload', () => {
            const payload = {
                title: 'Updated Post Title',
                content: 'This is an updated post with sufficient content length.',
            }

            const result = updatePostSchema.parse(payload)

            expect(result.title).toBe(payload.title)
            expect(result.content).toBe(payload.content)
        })

        it('should reject an update with title shorter than 3 characters', () => {
            const payload = {
                title: 'ab',
                content: 'This is an updated post with sufficient content length.',
            }

            expect(() => updatePostSchema.parse(payload)).toThrow()
        })

        it('should reject an update with content shorter than 10 characters', () => {
            const payload = {
                title: 'Updated Post Title',
                content: 'short',
            }

            expect(() => updatePostSchema.parse(payload)).toThrow()
        })

        it('should accept exact minimum lengths', () => {
            const payload = {
                title: 'abc',
                content: '0123456789',
            }

            const result = updatePostSchema.parse(payload)

            expect(result.title).toBe('abc')
            expect(result.content).toBe('0123456789')
        })
    })
})
