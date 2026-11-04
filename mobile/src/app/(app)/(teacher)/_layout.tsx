import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme';

// A primeira tela de um stack aninhado não ganha botão de voltar nativo, então ele é
// declarado aqui. Sem histórico (aberta por deep link), o botão leva à tela inicial.
function BackButton() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={12}
      style={styles.button}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
      <Text style={styles.icon}>‹</Text>
    </Pressable>
  );
}

export default function TeacherLayout() {
  return <Stack screenOptions={{ headerTransparent: false, headerLeft: () => <BackButton /> }} />;
}

const styles = StyleSheet.create({
  button: { minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 32, lineHeight: 34, color: colors.ink900 },
});
