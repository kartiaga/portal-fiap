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

  it('keeps the photo storage optional, with defaults for the bucket and region', async () => {
    jest.resetModules()
    const { env } = await import('@/env/index')

    expect(env.S3_ENDPOINT).toBeUndefined()
    expect(env.S3_PUBLIC_URL).toBeUndefined()
    expect(env.S3_BUCKET).toBe('portal-fiap')
    expect(env.S3_REGION).toBe('us-east-1')
  })

  it('reads the photo storage settings when present', async () => {
    process.env.S3_ENDPOINT = 'http://minio:9000'
    process.env.S3_PUBLIC_URL = 'http://localhost:9000'
    process.env.S3_BUCKET = 'fotos'
    jest.resetModules()
    const { env } = await import('@/env/index')

    expect(env.S3_ENDPOINT).toBe('http://minio:9000')
    expect(env.S3_PUBLIC_URL).toBe('http://localhost:9000')
    expect(env.S3_BUCKET).toBe('fotos')
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
