import {
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import {
  AVATAR_MAX_BYTES,
  type AvatarContentType,
  type AvatarStorage,
  type AvatarUpload,
  type StoredObject,
} from './avatar'

export type S3AvatarStorageConfig = {
  /** Endereço que a API usa para falar com o armazenamento (na rede do Docker: http://minio:9000). */
  endpoint: string
  /** Endereço que o app usa para enviar e baixar fotos (http://localhost:9000 no simulador). */
  publicUrl: string
  bucket: string
  accessKey: string
  secretKey: string
  region: string
}

const UPLOAD_EXPIRES_SECONDS = 300

function isNotFound(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const { name, $metadata } = error as {
    name?: string
    $metadata?: { httpStatusCode?: number }
  }
  return name === 'NotFound' || $metadata?.httpStatusCode === 404
}

/** Armazenamento compatível com S3 (MinIO em desenvolvimento). */
export class S3AvatarStorage implements AvatarStorage {
  private readonly client: S3Client
  /** Só assina o upload, sem chamar a rede: usa o endereço que o app enxerga. */
  private readonly signer: S3Client

  constructor(private readonly config: S3AvatarStorageConfig) {
    const common = {
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    }
    this.client = new S3Client({ ...common, endpoint: config.endpoint })
    this.signer = new S3Client({ ...common, endpoint: config.publicUrl })
  }

  async createUpload(
    key: string,
    contentType: AvatarContentType,
  ): Promise<AvatarUpload> {
    const { url, fields } = await createPresignedPost(this.signer, {
      Bucket: this.config.bucket,
      Key: key,
      Expires: UPLOAD_EXPIRES_SECONDS,
      Fields: { 'Content-Type': contentType },
      Conditions: [
        ['content-length-range', 1, AVATAR_MAX_BYTES],
        ['eq', '$Content-Type', contentType],
      ],
    })
    return { url, fields }
  }

  async head(key: string): Promise<StoredObject | undefined> {
    try {
      const result = await this.client.send(
        new HeadObjectCommand({ Bucket: this.config.bucket, Key: key }),
      )
      return {
        size: result.ContentLength ?? 0,
        contentType: result.ContentType,
      }
    } catch (error) {
      if (isNotFound(error)) return undefined
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
    )
  }
}
