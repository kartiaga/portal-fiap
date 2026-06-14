import { env } from "@/env";
import { Pool, type PoolClient } from "pg";

const CONFIG = {
    user: env.POSTGRES_USER,
    host: env.POSTGRES_HOST,
    database: env.POSTGRES_DB,
    password: env.POSTGRES_PASSWORD,
    port: env.POSTGRES_PORT,
}

class Database {
    private pool: Pool
    private client: PoolClient | undefined
    
    constructor() {
        this.pool = new Pool(CONFIG)
        this.connection()
    }

    private async connection() {
        try {
            this.client =await this.pool.connect();
        } catch (error) {
            console.error(`Error connecting to the database: ${error}`)
            throw new Error(`Error connecting to the database: ${error}`)
        }
    }

    get clienteInstance() {
        return this.client
    }
}

export const database = new Database()