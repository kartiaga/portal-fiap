import 'dotenv/config'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

async function main() {
  const {
    POSTGRES_USER,
    POSTGRES_HOST,
    POSTGRES_DB,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
  } = process.env

  if (!POSTGRES_HOST || !POSTGRES_DB) {
    console.error('Missing POSTGRES configuration in environment variables')
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

    const users = [
        { email: 'admin@example.com', password: 'admin123', role: 'ADMIN' },
        { email: 'teacher1@example.com', password: 'teacher123', role: 'TEACHER' },
        { email: 'teacher2@example.com', password: 'teacher123', role: 'TEACHER' },
        { email: 'student1@example.com', password: 'student123', role: 'STUDENT' },
        { email: 'student2@example.com', password: 'student123', role: 'STUDENT' },
        { email: 'student3@example.com', password: 'student123', role: 'STUDENT' },
        { email: 'student4@example.com', password: 'student123', role: 'STUDENT' },
        { email: 'student5@example.com', password: 'student123', role: 'STUDENT' },
        { email: 'student6@example.com', password: 'student123', role: 'STUDENT' },
        { email: 'student7@example.com', password: 'student123', role: 'STUDENT' },
        { email: 'student8@example.com', password: 'student123', role: 'STUDENT' },
    ]

    const createdIds: string[] = []

    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10)
      const res = await client.query(
        'INSERT INTO users(email, password, role) VALUES($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING id',
        [u.email, hashed, u.role],
      )

      if (res.rows[0]) createdIds.push(res.rows[0].id)
      else {
        const r = await client.query('SELECT id FROM users WHERE email = $1', [u.email])
        createdIds.push(r.rows[0].id)
      }
    }

    // create profiles for all users
    for (let i = 0; i < users.length; i++) {
      const u = users[i]
      const name = u.email.split('@')[0].replace('.', ' ').replace(/\d+/g, '')
      await client.query(
        'INSERT INTO profiles(user_id, name) VALUES($1, $2) ON CONFLICT (user_id) DO NOTHING',
        [createdIds[i], name.charAt(0).toUpperCase() + name.slice(1)],
      )
    }

    // create several posts: teachers create multiple posts, students create one each
    const posts = []
    // teacher posts
    const teacherIds = createdIds.filter((_, idx) => idx === 1 || idx === 2)
    teacherIds.forEach((tid, tindex) => {
      posts.push({ title: `Lecture notes ${tindex + 1}`, content: 'Important lecture notes about programming and design patterns.', authorId: tid })
      posts.push({ title: `Homework ${tindex + 1}`, content: 'Please solve the exercises in the repository assigned.', authorId: tid })
      posts.push({ title: `Announcement ${tindex + 1}`, content: 'Class will be remote tomorrow.', authorId: tid })
    })

    // student posts
    const studentIds = createdIds.slice(3)
    studentIds.forEach((sid, sidx) => {
      posts.push({ title: `Student post ${sidx + 1}`, content: 'Sharing my thoughts on the assignment and asking for feedback.', authorId: sid })
      if (sidx % 3 === 0) {
        posts.push({ title: `Project update ${sidx + 1}`, content: 'We finished the first milestone of the group project.', authorId: sid })
      }
    })

    for (const p of posts) {
      await client.query(
        'INSERT INTO posts(title, content, author_id) VALUES($1, $2, $3) ON CONFLICT DO NOTHING',
        [p.title, p.content, p.authorId],
      )
    }

    await client.query('COMMIT')

    console.log('Seed completed successfully')
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
