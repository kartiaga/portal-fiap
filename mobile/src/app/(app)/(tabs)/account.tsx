import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { Avatar } from '@/components/avatar';
import { Banner } from '@/components/banner';
import { Icon, type IconName } from '@/components/icon';
import { RoleBadge } from '@/components/role-badge';
import { ScreenHeader } from '@/components/screen-header';
import { getPerson, type Person } from '@/features/people/api';
import { canViewPeople } from '@/features/people/permissions';
import { avatarErrorMessage, pickPhoto, removeAvatar, uploadAvatar } from '@/features/profile/avatar';
import { useNotice } from '@/hooks/use-notice';
import { useTheme } from '@/hooks/use-theme';
import { takeFlashNotice } from '@/lib/notice';
import {
  AvatarSize,
  BorderWidth,
  IconSize,
  MaxContentWidth,
  Radius,
  RowHeight,
  Spacing,
  Typography,
} from '@/theme';

/**
 * Aba Conta: quem está conectado, a foto de perfil, "Editar meus dados" e sair. O token só traz id
 * e perfil; nome, e-mail e foto vêm de `GET /users/:id`, que a API libera para qualquer um na
 * própria conta. Tocar no avatar troca ou remove a foto.
 */
export default function AccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useSession();
  const [profile, setProfile] = useState<Person | null>(null);
  const [uploading, setUploading] = useState(false);
  const { notice, showNotice, clearNotice } = useNotice();
  // Professor e administrador editam a própria conta; a API não libera isso para estudante.
  const managesAccount = canViewPeople(user?.role);

  useFocusEffect(
    useCallback(() => {
      // Aviso deixado por "Meus dados" ao salvar.
      showNotice(takeFlashNotice());
      if (!user) return;
      let active = true;
      getPerson(user.id)
        .then((person) => {
          if (active) setProfile(person);
        })
        // Sem os dados do cadastro, a tela continua útil só com o perfil.
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, [user, showNotice]),
  );

  if (!user) return null;

  const expiresAt = new Date(user.expiresAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const displayName = profile?.name ?? 'Sua conta';

  async function changePhoto() {
    if (!user || uploading) return;
    let photo;
    try {
      photo = await pickPhoto();
    } catch {
      showNotice({ kind: 'error', text: 'Não foi possível abrir suas fotos.' });
      return;
    }
    if (!photo) return;

    setUploading(true);
    try {
      const avatarUrl = await uploadAvatar(user.id, photo);
      setProfile((current) => (current ? { ...current, avatarUrl } : current));
      showNotice({ kind: 'success', text: 'Foto atualizada.' });
    } catch (error) {
      showNotice({ kind: 'error', text: avatarErrorMessage(error) });
    } finally {
      setUploading(false);
    }
  }

  async function deletePhoto() {
    if (!user || uploading) return;
    setUploading(true);
    try {
      await removeAvatar(user.id);
      setProfile((current) => (current ? { ...current, avatarUrl: null } : current));
      showNotice({ kind: 'success', text: 'Foto removida.' });
    } catch (error) {
      showNotice({ kind: 'error', text: avatarErrorMessage(error) });
    } finally {
      setUploading(false);
    }
  }

  function openPhotoMenu() {
    Alert.alert('Foto de perfil', undefined, [
      { text: 'Escolher da galeria', onPress: () => void changePhoto() },
      ...(profile?.avatarUrl
        ? [{ text: 'Remover foto', style: 'destructive' as const, onPress: () => void deletePhoto() }]
        : []),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  }

  function confirmSignOut() {
    Alert.alert('Sair da conta?', 'Você vai precisar entrar de novo com e-mail e senha.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <ScreenHeader title="Conta" />

        {notice ? (
          <Banner
            kind={notice.kind}
            text={notice.text}
            onDismiss={notice.kind === 'success' ? undefined : clearNotice}
          />
        ) : null}

        <View style={[styles.profile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <PhotoButton
            name={profile?.name}
            uri={profile?.avatarUrl}
            busy={uploading}
            onPress={openPhotoMenu}
          />
          <View style={styles.identity}>
            <Text numberOfLines={2} style={[Typography.title, { color: theme.text }]}>
              {displayName}
            </Text>
            {profile ? (
              <Text numberOfLines={1} style={[Typography.callout, { color: theme.textSecondary }]}>
                {profile.email}
              </Text>
            ) : null}
            <RoleBadge role={user.role} />
          </View>
        </View>

        <View style={styles.section}>
          {managesAccount ? (
            <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ActionRow
                icon="person-outline"
                label="Editar meus dados"
                onPress={() => router.push('/account/edit')}
              />
            </View>
          ) : null}
          <Text style={[Typography.callout, styles.caption, { color: theme.textSecondary }]}>
            Sessão válida até {expiresAt}
          </Text>
        </View>

        <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ActionRow icon="log-out-outline" label="Sair" tone="danger" onPress={confirmSignOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type PhotoButtonProps = {
  name: string | null | undefined;
  uri: string | null | undefined;
  busy: boolean;
  onPress: () => void;
};

/** Avatar tocável do cartão de identidade, com o selo de câmera que avisa que dá para trocar a foto. */
function PhotoButton({ name, uri, busy, onPress }: PhotoButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Alterar foto de perfil"
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      testID="account-photo"
      style={styles.photo}>
      <Avatar name={name} uri={uri} size={AvatarSize.large} variant="solid" />
      {busy ? (
        <View style={[styles.photoBusy, { backgroundColor: theme.scrim }]}>
          <ActivityIndicator color={theme.onTint} accessibilityLabel="Enviando foto" />
        </View>
      ) : null}
      <View style={[styles.cameraBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Icon name="camera" size={IconSize.small} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

type ActionRowProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** `danger` para sair: texto e ícone vermelhos, sem seta (não abre outra tela). */
  tone?: 'default' | 'danger';
};

/** Linha tocável de grupo, no padrão dos Ajustes do iOS. */
function ActionRow({ icon, label, onPress, tone = 'default' }: ActionRowProps) {
  const theme = useTheme();
  const danger = tone === 'danger';
  const color = danger ? theme.danger : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: danger ? theme.dangerSoft : theme.backgroundSelected },
      ]}>
      <Icon name={icon} size={IconSize.medium} color={danger ? theme.danger : theme.textSecondary} />
      <Text style={[Typography.body, styles.rowLabel, { color }]}>{label}</Text>
      {danger ? null : (
        <Icon name="chevron-forward" size={IconSize.medium} color={theme.textTertiary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.medium,
  },
  identity: {
    flex: 1,
    gap: Spacing.one,
  },
  photo: {
    width: AvatarSize.large,
    height: AvatarSize.large,
  },
  photoBusy: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: AvatarSize.large / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -Spacing.one,
    bottom: -Spacing.one,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: BorderWidth.thin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: Spacing.two,
  },
  group: {
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  caption: {
    paddingHorizontal: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: RowHeight,
    paddingHorizontal: Spacing.three,
  },
  rowLabel: {
    flex: 1,
  },
});
