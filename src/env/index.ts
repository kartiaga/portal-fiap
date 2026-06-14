import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().default(3000),
    POSTGRES_DB: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.coerce.string(),
})

const _env = envSchema.safeParse(process.env)

if(!_env.success) {
    console.error("Invalid environment variables", _env.error.format())
    throw new Error("Invalid environment variables")
}

export const env = _env.data