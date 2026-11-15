import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { ApiError, apiFetch, reachableUrl } from '@/lib/api';

/** Tipos que a API aceita. O seletor devolve JPEG quando recorta ou comprime a foto. */
const CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

const EXTENSION_TYPES: Record<string, ContentType> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const STORAGE_TIMEOUT_MS = 30_000;

/** Autorização de envio devolvida pela API: um formulário assinado para o armazenamento. */
export type AvatarUpload = {
  url: string;
  fields: Record<string, string>;
  key: string;
  maxBytes: number;
};

/** Foto escolhida, no formato que o seletor devolve. */
export type PickedPhoto = {
  uri: string;
  mimeType?: string | undefined;
  fileName?: string | null | undefined;
  fileSize?: number | undefined;
};

/** Erro com mensagem pronta para mostrar ao usuário. */
export class AvatarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvatarError';
  }
}

export function requestAvatarUpload(userId: string, contentType: ContentType): Promise<AvatarUpload> {
  return apiFetch<AvatarUpload>(`/users/${encodeURIComponent(userId)}/avatar/upload`, {
    method: 'POST',
    body: JSON.stringify({ contentType }),
  });
}

export function confirmAvatar(userId: string, key: string): Promise<{ avatarUrl: string | null }> {
  return apiFetch<{ avatarUrl: string | null }>(`/users/${encodeURIComponent(userId)}/avatar`, {
    method: 'PUT',
    body: JSON.stringify({ key }),
  });
}

export async function removeAvatar(userId: string): Promise<void> {
  await apiFetch(`/users/${encodeURIComponent(userId)}/avatar`, { method: 'DELETE' });
}

/** Tipo da foto pelo que o seletor informou; sem isso, pela extensão do arquivo. */
export function contentTypeOf(photo: PickedPhoto): ContentType | null {
  if (photo.mimeType && (CONTENT_TYPES as readonly string[]).includes(photo.mimeType)) {
    return photo.mimeType as ContentType;
  }
  const name = photo.fileName ?? photo.uri.split('?')[0] ?? '';
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_TYPES[extension] ?? null;
}

/**
 * Envia o arquivo direto ao armazenamento (não passa pela API): `POST multipart` com os campos
 * assinados primeiro e o arquivo por último, que é a ordem que o S3 exige.
 */
export async function sendAvatarFile(upload: AvatarUpload, photo: PickedPhoto) {
  const form = new FormData();
  for (const [name, value] of Object.entries(upload.fields)) form.append(name, value);
  // O `fetch` do Expo só aceita arquivo de verdade no formulário: o jeito antigo do React Native,
  // um objeto { uri, name, type }, falha com "Unsupported FormDataPart implementation". O `File` do
  // expo-file-system é um Blob que lê o arquivo local direto do disco. O tipo do arquivo é o campo
  // `Content-Type` assinado, que já está no formulário.
  form.append('file', new File(photo.uri) as unknown as Blob);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STORAGE_TIMEOUT_MS);
  try {
    const response = await fetch(reachableUrl(upload.url), { method: 'POST', body: form, signal: controller.signal });
    if (!response.ok) throw new ApiError('Não foi possível enviar a foto.', response.status);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // A mensagem para o usuário é genérica; o motivo real fica no log do Metro.
    if (__DEV__) console.warn('[foto de perfil] falha ao enviar o arquivo ao armazenamento:', error);
    throw new ApiError('Não foi possível enviar a foto. Verifique a conexão e tente de novo.', 0);
  } finally {
    clearTimeout(timeout);
  }
}

/** Mensagem para o usuário a partir de qualquer falha da troca de foto. */
export function avatarErrorMessage(error: unknown): string {
  if (error instanceof AvatarError) return error.message;
  if (error instanceof ApiError) {
    if (error.status === 503) return 'O envio de fotos não está disponível no momento.';
    if (error.status === 0) return error.message;
    if (error.status === 403) return 'Você não pode alterar esta foto.';
  }
  return 'Não foi possível atualizar a foto. Tente de novo.';
}

/** Abre a galeria. Devolve `null` se a pessoa cancelar. */
export async function pickPhoto(): Promise<PickedPhoto | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    // Recorte quadrado: a foto aparece num círculo.
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    exif: false,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return { uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName, fileSize: asset.fileSize };
}

/**
 * Troca a foto de perfil: pede a autorização à API, envia o arquivo ao armazenamento e confirma.
 * Devolve o endereço público da nova foto.
 */
export async function uploadAvatar(userId: string, photo: PickedPhoto): Promise<string | null> {
  const contentType = contentTypeOf(photo);
  if (!contentType) throw new AvatarError('Use uma foto JPEG, PNG ou WebP.');

  const upload = await requestAvatarUpload(userId, contentType);
  if (photo.fileSize !== undefined && photo.fileSize > upload.maxBytes) {
    const megabytes = Math.round(upload.maxBytes / (1024 * 1024));
    throw new AvatarError(`A foto é muito grande. Escolha uma de até ${megabytes} MB.`);
  }

  await sendAvatarFile(upload, photo);
  const { avatarUrl } = await confirmAvatar(userId, upload.key);
  return avatarUrl;
}
