import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

// Provisória: será implementada no item 9 do Tech Challenge.
export default function AdminScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Administração' }} />
      <Text style={styles.text}>Página administrativa de postagens.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.paper050 },
  text: { fontSize: 16, color: colors.ink900 },
});
