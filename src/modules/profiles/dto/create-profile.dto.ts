import z from "zod";

export const createProfileSchema = z.object({
    name: z.string(),
    avatarUrl: z.string().optional(),
    userId: z.string(),
})