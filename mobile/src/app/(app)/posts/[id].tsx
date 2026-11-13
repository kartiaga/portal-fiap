import { Stack, useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { Button } from '@/components/button';
import { usePost } from '@/hooks/use-post';
import { formatDate } from '@/lib/format';
import { takeFlashNotice, type Notice } from '@/lib/notice';
import { canModifyPost } from '@/lib/permissions';
import { colors } from '@/theme';

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { post, loaded, notFound, loadError, reload } = usePost(id);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Também recarrega ao voltar para a tela, para refletir uma edição recente,
  // e exibe o aviso deixado pela tela de edição.
  useFocusEffect(
    useCallback(() => {
      setNotice(takeFlashNotice());
      void reload();
    }, [reload]),
  );

  function goToList() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  if (!loaded) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'Postagem' }} />
        <ActivityIndicator size="large" color={colors.red600} accessibilityLabel="Carregando" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'Postagem' }} />
        <View style={styles.message}>
          <Text style={styles.messageText}>{loadError}</Text>
          {notFound ? (
            <Button label="Voltar para a lista" variant="secondary" onPress={goToList} />
          ) : (
            <Button label="Tentar novamente" variant="secondary" onPress={() => void reload()} />
          )}
        </View>
      </View>
    );
  }

  const author = post.authorName || 'Autor não informado';
  const createdAt = formatDate(post.createdAt);
  const updatedAt = formatDate(post.updatedAt);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Postagem' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* A postagem já está na tela, então uma falha ao atualizar não a esconde. */}
        {loadError ? <Banner text={loadError} /> : null}
        {!loadError && notice ? <Banner kind={notice.kind} text={notice.text} /> : null}

        <Text style={styles.title} accessibilityRole="header" selectable>
          {post.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>Por {author}</Text>
          {createdAt ? <Text style={styles.metaText}>Publicada em {createdAt}</Text> : null}
          {updatedAt && updatedAt !== createdAt ? (
            <Text style={styles.metaText}>Atualizada em {updatedAt}</Text>
          ) : null}
        </View>

        {canModifyPost(user, post) ? (
          <Button
            label="Editar"
            accessibilityLabel={`Editar ${post.title}`}
            variant="secondary"
            onPress={() => router.push(`/posts/${post.id}/edit` as Href)}
          />
        ) : null}

        <View style={styles.divider} />

        <Text style={styles.body} selectable>
          {post.content}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper050 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { gap: 12, padding: 20, paddingBottom: 40 },
  message: { alignSelf: 'stretch', gap: 12 },
  messageText: { fontSize: 15, textAlign: 'center', color: colors.ink500 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: colors.ink900 },
  meta: { gap: 2 },
  metaText: { fontSize: 13, color: colors.ink500 },
  divider: { height: 1, backgroundColor: colors.ink100 },
  body: { fontSize: 16, lineHeight: 26, color: colors.ink700 },
});
