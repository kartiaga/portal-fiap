import type { User } from "../entities/user";
import type { UserRepository } from "../repositories/user.repository";

export class CreateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    handler(user: User): Promise<User | undefined> {
        return this.userRepository.create(user)
    }
}