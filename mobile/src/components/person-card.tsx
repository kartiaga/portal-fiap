import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { SelfBadge } from '@/components/badge';
import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import type { Person } from '@/features/people/api';
import { BorderWidth, IconSize, Radius, Spacing, Typography } from '@/theme';

type PersonCardProps = {
  person: Person;
  isSelf: boolean;
  onPress: (person: Person) => void;
};

/** Linha da lista de pessoas: avatar, nome e e-mail. Tocar abre a edição. */
export const PersonCard = memo(function PersonCard({ person, isSelf, onPress }: PersonCardProps) {
  const theme = useTheme();
  const name = person.name ?? 'Nome não informado';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${person.email}${isSelf ? ', você' : ''}`}
      accessibilityHint="Abre a edição"
      onPress={() => onPress(person)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.surface,
          borderColor: theme.border,
        },
      ]}>
      <Avatar name={person.name} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[Typography.headline, styles.name, { color: theme.text }]}>
            {name}
          </Text>
          {isSelf ? <SelfBadge /> : null}
        </View>
        <Text numberOfLines={1} style={[Typography.callout, { color: theme.textSecondary }]}>
          {person.email}
        </Text>
      </View>
      <Icon name="chevron-forward" size={IconSize.medium} color={theme.textTertiary} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.medium,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
  },
});
