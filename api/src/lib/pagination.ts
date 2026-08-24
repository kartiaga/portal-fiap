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

export function buildPaginatedResult<T>(
  rows: T[],
  limit: number,
  getCursorSource: (item: T) => { createdAt: string; id: string },
): PaginatedResult<T> {
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const lastItem = items.at(-1)

  if (!lastItem || !hasMore) {
    return {
      items,
      nextCursor: null,
      hasMore: false,
    }
  }

  const { createdAt, id } = getCursorSource(lastItem)

  return {
    items,
    nextCursor: encodeCursor(createdAt, id),
    hasMore: true,
  }
}
