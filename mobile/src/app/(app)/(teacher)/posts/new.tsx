import { useRouter } from 'expo-router';
import { useState } from 'react';

import { FormScreen } from '@/components/form-screen';
import { ModalCancel } from '@/components/modal-cancel';
import { PostForm } from '@/components/post-form';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { ApiError, getErrorMessage } from '@/lib/api';
import { setFlashNotice } from '@/lib/notice';
import { createPost, type PostInput } from '@/lib/posts';

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
  const [dirty, setDirty] = useState(false);
  const { guarding, allowLeave } = useDiscardGuard(dirty && !submitting);

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
        submitLabel="Publicar postagem"
        submitting={submitting}
        error={error}
        onSubmit={(values) => void handleSubmit(values)}
        onDirtyChange={setDirty}
      />
    </FormScreen>
  );
}
