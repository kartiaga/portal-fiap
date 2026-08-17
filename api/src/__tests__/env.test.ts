import { jest } from '@jest/globals'

describe('env configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
      PORT: '4000',
      POSTGRES_DB: 'testdb',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'user',
      POSTGRES_PASSWORD: 'password',
      JWT_SECRET: 'a'.repeat(32),
    }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  it('loads environment variables successfully', async () => {
    jest.resetModules()
    const { env } = await import('@/env/index')

    expect(env.NODE_ENV).toBe('development')
    expect(env.PORT).toBe(4000)
    expect(env.POSTGRES_DB).toBe('testdb')
    expect(env.JWT_SECRET).toHaveLength(32)
  })

  it('throws when required environment variables are invalid', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    process.env.JWT_SECRET = 'short'
    jest.resetModules()

    await expect(import('@/env/index')).rejects.toThrow(
      'Invalid environment variables',
    )

    consoleSpy.mockRestore()
  })
})
