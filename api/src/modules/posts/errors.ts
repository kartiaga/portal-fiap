export class ForbiddenPostAccessError extends Error {
  constructor() {
    super('You do not have permission to modify this post')
    this.name = 'ForbiddenPostAccessError'
  }
}

export class PostNotFoundError extends Error {
  constructor() {
    super('Post not found')
    this.name = 'PostNotFoundError'
  }
}

export class CommentNotFoundError extends Error {
  constructor() {
    super('Comment not found')
    this.name = 'CommentNotFoundError'
  }
}

export class ForbiddenCommentAccessError extends Error {
  constructor() {
    super('You do not have permission to delete this comment')
    this.name = 'ForbiddenCommentAccessError'
  }
}

/**
 * Violação de chave estrangeira do Postgres: a postagem foi excluída entre a verificação e a
 * gravação da curtida ou do comentário.
 */
export function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === '23503'
  )
}
