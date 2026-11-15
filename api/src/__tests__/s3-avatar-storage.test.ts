import { AVATAR_MAX_BYTES } from '@/lib/avatar'
import { S3AvatarStorage } from '@/lib/s3-avatar-storage'

const storage = new S3AvatarStorage({
  endpoint: 'http://minio:9000',
  publicUrl: 'http://localhost:9000',
  bucket: 'portal-fiap',
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
  region: 'us-east-1',
})

describe('S3AvatarStorage.createUpload', () => {
  it('signs the upload for the public address, with no network call', async () => {
    const { url, fields } = await storage.createUpload(
      'avatars/u/f.jpg',
      'image/jpeg',
    )

    // O app envia para o endereço que ele enxerga (localhost), não para o da rede do Docker.
    expect(url).toBe('http://localhost:9000/portal-fiap')
    expect(fields.key).toBe('avatars/u/f.jpg')
    expect(fields['Content-Type']).toBe('image/jpeg')
    expect(fields['X-Amz-Signature']).toBeTruthy()
  })

  it('limits the size and the type inside the signed policy', async () => {
    const { fields } = await storage.createUpload(
      'avatars/u/f.png',
      'image/png',
    )

    const policy = JSON.parse(
      Buffer.from(fields.Policy as string, 'base64').toString('utf8'),
    )
    expect(policy.conditions).toEqual(
      expect.arrayContaining([
        ['content-length-range', 1, AVATAR_MAX_BYTES],
        ['eq', '$Content-Type', 'image/png'],
        { bucket: 'portal-fiap' },
      ]),
    )
    // O envio expira em poucos minutos.
    expect(
      new Date(policy.expiration).getTime() - Date.now(),
    ).toBeLessThanOrEqual(5 * 60 * 1000)
  })
})
