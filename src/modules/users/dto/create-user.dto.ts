import z from "zod";
import { UserRole } from "../entities/user";

// body do POST /users
export const createUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    role: z.nativeEnum(UserRole).optional().default(UserRole.STUDENT)
})
