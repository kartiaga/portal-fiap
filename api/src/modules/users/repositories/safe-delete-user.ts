import type { PoolClient } from 'pg'

export type DeleteUserResult = 'deleted' | 'missing' | 'has_posts'

// O bloqueio impede que uma nova postagem referencie o usuário entre a
// verificação e o DELETE. Cada consulta usa um snapshot novo da transação.
export async function safeDeleteUser(
  client: PoolClient,
  id: string,
): Promise<DeleteUserResult> {
  const user = await client.query(
    'SELECT id FROM users WHERE id = $1 FOR UPDATE',
    [id],
  )
  if (!user.rowCount) return 'missing'

  const posts = await client.query(
    'SELECT EXISTS (SELECT 1 FROM posts WHERE author_id = $1) AS has_posts',
    [id],
  )
  if (posts.rows[0]?.has_posts === true) return 'has_posts'

  await client.query('DELETE FROM users WHERE id = $1', [id])
  return 'deleted'
}
