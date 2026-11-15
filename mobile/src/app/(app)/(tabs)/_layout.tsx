import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Icon, type IconName } from '@/components/icon';
import { TabBar } from '@/components/tab-bar';
import { canViewPeople } from '@/features/people/permissions';
import { canManagePosts } from '@/lib/permissions';
import { IconSize } from '@/theme';

/** A cor chega do `TabBar`, que sempre passa uma string (`ColorValue` é só a tipagem do navegador). */
function tabIcon(filled: IconName, outline: IconName) {
  return function TabIcon({ focused, color }: { focused: boolean; color: ColorValue }) {
    return <Icon name={focused ? filled : outline} size={IconSize.xlarge} color={color as string} />;
  };
}

/**
 * Abas da área logada, com a barra própria de `TabBar` (ícone cheio na aba ativa, contorno nas
 * demais). Gerenciar e Pessoas só existem para professor e administrador; as telas e a API
 * também exigem.
 */
export default function TabsLayout() {
  const { user } = useSession();

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Posts', tabBarIcon: tabIcon('newspaper', 'newspaper-outline') }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Gerenciar',
          tabBarIcon: tabIcon('list', 'list-outline'),
          href: canManagePosts(user?.role) ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: 'Pessoas',
          tabBarIcon: tabIcon('people', 'people-outline'),
          href: canViewPeople(user?.role) ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Conta', tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }}
      />
    </Tabs>
  );
}
