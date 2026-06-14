
import type { FastifyInstance } from "fastify";
import { create } from "./controller/create";


export async function usersRoutes(app: FastifyInstance) {
    app.post("/users", create)
}