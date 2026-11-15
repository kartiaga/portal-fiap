import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { ListFooter } from '@/components/list-footer';
import { SheetScaffold, type SheetInsets } from '@/components/sheet-scaffold';
import { LoadingState, StateMessage } from '@/components/state-message';
import { useNotice } from '@/hooks/use-notice';
import { useSheetKeyboardInset } from '@/hooks/use-sheet-keyboard-inset';
import { ApiError, getErrorMessage } from '@/lib/api';
import { SheetDetent } from '@/lib/sheets';
import { MaxContentWidth, Spacing } from '@/theme';

import type { Comment } from './api';
import { CommentComposer } from './comment-composer';
import { CommentItem } from './comment-item';
import { canDeleteComment } from './permissions';
import { useComments } from './use-comments';

/**
 * Conteúdo da folha de comentários (rota `posts/[id]/comments`, `formSheet`): título, a lista
 * (mais recentes primeiro, com a próxima página ao rolar) e o campo de comentar fixo embaixo.
 * A tela que abriu a folha recarrega ao voltar, e assim o total de comentários se atualiza.
 */
export function CommentsSheet({ postId }: { postId: string }) {
  const insets = useSafeAreaInsets();
  const keyboardInset = useSheetKeyboardInset(SheetDetent.comments);
  const { user } = useSession();
  const { comments, loaded, loadError, loadingMore, loadMoreError, reload, loadMore, add, remove, drop } =
    useComments(postId);
  const { notice, showNotice, clearNotice } = useNotice();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const listRef = useRef<FlatList<Comment>>(null);

  useEffect(() => {
    void reload();
  }, [reload]);

  const publish = useCallback(
    async (content: string) => {
      clearNotice();
      await add(content);
      // O comentário novo entra no topo: rola até ele.
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [add, clearNotice],
  );

  const handleDelete = useCallback(
    async (comment: Comment) => {
      setDeletingId(comment.id);
      clearNotice();

      try {
        await remove(comment);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          drop(comment.id);
          showNotice({ kind: 'error', text: 'Este comentário já havia sido excluído.' });
        } else if (error instanceof ApiError && error.status === 403) {
          showNotice({ kind: 'error', text: 'Você não tem permissão para excluir este comentário.' });
        } else {
          showNotice({ kind: 'error', text: getErrorMessage(error, 'Não foi possível excluir o comentário.') });
        }
      } finally {
        setDeletingId(null);
      }
    },
    [clearNotice, drop, remove, showNotice],
  );

  const confirmDelete = useCallback(
    (comment: Comment) => {
      Alert.alert('Excluir comentário', 'Deseja excluir este comentário? Esta ação não pode ser desfeita.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => void handleDelete(comment) },
      ]);
    },
    [handleDelete],
  );

  const renderBody = ({ top, bottom }: SheetInsets) => {
    if (!loaded || (comments.length === 0 && loadError)) {
      return (
        <View style={[styles.state, { paddingTop: top, paddingBottom: bottom }]}>
          {loaded && loadError ? (
            <StateMessage tone="error" message={loadError} actionLabel="Tentar novamente" onAction={() => void reload()} />
          ) : (
            <LoadingState label="Carregando comentários" />
          )}
        </View>
      );
    }

    return (
      <FlatList
        ref={listRef}
        testID="comments-list"
        data={comments}
        keyExtractor={(comment) => comment.id}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            isSelf={item.authorId === user?.id}
            canDelete={canDeleteComment(user, item)}
            deleting={deletingId === item.id}
            onDelete={confirmDelete}
          />
        )}
        ListEmptyComponent={
          <StateMessage
            icon="chatbubble-outline"
            title="Nenhum comentário ainda"
            message="Seja o primeiro a comentar."
          />
        }
        ListFooterComponent={
          <ListFooter
            loading={loadingMore}
            error={loadMoreError}
            onRetry={() => void loadMore()}
            loadingLabel="Carregando mais comentários"
          />
        }
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        // A lista ocupa a folha inteira: os recuos a mantêm entre o título e o campo de comentar.
        contentContainerStyle={[
          styles.list,
          { paddingTop: top + Spacing.three, paddingBottom: bottom + Spacing.three },
        ]}
        scrollIndicatorInsets={{ top, bottom }}
      />
    );
  };

  const banner =
    loadError && comments.length > 0 ? (
      <View style={styles.banner}>
        <Banner text={loadError} action={{ label: 'Tentar novamente', onPress: () => void reload() }} />
      </View>
    ) : notice ? (
      <View style={styles.banner}>
        <Banner kind={notice.kind} text={notice.text} onDismiss={clearNotice} />
      </View>
    ) : null;

  return (
    <SheetScaffold
      title="Comentários"
      banner={banner}
      footer={
        <CommentComposer onSubmit={publish} bottomInset={Math.max(insets.bottom, Spacing.two) + keyboardInset} />
      }>
      {renderBody}
    </SheetScaffold>
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
  },
  banner: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  list: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
});
