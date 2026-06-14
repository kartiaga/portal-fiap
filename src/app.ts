import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { env } from "./env";
import { registerUsersModule } from "./modules/users";
import { registerAuthModule } from "./modules/auth";
import { registerPostsModule } from "./modules/posts";

export const app = fastify();

await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
})

await registerUsersModule(app)
await registerAuthModule(app)
await registerPostsModule(app)
