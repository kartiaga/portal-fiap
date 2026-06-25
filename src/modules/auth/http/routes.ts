import type { FastifyInstance } from "fastify";
import { login } from "./controller/login";

export async function authRoutes(app: FastifyInstance) {
    app.post(
        "/login",
        {
            schema: {
                body: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 8 },
                    },
                    required: ['email', 'password'],
                },
                response: {
                    200: {
                        type: 'object',
                    },
                },
            },
        },
        login,
    )
}