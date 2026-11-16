import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { Icon, type IconName } from '@/components/icon';
import { RoleBadge } from '@/components/role-badge';
import { useTheme } from '@/hooks/use-theme';
import { capitalize } from '@/lib/format';
import { setFlashNotice } from '@/lib/notice';
import { BorderWidth, IconSize, MinTouchSize, Radius, Spacing, Typography } from '@/theme';

import { deletePerson, personError, type ListedRole } from './api';
import { peopleConfig } from './config';

type ActionRowProps = {
  label: string;
  icon: IconName;
  hint: string;
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function ActionRow({ label, icon, hint, danger = false, loading = false, disabled = false, onPress }: ActionRowProps) {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.backgroundSelected }]}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Icon name={icon} size={IconSize.medium} color={color} />
      )}
      <Text style={[Typography.body, styles.rowLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

type PersonActionsSheetProps = {
  id: string;
  name: string;
  role: ListedRole;
};

/**
 * Folha aberta pelos três pontinhos de uma pessoa na aba Pessoas (só administrador): o nome, o
 * perfil e as ações **Editar** e **Excluir**. Excluir pede confirmação, e depois a folha fecha e a
 * aba mostra o aviso e recarrega a lista. A própria conta não tem **Excluir**.
 */
export function PersonActionsSheet({ id, name, role }: PersonActionsSheetProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const singular = peopleConfig[role].singular;
  const isSelf = id === user?.id;

  function edit() {
    // Troca a folha pela edição: voltar da edição leva direto à lista.
    router.replace({ pathname: '/people/[id]/edit', params: { id } });
  }

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      await deletePerson(id);
      // A aba Pessoas mostra o aviso e recarrega a lista ao voltar a aparecer.
      setFlashNotice({ kind: 'success', text: `${capitalize(singular)} excluído com sucesso.` });
      router.back();
    } catch (caught) {
      setError(personError(caught, 'delete'));
      setDeleting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(`Excluir ${singular}?`, `Esta ação remove a conta de ${name}. Ela não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void remove() },
    ]);
  }

  return (
    <View
      style={[
        styles.sheet,
        { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, Spacing.three) },
      ]}>
      <View style={styles.header}>
        <RoleBadge role={role} />
        <Text accessibilityRole="header" numberOfLines={2} style={[Typography.title, { color: theme.text }]}>
          {name}
        </Text>
      </View>

      {error ? <Banner text={error} /> : null}

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ActionRow
          label="Editar"
          icon="create-outline"
          hint={`Abre a edição de ${singular}`}
          disabled={deleting}
          onPress={edit}
        />
        {isSelf ? null : (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ActionRow
              label="Excluir"
              icon="trash-outline"
              hint="Remove a conta. A ação não pode ser desfeita."
              danger
              loading={deleting}
              disabled={deleting}
              onPress={confirmDelete}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: Spacing.four,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  card: {
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: MinTouchSize,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rowLabel: {
    flex: 1,
  },
  divider: {
    height: BorderWidth.hairline,
    marginStart: Spacing.three + IconSize.medium + Spacing.three,
  },
});
