import { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { Avatar } from '@/components/avatar';
import { SelfBadge } from '@/components/badge';
import { ListFooter } from '@/components/list-footer';
import { SheetScaffold, type SheetInsets } from '@/components/sheet-scaffold';
import { LoadingState, StateMessage } from '@/components/state-message';
import { usePagedList } from '@/hooks/use-paged-list';
import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth, Spacing, Typography } from '@/theme';

import { getLikers, type Liker } from './api';

const MESSAGES = {
  load: 'Não foi possível carregar as curtidas.',
  loadMore: 'Não foi possível carregar mais curtidas.',
};

const likerId = (liker: Liker) => liker.userId;

function LikerRow({ liker, isSelf }: { liker: Liker; isSelf: boolean }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Avatar name={liker.name} uri={liker.avatarUrl} />
      <Text numberOfLines={1} style={[Typography.body, styles.name, { color: theme.text }]}>
        {liker.name || 'Nome não informado'}
      </Text>
      {isSelf ? <SelfBadge /> : null}
    </View>
  );
}

/** Conteúdo da folha de curtidas (rota `posts/[id]/likes`): quem curtiu, dos mais recentes primeiro. */
export function LikesSheet({ postId }: { postId: string }) {
  const safeArea = useSafeAreaInsets();
  const { user } = useSession();
  const fetchPage = useCallback((cursor: string | null) => getLikers(postId, cursor), [postId]);
  const { items, loaded, loadError, loadingMore, loadMoreError, reload, loadMore } = usePagedList(
    fetchPage,
    likerId,
    MESSAGES,
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  const renderBody = ({ top }: SheetInsets) => {
    const bottom = Math.max(safeArea.bottom, Spacing.three);

    if (!loaded || (items.length === 0 && loadError)) {
      return (
        <View style={[styles.state, { paddingTop: top, paddingBottom: bottom }]}>
          {loaded && loadError ? (
            <StateMessage tone="error" message={loadError} actionLabel="Tentar novamente" onAction={() => void reload()} />
          ) : (
            <LoadingState label="Carregando curtidas" />
          )}
        </View>
      );
    }

    return (
      <FlatList
        testID="likes-list"
        data={items}
        keyExtractor={likerId}
        renderItem={({ item }) => <LikerRow liker={item} isSelf={item.userId === user?.id} />}
        ListEmptyComponent={
          <StateMessage icon="heart-outline" title="Nenhuma curtida ainda" message="Quem curtir aparece aqui." />
        }
        ListFooterComponent={
          <ListFooter
            loading={loadingMore}
            error={loadMoreError}
            onRetry={() => void loadMore()}
            loadingLabel="Carregando mais curtidas"
          />
        }
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.5}
        // A lista ocupa a folha inteira: o recuo de cima a mantém abaixo do título.
        contentContainerStyle={[styles.list, { paddingTop: top + Spacing.three, paddingBottom: bottom }]}
        scrollIndicatorInsets={{ top }}
      />
    );
  };

  return <SheetScaffold title="Curtidas">{renderBody}</SheetScaffold>;
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
  },
  list: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  name: {
    flexShrink: 1,
  },
});
