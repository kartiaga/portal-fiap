import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { FilterButton } from '@/components/filter-button';
import { FilterTag } from '@/components/filter-tag';
import { ListFooter } from '@/components/list-footer';
import { PersonCard } from '@/components/person-card';
import { ScreenHeader } from '@/components/screen-header';
import { LoadingState, StateMessage } from '@/components/state-message';
import { TextField } from '@/components/text-field';
import type { ListedRole, Person } from '@/features/people/api';
import { parseListedRole, peopleConfig } from '@/features/people/config';
import { canManagePeople, canViewPeople } from '@/features/people/permissions';
import { usePeople } from '@/features/people/use-people';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useNotice } from '@/hooks/use-notice';
import { useTheme } from '@/hooks/use-theme';
import { takeFlashNotice } from '@/lib/notice';
import { MaxContentWidth, Spacing } from '@/theme';

const SEARCH_DEBOUNCE_MS = 400;

const personKey = (person: Person) => person.id;

/**
 * Aba Pessoas: todos os perfis numa lista só, com busca por nome ou e-mail e filtro por perfil (folha
 * aberta pelo ícone ao lado da busca). O perfil escolhido fica no parâmetro `role` da rota.
 * Professor e administrador veem a lista; só o administrador cadastra (botão "Adicionar"), edita
 * e exclui (tocar no cartão abre a edição; os três pontinhos abrem a folha com Editar e Excluir).
 */
export default function PeopleScreen() {
  const { user } = useSession();

  if (!canViewPeople(user?.role)) return <Redirect href="/" />;

  return <People />;
}

function People() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const canManage = canManagePeople(user?.role);
  const params = useLocalSearchParams<{ role?: string }>();
  const role = parseListedRole(params.role);
  const [search, setSearch] = useState('');
  const { notice, showNotice, clearNotice } = useNotice();
  const term = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  useFocusEffect(
    useCallback(() => {
      showNotice(takeFlashNotice());
    }, [showNotice]),
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ScreenHeader
          title="Pessoas"
          action={
            canManage
              ? {
                  label: 'Adicionar',
                  accessibilityLabel: 'Nova pessoa',
                  icon: 'person-add-outline',
                  onPress: () =>
                    router.push({
                      pathname: '/people/create',
                      params: role ? { role } : {},
                    }),
                }
              : undefined
          }
        />
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <TextField
              testID="people-search"
              variant="search"
              label="Buscar por nome ou e-mail"
              icon="search"
              value={search}
              onChangeText={setSearch}
              placeholder="Nome ou e-mail"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <FilterButton
            testID="people-filter"
            activeCount={role ? 1 : 0}
            onPress={() => router.push({ pathname: '/filters/people', params: { role: role ?? '' } })}
          />
        </View>
        {role ? (
          <FilterTag
            label={`Perfil: ${peopleConfig[role].plural}`}
            onRemove={() => router.setParams({ role: '' })}
          />
        ) : null}
        {notice ? (
          <Banner
            kind={notice.kind}
            text={notice.text}
            onDismiss={notice.kind === 'success' ? undefined : clearNotice}
          />
        ) : null}
      </View>

      {/* A chave recria a lista ao trocar de filtro: a lista anterior não aparece sob a etiqueta nova. */}
      <PeopleResults key={role ?? 'all'} role={role} search={term} />
    </SafeAreaView>
  );
}

function PeopleResults({ role, search }: { role: ListedRole | undefined; search: string }) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const canManage = canManagePeople(user?.role);
  const { items, loaded, stale, refreshing, loadingMore, error, loadMoreError, reload, loadMore } = usePeople(
    role,
    search,
  );
  const noun = role ? peopleConfig[role].singular : 'pessoa';

  // Recarrega ao voltar para a aba (cadastro, edição ou exclusão) e quando a busca muda.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const openPerson = useCallback(
    (person: Person) => router.push({ pathname: '/people/[id]/edit', params: { id: person.id } }),
    [router],
  );

  const openActions = useCallback(
    (person: Person) =>
      router.push({
        pathname: '/people/[id]/actions',
        params: { id: person.id, name: person.name || person.email, role: person.role },
      }),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Person }) => (
      <PersonCard
        person={item}
        isSelf={item.id === user?.id}
        onEdit={canManage ? openPerson : undefined}
        onMore={canManage ? openActions : undefined}
      />
    ),
    [canManage, openActions, openPerson, user?.id],
  );

  if (!loaded) return <LoadingState label="Carregando pessoas" />;

  if (items.length === 0 && error) {
    return (
      <StateMessage
        tone="error"
        message={error}
        actionLabel="Tentar novamente"
        onAction={() => void reload()}
      />
    );
  }

  return (
    <FlatList
      testID="people-list"
      data={items}
      keyExtractor={personKey}
      renderItem={renderItem}
      ListHeaderComponent={
        stale ? (
          <ActivityIndicator color={theme.tint} accessibilityLabel="Buscando" />
        ) : error ? (
          <Banner text={error} action={{ label: 'Tentar novamente', onPress: () => void reload() }} />
        ) : undefined
      }
      ListEmptyComponent={
        search ? (
          <StateMessage
            icon="search"
            title="Ninguém encontrado"
            message={`Nenhum ${noun} com nome ou e-mail parecido com "${search}".`}
          />
        ) : (
          <StateMessage
            icon="people-outline"
            title={role ? `Nenhum ${noun} cadastrado` : 'Ninguém cadastrado'}
            message={
              canManage
                ? 'Cadastre a primeira pessoa para que ela possa entrar no app.'
                : 'Quando o administrador cadastrar alguém, a pessoa aparece aqui.'
            }
            actionLabel={canManage ? 'Nova pessoa' : undefined}
            onAction={canManage ? () => router.push('/people/create') : undefined}
          />
        )
      }
      ListFooterComponent={
        <ListFooter
          loading={loadingMore}
          error={loadMoreError}
          onRetry={() => void loadMore()}
          loadingLabel="Carregando mais pessoas"
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  search: {
    flex: 1,
  },
  list: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
});
