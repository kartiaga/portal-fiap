import { env } from '@/env'
import { Pool, type PoolClient } from 'pg'

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
      this.client = await this.pool.connect()
    } catch (error) {
      console.error(`Error connecting to the database: ${error}`)
      throw new Error(`Error connecting to the database: ${error}`)
    }
  }

  get clienteInstance() {
    return this.client
  }

  async withTransaction<T>(
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await work(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

export const database = new Database()
