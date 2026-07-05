import { database } from '@/lib/db'
import type { Post } from '../entities/post'

interface PostRow {
    id: string;
    title: string;
    content: string;
    author_id: string;
    created_at: Date;
    updated_at: Date;
}

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

    public async findById(id: string): Promise<Post | undefined> {
        const result = await database.clienteInstance?.query(
            `SELECT * FROM posts WHERE id = $1 LIMIT 1`,
            [id],
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

        return {
            id: row.id,
            title: row.title,
            content: row.content,
            authorId: row.author_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }
    }

    public async search(term: string): Promise<Post[]> {
        const result = await database.clienteInstance?.query(
            `
            SELECT *
            FROM posts
            WHERE title ILIKE $1
                OR content ILIKE $1
                ORDER BY created_at DESC
                `,
            [`%${term}%`],
        )

        const rows = result?.rows ?? []
        return rows.map((row: PostRow) => ({
            id: row.id,
            title: row.title,
            content: row.content,
            authorId: row.author_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }))
    }

    public async findAll(): Promise<Post[]> {
        const result = await database.clienteInstance?.query(
            `SELECT * FROM posts ORDER BY created_at DESC`,
        )

        const rows = result?.rows ?? []

        return rows.map((row: PostRow) => ({
            id: row.id,
            title: row.title,
            content: row.content,
            authorId: row.author_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }))
    }
}
