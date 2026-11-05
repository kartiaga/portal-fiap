import { Stack } from 'expo-router';

import { useSession } from '@/auth/session-context';
import { canManagePosts } from '@/lib/permissions';

export default function AppLayout() {
  const { user } = useSession();

  return (
    <Stack screenOptions={{ headerTransparent: false, headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Portal FIAP' }} />
      {/* Toda rota dentro de (teacher) exige perfil de professor ou administrador. */}
      <Stack.Protected guard={canManagePosts(user?.role)}>
        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
