import { hashPassword } from "@/lib/password";
import type { User } from "../entities/user";
import type { UserRepository } from "../repositories/user.repository";

export class CreateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async handler(user: User): Promise<User | undefined> {
        const hashedPassword = await hashPassword(user.password)
        
        return this.userRepository.create({
            ...user,
            password: hashedPassword
        })
    }
}