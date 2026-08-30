import { database } from '@/lib/db'
import {
  buildPaginatedResult,
  decodeCursor,
  encodeCursor,
  resolveLimit,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'
import type { User } from '../entities/user'
import { UserRole } from '../entities/user'

interface UserRow {
  id: string
  email: string
  password: string
  role: UserRole
  created_at: Date
  cursor_created_at: string
  updated_at: Date
}

export class UserRepository {
  private mapRow(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  public async create({
    email,
    password,
    role,
  }: User): Promise<User | undefined> {
    const result = await database.clienteInstance?.query(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *`,
      [email, password, role],
    )

    const row = result?.rows[0]
    if (!row) return undefined

    return this.mapRow(row as UserRow)
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const result = await database.clienteInstance?.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    )

    const row = result?.rows[0]
    if (!row) return undefined

    return this.mapRow(row as UserRow)
  }

  public async findPaginated(
    params: PaginationParams & { search?: string | undefined } = {},
  ): Promise<PaginatedResult<User>> {
    const limit = resolveLimit(params.limit)
    const fetchLimit = limit + 1
    const searchPattern = params.search ? `%${params.search}%` : undefined

    const SELECT_COLUMNS = `
      id, email, password, role, created_at,
      to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_created_at,
      updated_at
    `
    let result

    if (params.cursor) {
      const { createdAt, id } = decodeCursor(params.cursor)

      if (searchPattern) {
        result = await database.clienteInstance?.query(
          `
           SELECT ${SELECT_COLUMNS}
          FROM users
          WHERE email ILIKE $1
            AND (created_at, id) < ($2::timestamptz, $3::uuid)
          ORDER BY created_at DESC, id DESC
          LIMIT $4
          `,
          [searchPattern, createdAt, id, fetchLimit],
        )
      } else {
        result = await database.clienteInstance?.query(
          `
          SELECT ${SELECT_COLUMNS}
          FROM users
          WHERE (created_at, id) < ($1::timestamptz, $2::uuid)
          ORDER BY created_at DESC, id DESC
          LIMIT $3
          `,
          [createdAt, id, fetchLimit],
        )
      }
    } else if (searchPattern) {
      result = await database.clienteInstance?.query(
        `
        SELECT ${SELECT_COLUMNS}
        FROM users
        WHERE email ILIKE $1
        ORDER BY created_at DESC, id DESC
        LIMIT $2
        `,
        [searchPattern, fetchLimit],
      )
    } else {
      result = await database.clienteInstance?.query(
        `
        SELECT ${SELECT_COLUMNS}
        FROM users
        ORDER BY created_at DESC, id DESC
        LIMIT $1
        `,
        [fetchLimit],
      )
    }

    const rows = (result?.rows ?? []) as UserRow[]
    
   return buildPaginatedResult(rows, limit, (row) => this.mapRow(row))
  }
}
