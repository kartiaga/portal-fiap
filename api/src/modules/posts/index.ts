import type { FastifyInstance } from 'fastify'
import { interactionRoutes } from './http/interaction-routes'
import { postsRoutes } from './http/routes'

export async function registerPostsModule(app: FastifyInstance) {
  await app.register(postsRoutes)
  await app.register(interactionRoutes)
}
