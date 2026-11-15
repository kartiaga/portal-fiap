import z from 'zod'
import { paginationQuerySchema } from '@/lib/pagination'

export const COMMENT_MAX_LENGTH = 1000

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(COMMENT_MAX_LENGTH),
})

export const listCommentsQuerySchema = paginationQuerySchema

export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>
