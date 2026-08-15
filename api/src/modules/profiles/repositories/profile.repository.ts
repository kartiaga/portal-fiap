import { database } from '@/lib/db'
import type { Profile } from '../entities/profile'

export class ProfileRepository {
  public async create({
    name,
    avatarUrl,
    userId,
  }: Profile): Promise<Profile | undefined> {
    const result = await database.clienteInstance?.query(
      `INSERT INTO profiles (name, avatar_url, user_id) VALUES ($1, $2, $3) RETURNING *`,
      [name, avatarUrl, userId],
    )
    return result?.rows[0]
  }
}
