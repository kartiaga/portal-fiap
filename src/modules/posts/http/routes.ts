import type { FastifyInstance } from "fastify";
import { authenticate } from "@/lib/auth";
import { create } from "./controller/create";
import { requireTeacherOrAdmin } from "@/lib/authorization";

export async function postsRoutes(app: FastifyInstance) {
    app.post(
        "/posts",
        {
            schema: {
                body: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', minLength: 3 },
                        content: { type: 'string', minLength: 10 },
                    },
                    required: ['title', 'content'],
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            content: { type: 'string' },
                            authorId: { type: 'string' },
                        },
                    },
                },
                security: [{ bearerAuth: [] }],
            },
            preHandler: [authenticate, requireTeacherOrAdmin],
        },
        create,
    )
}
