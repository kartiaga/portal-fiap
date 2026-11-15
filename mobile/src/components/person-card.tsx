import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { SelfBadge } from '@/components/badge';
import { Icon } from '@/components/icon';
import { RoleBadge } from '@/components/role-badge';
import { useTheme } from '@/hooks/use-theme';
import type { Person } from '@/features/people/api';
import { ROLE_LABEL } from '@/lib/roles';
import { BorderWidth, IconSize, Radius, Spacing, Typography } from '@/theme';

type PersonCardProps = {
  person: Person;
  isSelf: boolean;
  /** Sem isto, o cartão é só leitura (o professor vê a lista, mas não edita contas). */
  onPress?: (person: Person) => void;
};

/**
 * Linha da lista de pessoas: avatar, nome e o selo do perfil (o e-mail fica na tela da pessoa). Com `onPress`, tocar abre a
 * edição; sem ele, o cartão só informa.
 */
export const PersonCard = memo(function PersonCard({ person, isSelf, onPress }: PersonCardProps) {
  const theme = useTheme();
  const name = person.name ?? 'Nome não informado';
  const label = `${name}, ${ROLE_LABEL[person.role]}${isSelf ? ', você' : ''}`;

  const content = (
    <>
      <Avatar name={person.name} uri={person.avatarUrl} />
      <View style={styles.info}>
        <Text numberOfLines={1} style={[Typography.headline, { color: theme.text }]}>
          {name}
        </Text>
        <View style={styles.badges}>
          <RoleBadge role={person.role} />
          {isSelf ? <SelfBadge /> : null}
        </View>
      </View>
      {onPress ? <Icon name="chevron-forward" size={IconSize.medium} color={theme.textTertiary} /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityLabel={label}
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre a edição"
      onPress={() => onPress(person)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.surface,
          borderColor: theme.border,
        },
      ]}>
      {content}
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
