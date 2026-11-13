import type { PoolClient } from 'pg'
import { safeDeleteUser } from '@/modules/users/repositories/safe-delete-user'

describe('safe user deletion', () => {
  it('locks the user, checks posts, then deletes', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ has_posts: false }] })
      .mockResolvedValueOnce({ rowCount: 1 })
    const client = { query } as unknown as PoolClient
    await expect(safeDeleteUser(client, 'user-1')).resolves.toBe('deleted')
    expect(query.mock.calls.map(([sql]) => sql)).toEqual([
      'SELECT id FROM users WHERE id = $1 FOR UPDATE',
      'SELECT EXISTS (SELECT 1 FROM posts WHERE author_id = $1) AS has_posts',
      'DELETE FROM users WHERE id = $1',
    ])
  })

  it('does not delete a user with posts', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ has_posts: true }] })
    const client = { query } as unknown as PoolClient
    await expect(safeDeleteUser(client, 'user-1')).resolves.toBe('has_posts')
    expect(query).toHaveBeenCalledTimes(2)
  })
})
