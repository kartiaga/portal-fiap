import { database } from '@/lib/db'
import type { Profile } from '../entities/profile'

export class ProfileRepository {
  public async create({
    name,
    avatarKey,
    userId,
  }: Profile): Promise<Profile | undefined> {
    const result = await database.clienteInstance?.query(
      `INSERT INTO profiles (name, avatar_key, user_id) VALUES ($1, $2, $3) RETURNING *`,
      [name, avatarKey ?? null, userId],
    )
    return result?.rows[0]
  }

  /** Chave da foto atual; `null` sem foto e `undefined` se o usuário não tem perfil. */
  public async findAvatarKey(
    userId: string,
  ): Promise<string | null | undefined> {
    const result = await database.clienteInstance?.query(
      `SELECT avatar_key FROM profiles WHERE user_id = $1`,
      [userId],
    )
    const row = result?.rows[0] as { avatar_key: string | null } | undefined
    return row ? row.avatar_key : undefined
  }

  /** Troca (ou limpa, com `null`) a foto do perfil. Devolve `false` se não há perfil. */
  public async setAvatarKey(
    userId: string,
    key: string | null,
  ): Promise<boolean> {
    const result = await database.clienteInstance?.query(
      `UPDATE profiles SET avatar_key = $2, updated_at = now() WHERE user_id = $1`,
      [userId, key],
    )
    return (result?.rowCount ?? 0) > 0
  }
}
