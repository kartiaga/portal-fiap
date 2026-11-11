import { Pressable, StyleSheet, Text } from 'react-native';

import { formatDate } from '@/lib/format';
import type { Post } from '@/lib/posts';
import { colors, radius } from '@/theme';

type PostCardProps = {
  post: Post;
  onPress: () => void;
};

export function PostCard({ post, onPress }: PostCardProps) {
  const author = `Por ${post.authorName || 'Autor não informado'}`;
  const date = formatDate(post.createdAt);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ler ${post.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>
      <Text style={styles.meta}>{date ? `${author} · ${date}` : author}</Text>
      <Text style={styles.excerpt} numberOfLines={3}>
        {post.content}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    padding: 16,
    backgroundColor: colors.paper000,
    borderWidth: 1,
    borderColor: colors.ink100,
    borderRadius: radius.m,
  },
  pressed: { borderColor: colors.ink300 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink900 },
  meta: { fontSize: 13, color: colors.ink500 },
  excerpt: { fontSize: 14, lineHeight: 20, color: colors.ink700 },
});
