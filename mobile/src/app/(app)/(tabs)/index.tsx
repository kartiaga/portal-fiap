import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { ListFooter } from '@/components/list-footer';
import { PostCard } from '@/components/post-card';
import { ScreenHeader } from '@/components/screen-header';
import { LoadingState, StateMessage } from '@/components/state-message';
import { TextField } from '@/components/text-field';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useLikeToggle } from '@/hooks/use-like-toggle';
import { usePostsFeed } from '@/hooks/use-posts-feed';
import { useTheme } from '@/hooks/use-theme';
import { takeFlashNotice } from '@/lib/notice';
import { canManagePosts } from '@/lib/permissions';
import { getPost, type Post } from '@/lib/posts';
import { MaxContentWidth, Spacing } from '@/theme';

const SEARCH_DEBOUNCE_MS = 500;

export default function PostsScreen() {
  const theme = useTheme();
  const { user } = useSession();
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
    loadMoreError,
    notice,
    showNotice,
    clearNotice,
    reload,
    loadMore,
    patchPost,
  } = usePostsFeed(term);
  const canPublish = canManagePosts(user?.role);

  const showLikeError = useCallback(
    (text: string) => showNotice({ kind: 'error', text }),
    [showNotice],
  );
  const toggleLike = useLikeToggle(patchPost, showLikeError);

  // Postagem cuja folha (comentários ou curtidas) está aberta. Ao voltar dela, só os totais dessa
  // postagem são atualizados: recarregar a lista inteira a levaria de volta para a primeira página.
  const sheetPostId = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fromSheet = sheetPostId.current;
      sheetPostId.current = null;
      if (fromSheet) {
        getPost(fromSheet)
          .then(({ likeCount, commentCount, likedByMe }) =>
            patchPost(fromSheet, { likeCount, commentCount, likedByMe }),
          )
          .catch(() => undefined); // Os totais antigos continuam; a próxima atualização corrige.
        return;
      }

      const flash = takeFlashNotice();
      void reload();
      if (flash) showNotice(flash);
    }, [reload, showNotice, patchPost]),
  );

  const openPost = useCallback(
    (post: Post) => router.push(`/posts/${post.id}` as Href),
    [router],
  );

  const openSheet = useCallback(
    (post: Post, sheet: 'comments' | 'likes') => {
      sheetPostId.current = post.id;
      router.push(`/posts/${post.id}/${sheet}` as Href);
    },
    [router],
  );
  const openComments = useCallback((post: Post) => openSheet(post, 'comments'), [openSheet]);
  const openLikes = useCallback((post: Post) => openSheet(post, 'likes'), [openSheet]);

  const searching = loaded && term !== appliedTerm;
  // Falha ao atualizar com a lista já na tela: a lista fica e o aviso oferece tentar de novo.
  const refreshError = posts.length > 0 ? loadError : null;

  /**
   * O cabeçalho com a busca fica fora da lista e sempre na mesma posição da árvore: se fosse
   * recriado junto com o carregamento ou o erro, o campo perderia o foco no meio da digitação.
   */
  const header = (
    <View style={styles.header}>
      <ScreenHeader
        title="Posts"
        action={
          canPublish
            ? {
                label: 'Criar',
                accessibilityLabel: 'Nova postagem',
                icon: 'add',
                onPress: () => router.push('/posts/new'),
              }
            : undefined
        }
      />
      <TextField
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
  );

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
        testID="posts-list"
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={openPost}
            onToggleLike={toggleLike}
            onOpenLikes={openLikes}
            onOpenComments={openComments}
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
              title="Nenhuma postagem ainda"
              message="Quando houver avisos, eles aparecem aqui."
              actionLabel={canPublish ? 'Criar a primeira' : undefined}
              onAction={canPublish ? () => router.push('/posts/new') : undefined}
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
      {header}
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
