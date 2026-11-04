import { Stack, useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { Button } from '@/components/button';
import { PostAdminCard } from '@/components/post-admin-card';
import { useAdminPosts, type Notice } from '@/hooks/use-admin-posts';
import { canModifyPost } from '@/lib/permissions';
import type { Post } from '@/lib/posts';
import { colors } from '@/theme';

export default function AdminScreen() {
  const router = useRouter();
  const { user } = useSession();
  const {
    posts,
    loaded,
    refreshing,
    loadingMore,
    deletingId,
    loadError,
    notice,
    reload,
    loadMore,
    remove,
  } = useAdminPosts();

  // Também recarrega ao voltar para a tela, para refletir uma postagem recém-editada.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  function confirmDelete(post: Post) {
    Alert.alert('Excluir postagem', `Deseja excluir "${post.title}"? Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void remove(post) },
    ]);
  }

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
    return <Text style={styles.emptyText}>Nenhuma postagem cadastrada.</Text>;
  }

  const banner: Notice | null =
    posts.length > 0 && loadError ? { kind: 'error', text: loadError } : notice;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Administração' }} />
      <FlatList
        testID="admin-posts-list"
        data={posts}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.content}
        refreshing={refreshing}
        onRefresh={() => void reload({ showRefreshing: true })}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={banner ? <Banner kind={banner.kind} text={banner.text} /> : undefined}
        ListEmptyComponent={<View style={styles.empty}>{renderEmptyState()}</View>}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.red600} accessibilityLabel="Carregando mais postagens" />
          ) : undefined
        }
        renderItem={({ item }) => (
          <PostAdminCard
            post={item}
            isOwn={item.authorId === user?.id}
            canModify={canModifyPost(user, item)}
            deleting={deletingId === item.id}
            actionsDisabled={deletingId !== null}
            onEdit={() => router.push(`/posts/${item.id}/edit` as Href)}
            onDelete={() => confirmDelete(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper050 },
  content: { flexGrow: 1, gap: 12, padding: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyContent: { alignSelf: 'stretch', gap: 12 },
  emptyText: { fontSize: 15, textAlign: 'center', color: colors.ink500 },
});
