import { randomUUID } from 'node:crypto'

/** Tamanho máximo da foto de perfil: o armazenamento recusa arquivos maiores no upload. */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

export type AvatarContentType = keyof typeof EXTENSIONS

export const AVATAR_CONTENT_TYPES = Object.keys(EXTENSIONS) as [
  AvatarContentType,
  ...AvatarContentType[],
]

export function isAvatarContentType(
  value: unknown,
): value is AvatarContentType {
  return typeof value === 'string' && value in EXTENSIONS
}

/**
 * Nome do objeto no armazenamento: `avatars/<id do usuário>/<uuid>.<extensão>`. O uuid muda a cada
 * troca de foto, então o endereço antigo deixa de servir e nenhum cache mostra a foto velha.
 */
export function newAvatarKey(
  userId: string,
  contentType: AvatarContentType,
  id: string = randomUUID(),
): string {
  return `avatars/${userId}/${id}.${EXTENSIONS[contentType]}`
}

/** Só vale uma chave do próprio usuário: impede apontar o perfil para o arquivo de outra pessoa. */
export function isAvatarKeyOf(userId: string, key: string): boolean {
  const extensions = Object.values(EXTENSIONS).join('|')
  const pattern = new RegExp(
    `^avatars/${userId}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(${extensions})$`,
  )
  return pattern.test(key)
}

export type AvatarUrlConfig = {
  /** Endereço do armazenamento como os clientes (o app) o enxergam. */
  publicUrl: string | undefined
  bucket: string
}

/** Endereço público da foto, ou `null` sem foto ou com o armazenamento sem configurar. */
export function avatarUrlFor(
  key: string | null | undefined,
  { publicUrl, bucket }: AvatarUrlConfig,
): string | null {
  if (!key || !publicUrl) return null
  return `${publicUrl.replace(/\/+$/, '')}/${bucket}/${key}`
}

export type AvatarUpload = {
  /** Endereço que recebe o `POST multipart` do arquivo. */
  url: string
  /** Campos que precisam ir no formulário, antes do arquivo. */
  fields: Record<string, string>
}

export type StoredObject = { size: number; contentType: string | undefined }

/** O que a API precisa do armazenamento de arquivos (MinIO em desenvolvimento, S3 em produção). */
export interface AvatarStorage {
  /** Autoriza um upload direto do cliente, limitado em tamanho e tipo. */
  createUpload(
    key: string,
    contentType: AvatarContentType,
  ): Promise<AvatarUpload>
  /** Dados do arquivo enviado, ou `undefined` se ele não existe. */
  head(key: string): Promise<StoredObject | undefined>
  remove(key: string): Promise<void>
}
