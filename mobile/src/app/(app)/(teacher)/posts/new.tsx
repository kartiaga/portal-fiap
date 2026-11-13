import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { PostForm } from '@/components/post-form';
import { ApiError, getErrorMessage } from '@/lib/api';
import { setFlashNotice } from '@/lib/notice';
import { createPost, type PostInput } from '@/lib/posts';
import { colors } from '@/theme';

function getCreateError(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'Você não tem permissão para publicar postagens.';
  }
  return getErrorMessage(error, 'Não foi possível publicar a postagem.');
}

export default function NewPostScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  async function handleSubmit(values: PostInput) {
    setError(null);
    setSubmitting(true);
    try {
      await createPost(values);
      // A lista recarrega ao voltar a aparecer e exibe este aviso.
      setFlashNotice({ kind: 'success', text: 'Postagem publicada.' });
      leave();
    } catch (caught) {
      setError(getCreateError(caught));
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: 'Nova postagem' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PostForm
          author="Você"
          submitLabel="Publicar postagem"
          submitting={submitting}
          error={error}
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={leave}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper050 },
  content: { padding: 16, paddingBottom: 40 },
});
