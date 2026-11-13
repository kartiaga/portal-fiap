import z from 'zod'

export const updateUserSchema = z.strictObject({
  email: z.email(),
  name: z.string().trim().min(2),
  password: z.string().min(8).optional(),
})
