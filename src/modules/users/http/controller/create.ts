import { createUserSchema } from "@/modules/users/dto/create-user.dto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserUseCase } from "../../use-cases/create-user.use-case";
import { UserRepository } from "../../repositories/user.repository";

export async function create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { email, password, role } = createUserSchema.parse(request.body)

    try {
        const userRepository = new UserRepository()
        const createUserUseCase = new CreateUserUseCase(userRepository)

        await createUserUseCase.handler({
            email,
            password,
            role,
        })

        return reply.status(201).send(`User created successfully ${email}`)
    } catch (error) {
        console.error(error)
        throw new Error("Failed to create user")
    }
}