import { engagementColumns } from './post-engagement-sql'
import {
  decodeCursor,
  resolveLimit,
  type PaginationParams,
} from '@/lib/pagination'

export type PostListQueryParams = PaginationParams & {
  authorId?: string | undefined
  /** Quem pede a lista: define `liked_by_me` de cada postagem. */
  viewerId?: string | undefined
}

/**
 * Monta a consulta da listagem paginada de postagens, com filtro opcional por autor e os
 * contadores de curtidas e comentários.
 */
export function buildPostListQuery(params: PostListQueryParams) {
  const values: unknown[] = []
  const conditions: string[] = []

  if (params.authorId) {
    values.push(params.authorId)
    conditions.push(`posts.author_id = $${values.length}::uuid`)
  }
  if (params.cursor) {
    const { createdAt, id } = decodeCursor(params.cursor)
    values.push(createdAt, id)
    conditions.push(
      `(posts.created_at, posts.id) < ($${values.length - 1}::timestamptz, $${values.length}::uuid)`,
    )
  }
  let viewerParam: string | undefined
  if (params.viewerId) {
    values.push(params.viewerId)
    viewerParam = `$${values.length}`
  }
  values.push(resolveLimit(params.limit) + 1)
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  return {
    values,
    sql: `SELECT posts.id, posts.title, posts.content, posts.author_id,
                 profiles.name AS author_name,
                 profiles.avatar_key AS author_avatar_key, posts.created_at,
                 to_char(posts.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_created_at,
                 posts.updated_at,
                 ${engagementColumns(viewerParam)}
          FROM posts
          LEFT JOIN profiles ON profiles.user_id = posts.author_id
          ${where}
          ORDER BY posts.created_at DESC, posts.id DESC
          LIMIT $${values.length}`,
  }
}
