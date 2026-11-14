import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeTabs } from 'expo-router/native-tabs';

import { useSession } from '@/auth/session-context';
import { useTheme } from '@/hooks/use-theme';
import { canManagePeople } from '@/features/people/permissions';
import { canManagePosts } from '@/lib/permissions';

/**
 * Abas nativas da área logada. Gerenciar e Pessoas só existem para professor e administrador;
 * as telas e a API também exigem. No iOS os ícones são SF Symbols; no Android, Ionicons.
 * `disableTransparentOnScrollEdge`: sem ele, no iOS os cartões aparecem por baixo dos ícones.
 */
export default function TabsLayout() {
  const theme = useTheme();
  const { user } = useSession();

  return (
    <NativeTabs
      backgroundColor={theme.background}
      // Ícone não é texto: o vermelho cheio passa o mínimo de 3:1 nos dois temas.
      iconColor={{ default: theme.textSecondary, selected: theme.tint }}
      tintColor={theme.tintText}
      indicatorColor={theme.tintSoft}
      labelStyle={{ default: { color: theme.textSecondary }, selected: { color: theme.text } }}
      disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Posts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'newspaper', selected: 'newspaper.fill' }}
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="newspaper" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="admin" hidden={!canManagePosts(user?.role)}>
        <NativeTabs.Trigger.Label>Gerenciar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }}
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="list" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="people" hidden={!canManagePeople(user?.role)}>
        <NativeTabs.Trigger.Label>Pessoas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.2', selected: 'person.2.fill' }}
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="people" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Conta</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="person-circle" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
