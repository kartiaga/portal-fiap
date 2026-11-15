import { AVATAR_MAX_BYTES, type AvatarStorage } from '@/lib/avatar'
import { UserRole } from '@/modules/users/entities/user'
import {
  CreateAvatarUploadUseCase,
  RemoveAvatarUseCase,
  SetAvatarUseCase,
} from '@/modules/users/use-cases/avatar.use-cases'

const ME = '00000000-0000-4000-8000-000000000001'
const OTHER = '00000000-0000-4000-8000-000000000002'
const FILE = '11111111-2222-4333-8444-555555555555'
const OLD_FILE = '99999999-2222-4333-8444-555555555555'
const KEY = `avatars/${ME}/${FILE}.jpg`

const student = { id: ME, role: UserRole.STUDENT }
const teacher = { id: ME, role: UserRole.TEACHER }
const admin = { id: 'admin-1', role: UserRole.ADMIN }
const urlConfig = { publicUrl: 'http://localhost:9000', bucket: 'portal-fiap' }

function makeStorage(overrides: Partial<AvatarStorage> = {}) {
  return {
    createUpload: jest.fn().mockResolvedValue({
      url: 'http://localhost:9000/portal-fiap',
      fields: { key: 'k' },
    }),
    head: jest
      .fn()
      .mockResolvedValue({ size: 1000, contentType: 'image/jpeg' }),
    remove: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as jest.Mocked<AvatarStorage>
}

/** Sem argumento, o perfil existe e não tem foto; com `undefined`, o usuário não tem perfil. */
function makeProfiles(...args: [] | [string | null | undefined]) {
  const previous = args.length ? args[0] : null
  return {
    findAvatarKey: jest.fn().mockResolvedValue(previous),
    setAvatarKey: jest.fn().mockResolvedValue(true),
  }
}

describe('CreateAvatarUploadUseCase', () => {
  it('lets each person (even a student) and the admin ask for an upload', async () => {
    const storage = makeStorage()
    const useCase = new CreateAvatarUploadUseCase(storage)

    for (const actor of [student, teacher, admin]) {
      const result = await useCase.handler(ME, actor, 'image/png')
      expect(result.key).toMatch(
        new RegExp(`^avatars/${ME}/[0-9a-f-]{36}\\.png$`),
      )
      expect(result.maxBytes).toBe(AVATAR_MAX_BYTES)
      expect(result.url).toBe('http://localhost:9000/portal-fiap')
    }
    expect(storage.createUpload).toHaveBeenCalledTimes(3)
  })

  it("refuses to change someone else's photo, unless admin", async () => {
    const storage = makeStorage()
    const useCase = new CreateAvatarUploadUseCase(storage)

    await expect(
      useCase.handler(OTHER, student, 'image/jpeg'),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      useCase.handler(OTHER, teacher, 'image/jpeg'),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      useCase.handler(OTHER, admin, 'image/jpeg'),
    ).resolves.toHaveProperty('key')
    expect(storage.createUpload).toHaveBeenCalledTimes(1)
  })

  it('refuses types that are not images the app supports', async () => {
    const useCase = new CreateAvatarUploadUseCase(makeStorage())

    await expect(
      useCase.handler(ME, student, 'image/gif'),
    ).rejects.toMatchObject({ status: 400 })
    await expect(
      useCase.handler(ME, student, 'application/pdf'),
    ).rejects.toMatchObject({ status: 400 })
  })
})

describe('SetAvatarUseCase', () => {
  it('points the profile to the uploaded file and returns its public address', async () => {
    const storage = makeStorage()
    const profiles = makeProfiles(null)

    const result = await new SetAvatarUseCase(
      profiles,
      storage,
      urlConfig,
    ).handler(ME, student, KEY)

    expect(profiles.setAvatarKey).toHaveBeenCalledWith(ME, KEY)
    expect(result).toEqual({
      avatarUrl: `http://localhost:9000/portal-fiap/${KEY}`,
    })
    expect(storage.remove).not.toHaveBeenCalled()
  })

  it('deletes the previous photo after the swap', async () => {
    const storage = makeStorage()
    const previous = `avatars/${ME}/${OLD_FILE}.png`
    const profiles = makeProfiles(previous)

    await new SetAvatarUseCase(profiles, storage, urlConfig).handler(
      ME,
      student,
      KEY,
    )

    expect(storage.remove).toHaveBeenCalledWith(previous)
  })

  it('still succeeds if deleting the previous photo fails', async () => {
    const storage = makeStorage({
      remove: jest.fn().mockRejectedValue(new Error('down')),
    })
    const profiles = makeProfiles(`avatars/${ME}/${OLD_FILE}.png`)

    await expect(
      new SetAvatarUseCase(profiles, storage, urlConfig).handler(
        ME,
        student,
        KEY,
      ),
    ).resolves.toHaveProperty('avatarUrl')
  })

  it("refuses a key that is not the user's own, without touching the storage", async () => {
    const storage = makeStorage()
    const profiles = makeProfiles()
    const useCase = new SetAvatarUseCase(profiles, storage, urlConfig)

    await expect(
      useCase.handler(ME, student, `avatars/${OTHER}/${FILE}.jpg`),
    ).rejects.toMatchObject({ status: 400 })
    await expect(
      useCase.handler(ME, student, '../../etc/passwd'),
    ).rejects.toMatchObject({ status: 400 })
    expect(storage.head).not.toHaveBeenCalled()
    expect(profiles.setAvatarKey).not.toHaveBeenCalled()
  })

  it('refuses when the file was never uploaded', async () => {
    const storage = makeStorage({
      head: jest.fn().mockResolvedValue(undefined),
    })
    const profiles = makeProfiles()

    await expect(
      new SetAvatarUseCase(profiles, storage, urlConfig).handler(
        ME,
        student,
        KEY,
      ),
    ).rejects.toMatchObject({ status: 400 })
    expect(profiles.setAvatarKey).not.toHaveBeenCalled()
  })

  it.each([
    ['too big', { size: AVATAR_MAX_BYTES + 1, contentType: 'image/jpeg' }],
    ['not an image', { size: 100, contentType: 'text/html' }],
    ['without a type', { size: 100, contentType: undefined }],
  ])('refuses and deletes a file that is %s', async (_label, object) => {
    const storage = makeStorage({ head: jest.fn().mockResolvedValue(object) })
    const profiles = makeProfiles()

    await expect(
      new SetAvatarUseCase(profiles, storage, urlConfig).handler(
        ME,
        student,
        KEY,
      ),
    ).rejects.toMatchObject({ status: 400 })
    expect(storage.remove).toHaveBeenCalledWith(KEY)
    expect(profiles.setAvatarKey).not.toHaveBeenCalled()
  })

  it("answers 404 when the user has no profile, and 403 for someone else's photo", async () => {
    const storage = makeStorage()

    await expect(
      new SetAvatarUseCase(makeProfiles(undefined), storage, urlConfig).handler(
        ME,
        student,
        KEY,
      ),
    ).rejects.toMatchObject({ status: 404 })
    await expect(
      new SetAvatarUseCase(makeProfiles(), storage, urlConfig).handler(
        OTHER,
        student,
        KEY,
      ),
    ).rejects.toMatchObject({ status: 403 })
  })
})

describe('RemoveAvatarUseCase', () => {
  it('clears the photo and deletes the file', async () => {
    const storage = makeStorage()
    const profiles = makeProfiles(KEY)

    await expect(
      new RemoveAvatarUseCase(profiles, storage).handler(ME, student),
    ).resolves.toEqual({
      avatarUrl: null,
    })
    expect(profiles.setAvatarKey).toHaveBeenCalledWith(ME, null)
    expect(storage.remove).toHaveBeenCalledWith(KEY)
  })

  it('works without a photo, refuses others and answers 404 without a profile', async () => {
    const storage = makeStorage()

    await expect(
      new RemoveAvatarUseCase(makeProfiles(null), storage).handler(ME, student),
    ).resolves.toEqual({
      avatarUrl: null,
    })
    expect(storage.remove).not.toHaveBeenCalled()
    await expect(
      new RemoveAvatarUseCase(makeProfiles(), storage).handler(OTHER, student),
    ).rejects.toMatchObject({
      status: 403,
    })
    await expect(
      new RemoveAvatarUseCase(makeProfiles(undefined), storage).handler(
        ME,
        student,
      ),
    ).rejects.toMatchObject({ status: 404 })
  })
})
