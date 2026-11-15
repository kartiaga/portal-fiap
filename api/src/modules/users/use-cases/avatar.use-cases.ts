import {
  AVATAR_MAX_BYTES,
  avatarUrlFor,
  isAvatarContentType,
  isAvatarKeyOf,
  newAvatarKey,
  type AvatarContentType,
  type AvatarStorage,
  type AvatarUpload,
  type AvatarUrlConfig,
} from '@/lib/avatar'
import type { ProfileRepository } from '@/modules/profiles/repositories/profile.repository'
import { assertCanEdit, type UserActor } from '../access'
import { UserError } from '../errors'

type Profiles = Pick<ProfileRepository, 'findAvatarKey' | 'setAvatarKey'>

/** Apaga o arquivo antigo sem derrubar a operação: sobrar um arquivo solto é só desperdício. */
async function removeQuietly(
  storage: AvatarStorage,
  key: string | null | undefined,
) {
  if (key) await storage.remove(key).catch(() => undefined)
}

/**
 * Passo 1 da troca de foto: autoriza o app a enviar o arquivo direto ao armazenamento, com tipo
 * e tamanho limitados. Cada um troca a própria foto; o administrador troca a de qualquer um.
 */
export class CreateAvatarUploadUseCase {
  constructor(private readonly storage: AvatarStorage) {}

  async handler(
    id: string,
    actor: UserActor,
    contentType: string,
  ): Promise<AvatarUpload & { key: string; maxBytes: number }> {
    assertCanEdit(actor, id)
    if (!isAvatarContentType(contentType)) {
      throw new UserError('Unsupported image type', 400)
    }
    const key = newAvatarKey(id, contentType as AvatarContentType)
    const upload = await this.storage.createUpload(key, contentType)
    return { ...upload, key, maxBytes: AVATAR_MAX_BYTES }
  }
}

/**
 * Passo 2: depois do envio, o app confirma a chave e o perfil passa a apontar para ela. A API
 * confere que o arquivo existe e que é uma imagem de tamanho aceito antes de aceitar.
 */
export class SetAvatarUseCase {
  constructor(
    private readonly profiles: Profiles,
    private readonly storage: AvatarStorage,
    private readonly urlConfig: AvatarUrlConfig,
  ) {}

  async handler(
    id: string,
    actor: UserActor,
    key: string,
  ): Promise<{ avatarUrl: string | null }> {
    assertCanEdit(actor, id)
    if (!isAvatarKeyOf(id, key)) throw new UserError('Invalid avatar key', 400)

    const previous = await this.profiles.findAvatarKey(id)
    if (previous === undefined) throw new UserError('User not found', 404)

    const object = await this.storage.head(key)
    if (!object) throw new UserError('Avatar was not uploaded', 400)
    if (
      object.size > AVATAR_MAX_BYTES ||
      !isAvatarContentType(object.contentType)
    ) {
      await removeQuietly(this.storage, key)
      throw new UserError('Invalid avatar file', 400)
    }

    if (!(await this.profiles.setAvatarKey(id, key))) {
      throw new UserError('User not found', 404)
    }
    if (previous !== key) await removeQuietly(this.storage, previous)
    return { avatarUrl: avatarUrlFor(key, this.urlConfig) }
  }
}

/** Tira a foto: o perfil volta a mostrar só as iniciais. */
export class RemoveAvatarUseCase {
  constructor(
    private readonly profiles: Profiles,
    private readonly storage: AvatarStorage,
  ) {}

  async handler(id: string, actor: UserActor): Promise<{ avatarUrl: null }> {
    assertCanEdit(actor, id)
    const previous = await this.profiles.findAvatarKey(id)
    if (previous === undefined) throw new UserError('User not found', 404)

    await this.profiles.setAvatarKey(id, null)
    await removeQuietly(this.storage, previous)
    return { avatarUrl: null }
  }
}
