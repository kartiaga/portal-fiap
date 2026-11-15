import { Stack } from 'expo-router';

import { useSession } from '@/auth/session-context';
import { useTheme } from '@/hooks/use-theme';
import { canManagePeople } from '@/features/people/permissions';
import { canManagePosts } from '@/lib/permissions';
import { SheetDetent } from '@/lib/sheets';
import { Radius } from '@/theme';

/** Aberta por link direto, uma tela interna ainda tem as abas por baixo para onde voltar. */
export const unstable_settings = { anchor: '(tabs)' };

/** Área logada: só é montada com sessão ativa (guard em `src/app/_layout.tsx`). */
export default function AppLayout() {
  const { user } = useSession();
  const theme = useTheme();

  const sheetOptions = {
    presentation: 'formSheet',
    headerShown: false,
    sheetAllowedDetents: 'fitToContents',
    sheetGrabberVisible: true,
    sheetCornerRadius: Radius.large,
    contentStyle: { backgroundColor: theme.background },
  } as const;

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

      {/* Comentários e curtidas: folhas nativas de altura fixa, abertas do feed ou da leitura. */}
      <Stack.Screen
        name="posts/[id]/comments"
        options={{ ...sheetOptions, sheetAllowedDetents: [SheetDetent.comments] }}
      />
      <Stack.Screen
        name="posts/[id]/likes"
        options={{ ...sheetOptions, sheetAllowedDetents: [SheetDetent.likes] }}
      />

      {/* Toda rota dentro de (teacher) exige perfil de professor ou administrador. */}
      <Stack.Protected guard={canManagePosts(user?.role)}>
        <Stack.Screen
          name="(teacher)/posts/new"
          options={{ title: 'Nova postagem', presentation: 'modal' }}
        />
        <Stack.Screen name="(teacher)/posts/[id]/edit" options={{ title: 'Editar postagem' }} />
        {/* Escolha do autor da nova postagem (só administrador), aberta pelo campo "Autor". */}
        <Stack.Screen
          name="(teacher)/posts/author-picker"
          options={{ ...sheetOptions, sheetAllowedDetents: [SheetDetent.author] }}
        />
        <Stack.Screen name="(teacher)/account/edit" options={{ title: 'Meus dados' }} />

        {/* Folhas de filtro: nativas (formSheet), do tamanho do conteúdo e sem cabeçalho. */}
        <Stack.Screen name="(teacher)/filters/people" options={sheetOptions} />
        <Stack.Screen name="(teacher)/filters/posts" options={sheetOptions} />
      </Stack.Protected>

      {/* Cadastrar e editar contas é só do administrador; o professor apenas vê a lista. */}
      <Stack.Protected guard={canManagePeople(user?.role)}>
        <Stack.Screen
          name="(teacher)/people/create"
          options={{ title: 'Nova pessoa', presentation: 'modal' }}
        />
        <Stack.Screen name="(teacher)/people/[id]/edit" options={{ title: 'Editar pessoa' }} />
      </Stack.Protected>
    </Stack>
  );
}
