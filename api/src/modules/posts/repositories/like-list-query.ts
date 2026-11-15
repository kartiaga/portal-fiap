import {
  decodeCursor,
  resolveLimit,
  type PaginationParams,
} from '@/lib/pagination'

/**
 * Quem curtiu uma postagem, das curtidas mais recentes para as mais antigas, paginado por cursor.
 * O id da pessoa sai como `id` porque é ele que o cursor usa para desempatar.
 */
export function buildLikeListQuery(postId: string, params: PaginationParams) {
  const values: unknown[] = [postId]
  const conditions = ['post_likes.post_id = $1::uuid']

  if (params.cursor) {
    const { createdAt, id } = decodeCursor(params.cursor)
    values.push(createdAt, id)
    conditions.push(
      `(post_likes.created_at, post_likes.user_id) < ($${values.length - 1}::timestamptz, $${values.length}::uuid)`,
    )
  }
  values.push(resolveLimit(params.limit) + 1)

  return {
    values,
    sql: `SELECT post_likes.user_id AS id, post_likes.created_at,
                 to_char(post_likes.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_created_at,
                 profiles.name, profiles.avatar_key
          FROM post_likes
          LEFT JOIN profiles ON profiles.user_id = post_likes.user_id
          WHERE ${conditions.join(' AND ')}
          ORDER BY post_likes.created_at DESC, post_likes.user_id DESC
          LIMIT $${values.length}`,
  }
}
