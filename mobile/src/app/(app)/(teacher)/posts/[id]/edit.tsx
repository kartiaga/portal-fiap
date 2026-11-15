import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { DangerZone } from '@/components/danger-zone';
import { FormScreen } from '@/components/form-screen';
import { PostForm } from '@/components/post-form';
import { LoadingState, StateMessage } from '@/components/state-message';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { usePost } from '@/hooks/use-post';
import { useTheme } from '@/hooks/use-theme';
import { ApiError, getErrorMessage } from '@/lib/api';
import { setFlashNotice } from '@/lib/notice';
import { canModifyPost } from '@/lib/permissions';
import { deletePost, updatePost, type PostInput } from '@/lib/posts';

const FORBIDDEN_MESSAGE = 'Você não tem permissão para editar esta postagem.';

function getUpdateError(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) return FORBIDDEN_MESSAGE;
  if (error instanceof ApiError && error.status === 404) {
    return 'Esta postagem não existe mais. Ela pode ter sido excluída.';
  }
  return getErrorMessage(error, 'Não foi possível salvar as alterações.');
}

function getDeleteError(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'Você não tem permissão para excluir esta postagem.';
  }
  return getErrorMessage(error, 'Não foi possível excluir a postagem.');
}

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const { post, loaded, notFound, loadError, reload } = usePost(id);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const { allowLeave } = useDiscardGuard(dirty && !submitting && !deleting);

  // Carrega só ao abrir: recarregar ao receber foco poderia apagar o que já foi digitado.
  useEffect(() => {
    void reload();
  }, [reload]);

  // Volta para quem abriu a edição (Gerenciar ou leitura da postagem).
  // Sem histórico, como ao abrir por link direto, leva à leitura da postagem.
  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace(`/posts/${id}` as Href);
  }

  // Depois de excluir, a leitura da postagem também deixou de existir: volta até as abas, que
  // recarregam a lista (Posts ou Gerenciar, a que estava aberta) e mostram o aviso.
  function leaveToList() {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  }

  async function handleSubmit(values: PostInput) {
    setError(null);
    setSubmitting(true);
    try {
      await updatePost(id, values);
      // A tela anterior recarrega ao voltar a aparecer e exibe este aviso.
      setFlashNotice({ kind: 'success', text: 'Postagem atualizada.' });
      allowLeave();
      leave();
    } catch (caught) {
      setError(getUpdateError(caught));
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await deletePost(id);
      setFlashNotice({ kind: 'success', text: 'Postagem excluída.' });
      allowLeave();
      leaveToList();
    } catch (caught) {
      setError(getDeleteError(caught));
      setDeleting(false);
    }
  }

  function confirmDelete(title: string) {
    Alert.alert('Excluir postagem', `Deseja excluir "${title}"? Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void handleDelete() },
    ]);
  }

  function renderMessage(text: string, action: 'retry' | 'back') {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <StateMessage
          tone="error"
          message={text}
          actionLabel={action === 'retry' ? 'Tentar novamente' : 'Voltar'}
          onAction={action === 'retry' ? () => void reload() : leave}
        />
      </View>
    );
  }

  if (!loaded) return <LoadingState label="Carregando postagem" />;
  if (!post) return renderMessage(loadError ?? '', notFound ? 'back' : 'retry');
  // A API também recusaria a alteração; aqui o usuário só é avisado antes de digitar.
  if (!canModifyPost(user, post)) return renderMessage(FORBIDDEN_MESSAGE, 'back');

  const isOwn = post.authorId === user?.id;

  return (
    <FormScreen>
      <PostForm
        key={post.id}
        initialValues={{ title: post.title, content: post.content }}
        otherAuthor={isOwn ? null : post.authorName || 'autor não informado'}
        submitLabel="Salvar alterações"
        submitting={submitting || deleting}
        error={error}
        onSubmit={(values) => void handleSubmit(values)}
        onDirtyChange={setDirty}
      />

      <DangerZone
        title="Excluir postagem"
        description="A postagem sai do app para todos. Não é possível desfazer."
        buttonLabel="Excluir postagem"
        accessibilityLabel={`Excluir ${post.title}`}
        loading={deleting}
        disabled={submitting}
        onPress={() => confirmDelete(post.title)}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
});
