import { encodeCursor } from '@/lib/pagination'
import { listPostsQuerySchema } from '@/modules/posts/dto/list-posts.dto'
import { buildPostListQuery } from '@/modules/posts/repositories/post-list-query'

const AUTHOR_ID = '00000000-0000-4000-8000-0000000000aa'

describe('post list SQL', () => {
  it('filters by author before cursor and limit', () => {
    const cursor = encodeCursor(
      '2026-01-01T00:00:00.000000Z',
      '00000000-0000-4000-8000-000000000001',
    )
    const { sql, values } = buildPostListQuery({
      authorId: AUTHOR_ID,
      cursor,
      limit: 10,
    })

    expect(sql).toMatch(
      /LEFT JOIN profiles ON profiles\.user_id = posts\.author_id/,
    )
    expect(sql).toMatch(
      /WHERE posts\.author_id = \$1::uuid AND \(posts\.created_at, posts\.id\) < \(\$2::timestamptz, \$3::uuid\)/,
    )
    expect(sql.indexOf('WHERE')).toBeLessThan(sql.indexOf('ORDER BY'))
    expect(sql.indexOf('ORDER BY')).toBeLessThan(sql.indexOf('LIMIT'))
    expect(values).toEqual([
      AUTHOR_ID,
      '2026-01-01T00:00:00.000000Z',
      '00000000-0000-4000-8000-000000000001',
      11,
    ])
  })

  it('keeps the list without filters compatible', () => {
    const { sql, values } = buildPostListQuery({})

    expect(sql).not.toContain('WHERE')
    expect(values).toEqual([21])
  })

  it('filters by author only', () => {
    const { sql, values } = buildPostListQuery({
      authorId: AUTHOR_ID,
      limit: 5,
    })

    expect(sql).toMatch(/WHERE posts\.author_id = \$1::uuid\s+ORDER BY/)
    expect(values).toEqual([AUTHOR_ID, 6])
  })
})

describe('list posts query schema', () => {
  it('accepts an author UUID and keeps the default page size', () => {
    const parsed = listPostsQuerySchema.safeParse({ authorId: AUTHOR_ID })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.authorId).toBe(AUTHOR_ID)
      expect(parsed.data.limit).toBe(20)
    }
  })

  it('works without an author, as before', () => {
    expect(listPostsQuerySchema.safeParse({}).success).toBe(true)
  })

  it('rejects an author that is not a UUID', () => {
    expect(listPostsQuerySchema.safeParse({ authorId: 'ana' }).success).toBe(
      false,
    )
  })
})
