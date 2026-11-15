import z from 'zod'

export const createProfileSchema = z.object({
  name: z.string(),
  avatarKey: z.string().optional(),
  userId: z.string(),
})
