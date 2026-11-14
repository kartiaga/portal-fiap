import { Redirect, useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { ListFooter } from '@/components/list-footer';
import { PostAdminCard } from '@/components/post-admin-card';
import { ScreenHeader } from '@/components/screen-header';
import { LoadingState, StateMessage } from '@/components/state-message';
import { TextField } from '@/components/text-field';
import { useAdminPosts } from '@/hooks/use-admin-posts';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';
import { takeFlashNotice } from '@/lib/notice';
import { canManagePosts, canModifyPost } from '@/lib/permissions';
import type { Post } from '@/lib/posts';
import { MaxContentWidth, Spacing } from '@/theme';

const SEARCH_DEBOUNCE_MS = 500;

/**
 * Aba Gerenciar: todas as postagens, com busca, editar e excluir onde o perfil permite. Tocar no
 * cartão abre a leitura. (Filtrar só as do professor exige um filtro por autor na API: pendência.)
 */
export default function AdminScreen() {
  const { user } = useSession();

  // A aba fica oculta para estudantes; isto cobre quem chega por link direto.
  if (!canManagePosts(user?.role)) return <Redirect href="/" />;

  return <AdminPosts />;
}

function AdminPosts() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const [search, setSearch] = useState('');
  const term = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const {
    posts,
    appliedTerm,
    loaded,
    refreshing,
    loadingMore,
    deletingId,
    loadError,
    loadMoreError,
    notice,
    showNotice,
    clearNotice,
    reload,
    loadMore,
    remove,
  } = useAdminPosts(term);

  // Recarrega ao voltar para a aba (reflete uma edição recente) e mostra o aviso deixado por ela.
  useFocusEffect(
    useCallback(() => {
      const flash = takeFlashNotice();
      void reload();
      if (flash) showNotice(flash);
    }, [reload, showNotice]),
  );

  const openPost = useCallback(
    (post: Post) => router.push(`/posts/${post.id}` as Href),
    [router],
  );

  const editPost = useCallback(
    (post: Post) => router.push(`/posts/${post.id}/edit` as Href),
    [router],
  );

  const confirmDelete = useCallback(
    (post: Post) => {
      Alert.alert(
        'Excluir postagem',
        `Deseja excluir "${post.title}"? Esta ação não pode ser desfeita.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => void remove(post) },
        ],
      );
    },
    [remove],
  );

  const searching = loaded && term !== appliedTerm;
  // Falha ao atualizar com a lista já na tela: a lista fica e o aviso oferece tentar de novo.
  const refreshError = posts.length > 0 ? loadError : null;

  let body: React.ReactNode;

  if (!loaded) {
    body = <LoadingState label="Carregando postagens" />;
  } else if (posts.length === 0 && loadError) {
    body = (
      <StateMessage
        tone="error"
        message={loadError}
        actionLabel="Tentar novamente"
        onAction={() => void reload()}
      />
    );
  } else {
    body = (
      <FlatList
        testID="admin-posts-list"
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <PostAdminCard
            post={item}
            isOwn={item.authorId === user?.id}
            canModify={canModifyPost(user, item)}
            deleting={deletingId === item.id}
            actionsDisabled={deletingId !== null}
            onOpen={openPost}
            onEdit={editPost}
            onDelete={confirmDelete}
          />
        )}
        ListEmptyComponent={
          appliedTerm ? (
            <StateMessage
              icon="search"
              title="Nada por aqui"
              message="Nenhuma postagem encontrada para esta busca."
            />
          ) : (
            <StateMessage
              title="Nada para gerenciar"
              message="Nenhuma postagem cadastrada."
              actionLabel="Criar a primeira"
              onAction={() => router.push('/posts/new')}
            />
          )
        }
        ListFooterComponent={
          <ListFooter
            loading={loadingMore}
            error={loadMoreError}
            onRetry={() => void loadMore()}
            loadingLabel="Carregando mais postagens"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void reload({ showRefreshing: true })}
            tintColor={theme.tint}
            colors={[theme.tint]}
          />
        }
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Fora da lista, como no feed: o campo de busca não perde o foco quando a lista recarrega. */}
      <View style={styles.header}>
        <ScreenHeader
          title="Gerenciar"
          subtitle={
            user?.role === 'ADMIN'
              ? 'Edite ou exclua qualquer postagem'
              : 'Todas as postagens. Você pode editar as suas.'
          }
          action={{ label: 'Nova postagem', icon: 'add', onPress: () => router.push('/posts/new') }}
        />
        <TextField
          testID="admin-search"
          variant="search"
          label="Buscar postagens"
          icon="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Título, conteúdo ou autor"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          trailing={
            searching ? (
              <ActivityIndicator color={theme.tint} accessibilityLabel="Buscando postagens" />
            ) : null
          }
        />
        {refreshError ? (
          <Banner
            text={refreshError}
            action={{ label: 'Tentar novamente', onPress: () => void reload() }}
          />
        ) : notice ? (
          <Banner
            kind={notice.kind}
            text={notice.text}
            onDismiss={notice.kind === 'success' ? undefined : clearNotice}
          />
        ) : null}
      </View>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  list: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
});
