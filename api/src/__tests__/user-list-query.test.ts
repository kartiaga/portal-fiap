import { encodeCursor } from '@/lib/pagination'
import { UserRole } from '@/modules/users/entities/user'
import { buildUserListQuery } from '@/modules/users/repositories/user-list-query'

describe('user list SQL', () => {
  it('filters by role and email before cursor and limit', () => {
    const cursor = encodeCursor(
      '2026-01-01T00:00:00.000000Z',
      '00000000-0000-4000-8000-000000000001',
    )
    const { sql, values } = buildUserListQuery({
      role: UserRole.TEACHER,
      search: '@fiap',
      cursor,
      limit: 10,
    })
    expect(sql).toMatch(/LEFT JOIN profiles ON profiles\.user_id = users\.id/)
    expect(sql).toMatch(
      /WHERE users\.role = \$1 AND users\.email ILIKE \$2 AND \(users\.created_at, users\.id\) < \(\$3::timestamptz, \$4::uuid\)/,
    )
    expect(sql.indexOf('WHERE')).toBeLessThan(sql.indexOf('ORDER BY'))
    expect(sql.indexOf('ORDER BY')).toBeLessThan(sql.indexOf('LIMIT'))
    expect(values).toEqual([
      UserRole.TEACHER,
      '%@fiap%',
      '2026-01-01T00:00:00.000000Z',
      '00000000-0000-4000-8000-000000000001',
      11,
    ])
  })

  it('keeps the admin list without filters compatible', () => {
    const { sql, values } = buildUserListQuery({})
    expect(sql).not.toContain('WHERE')
    expect(values).toEqual([21])
  })

  it('rejects a cursor with a non-UUID id before querying the database', () => {
    const cursor = encodeCursor('2026-01-01T00:00:00.000Z', 'invalid-id')
    expect(() => buildUserListQuery({ cursor })).toThrow('Invalid cursor')
  })
})
