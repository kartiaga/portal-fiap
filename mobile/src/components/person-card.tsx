import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { SelfBadge } from '@/components/badge';
import { Icon } from '@/components/icon';
import { RoleBadge } from '@/components/role-badge';
import { useTheme } from '@/hooks/use-theme';
import type { Person } from '@/features/people/api';
import { ROLE_LABEL } from '@/lib/roles';
import { BorderWidth, IconSize, MinTouchSize, Radius, Spacing, Typography } from '@/theme';

type PersonCardProps = {
  person: Person;
  isSelf: boolean;
  /** Tocar no cartão abre a edição. Sem isto, o cartão é só leitura (o professor não gerencia contas). */
  onEdit?: (person: Person) => void;
  /** Os três pontinhos abrem a folha com Editar e Excluir. */
  onMore?: (person: Person) => void;
};

/**
 * Linha da lista de pessoas: avatar, o selo do perfil acima do nome e, para quem gerencia contas,
 * os três pontinhos com as ações (o e-mail fica na tela da pessoa). O conteúdo e os três pontinhos
 * são irmãos, não aninhados, para o leitor de tela alcançar cada um.
 */
export const PersonCard = memo(function PersonCard({ person, isSelf, onEdit, onMore }: PersonCardProps) {
  const theme = useTheme();
  const name = person.name ?? 'Nome não informado';
  const label = `${name}, ${ROLE_LABEL[person.role]}${isSelf ? ', você' : ''}`;

  const content = (
    <>
      <Avatar name={person.name} uri={person.avatarUrl} />
      <View style={styles.info}>
        <View style={styles.badges}>
          <RoleBadge role={person.role} />
          {isSelf ? <SelfBadge /> : null}
        </View>
        <Text numberOfLines={1} style={[Typography.headline, { color: theme.text }]}>
          {name}
        </Text>
      </View>
    </>
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {onEdit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint="Abre a edição"
          onPress={() => onEdit(person)}
          style={({ pressed }) => [styles.body, pressed && { backgroundColor: theme.backgroundSelected }]}>
          {content}
        </Pressable>
      ) : (
        <View accessible accessibilityLabel={label} style={styles.body}>
          {content}
        </View>
      )}

      {onMore ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mais ações para ${name}`}
          accessibilityHint="Abre as opções Editar e Excluir"
          onPress={() => onMore(person)}
          style={({ pressed }) => [styles.more, pressed && { backgroundColor: theme.backgroundSelected }]}>
          <Icon name="ellipsis-horizontal" size={IconSize.medium} color={theme.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  info: {
    flex: 1,
    gap: Spacing.one,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  more: {
    width: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
