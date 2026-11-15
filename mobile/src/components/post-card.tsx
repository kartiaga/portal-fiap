import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CommentButton, LikeButton } from '@/components/post-engagement';
import { PostMeta } from '@/components/post-meta';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeDate } from '@/lib/format';
import type { Post } from '@/lib/posts';
import { BorderWidth, Radius, Spacing, Typography } from '@/theme';

type PostCardProps = {
  post: Post;
  onPress: (post: Post) => void;
  onToggleLike: (post: Post) => void;
  /** Abre a folha de quem curtiu. */
  onOpenLikes: (post: Post) => void;
  /** Abre a folha de comentários. */
  onOpenComments: (post: Post) => void;
};

/**
 * Cartão do feed: autor e data no cabeçalho, depois título e resumo; tocar abre a postagem.
 * Embaixo, curtir (coração), quem curtiu (número) e comentários (balão). A área de conteúdo e
 * esses botões são irmãos, não aninhados, para o leitor de tela alcançar cada um.
 */
export const PostCard = memo(function PostCard({
  post,
  onPress,
  onToggleLike,
  onOpenLikes,
  onOpenComments,
}: PostCardProps) {
  const theme = useTheme();
  const author = post.authorName || 'Autor não informado';
  const date = formatRelativeDate(post.createdAt);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        // O essencial vai no rótulo (dicas podem estar desligadas no leitor de tela); a ação, na dica.
        accessibilityLabel={date ? `${post.title}. ${author}, ${date}` : `${post.title}. ${author}`}
        accessibilityHint="Abre a postagem"
        onPress={() => onPress(post)}
        style={({ pressed }) => [
          styles.body,
          pressed && { backgroundColor: theme.backgroundSelected },
        ]}>
        <PostMeta authorName={post.authorName} authorAvatarUrl={post.authorAvatarUrl} date={date} />
        <Text numberOfLines={2} style={[Typography.headline, styles.title, { color: theme.text }]}>
          {post.title}
        </Text>
        <Text numberOfLines={2} style={[Typography.callout, { color: theme.textSecondary }]}>
          {post.content}
        </Text>
      </Pressable>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={styles.stats}>
          <LikeButton
            liked={post.likedByMe ?? false}
            count={post.likeCount ?? 0}
            subject={post.title}
            onToggle={() => onToggleLike(post)}
            onOpenLikes={() => onOpenLikes(post)}
          />
          <CommentButton
            count={post.commentCount ?? 0}
            subject={post.title}
            onPress={() => onOpenComments(post)}
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    marginTop: Spacing.one,
  },
  footer: {
    marginHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderTopWidth: BorderWidth.hairline,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    // O coração tem respiro próprio: o recuo negativo o alinha ao texto do cartão.
    marginStart: -Spacing.two + Spacing.half,
  },
});
