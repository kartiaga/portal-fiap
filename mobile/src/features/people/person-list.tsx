import { Redirect, Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Button } from '@/components/button';
import { colors, radius } from '@/theme';

import { deletePerson, listPeoplePage, personError, type Person, type PersonRole } from './api';
import { peopleConfig } from './config';
import { canManagePeople } from './permissions';

export function PersonList({ role }: { role: PersonRole }) {
  const { user } = useSession();
  const router = useRouter();
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const config = peopleConfig[role];
  const [items, setItems] = useState<Person[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [localNotice, setLocalNotice] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!canManagePeople(user?.role)) return;
    let active = true;
    async function refresh() {
      try {
        const page = await listPeoplePage(role);
        if (!active) return;
        setItems(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setError(null);
        setLocalNotice(null);
      } catch (caught) {
        if (active) setError(personError(caught, 'load'));
      } finally {
        if (active) setInitialLoading(false);
      }
    }
    void refresh();
    return () => { active = false; };
    // reloadKey força nova consulta quando o usuário pede atualização manual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, reloadKey, user?.role]));

  if (!canManagePeople(user?.role)) return <Redirect href="/" />;

  async function loadMore() {
    if (!cursor || !hasMore || loadingMore || initialLoading) return;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await listPeoplePage(role, cursor);
      setItems((current) => [...current, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (caught) {
      setError(personError(caught, 'load'));
    } finally {
      setLoadingMore(false);
    }
  }

  async function confirmDelete() {
    if (!confirmTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deletePerson(confirmTarget.id);
      setItems((current) => current.filter((item) => item.id !== confirmTarget.id));
      setLocalNotice(`${config.singular} excluído com sucesso.`);
      setConfirmTarget(null);
    } catch (caught) {
      setError(personError(caught, 'delete'));
      setConfirmTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: config.plural }} />
      <View style={styles.heading}>
        <Text style={styles.title} accessibilityRole="header">{config.plural}</Text>
        <Text style={styles.description}>Usuários cadastrados com este perfil.</Text>
        <Button label={`Cadastrar ${config.singular}`} onPress={() => router.push(config.createPath)} />
        <Button label="Atualizar lista" variant="secondary" onPress={() => { setInitialLoading(true); setReloadKey((value) => value + 1); }} />
      </View>
      {localNotice ?? notice ? <Text style={styles.success} accessibilityRole="alert">{localNotice ?? notice}</Text> : null}
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!initialLoading && !error ? <Text style={styles.empty}>Nenhum {config.singular} encontrado.</Text> : undefined}
        renderItem={({ item }) => {
          const selfDeleteBlocked = user?.role === 'TEACHER' && user.id === item.id;
          return <View style={styles.card}>
            <Text style={styles.name}>{item.name ?? 'Nome não informado'}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.meta}>Cadastro: {new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${item.email}`} onPress={() => router.push({
                pathname: role === 'TEACHER' ? '/teachers/[id]/edit' : '/students/[id]/edit',
                params: { id: item.id },
              })}>
                <Text style={styles.action}>Editar</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Excluir ${item.email}`} accessibilityState={{ disabled: selfDeleteBlocked }} disabled={selfDeleteBlocked} onPress={() => setConfirmTarget(item)}>
                <Text style={[styles.action, selfDeleteBlocked && styles.disabledAction]}>Excluir</Text>
              </Pressable>
            </View>
            {selfDeleteBlocked ? <Text style={styles.meta}>Você não pode excluir sua própria conta.</Text> : null}
          </View>;
        }}
        ListFooterComponent={<View style={styles.footer}>
          {initialLoading || loadingMore ? <ActivityIndicator color={colors.red600} accessibilityLabel="Carregando" /> : null}
          {hasMore && !initialLoading && !loadingMore ? <Button label="Carregar mais" variant="secondary" onPress={() => void loadMore()} /> : null}
        </View>}
      />
      <Modal visible={confirmTarget !== null} transparent animationType="fade" onRequestClose={() => { if (!deleting) setConfirmTarget(null); }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Excluir {config.singular}?</Text>
            <Text style={styles.modalText}>Esta ação remove a conta de {confirmTarget?.name ?? confirmTarget?.email}. Ela não pode ser desfeita.</Text>
            {!deleting ? <Button label="Cancelar" variant="secondary" onPress={() => setConfirmTarget(null)} /> : null}
            <Button label="Confirmar exclusão" onPress={() => void confirmDelete()} loading={deleting} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper050 },
  heading: { padding: 24, gap: 10 },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink900 },
  description: { fontSize: 15, color: colors.ink500, marginBottom: 8 },
  list: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  card: { padding: 16, backgroundColor: colors.paper000, borderWidth: 1, borderColor: colors.ink100, borderRadius: radius.m, gap: 8 },
  name: { fontSize: 16, fontWeight: '600', color: colors.ink900 },
  email: { fontSize: 14, color: colors.ink900 },
  meta: { color: colors.ink500, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 24 },
  action: { color: colors.red600, fontWeight: '600', paddingVertical: 6 },
  disabledAction: { color: colors.ink300 },
  empty: { color: colors.ink500, textAlign: 'center', paddingVertical: 32 },
  error: { color: colors.error, marginHorizontal: 24, marginBottom: 12 },
  success: { color: colors.ink900, backgroundColor: colors.paper000, borderColor: colors.ink100, borderWidth: 1, borderRadius: radius.s, padding: 12, marginHorizontal: 24, marginBottom: 12 },
  footer: { gap: 12, paddingTop: 12 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(25, 24, 28, 0.55)' },
  modalCard: { padding: 24, gap: 16, backgroundColor: colors.paper000, borderRadius: radius.m },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.ink900 },
  modalText: { color: colors.ink500, lineHeight: 22 },
});
