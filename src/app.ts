import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { env } from "./env";
import { registerUsersModule } from "./modules/users";
import { registerAuthModule } from "./modules/auth";
import { registerPostsModule } from "./modules/posts";

export const app = fastify();

await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
        expiresIn: "15d"
    }
})

// OpenAPI / Swagger
await app.register(import('@fastify/swagger'), {
    mode: 'dynamic',
    openapi: {
        info: {
            title: 'Portal FIAP API',
            description: 'API para desenvolvimento do Tech Challenge 2 — Fase 2 (FIAP)',
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
        security: [{ bearerAuth: [] }],
    },
})

await app.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
    },
})

await registerUsersModule(app)
await registerAuthModule(app)
await registerPostsModule(app)
