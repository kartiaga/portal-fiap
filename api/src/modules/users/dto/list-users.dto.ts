import z from 'zod'
import { paginationQuerySchema } from '@/lib/pagination'
import { UserRole } from '../entities/user'

export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  role: z.nativeEnum(UserRole).optional(),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
