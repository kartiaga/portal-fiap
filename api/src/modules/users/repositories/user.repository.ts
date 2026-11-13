import { database } from '@/lib/db'
import {
  buildPaginatedResult,
  resolveLimit,
  type PaginatedResult,
} from '@/lib/pagination'
import type { User } from '../entities/user'
import { UserRole } from '../entities/user'
import { buildUserListQuery, type UserListParams } from './user-list-query'
import { safeDeleteUser, type DeleteUserResult } from './safe-delete-user'

interface UserRow {
  id: string
  email: string
  password: string
  role: UserRole
  created_at: Date
  updated_at: Date
}

interface PublicUserRow extends Omit<UserRow, 'password'> {
  name: string | null
  cursor_created_at: string
}

export type PublicUser = {
  id: string
  email: string
  name: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
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

  private mapPublicRow(row: PublicUserRow): PublicUser {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
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
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, password, role],
    )
    const row = result?.rows[0] as UserRow | undefined
    return row ? this.mapRow(row) : undefined
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const result = await database.clienteInstance?.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    )
    const row = result?.rows[0] as UserRow | undefined
    return row ? this.mapRow(row) : undefined
  }

  public async findById(id: string): Promise<PublicUser | undefined> {
    const result = await database.clienteInstance?.query(
      `SELECT users.id, users.email, users.role, users.created_at, users.updated_at, profiles.name
       FROM users LEFT JOIN profiles ON profiles.user_id = users.id
       WHERE users.id = $1`,
      [id],
    )
    const row = result?.rows[0] as PublicUserRow | undefined
    return row ? this.mapPublicRow(row) : undefined
  }

  public async update(
    id: string,
    data: { email: string; name: string; password?: string | undefined },
  ): Promise<PublicUser | undefined> {
    // Uma instrução mantém a atualização de users e profiles atômica.
    const result = await database.clienteInstance?.query(
      `WITH updated_user AS (
         UPDATE users SET email = $2, password = COALESCE($4, password), updated_at = now()
         WHERE id = $1
         RETURNING id, email, role, created_at, updated_at
       ), updated_profile AS (
         INSERT INTO profiles (user_id, name) SELECT id, $3 FROM updated_user WHERE true
         ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
         RETURNING user_id, name
       )
       SELECT updated_user.*, updated_profile.name
       FROM updated_user JOIN updated_profile ON updated_profile.user_id = updated_user.id`,
      [id, data.email, data.name, data.password ?? null],
    )
    const row = result?.rows[0] as PublicUserRow | undefined
    return row ? this.mapPublicRow(row) : undefined
  }

  public async deleteWithoutPosts(id: string): Promise<DeleteUserResult> {
    return database.withTransaction((client) => safeDeleteUser(client, id))
  }

  public async findPaginated(
    params: UserListParams = {},
  ): Promise<PaginatedResult<PublicUser>> {
    const limit = resolveLimit(params.limit)
    const { sql, values } = buildUserListQuery(params)
    const result = await database.clienteInstance?.query(sql, values)
    const rows = (result?.rows ?? []) as PublicUserRow[]
    return buildPaginatedResult(rows, limit, (row) => this.mapPublicRow(row))
  }
}
