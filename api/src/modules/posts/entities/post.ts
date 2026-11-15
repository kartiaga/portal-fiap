export class Post {
  id?: string
  title: string
  content: string
  authorId: string
  authorName?: string | undefined
  authorAvatarUrl?: string | null | undefined
  /** Curtidas, comentários e se quem pediu curtiu: só nas leituras (listagem, busca e por id). */
  likeCount?: number | undefined
  commentCount?: number | undefined
  likedByMe?: boolean | undefined
  createdAt?: Date
  updatedAt?: Date

  constructor(post: Post) {
    this.title = post.title
    this.content = post.content
    this.authorId = post.authorId
  }
}
