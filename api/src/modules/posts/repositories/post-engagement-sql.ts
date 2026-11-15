/**
 * Colunas de curtidas e comentários de uma postagem, para incluir no SELECT de `posts`.
 * `viewerParam` é o parâmetro posicional com o id de quem pede (ex.: `$2`); sem ele, como na
 * leitura pública de uma postagem, `liked_by_me` é sempre falso.
 */
export function engagementColumns(viewerParam?: string): string {
  const likedByMe = viewerParam
    ? `EXISTS (SELECT 1 FROM post_likes
               WHERE post_likes.post_id = posts.id
                 AND post_likes.user_id = ${viewerParam}::uuid)`
    : 'false'

  return `(SELECT count(*)::int FROM post_likes
           WHERE post_likes.post_id = posts.id) AS like_count,
          (SELECT count(*)::int FROM post_comments
           WHERE post_comments.post_id = posts.id) AS comment_count,
          ${likedByMe} AS liked_by_me`
}
