import type { FastifyInstance } from "fastify";
import { login } from "./controller/login";

export async function authRoutes(app: FastifyInstance) {
    app.post("/login", {
        schema: {
            tags: ["Auth"],
            summary: "Autentica um usuário",
            description: "Retorna um token JWT válido por 15 dias.",
            body: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        token: { type: "string" },
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "string", format: "uuid" },
                                email: { type: "string", format: "email" },
                                role: {
                                    type: "string",
                                    enum: ["STUDENT", "TEACHER", "ADMIN"],
                                },
                            },
                        },
                    },
                },
                401: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                    },
                },
            },
        },
    }, login);
}
