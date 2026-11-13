import {
  decodeCursor,
  resolveLimit,
  type PaginationParams,
} from '@/lib/pagination'
import type { UserRole } from '../entities/user'
import z from 'zod'

export type UserListParams = PaginationParams & {
  search?: string | undefined
  role?: UserRole | undefined
}

export function buildUserListQuery(params: UserListParams) {
  const values: unknown[] = []
  const conditions: string[] = []
  if (params.role) {
    values.push(params.role)
    conditions.push(`users.role = $${values.length}`)
  }
  if (params.search) {
    values.push(`%${params.search}%`)
    conditions.push(`users.email ILIKE $${values.length}`)
  }
  if (params.cursor) {
    const { createdAt, id } = decodeCursor(params.cursor)
    if (!z.uuid().safeParse(id).success) throw new Error('Invalid cursor')
    values.push(createdAt, id)
    conditions.push(
      `(users.created_at, users.id) < ($${values.length - 1}::timestamptz, $${values.length}::uuid)`,
    )
  }
  values.push(resolveLimit(params.limit) + 1)
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  return {
    values,
    sql: `SELECT users.id, users.email, users.role, users.created_at,
                 to_char(users.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_created_at,
                 users.updated_at, profiles.name
          FROM users LEFT JOIN profiles ON profiles.user_id = users.id
          ${where}
          ORDER BY users.created_at DESC, users.id DESC
          LIMIT $${values.length}`,
  }
}
