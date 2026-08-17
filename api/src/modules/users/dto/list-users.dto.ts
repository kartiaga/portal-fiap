import z from 'zod'
import { paginationQuerySchema } from '@/lib/pagination'

export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
