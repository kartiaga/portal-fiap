import {
  decodeCursor,
  resolveLimit,
  type PaginationParams,
} from '@/lib/pagination'

/** Colunas de um comentário com o nome e a foto do autor. Espera `post_comments` e `profiles`. */
export const COMMENT_COLUMNS = `post_comments.id, post_comments.post_id,
       post_comments.author_id, post_comments.content, post_comments.created_at,
       to_char(post_comments.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_created_at,
       profiles.name AS author_name, profiles.avatar_key AS author_avatar_key`

/** Comentários de uma postagem, dos mais recentes para os mais antigos, paginados por cursor. */
export function buildCommentListQuery(
  postId: string,
  params: PaginationParams,
) {
  const values: unknown[] = [postId]
  const conditions = ['post_comments.post_id = $1::uuid']

  if (params.cursor) {
    const { createdAt, id } = decodeCursor(params.cursor)
    values.push(createdAt, id)
    conditions.push(
      `(post_comments.created_at, post_comments.id) < ($${values.length - 1}::timestamptz, $${values.length}::uuid)`,
    )
  }
  values.push(resolveLimit(params.limit) + 1)

  return {
    values,
    sql: `SELECT ${COMMENT_COLUMNS}
          FROM post_comments
          LEFT JOIN profiles ON profiles.user_id = post_comments.author_id
          WHERE ${conditions.join(' AND ')}
          ORDER BY post_comments.created_at DESC, post_comments.id DESC
          LIMIT $${values.length}`,
  }
}
