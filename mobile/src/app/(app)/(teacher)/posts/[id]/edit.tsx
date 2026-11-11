import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSession } from '@/auth/session-context';
import { Button } from '@/components/button';
import { PostForm } from '@/components/post-form';
import { usePost } from '@/hooks/use-post';
import { ApiError, getErrorMessage } from '@/lib/api';
import { setFlashNotice } from '@/lib/notice';
import { canModifyPost } from '@/lib/permissions';
import { updatePost, type PostInput } from '@/lib/posts';
import { colors } from '@/theme';

const FORBIDDEN_MESSAGE = 'Você não tem permissão para editar esta postagem.';

function getUpdateError(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) return FORBIDDEN_MESSAGE;
  if (error instanceof ApiError && error.status === 404) {
    return 'Esta postagem não existe mais. Ela pode ter sido excluída.';
  }
  return getErrorMessage(error, 'Não foi possível salvar as alterações.');
}

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { post, loaded, notFound, loadError, reload } = usePost(id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega só ao abrir: recarregar ao receber foco poderia apagar o que já foi digitado.
  useEffect(() => {
    void reload();
  }, [reload]);

  // Volta para quem abriu a edição (lista administrativa ou leitura da postagem).
  // Sem histórico, como ao abrir por link direto, leva à leitura da postagem.
  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace(`/posts/${id}` as Href);
  }

  async function handleSubmit(values: PostInput) {
    setError(null);
    setSubmitting(true);
    try {
      await updatePost(id, values);
      // A tela anterior recarrega ao voltar a aparecer e exibe este aviso.
      setFlashNotice({ kind: 'success', text: 'Postagem atualizada.' });
      leave();
    } catch (caught) {
      setError(getUpdateError(caught));
      setSubmitting(false);
    }
  }

  function renderMessage(text: string, action: 'retry' | 'back') {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.message}>
          <Text style={styles.messageText}>{text}</Text>
          {action === 'retry' ? (
            <Button label="Tentar novamente" variant="secondary" onPress={() => void reload()} />
          ) : (
            <Button label="Voltar" variant="secondary" onPress={leave} />
          )}
        </View>
      </View>
    );
  }

  let body: ReactNode;
  if (!loaded) {
    body = (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.red600} accessibilityLabel="Carregando" />
      </View>
    );
  } else if (!post) {
    body = renderMessage(loadError ?? '', notFound ? 'back' : 'retry');
  } else if (!canModifyPost(user, post)) {
    // A API também recusaria a alteração; aqui o usuário só é avisado antes de digitar.
    body = renderMessage(FORBIDDEN_MESSAGE, 'back');
  } else {
    body = (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <PostForm
            key={post.id}
            initialValues={{ title: post.title, content: post.content }}
            author={post.authorName || 'Autor não informado'}
            submitLabel="Salvar alterações"
            submitting={submitting}
            error={error}
            onSubmit={(values) => void handleSubmit(values)}
            onCancel={leave}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Editar postagem' }} />
      {body}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper050 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 16, paddingBottom: 40 },
  message: { alignSelf: 'stretch', gap: 12 },
  messageText: { fontSize: 15, textAlign: 'center', color: colors.ink500 },
});
