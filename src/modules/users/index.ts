import type { FastifyInstance } from "fastify";
import { usersRoutes } from "./http/routes";

export async function registerUsersModule(app: FastifyInstance) {
    await app.register(usersRoutes)
}