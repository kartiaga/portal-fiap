import { hashPassword, comparePassword } from '@/lib/password'

describe('password utils', () => {
  it('hashes a password and verifies it', async () => {
    const plain = 'secret123'
    const hashed = await hashPassword(plain)

    expect(hashed).not.toBe(plain)
    expect(await comparePassword(plain, hashed)).toBe(true)
  })

  it('returns false for a mismatched password', async () => {
    const hashed = await hashPassword('secret123')
    expect(await comparePassword('wrongpass', hashed)).toBe(false)
  })
})
