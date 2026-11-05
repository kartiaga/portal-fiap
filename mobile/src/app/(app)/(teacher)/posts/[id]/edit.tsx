import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

// Provisória: será substituída pelo formulário de edição (item 4 do Tech Challenge).
export default function EditPostScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Editar postagem' }} />
      <Text style={styles.text}>O formulário de edição ainda será implementado.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.paper050 },
  text: { fontSize: 16, color: colors.ink900 },
});
