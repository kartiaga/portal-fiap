import {
  avatarUrlFor,
  isAvatarContentType,
  isAvatarKeyOf,
  newAvatarKey,
} from '@/lib/avatar'

const USER = '00000000-0000-4000-8000-000000000001'
const OTHER = '00000000-0000-4000-8000-000000000002'
const FILE = '11111111-2222-4333-8444-555555555555'

describe('avatar keys', () => {
  it('builds a key under the user folder, with an extension from the type', () => {
    expect(newAvatarKey(USER, 'image/jpeg', FILE)).toBe(
      `avatars/${USER}/${FILE}.jpg`,
    )
    expect(newAvatarKey(USER, 'image/png', FILE)).toBe(
      `avatars/${USER}/${FILE}.png`,
    )
    expect(newAvatarKey(USER, 'image/webp', FILE)).toBe(
      `avatars/${USER}/${FILE}.webp`,
    )
  })

  it('generates a new key on every call, so an old address never serves a new photo', () => {
    expect(newAvatarKey(USER, 'image/jpeg')).not.toBe(
      newAvatarKey(USER, 'image/jpeg'),
    )
  })

  it('accepts only the key of the same user, in the expected format', () => {
    expect(isAvatarKeyOf(USER, `avatars/${USER}/${FILE}.jpg`)).toBe(true)
    // Arquivo de outra pessoa, tentativa de sair da pasta e extensões fora da lista.
    expect(isAvatarKeyOf(USER, `avatars/${OTHER}/${FILE}.jpg`)).toBe(false)
    expect(isAvatarKeyOf(USER, `avatars/${USER}/../${OTHER}/${FILE}.jpg`)).toBe(
      false,
    )
    expect(isAvatarKeyOf(USER, `avatars/${USER}/${FILE}.gif`)).toBe(false)
    expect(isAvatarKeyOf(USER, `avatars/${USER}/nao-e-uuid.jpg`)).toBe(false)
    expect(isAvatarKeyOf(USER, `outra-pasta/${USER}/${FILE}.jpg`)).toBe(false)
  })

  it('knows which image types are accepted', () => {
    expect(isAvatarContentType('image/jpeg')).toBe(true)
    expect(isAvatarContentType('image/gif')).toBe(false)
    expect(isAvatarContentType('application/pdf')).toBe(false)
    expect(isAvatarContentType(undefined)).toBe(false)
  })
})

describe('avatarUrlFor', () => {
  const config = { publicUrl: 'http://localhost:9000', bucket: 'portal-fiap' }

  it('builds the public address from the public URL, the bucket and the key', () => {
    expect(avatarUrlFor('avatars/u/f.jpg', config)).toBe(
      'http://localhost:9000/portal-fiap/avatars/u/f.jpg',
    )
    expect(
      avatarUrlFor('avatars/u/f.jpg', {
        ...config,
        publicUrl: 'http://192.168.0.10:9000/',
      }),
    ).toBe('http://192.168.0.10:9000/portal-fiap/avatars/u/f.jpg')
  })

  it('returns null without a photo or without a configured storage', () => {
    expect(avatarUrlFor(null, config)).toBeNull()
    expect(avatarUrlFor(undefined, config)).toBeNull()
    expect(
      avatarUrlFor('avatars/u/f.jpg', { ...config, publicUrl: undefined }),
    ).toBeNull()
  })
})
