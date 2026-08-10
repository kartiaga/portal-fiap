import type { FastifyReply, FastifyRequest } from "fastify";
import { loginSchema } from "../../dto/login.dto";
import { UserRepository } from "@/modules/users/repositories/user.repository";
import { AuthenticateUserUseCase } from "../../use-cases/authenticate-user.use-case";

export async function login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { email, password} = loginSchema.parse(request.body);

    const userRepository = new UserRepository()
    const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository)

    try {
        const user = await authenticateUserUseCase.handler({ email, password })

        const token = await reply.jwtSign({
            role: user.role,
            sub: user.id,
        })

        return reply.status(200).send({ token, user });
    } catch (error) {
        return reply.status(401).send({ message: "Invalid credentials"})
    }
}