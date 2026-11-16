import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { useSession } from '@/auth/session-context';
import { FormScreen } from '@/components/form-screen';
import { ModalCancel } from '@/components/modal-cancel';
import { PostForm } from '@/components/post-form';
import { getPerson } from '@/features/people/api';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { ApiError, getErrorMessage } from '@/lib/api';
import { setFlashNotice } from '@/lib/notice';
import { createPost, type PostInput } from '@/lib/posts';

function getCreateError(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'Você não tem permissão para publicar postagens.';
  }
  if (error instanceof ApiError && error.status === 422) {
    return 'O autor escolhido não é mais um professor cadastrado. Escolha outro.';
  }
  return getErrorMessage(error, 'Não foi possível publicar a postagem.');
}

/**
 * Nova postagem, em modal. O autor é quem está logado; o administrador pode escolher um professor
 * no campo "Autor" (folha `posts/author-picker`, que devolve a escolha nos parâmetros desta rota).
 */
export default function NewPostScreen() {
  const router = useRouter();
  const { user } = useSession();
  const params = useLocalSearchParams<{ authorId?: string; authorName?: string }>();
  const [ownName, setOwnName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const { guarding, allowLeave } = useDiscardGuard(dirty && !submitting);

  const isAdmin = user?.role === 'ADMIN';
  // Só o administrador escolhe; para os outros, um parâmetro na rota não muda nada.
  const chosenId = isAdmin && params.authorId ? params.authorId : null;
  const chosenName = chosenId ? params.authorName || null : null;

  // O token não traz o nome: ele vem do perfil. Sem ele, o campo mostra "Você".
  useEffect(() => {
    if (!user) return;
    let active = true;
    getPerson(user.id)
      .then((person) => {
        if (active) setOwnName(person.name ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user]);

  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  async function handleSubmit(values: PostInput) {
    setError(null);
    setSubmitting(true);
    try {
      await createPost(chosenId ? { ...values, authorId: chosenId } : values);
      // A lista recarrega ao voltar a aparecer e exibe este aviso.
      setFlashNotice({
        kind: 'success',
        text: chosenName ? `Postagem publicada em nome de ${chosenName}.` : 'Postagem publicada.',
      });
      allowLeave();
      leave();
    } catch (caught) {
      setError(getCreateError(caught));
      setSubmitting(false);
    }
  }

  return (
    <FormScreen>
      <ModalCancel guarding={guarding} onCancel={leave} />
      <PostForm
        author={
          isAdmin
            ? {
                name: chosenId ? chosenName : ownName,
                isSelf: !chosenId,
                hint: 'Você pode publicar em seu nome ou em nome de um professor.',
                onPress: () =>
                  router.push({
                    pathname: '/posts/author-picker',
                    params: { selected: chosenId ?? '' },
                  } as Href),
              }
            : { name: ownName, isSelf: true, hint: 'A postagem é publicada em seu nome.' }
        }
        submitLabel="Publicar postagem"
        submitting={submitting}
        error={error}
        onSubmit={(values) => void handleSubmit(values)}
        onDirtyChange={setDirty}
      />
    </FormScreen>
  );
}
