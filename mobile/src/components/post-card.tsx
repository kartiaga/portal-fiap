import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { PostMeta } from '@/components/post-meta';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeDate } from '@/lib/format';
import type { Post } from '@/lib/posts';
import { BorderWidth, Radius, Spacing, Typography } from '@/theme';

type PostCardProps = {
  post: Post;
  onPress: (post: Post) => void;
};

/** Cartão do feed: autor e data no cabeçalho, depois título e resumo. Tocar abre a postagem. */
export const PostCard = memo(function PostCard({ post, onPress }: PostCardProps) {
  const theme = useTheme();
  const author = post.authorName || 'Autor não informado';
  const date = formatRelativeDate(post.createdAt);

  return (
    <Pressable
      accessibilityRole="button"
      // O essencial vai no rótulo (dicas podem estar desligadas no leitor de tela); a ação, na dica.
      accessibilityLabel={date ? `${post.title}. ${author}, ${date}` : `${post.title}. ${author}`}
      accessibilityHint="Abre a postagem"
      onPress={() => onPress(post)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.surface,
          borderColor: theme.border,
        },
      ]}>
      <PostMeta authorName={post.authorName} authorAvatarUrl={post.authorAvatarUrl} date={date} />
      <Text numberOfLines={2} style={[Typography.headline, styles.title, { color: theme.text }]}>
        {post.title}
      </Text>
      <Text numberOfLines={2} style={[Typography.callout, { color: theme.textSecondary }]}>
        {post.content}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.medium,
  },
  title: {
    marginTop: Spacing.one,
  },
});
