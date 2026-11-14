import z from 'zod'
import { paginationQuerySchema } from '@/lib/pagination'

export const listPostsQuerySchema = paginationQuerySchema.extend({
  authorId: z.uuid().optional(),
})

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>
