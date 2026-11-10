import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { formatDate } from '@/lib/format';
import type { Post } from '@/lib/posts';
import { colors, radius } from '@/theme';

type PostAdminCardProps = {
  post: Post;
  isOwn: boolean;
  canModify: boolean;
  deleting: boolean;
  actionsDisabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function PostAdminCard({
  post,
  isOwn,
  canModify,
  deleting,
  actionsDisabled,
  onEdit,
  onDelete,
}: PostAdminCardProps) {
  const author = isOwn ? 'Sua postagem' : post.authorName || 'Autor não informado';
  const date = formatDate(post.updatedAt);

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={2} accessibilityRole="header">
        {post.title}
      </Text>
      <Text style={styles.meta}>{date ? `${author} · Atualizada em ${date}` : author}</Text>
      <Text style={styles.excerpt} numberOfLines={2}>
        {post.content}
      </Text>

      {canModify ? (
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button
              label="Editar"
              accessibilityLabel={`Editar ${post.title}`}
              variant="secondary"
              disabled={actionsDisabled}
              onPress={onEdit}
            />
          </View>
          <View style={styles.action}>
            <Button
              label="Excluir"
              accessibilityLabel={`Excluir ${post.title}`}
              variant="danger"
              loading={deleting}
              disabled={actionsDisabled}
              onPress={onDelete}
            />
          </View>
        </View>
      ) : null}
    </View>
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
  title: { fontSize: 17, fontWeight: '700', color: colors.ink900 },
  meta: { fontSize: 13, color: colors.ink500 },
  excerpt: { fontSize: 14, lineHeight: 20, color: colors.ink700 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  action: { flex: 1 },
});
