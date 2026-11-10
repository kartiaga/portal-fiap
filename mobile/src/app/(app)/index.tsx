import { Stack, useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { Button } from '@/components/button';
import { PostCard } from '@/components/post-card';
import { TextField } from '@/components/text-field';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { usePostsFeed } from '@/hooks/use-posts-feed';
import { takeFlashNotice, type Notice } from '@/lib/notice';
import { canManagePosts } from '@/lib/permissions';
import { colors } from '@/theme';

const ROLE_LABELS = { STUDENT: 'Estudante', TEACHER: 'Professor(a)', ADMIN: 'Administrador(a)' };
const SEARCH_DEBOUNCE_MS = 500;

function SignOutButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Sair" hitSlop={12} onPress={onPress}>
      <Text style={styles.headerAction}>Sair</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user, signOut } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const term = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const {
    posts,
    appliedTerm,
    loaded,
    refreshing,
    loadingMore,
    loadError,
    notice,
    showNotice,
    reload,
    loadMore,
  } = usePostsFeed(term);

  // Roda ao abrir a tela, ao voltar para ela e sempre que o termo de busca muda.
  // Ao voltar da criação de uma postagem, também exibe o aviso deixado por ela.
  useFocusEffect(
    useCallback(() => {
      const flash = takeFlashNotice();
      void reload();
      if (flash) showNotice(flash);
    }, [reload, showNotice]),
  );

  function renderEmptyState() {
    if (!loaded) {
      return <ActivityIndicator size="large" color={colors.red600} accessibilityLabel="Carregando" />;
    }
    if (loadError) {
      return (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>{loadError}</Text>
          <Button label="Tentar novamente" variant="secondary" onPress={() => void reload()} />
        </View>
      );
    }
    return (
      <Text style={styles.emptyText}>
        {appliedTerm ? 'Nenhuma postagem encontrada para esta busca.' : 'Nenhuma postagem publicada.'}
      </Text>
    );
  }

  const banner: Notice | null =
    posts.length > 0 && loadError ? { kind: 'error', text: loadError } : notice;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerRight: () => <SignOutButton onPress={signOut} /> }} />
      <FlatList
        testID="posts-list"
        data={posts}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={refreshing}
        onRefresh={() => void reload({ showRefreshing: true })}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.profile}>{user ? `Perfil: ${ROLE_LABELS[user.role]}` : ''}</Text>
            {canManagePosts(user?.role) ? (
              <View style={styles.teacherActions}>
                <Button label="Nova postagem" onPress={() => router.push('/posts/new')} />
                <Button
                  label="Administrar postagens"
                  variant="secondary"
                  onPress={() => router.push('/admin')}
                />
              </View>
            ) : null}
            <TextField
              label="Buscar postagens"
              value={search}
              onChangeText={setSearch}
              placeholder="Título, conteúdo ou autor"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {banner ? <Banner kind={banner.kind} text={banner.text} /> : null}
          </View>
        }
        ListEmptyComponent={<View style={styles.empty}>{renderEmptyState()}</View>}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.red600} accessibilityLabel="Carregando mais postagens" />
          ) : undefined
        }
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => router.push(`/posts/${item.id}` as Href)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper050 },
  content: { flexGrow: 1, gap: 12, padding: 16 },
  header: { gap: 12 },
  teacherActions: { gap: 8 },
  headerAction: { fontSize: 16, fontWeight: '600', color: colors.red600 },
  profile: { fontSize: 14, color: colors.ink500 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyContent: { alignSelf: 'stretch', gap: 12 },
  emptyText: { fontSize: 15, textAlign: 'center', color: colors.ink500 },
});
