import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { PostMeta } from '@/components/post-meta';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/format';
import type { Post } from '@/lib/posts';
import { BorderWidth, Radius, Spacing, Typography } from '@/theme';

type PostAdminCardProps = {
  post: Post;
  isOwn: boolean;
  canModify: boolean;
  deleting: boolean;
  actionsDisabled: boolean;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  /** Tocar no conteúdo do cartão abre a leitura. Sem ele, o cartão não é tocável. */
  onOpen?: (post: Post) => void;
};

/**
 * Cartão da aba Gerenciar: o mesmo cabeçalho do feed (com o selo "Você" e a data da última
 * alteração), título, resumo e as ações. A área de conteúdo e as ações são irmãs, não aninhadas,
 * para o leitor de tela alcançar os botões separadamente.
 */
export const PostAdminCard = memo(function PostAdminCard({
  post,
  isOwn,
  canModify,
  deleting,
  actionsDisabled,
  onEdit,
  onDelete,
  onOpen,
}: PostAdminCardProps) {
  const theme = useTheme();
  const author = post.authorName || 'Autor não informado';
  const date = formatDate(post.updatedAt);
  const label = [`${post.title}. ${author}`, isOwn ? 'sua postagem' : null, date ? `editada em ${date}` : null]
    .filter(Boolean)
    .join(', ');

  const content = (
    <>
      <PostMeta
        authorName={post.authorName}
        authorAvatarUrl={post.authorAvatarUrl}
        date={date}
        datePrefix="Editada"
        isSelf={isOwn}
      />
      <Text
        numberOfLines={2}
        accessibilityRole="header"
        style={[Typography.headline, styles.title, { color: theme.text }]}>
        {post.title}
      </Text>
      <Text numberOfLines={2} style={[Typography.callout, { color: theme.textSecondary }]}>
        {post.content}
      </Text>
    </>
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {onOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint="Abre a postagem"
          onPress={() => onOpen(post)}
          style={({ pressed }) => [
            styles.body,
            pressed && { backgroundColor: theme.backgroundSelected },
          ]}>
          {content}
        </Pressable>
      ) : (
        <View style={styles.body}>{content}</View>
      )}

      {canModify ? (
        <View style={[styles.actions, { borderTopColor: theme.border }]}>
          <Button
            label="Editar"
            icon="create-outline"
            size="small"
            variant="secondary"
            accessibilityLabel={`Editar ${post.title}`}
            disabled={actionsDisabled}
            onPress={() => onEdit(post)}
          />
          <Button
            label="Excluir"
            icon="trash-outline"
            size="small"
            variant="dangerGhost"
            accessibilityLabel={`Excluir ${post.title}`}
            loading={deleting}
            disabled={actionsDisabled}
            onPress={() => onDelete(post)}
          />
        </View>
      ) : null}
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
    gap: Spacing.two,
    padding: Spacing.three,
  },
  title: {
    marginTop: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    borderTopWidth: BorderWidth.hairline,
  },
});
