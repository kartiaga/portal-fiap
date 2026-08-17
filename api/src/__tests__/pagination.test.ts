import {
  buildPaginatedResult,
  decodeCursor,
  encodeCursor,
  resolveLimit,
} from '@/lib/pagination'

describe('pagination helpers', () => {
  it('encodes and decodes a cursor', () => {
    const createdAt = new Date('2026-01-01T12:00:00.000Z')
    const id = 'post-123'

    const cursor = encodeCursor(createdAt, id)
    const decoded = decodeCursor(cursor)

    expect(decoded.id).toBe(id)
    expect(decoded.createdAt.toISOString()).toBe(createdAt.toISOString())
  })

  it('throws when cursor is invalid', () => {
    expect(() => decodeCursor('invalid-cursor')).toThrow('Invalid cursor')
  })

  it('resolves limit within bounds', () => {
    expect(resolveLimit(undefined)).toBe(20)
    expect(resolveLimit(0)).toBe(1)
    expect(resolveLimit(100)).toBe(50)
  })

  it('builds paginated result with hasMore and nextCursor', () => {
    const rows = [
      { id: '1', createdAt: new Date('2026-01-03T00:00:00.000Z') },
      { id: '2', createdAt: new Date('2026-01-02T00:00:00.000Z') },
      { id: '3', createdAt: new Date('2026-01-01T00:00:00.000Z') },
    ]

    const result = buildPaginatedResult(rows, 2, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }))

    expect(result.items).toHaveLength(2)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBeTruthy()
  })

  it('returns empty paginated result when there are no rows', () => {
    const result = buildPaginatedResult([], 20, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }))

    expect(result).toEqual({
      items: [],
      nextCursor: null,
      hasMore: false,
    })
  })
})
