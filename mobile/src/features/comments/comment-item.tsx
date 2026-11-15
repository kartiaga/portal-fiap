import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { PostMeta } from '@/components/post-meta';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeDate } from '@/lib/format';
import { AvatarSize, Spacing, Typography } from '@/theme';

import type { Comment } from './api';

type CommentItemProps = {
  comment: Comment;
  isSelf: boolean;
  canDelete: boolean;
  deleting: boolean;
  onDelete: (comment: Comment) => void;
};

/**
 * Um comentário: o mesmo cabeçalho dos cartões de postagem (avatar, autor, selo "Você" e data) e
 * o texto alinhado ao nome. Excluir aparece só para quem pode, como nas listas (`dangerGhost`).
 */
export const CommentItem = memo(function CommentItem({
  comment,
  isSelf,
  canDelete,
  deleting,
  onDelete,
}: CommentItemProps) {
  const theme = useTheme();
  const author = comment.authorName || 'Autor não informado';

  return (
    <View style={styles.item}>
      <PostMeta
        authorName={comment.authorName}
        authorAvatarUrl={comment.authorAvatarUrl}
        date={formatRelativeDate(comment.createdAt)}
        isSelf={isSelf}
      />
      <View style={styles.body}>
        <Text selectable style={[Typography.body, { color: theme.text }]}>
          {comment.content}
        </Text>
        {canDelete ? (
          <View style={styles.action}>
            <Button
              label="Excluir"
              icon="trash-outline"
              size="small"
              variant="dangerGhost"
              accessibilityLabel={`Excluir comentário de ${author}`}
              loading={deleting}
              onPress={() => onDelete(comment)}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  item: {
    gap: Spacing.one,
  },
  body: {
    // Alinha o texto ao nome do autor, à direita do avatar.
    marginStart: AvatarSize.small + Spacing.two,
    gap: Spacing.one,
  },
  action: {
    alignSelf: 'flex-start',
    // O botão tem respiro próprio: o recuo negativo alinha o ícone ao texto.
    marginStart: -Spacing.three,
  },
});
