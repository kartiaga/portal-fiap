import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Button } from '@/components/button';
import { canManagePosts } from '@/lib/permissions';
import { colors } from '@/theme';

const ROLE_LABELS = { STUDENT: 'Estudante', TEACHER: 'Professor(a)', ADMIN: 'Administrador(a)' };

// Provisória: será substituída pela lista de posts (item 1 do Tech Challenge).
export default function HomeScreen() {
  const { user, signOut } = useSession();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{user ? `Perfil: ${ROLE_LABELS[user.role]}` : ''}</Text>
      {canManagePosts(user?.role) ? (
        <Button label="Administrar postagens" onPress={() => router.push('/admin')} />
      ) : null}
      <Button label="Sair" variant="secondary" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, backgroundColor: colors.paper050 },
  text: { fontSize: 16, color: colors.ink900 },
});
