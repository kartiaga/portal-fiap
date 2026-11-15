import { env } from '@/env'
import { UserError } from '@/modules/users/errors'
import { avatarUrlFor, type AvatarStorage } from './avatar'
import { S3AvatarStorage } from './s3-avatar-storage'

/** Endereço público da foto de um perfil, a partir da chave guardada no banco. */
export function publicAvatarUrl(key: string | null | undefined): string | null {
  return avatarUrlFor(key, {
    publicUrl: env.S3_PUBLIC_URL,
    bucket: env.S3_BUCKET,
  })
}

/** Armazenamento configurado pelas variáveis `S3_*`, ou `undefined` se elas não foram definidas. */
export function findAvatarStorage(): AvatarStorage | undefined {
  const { S3_ENDPOINT, S3_PUBLIC_URL, S3_ACCESS_KEY, S3_SECRET_KEY } = env
  if (!S3_ENDPOINT || !S3_PUBLIC_URL || !S3_ACCESS_KEY || !S3_SECRET_KEY) {
    return undefined
  }
  return new S3AvatarStorage({
    endpoint: S3_ENDPOINT,
    publicUrl: S3_PUBLIC_URL,
    bucket: env.S3_BUCKET,
    accessKey: S3_ACCESS_KEY,
    secretKey: S3_SECRET_KEY,
    region: env.S3_REGION,
  })
}

/** Como `findAvatarStorage`, mas responde 503 quando o armazenamento não está configurado. */
export function getAvatarStorage(): AvatarStorage {
  const storage = findAvatarStorage()
  if (!storage) throw new UserError('Avatar storage is not configured', 503)
  return storage
}
