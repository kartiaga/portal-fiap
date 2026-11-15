import { database } from '@/lib/db'
import {
  buildPaginatedResult,
  resolveLimit,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'
import { publicAvatarUrl } from '@/lib/storage'

import type { Comment } from '../entities/comment'
import { buildCommentListQuery, COMMENT_COLUMNS } from './comment-list-query'

interface CommentRow {
  id: string
  post_id: string
  author_id: string
  author_name?: string | null
  author_avatar_key?: string | null
  content: string
  created_at: Date
  cursor_created_at: string
}

export class CommentRepository {
  private mapRow(row: CommentRow): Comment {
    return {
      id: row.id,
      postId: row.post_id,
      authorId: row.author_id,
      authorName: row.author_name ?? undefined,
      authorAvatarUrl: publicAvatarUrl(row.author_avatar_key),
      content: row.content,
      createdAt: row.created_at,
    }
  }

  public async findPaginated(
    postId: string,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<Comment>> {
    const limit = resolveLimit(params.limit)
    const { sql, values } = buildCommentListQuery(postId, { ...params, limit })

    const result = await database.clienteInstance?.query(sql, values)
    const rows = (result?.rows ?? []) as CommentRow[]

    return buildPaginatedResult(rows, limit, (row) => this.mapRow(row))
  }

  /** Grava e devolve o comentário já com o nome e a foto do autor, numa consulta só. */
  public async create(
    postId: string,
    authorId: string,
    content: string,
  ): Promise<Comment | undefined> {
    const result = await database.clienteInstance?.query(
      `WITH inserted AS (
         INSERT INTO post_comments (post_id, author_id, content)
         VALUES ($1, $2, $3)
         RETURNING *
       )
       SELECT ${COMMENT_COLUMNS}
       FROM inserted AS post_comments
       LEFT JOIN profiles ON profiles.user_id = post_comments.author_id`,
      [postId, authorId, content],
    )

    const row = result?.rows[0] as CommentRow | undefined
    return row ? this.mapRow(row) : undefined
  }

  public async findById(
    id: string,
  ): Promise<Pick<Comment, 'id' | 'postId' | 'authorId'> | undefined> {
    const result = await database.clienteInstance?.query(
      `SELECT id, post_id, author_id FROM post_comments WHERE id = $1 LIMIT 1`,
      [id],
    )

    const row = result?.rows[0] as
      | Pick<CommentRow, 'id' | 'post_id' | 'author_id'>
      | undefined
    if (!row) return undefined

    return { id: row.id, postId: row.post_id, authorId: row.author_id }
  }

  public async delete(id: string): Promise<void> {
    await database.clienteInstance?.query(
      `DELETE FROM post_comments WHERE id = $1`,
      [id],
    )
  }
}
