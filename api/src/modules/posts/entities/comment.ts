export type Comment = {
  id: string
  postId: string
  authorId: string
  authorName?: string | undefined
  authorAvatarUrl?: string | null | undefined
  content: string
  createdAt: Date
}

/** Uma pessoa que curtiu a postagem. */
export type Liker = {
  userId: string
  name?: string | undefined
  avatarUrl?: string | null | undefined
  likedAt: Date
}

/** Curtidas de uma postagem do ponto de vista de quem pediu. */
export type LikeSummary = {
  likeCount: number
  likedByMe: boolean
}
