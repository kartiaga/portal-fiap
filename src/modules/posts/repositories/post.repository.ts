import { database } from '@/lib/db'
import type { Post } from '../entities/post'

export class PostRepository {
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

        return {
            id: row.id,
            title: row.title,
            content: row.content,
            authorId: row.author_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }
    }

    public async findAll(): Promise<Post[]> {
        const result = await database.clienteInstance?.query(
            `SELECT * FROM posts ORDER BY created_at DESC`,
        )

        const rows = result?.rows ?? []

        return rows.map((row: any) => ({
            id: row.id,
            title: row.title,
            content: row.content,
            authorId: row.author_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }))
    }
}
