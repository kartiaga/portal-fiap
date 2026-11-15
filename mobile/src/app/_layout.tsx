import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { SessionProvider, useSession } from '@/auth/session-context';
import { LoadingState } from '@/components/state-message';
import { useTheme } from '@/hooks/use-theme';

function RootNavigator() {
  const { user, isRestoring, endReason } = useSession();

  // Enquanto o token salvo é lido, só o indicador aparece: evita piscar o login para quem já entrou.
  if (isRestoring) return <LoadingState />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*
        Sem sessão, a área logada leva à abertura na primeira vez. Depois de sair ou de a sessão
        expirar nesta execução, leva direto ao login: a pessoa já conhece o app.
      */}
      <Stack.Protected guard={user !== null} redirectTo={endReason ? '/login' : '/welcome'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={user === null} redirectTo="/">
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = useTheme();

  // As cores da navegação (fundo entre telas, cabeçalho) vêm dos mesmos tokens do app.
  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.tintText,
        background: theme.background,
        card: theme.background,
        text: theme.text,
        border: theme.border,
      },
    };
  }, [scheme, theme]);

  return (
    <ThemeProvider value={navigationTheme}>
      <SessionProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </SessionProvider>
    </ThemeProvider>
  );
}
