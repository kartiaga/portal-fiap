import { database } from '@/lib/db'
import {
  buildPaginatedResult,
  resolveLimit,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'
import { publicAvatarUrl } from '@/lib/storage'

import type { LikeSummary, Liker } from '../entities/comment'
import { buildLikeListQuery } from './like-list-query'

interface LikerRow {
  id: string
  name?: string | null
  avatar_key?: string | null
  created_at: Date
  cursor_created_at: string
}

export class PostLikeRepository {
  public async findLikers(
    postId: string,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<Liker>> {
    const limit = resolveLimit(params.limit)
    const { sql, values } = buildLikeListQuery(postId, { ...params, limit })

    const result = await database.clienteInstance?.query(sql, values)
    const rows = (result?.rows ?? []) as LikerRow[]

    return buildPaginatedResult(rows, limit, (row) => ({
      userId: row.id,
      name: row.name ?? undefined,
      avatarUrl: publicAvatarUrl(row.avatar_key),
      likedAt: row.created_at,
    }))
  }

  /** Curtir de novo não muda nada: a chave (post_id, user_id) segura uma curtida por pessoa. */
  public async like(postId: string, userId: string): Promise<void> {
    await database.clienteInstance?.query(
      `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [postId, userId],
    )
  }

  public async unlike(postId: string, userId: string): Promise<void> {
    await database.clienteInstance?.query(
      `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId],
    )
  }

  public async summary(postId: string, userId: string): Promise<LikeSummary> {
    const result = await database.clienteInstance?.query(
      `SELECT count(*)::int AS like_count,
              coalesce(bool_or(user_id = $2), false) AS liked_by_me
       FROM post_likes
       WHERE post_id = $1`,
      [postId, userId],
    )

    const row = result?.rows[0] as
      | { like_count: number; liked_by_me: boolean }
      | undefined

    return {
      likeCount: row?.like_count ?? 0,
      likedByMe: row?.liked_by_me ?? false,
    }
  }
}
