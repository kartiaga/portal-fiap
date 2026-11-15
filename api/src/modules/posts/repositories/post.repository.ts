import { database } from '@/lib/db'
import { publicAvatarUrl } from '@/lib/storage'

import {
  buildPaginatedResult,
  resolveLimit,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'

import type { Post } from '../entities/post'
import { buildPostListQuery } from './post-list-query'

export type PostListParams = PaginationParams & {
  /** Só as postagens deste autor. */
  authorId?: string | undefined
}

interface PostRow {
  id: string
  title: string
  content: string
  author_id: string
  author_name?: string | null
  author_avatar_key?: string | null
  created_at: Date
  cursor_created_at: string
  updated_at: Date
}

export class PostRepository {
  private mapRow(row: PostRow): Post {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      authorId: row.author_id,
      authorName: row.author_name ?? undefined,
      authorAvatarUrl: publicAvatarUrl(row.author_avatar_key),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  public async create({
    title,
    content,
    authorId,
  }: Post): Promise<Post | undefined> {
    const result = await database.clienteInstance?.query(
      `INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING *`,
      [title, content, authorId],
    )

    const row = result?.rows[0]
    if (!row) return undefined

    return this.mapRow(row as PostRow)
  }

  public async findById(id: string): Promise<Post | undefined> {
    const result = await database.clienteInstance?.query(
      `
      SELECT posts.*, profiles.name AS author_name,
             profiles.avatar_key AS author_avatar_key
      FROM posts
      LEFT JOIN profiles ON profiles.user_id = posts.author_id
      WHERE posts.id = $1
      LIMIT 1
      `,
      [id],
    )

    const row = result?.rows[0]
    if (!row) return undefined

    return this.mapRow(row as PostRow)
  }

  public async update(
    id: string,
    { title, content }: Pick<Post, 'title' | 'content'>,
  ): Promise<Post | undefined> {
    const result = await database.clienteInstance?.query(
      `UPDATE posts SET title = $1, content = $2, updated_at = now() WHERE id = $3 RETURNING *`,
      [title, content, id],
    )

    const row = result?.rows[0]
    if (!row) return undefined

    return this.mapRow(row as PostRow)
  }

  public async search(term: string): Promise<Post[]> {
    const result = await database.clienteInstance?.query(
      `
      SELECT posts.*, profiles.name AS author_name,
             profiles.avatar_key AS author_avatar_key
      FROM posts
      LEFT JOIN profiles ON profiles.user_id = posts.author_id
      WHERE posts.title ILIKE $1
        OR posts.content ILIKE $1
        OR profiles.name ILIKE $1
      ORDER BY posts.created_at DESC
      `,
      [`%${term}%`],
    )

    const rows = result?.rows ?? []
    return rows.map((row: PostRow) => this.mapRow(row))
  }

  public async delete(id: string): Promise<Post | undefined> {
    const result = await database.clienteInstance?.query(
      `DELETE FROM posts WHERE id = $1 RETURNING *`,
      [id],
    )

    const row = result?.rows[0]
    if (!row) return undefined

    return this.mapRow(row as PostRow)
  }

  public async findPaginated(
    params: PostListParams = {},
  ): Promise<PaginatedResult<Post>> {
    const limit = resolveLimit(params.limit)
    const { sql, values } = buildPostListQuery({ ...params, limit })

    const result = await database.clienteInstance?.query(sql, values)
    const rows = (result?.rows ?? []) as PostRow[]

    return buildPaginatedResult(rows, limit, (row) => this.mapRow(row))
  }
}
