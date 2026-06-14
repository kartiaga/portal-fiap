import type { FastifyInstance } from "fastify";
import { login } from "./controller/login";

export async function authRoutes(app: FastifyInstance) {
    app.post("/login", login)
}