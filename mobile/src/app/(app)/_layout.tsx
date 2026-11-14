import { Stack } from 'expo-router';

import { useSession } from '@/auth/session-context';
import { useTheme } from '@/hooks/use-theme';
import { canManagePosts } from '@/lib/permissions';

/** Aberta por link direto, uma tela interna ainda tem as abas por baixo para onde voltar. */
export const unstable_settings = { anchor: '(tabs)' };

/** Área logada: só é montada com sessão ativa (guard em `src/app/_layout.tsx`). */
export default function AppLayout() {
  const { user } = useSession();
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.tintText,
        headerTitleStyle: { color: theme.text },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="posts/[id]" options={{ title: '' }} />

      {/* Toda rota dentro de (teacher) exige perfil de professor ou administrador. */}
      <Stack.Protected guard={canManagePosts(user?.role)}>
        <Stack.Screen
          name="(teacher)/posts/new"
          options={{ title: 'Nova postagem', presentation: 'modal' }}
        />
        <Stack.Screen name="(teacher)/posts/[id]/edit" options={{ title: 'Editar postagem' }} />
        <Stack.Screen
          name="(teacher)/teachers/create"
          options={{ title: 'Novo professor', presentation: 'modal' }}
        />
        <Stack.Screen name="(teacher)/teachers/[id]/edit" options={{ title: 'Editar professor' }} />
        <Stack.Screen
          name="(teacher)/students/create"
          options={{ title: 'Novo estudante', presentation: 'modal' }}
        />
        <Stack.Screen name="(teacher)/students/[id]/edit" options={{ title: 'Editar estudante' }} />
        <Stack.Screen name="(teacher)/account/edit" options={{ title: 'Meus dados' }} />
      </Stack.Protected>
    </Stack>
  );
}
