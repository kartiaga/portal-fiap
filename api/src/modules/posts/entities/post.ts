export class Post {
  id?: string
  title: string
  content: string
  authorId: string
  authorName?: string | undefined
  authorAvatarUrl?: string | null | undefined
  createdAt?: Date
  updatedAt?: Date

  constructor(post: Post) {
    this.title = post.title
    this.content = post.content
    this.authorId = post.authorId
  }
}
