import z from 'zod'

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 50

export type PaginationParams = {
  cursor?: string | undefined
  limit?: number | undefined
}

export type PaginatedResult<T> = {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

type CursorPayload = {
  createdAt: string
  id: string
}

type CursorRow = {
  cursor_created_at: string
  id: string
}

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .optional()
    .default(DEFAULT_PAGE_SIZE),
})

export function resolveLimit(limit?: number): number {
  if (limit === undefined) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.min(Math.max(limit, 1), MAX_PAGE_SIZE)
}

export function encodeCursor(createdAt: string, id: string): string {
  const payload: CursorPayload = {
    createdAt,
    id,
  }

  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

export function decodeCursor(cursor: string): {
  createdAt: string
  id: string
} {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8')
    const payload = JSON.parse(json) as CursorPayload

    if (!payload.createdAt || !payload.id) {
      throw new Error('Invalid cursor')
    }

    if (Number.isNaN(new Date(payload.createdAt).getTime())) {
      throw new Error('Invalid cursor')
    }

    return {
      createdAt: payload.createdAt,
      id: payload.id,
    }
  } catch {
    throw new Error('Invalid cursor')
  }
}

export function buildPaginatedResult<T extends CursorRow, R>(
  rows: T[],
  limit: number,
  mapRow: (item: T) => R,
): PaginatedResult<R> {
  const records = rows.map(mapRow)

  const hasMore = rows.length > limit
  const items = hasMore ? records.slice(0, limit) : records

  if (!hasMore) {
    return {
      items,
      nextCursor: null,
      hasMore: false,
    }
  }

  const lastRow = rows[limit - 1]

  if (!lastRow) {
    return {
      items,
      nextCursor: null,
      hasMore: false,
    }
  }

  return {
    items,
    nextCursor: encodeCursor(lastRow.cursor_created_at, lastRow.id),
    hasMore: true,
  }
}
