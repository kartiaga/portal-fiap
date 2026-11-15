import { encodeCursor } from '@/lib/pagination'
import {
  CommentNotFoundError,
  ForbiddenCommentAccessError,
  PostNotFoundError,
} from '@/modules/posts/errors'
import { buildCommentListQuery } from '@/modules/posts/repositories/comment-list-query'
import { buildPostListQuery } from '@/modules/posts/repositories/post-list-query'
import type { PostLikeRepository } from '@/modules/posts/repositories/post-like.repository'
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ListCommentsUseCase,
} from '@/modules/posts/use-cases/comments.use-cases'
import { buildLikeListQuery } from '@/modules/posts/repositories/like-list-query'
import {
  LikePostUseCase,
  ListLikesUseCase,
} from '@/modules/posts/use-cases/like-post.use-case'
import { UserRole } from '@/modules/users/entities/user'

const POST_ID = '00000000-0000-4000-8000-000000000001'
const POST_AUTHOR = '00000000-0000-4000-8000-0000000000aa'
const STUDENT = '00000000-0000-4000-8000-0000000000bb'
const OTHER = '00000000-0000-4000-8000-0000000000cc'
const COMMENT_ID = '00000000-0000-4000-8000-000000000c01'

const existingPost = () => ({
  findAuthorId: jest.fn().mockResolvedValue(POST_AUTHOR),
})
const missingPost = () => ({
  findAuthorId: jest.fn().mockResolvedValue(undefined),
})

describe('post list SQL with engagement', () => {
  it('counts likes and comments and checks the viewer like', () => {
    const { sql, values } = buildPostListQuery({ viewerId: STUDENT, limit: 5 })

    expect(sql).toMatch(/count\(\*\)::int FROM post_likes/)
    expect(sql).toMatch(/count\(\*\)::int FROM post_comments/)
    expect(sql).toMatch(/post_likes\.user_id = \$1::uuid/)
    expect(values).toEqual([STUDENT, 6])
  })

  it('keeps liked_by_me false without a viewer', () => {
    const { sql } = buildPostListQuery({})

    expect(sql).toMatch(/false AS liked_by_me/)
  })
})

describe('comment list SQL', () => {
  it('filters by post and pages newest first', () => {
    const cursor = encodeCursor('2026-01-01T00:00:00.000000Z', COMMENT_ID)
    const { sql, values } = buildCommentListQuery(POST_ID, {
      cursor,
      limit: 10,
    })

    expect(sql).toMatch(
      /WHERE post_comments\.post_id = \$1::uuid AND \(post_comments\.created_at, post_comments\.id\) < \(\$2::timestamptz, \$3::uuid\)/,
    )
    expect(sql).toMatch(
      /ORDER BY post_comments\.created_at DESC, post_comments\.id DESC/,
    )
    expect(values).toEqual([
      POST_ID,
      '2026-01-01T00:00:00.000000Z',
      COMMENT_ID,
      11,
    ])
  })
})

describe('LikePostUseCase', () => {
  const makeLikes = () =>
    ({
      like: jest.fn().mockResolvedValue(undefined),
      unlike: jest.fn().mockResolvedValue(undefined),
      summary: jest.fn().mockResolvedValue({ likeCount: 3, likedByMe: true }),
    }) as unknown as jest.Mocked<PostLikeRepository>

  it('likes and returns the updated summary', async () => {
    const likes = makeLikes()
    const useCase = new LikePostUseCase(existingPost(), likes)

    await expect(useCase.handler(POST_ID, STUDENT, true)).resolves.toEqual({
      likeCount: 3,
      likedByMe: true,
    })
    expect(likes.like).toHaveBeenCalledWith(POST_ID, STUDENT)
    expect(likes.unlike).not.toHaveBeenCalled()
  })

  it('unlikes', async () => {
    const likes = makeLikes()
    const useCase = new LikePostUseCase(existingPost(), likes)

    await useCase.handler(POST_ID, STUDENT, false)

    expect(likes.unlike).toHaveBeenCalledWith(POST_ID, STUDENT)
    expect(likes.like).not.toHaveBeenCalled()
  })

  it('fails when the post does not exist', async () => {
    const likes = makeLikes()
    const useCase = new LikePostUseCase(missingPost(), likes)

    await expect(useCase.handler(POST_ID, STUDENT, true)).rejects.toThrow(
      PostNotFoundError,
    )
    expect(likes.like).not.toHaveBeenCalled()
  })

  it('treats a post deleted mid-request as not found', async () => {
    const likes = makeLikes()
    likes.like.mockRejectedValue(
      Object.assign(new Error('fk'), { code: '23503' }),
    )
    const useCase = new LikePostUseCase(existingPost(), likes)

    await expect(useCase.handler(POST_ID, STUDENT, true)).rejects.toThrow(
      PostNotFoundError,
    )
  })
})

describe('like list SQL', () => {
  it('filters by post and pages newest first, with the user id as tiebreaker', () => {
    const cursor = encodeCursor('2026-01-01T00:00:00.000000Z', STUDENT)
    const { sql, values } = buildLikeListQuery(POST_ID, { cursor, limit: 10 })

    expect(sql).toMatch(/post_likes\.user_id AS id/)
    expect(sql).toMatch(
      /WHERE post_likes\.post_id = \$1::uuid AND \(post_likes\.created_at, post_likes\.user_id\) < \(\$2::timestamptz, \$3::uuid\)/,
    )
    expect(values).toEqual([
      POST_ID,
      '2026-01-01T00:00:00.000000Z',
      STUDENT,
      11,
    ])
  })
})

describe('ListLikesUseCase', () => {
  it('lists who liked an existing post', async () => {
    const page = { items: [], nextCursor: null, hasMore: false }
    const likes = { findLikers: jest.fn().mockResolvedValue(page) }
    const useCase = new ListLikesUseCase(existingPost(), likes)

    await expect(useCase.handler(POST_ID, { limit: 5 })).resolves.toBe(page)
    expect(likes.findLikers).toHaveBeenCalledWith(POST_ID, { limit: 5 })
  })

  it('fails when the post does not exist', async () => {
    const likes = { findLikers: jest.fn() }
    const useCase = new ListLikesUseCase(missingPost(), likes)

    await expect(useCase.handler(POST_ID)).rejects.toThrow(PostNotFoundError)
    expect(likes.findLikers).not.toHaveBeenCalled()
  })
})

describe('ListCommentsUseCase', () => {
  it('lists the comments of an existing post', async () => {
    const page = { items: [], nextCursor: null, hasMore: false }
    const comments = { findPaginated: jest.fn().mockResolvedValue(page) }
    const useCase = new ListCommentsUseCase(existingPost(), comments)

    await expect(useCase.handler(POST_ID, { limit: 5 })).resolves.toBe(page)
    expect(comments.findPaginated).toHaveBeenCalledWith(POST_ID, { limit: 5 })
  })

  it('fails when the post does not exist', async () => {
    const comments = { findPaginated: jest.fn() }
    const useCase = new ListCommentsUseCase(missingPost(), comments)

    await expect(useCase.handler(POST_ID)).rejects.toThrow(PostNotFoundError)
    expect(comments.findPaginated).not.toHaveBeenCalled()
  })
})

describe('CreateCommentUseCase', () => {
  it('creates the comment as the requester', async () => {
    const created = { id: COMMENT_ID, postId: POST_ID, authorId: STUDENT }
    const comments = { create: jest.fn().mockResolvedValue(created) }
    const useCase = new CreateCommentUseCase(existingPost(), comments)

    await expect(
      useCase.handler(POST_ID, STUDENT, 'Ótima aula!'),
    ).resolves.toBe(created)
    expect(comments.create).toHaveBeenCalledWith(
      POST_ID,
      STUDENT,
      'Ótima aula!',
    )
  })

  it('fails when the post does not exist', async () => {
    const comments = { create: jest.fn() }
    const useCase = new CreateCommentUseCase(missingPost(), comments)

    await expect(useCase.handler(POST_ID, STUDENT, 'Oi')).rejects.toThrow(
      PostNotFoundError,
    )
    expect(comments.create).not.toHaveBeenCalled()
  })
})

describe('DeleteCommentUseCase', () => {
  const makeComments = (authorId = STUDENT, postId = POST_ID) => ({
    findById: jest.fn().mockResolvedValue({ id: COMMENT_ID, postId, authorId }),
    delete: jest.fn().mockResolvedValue(undefined),
  })

  it.each([
    ['the comment author', { id: STUDENT, role: UserRole.STUDENT }],
    ['an admin', { id: OTHER, role: UserRole.ADMIN }],
  ])('lets %s delete', async (_, requester) => {
    const comments = makeComments()
    const useCase = new DeleteCommentUseCase(comments)

    await useCase.handler(POST_ID, COMMENT_ID, requester)

    expect(comments.delete).toHaveBeenCalledWith(COMMENT_ID)
  })

  it.each([
    ['another student', { id: OTHER, role: UserRole.STUDENT }],
    ['another teacher', { id: OTHER, role: UserRole.TEACHER }],
    ['the post author', { id: POST_AUTHOR, role: UserRole.TEACHER }],
  ])('forbids %s', async (_, requester) => {
    const comments = makeComments()
    const useCase = new DeleteCommentUseCase(comments)

    await expect(
      useCase.handler(POST_ID, COMMENT_ID, requester),
    ).rejects.toThrow(ForbiddenCommentAccessError)
    expect(comments.delete).not.toHaveBeenCalled()
  })

  it('fails when the comment belongs to another post', async () => {
    const comments = makeComments(STUDENT, OTHER)
    const useCase = new DeleteCommentUseCase(comments)

    await expect(
      useCase.handler(POST_ID, COMMENT_ID, { id: OTHER, role: UserRole.ADMIN }),
    ).rejects.toThrow(CommentNotFoundError)
  })

  it('fails when the comment does not exist', async () => {
    const comments = {
      findById: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn(),
    }
    const useCase = new DeleteCommentUseCase(comments)

    await expect(
      useCase.handler(POST_ID, COMMENT_ID, {
        id: STUDENT,
        role: UserRole.STUDENT,
      }),
    ).rejects.toThrow(CommentNotFoundError)
  })
})
