import 'dotenv/config'
import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  POSTGRES_DB: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.coerce.string(),
  JWT_SECRET: z.string().min(32),
  // Armazenamento das fotos de perfil (MinIO em desenvolvimento, qualquer S3 em produção). Sem
  // estas variáveis a API funciona, só que as rotas de foto respondem 503.
  S3_ENDPOINT: z.url().optional(),
  S3_PUBLIC_URL: z.url().optional(),
  S3_BUCKET: z.string().default('portal-fiap'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Invalid environment variables', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data
