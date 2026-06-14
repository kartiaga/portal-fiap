
import type { FastifyInstance } from "fastify";
import { create } from "./controller/create";
import { authenticate } from "@/lib/auth";
import { requireAdmin } from "@/lib/authorization";


export async function usersRoutes(app: FastifyInstance) {
    app.post("/users", { preHandler: [authenticate, requireAdmin] }, create)
}