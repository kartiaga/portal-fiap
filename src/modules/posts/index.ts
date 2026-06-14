import type { FastifyInstance } from "fastify";
import { postsRoutes } from "./http/routes";

export async function registerPostsModule(app: FastifyInstance) {
    await app.register(postsRoutes)
}
