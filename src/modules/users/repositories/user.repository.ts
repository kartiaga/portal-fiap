import { database } from "@/lib/db";
import type { User } from "../entities/user";

export class UserRepository {
    public async create({ email, password, role }: User): Promise<User | undefined> {
        const result = await database.clienteInstance?.query(
            `INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *`,
            [email, password, role]
        )
        return result?.rows[0]
    }
}