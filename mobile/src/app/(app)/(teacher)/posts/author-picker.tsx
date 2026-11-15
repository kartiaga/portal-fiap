import { Redirect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { memo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { ListFooter } from '@/components/list-footer';
import { SheetScaffold, type SheetInsets } from '@/components/sheet-scaffold';
import { LoadingState, StateMessage } from '@/components/state-message';
import { TextField } from '@/components/text-field';
import { listPeoplePage, type Person } from '@/features/people/api';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { usePagedList } from '@/hooks/use-paged-list';
import { useTheme } from '@/hooks/use-theme';
import { AvatarSize, IconSize, MaxContentWidth, Radius, Spacing, Typography } from '@/theme';

const SEARCH_DEBOUNCE_MS = 400;

const MESSAGES = {
  load: 'Não foi possível carregar os professores.',
  loadMore: 'Não foi possível carregar mais professores.',
};

const personId = (person: Person) => person.id;

type OptionProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  avatar: ReactNode;
};

/** Uma linha da escolha: avatar, nome, e-mail (ou explicação) e o visto na escolhida. */
const AuthorOption = memo(function AuthorOption({ title, subtitle, selected, onPress, avatar }: OptionProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && { backgroundColor: theme.backgroundSelected }]}>
      {avatar}
      <View style={styles.optionText}>
        <Text
          numberOfLines={1}
          style={[Typography.body, { color: theme.text, fontWeight: selected ? '600' : '400' }]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[Typography.callout, { color: theme.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      {selected ? <Icon name="checkmark" size={IconSize.medium} color={theme.tintText} /> : null}
    </Pressable>
  );
});

/**
 * Folha "Autor" da nova postagem, só para o administrador: "Você" e a lista de professores, com
 * busca por nome ou e-mail e a próxima página ao rolar. Escolher volta para o formulário com a
 * escolha nos parâmetros (`authorId` e `authorName`); o texto digitado lá continua.
 */
export default function AuthorPickerSheet() {
  const { user } = useSession();

  if (user?.role !== 'ADMIN') return <Redirect href="/" />;

  return <AuthorPicker />;
}

function AuthorPicker() {
  const theme = useTheme();
  const router = useRouter();
  const safeArea = useSafeAreaInsets();
  const { selected } = useLocalSearchParams<{ selected?: string }>();
  const [search, setSearch] = useState('');
  const term = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  const fetchPage = useCallback(
    (cursor: string | null) => listPeoplePage('TEACHER', cursor, term || undefined),
    [term],
  );
  const { items, loaded, loadError, loadingMore, loadMoreError, reload, loadMore } = usePagedList(
    fetchPage,
    personId,
    MESSAGES,
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  const choose = useCallback(
    (person: Person | null) =>
      router.dismissTo({
        pathname: '/posts/new',
        params: { authorId: person?.id ?? '', authorName: person?.name ?? '' },
      } as Href),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Person }) => (
      <AuthorOption
        title={item.name || 'Nome não informado'}
        subtitle={item.email}
        selected={item.id === selected}
        onPress={() => choose(item)}
        avatar={<Avatar name={item.name} uri={item.avatarUrl} />}
      />
    ),
    [choose, selected],
  );

  // "Você" fica fora da busca: é sempre a primeira opção.
  const self = term ? undefined : (
    <AuthorOption
      title="Você"
      subtitle="Publicar em seu nome"
      selected={!selected}
      onPress={() => choose(null)}
      avatar={
        <View style={[styles.selfAvatar, { backgroundColor: theme.backgroundElement }]}>
          <Icon name="person" size={IconSize.medium} color={theme.textSecondary} />
        </View>
      }
    />
  );

  const empty = !loaded ? (
    <LoadingState label="Carregando professores" />
  ) : loadError ? (
    <StateMessage tone="error" message={loadError} actionLabel="Tentar novamente" onAction={() => void reload()} />
  ) : (
    <StateMessage
      icon="search"
      title="Nenhum professor encontrado"
      message={term ? `Nenhum professor com nome ou e-mail parecido com "${term}".` : 'Ainda não há professores cadastrados.'}
    />
  );

  const renderBody = ({ top }: SheetInsets) => (
    <FlatList
      testID="author-list"
      data={items}
      keyExtractor={personId}
      renderItem={renderItem}
      ListHeaderComponent={self}
      ListEmptyComponent={empty}
      ListFooterComponent={
        loaded ? (
          <ListFooter
            loading={loadingMore}
            error={loadMoreError}
            onRetry={() => void loadMore()}
            loadingLabel="Carregando mais professores"
          />
        ) : undefined
      }
      onEndReached={() => void loadMore()}
      onEndReachedThreshold={0.5}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={[
        styles.list,
        { paddingTop: top + Spacing.two, paddingBottom: Math.max(safeArea.bottom, Spacing.three) },
      ]}
      scrollIndicatorInsets={{ top }}
    />
  );

  return (
    <SheetScaffold
      title="Autor"
      banner={
        <View style={styles.search}>
          <TextField
            variant="search"
            label="Buscar professor por nome ou e-mail"
            icon="search"
            value={search}
            onChangeText={setSearch}
            placeholder="Nome ou e-mail do professor"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      }>
      {renderBody}
    </SheetScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.two,
  },
  search: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.medium,
  },
  optionText: {
    flex: 1,
    gap: Spacing.half,
  },
  selfAvatar: {
    width: AvatarSize.medium,
    height: AvatarSize.medium,
    borderRadius: AvatarSize.medium / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
