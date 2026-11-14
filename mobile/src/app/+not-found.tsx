import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StateMessage } from '@/components/state-message';
import { useTheme } from '@/hooks/use-theme';

/** Link quebrado ou endereço que não existe no app (o app abre links `portalfiap://`). */
export default function NotFoundScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StateMessage
        icon="help-circle-outline"
        title="Página não encontrada"
        message="O endereço aberto não existe no app."
        actionLabel="Voltar para Posts"
        // Sem sessão, "/" leva à abertura ou ao login pelo guard do layout raiz.
        onAction={() => router.replace('/')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
});
