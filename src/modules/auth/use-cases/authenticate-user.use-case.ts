import { comparePassword } from "@/lib/password";
import type { UserRepository } from "@/modules/users/repositories/user.repository";

type AuthenticateInput = {
  email: string;
  password: string;
};

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

export class AuthenticateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async handler({ email, password }: AuthenticateInput): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    return {
      id: user.id!,
      email: user.email,
      role: user.role,
    };
  }
}