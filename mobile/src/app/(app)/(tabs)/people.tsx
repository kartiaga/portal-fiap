import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { ListFooter } from '@/components/list-footer';
import { PersonCard } from '@/components/person-card';
import { ScreenHeader } from '@/components/screen-header';
import { SegmentedControl } from '@/components/segmented-control';
import { LoadingState, StateMessage } from '@/components/state-message';
import { TextField } from '@/components/text-field';
import type { Person, PersonRole } from '@/features/people/api';
import { peopleConfig } from '@/features/people/config';
import { canManagePeople } from '@/features/people/permissions';
import { usePeople } from '@/features/people/use-people';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useNotice } from '@/hooks/use-notice';
import { useTheme } from '@/hooks/use-theme';
import { takeFlashNotice } from '@/lib/notice';
import { MaxContentWidth, Spacing } from '@/theme';

const SEARCH_DEBOUNCE_MS = 400;

const ROLE_OPTIONS = [
  { value: 'TEACHER', label: peopleConfig.TEACHER.plural },
  { value: 'STUDENT', label: peopleConfig.STUDENT.plural },
] as const;

/** Aba Pessoas: professores e estudantes, com busca por e-mail. Tocar numa pessoa abre a edição. */
export default function PeopleScreen() {
  const { user } = useSession();

  if (!canManagePeople(user?.role)) return <Redirect href="/" />;

  return <People />;
}

function People() {
  const theme = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<PersonRole>('TEACHER');
  const [search, setSearch] = useState('');
  const { notice, showNotice, clearNotice } = useNotice();
  const term = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const config = peopleConfig[role];

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
          action={{
            label: config.newLabel,
            icon: 'person-add-outline',
            onPress: () => router.push(config.createPath),
          }}
        />
        <SegmentedControl
          accessibilityLabel="Perfil"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(value) => {
            clearNotice();
            setRole(value);
          }}
        />
        <TextField
          variant="search"
          label="Buscar por e-mail"
          icon="search"
          value={search}
          onChangeText={setSearch}
          placeholder="nome@fiap.com.br"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {notice ? (
          <Banner
            kind={notice.kind}
            text={notice.text}
            onDismiss={notice.kind === 'success' ? undefined : clearNotice}
          />
        ) : null}
      </View>

      {/* A chave recria a lista ao trocar de perfil: a lista anterior não aparece sob o rótulo novo. */}
      <PeopleResults key={role} role={role} search={term} />
    </SafeAreaView>
  );
}

function PeopleResults({ role, search }: { role: PersonRole; search: string }) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const config = peopleConfig[role];
  const { items, loaded, stale, refreshing, loadingMore, error, loadMoreError, reload, loadMore } = usePeople(
    role,
    search,
  );

  // Recarrega ao voltar para a aba (cadastro, edição ou exclusão) e quando a busca muda.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const openPerson = useCallback(
    (person: Person) =>
      router.push({
        pathname: role === 'TEACHER' ? '/teachers/[id]/edit' : '/students/[id]/edit',
        params: { id: person.id },
      }),
    [role, router],
  );

  if (!loaded) return <LoadingState label={`Carregando ${config.plural.toLowerCase()}`} />;

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
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PersonCard person={item} isSelf={item.id === user?.id} onPress={openPerson} />
      )}
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
            message={`Nenhum ${config.singular} com e-mail parecido com "${search}".`}
          />
        ) : (
          <StateMessage
            icon="people-outline"
            title={`Nenhum ${config.singular} cadastrado`}
            message="Cadastre o primeiro para que ele possa entrar no app."
            actionLabel={config.newLabel}
            onAction={() => router.push(config.createPath)}
          />
        )
      }
      ListFooterComponent={
        <ListFooter
          loading={loadingMore}
          error={loadMoreError}
          onRetry={() => void loadMore()}
          loadingLabel={`Carregando mais ${config.plural.toLowerCase()}`}
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
  list: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
});
