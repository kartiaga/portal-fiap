import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { pluralize } from '@/lib/format';
import { ControlHeight, IconSize, Radius, Spacing, Typography } from '@/theme';

type LikeButtonProps = {
  liked: boolean;
  count: number;
  /** Tocar no coração: curtir ou descurtir. */
  onToggle: () => void;
  /** Tocar no número: ver quem curtiu. Com zero curtidas, o número não é tocável. */
  onOpenLikes: () => void;
  /** Título da postagem: numa lista, "Curtir" sozinho seria ambíguo para o leitor de tela. */
  subject?: string;
};

/**
 * Curtidas, como no Instagram: o coração curte e o número ao lado abre quem curtiu. São dois
 * alvos de toque separados. Curtido, o coração fica cheio (`tint`); senão, vazado, para o estado
 * não depender só da cor.
 */
export function LikeButton({ liked, count, onToggle, onOpenLikes, subject }: LikeButtonProps) {
  const theme = useTheme();
  const action = liked ? 'Descurtir' : 'Curtir';
  const countLabel = pluralize(count, 'curtida', 'curtidas');
  const countText = (
    <Text style={[Typography.meta, { color: liked ? theme.tintText : theme.textSecondary }]}>{count}</Text>
  );

  return (
    <View style={styles.group}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={subject ? `${action} ${subject}` : action}
        accessibilityState={{ selected: liked }}
        hitSlop={Spacing.one}
        onPress={onToggle}
        style={({ pressed }) => [styles.icon, pressed && { backgroundColor: theme.backgroundSelected }]}>
        <Icon
          name={liked ? 'heart' : 'heart-outline'}
          size={IconSize.large}
          color={liked ? theme.tint : theme.textSecondary}
        />
      </Pressable>
      {count > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={subject ? `Ver quem curtiu ${subject}` : 'Ver quem curtiu'}
          accessibilityValue={{ text: countLabel }}
          hitSlop={Spacing.one}
          onPress={onOpenLikes}
          style={({ pressed }) => [styles.count, pressed && { backgroundColor: theme.backgroundSelected }]}>
          {countText}
        </Pressable>
      ) : (
        <View accessible accessibilityLabel={countLabel} style={styles.count}>
          {countText}
        </View>
      )}
    </View>
  );
}

type CommentButtonProps = {
  count: number;
  /** Abre a folha de comentários. */
  onPress: () => void;
  subject?: string;
};

/** Balão e total de comentários; tocar abre a folha de comentários. */
export function CommentButton({ count, onPress, subject }: CommentButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subject ? `Comentários de ${subject}` : 'Ver comentários'}
      accessibilityValue={{ text: pluralize(count, 'comentário', 'comentários') }}
      hitSlop={Spacing.one}
      onPress={onPress}
      style={({ pressed }) => [styles.comments, pressed && { backgroundColor: theme.backgroundSelected }]}>
      <Icon name="chatbubble-outline" size={IconSize.large} color={theme.textSecondary} />
      <Text style={[Typography.meta, { color: theme.textSecondary }]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: ControlHeight.small,
    height: ControlHeight.small,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    minWidth: ControlHeight.small - Spacing.two,
    minHeight: ControlHeight.small,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.small,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  comments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
    minHeight: ControlHeight.small,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
  },
});
