import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { env } from './env'
import { registerUsersModule } from './modules/users'
import { registerAuthModule } from './modules/auth'
import { registerPostsModule } from './modules/posts'

export const app = fastify()

await app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '15d',
  },
})

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Portal FIAP API',
      description: 'API REST do Tech Challenge 2',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
})

await registerUsersModule(app)
await registerAuthModule(app)
await registerPostsModule(app)

await app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})
