import 'dotenv/config'
import { Pool, type PoolClient } from 'pg'
import { hashPassword } from '../src/lib/password.ts'

const SEED_PASSWORD = '12345678'

const SEED_USERS = [
    { email: 'admin@fiap.com.br', role: 'ADMIN' },
    { email: 'student@fiap.com.br', role: 'STUDENT' },
    { email: 'teacher@fiap.com.br', role: 'TEACHER' },
] as const

async function ensureUser(
    client: PoolClient,
    email: string,
    role: string,
): Promise<void> {
    const existing = await client.query('SELECT 1 FROM users WHERE email = $1', [email])

    if (existing.rowCount && existing.rowCount > 0) {
        return
    }

    const hashed = await hashPassword(SEED_PASSWORD)
    await client.query(
        'INSERT INTO users(email, password, role) VALUES($1, $2, $3)',
        [email, hashed, role],
    )
}

async function main() {
    const {
        POSTGRES_USER,
        POSTGRES_HOST,
        POSTGRES_DB,
        POSTGRES_PASSWORD,
        POSTGRES_PORT,
    } = process.env

    if (!POSTGRES_HOST || !POSTGRES_DB || !POSTGRES_USER) {
        console.error('Missing POSTGRES_HOST, POSTGRES_DB or POSTGRES_USER in environment variables')
        process.exit(1)
    }

    const pool = new Pool({
        user: POSTGRES_USER,
        host: POSTGRES_HOST,
        database: POSTGRES_DB,
        password: POSTGRES_PASSWORD,
        port: POSTGRES_PORT ? parseInt(POSTGRES_PORT, 10) : undefined,
    })

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        for (const user of SEED_USERS) {
            await ensureUser(client, user.email, user.role)
        }

        await client.query('COMMIT')

        console.log('Seed completed successfully')
        console.log('Accounts created (password for all: 12345678):')
        for (const user of SEED_USERS) {
            console.log(`- ${user.email} (${user.role})`)
        }
    } catch (err) {
        await client.query('ROLLBACK')
        console.error('Seed failed', err)
        process.exitCode = 1
    } finally {
        client.release()
        await pool.end()
    }
}

main()
