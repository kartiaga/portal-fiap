import type { FastifyInstance } from 'fastify'
import { authRoutes } from './http/routes'

export async function registerAuthModule(app: FastifyInstance) {
  await app.register(authRoutes)
}
