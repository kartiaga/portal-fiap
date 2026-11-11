import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner } from '@/components/banner';
import { Button } from '@/components/button';
import { TextField, type TextFieldHandle } from '@/components/text-field';
import type { PostInput } from '@/lib/posts';
import { colors, radius } from '@/theme';

// Mesmos limites da API (create-post.dto.ts e update-post.dto.ts) e do frontend web,
// para o erro aparecer antes da chamada de rede. O título é varchar(255) no banco.
export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 255;
export const CONTENT_MIN_LENGTH = 10;

export function validatePost({ title, content }: PostInput): string | null {
  if (title.length < TITLE_MIN_LENGTH) {
    return `O título deve ter pelo menos ${TITLE_MIN_LENGTH} caracteres.`;
  }
  if (title.length > TITLE_MAX_LENGTH) {
    return `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres.`;
  }
  if (content.length < CONTENT_MIN_LENGTH) {
    return `O conteúdo deve ter pelo menos ${CONTENT_MIN_LENGTH} caracteres.`;
  }
  return null;
}

type PostFormProps = {
  /** Valores iniciais dos campos; ausentes na criação. */
  initialValues?: PostInput;
  /** Nome exibido no campo de autor, que não é editável: a API usa o autor do token. */
  author: string;
  submitLabel: string;
  submitting: boolean;
  /** Erro devolvido pela tela ao enviar, como uma falha da API. */
  error: string | null;
  onSubmit: (values: PostInput) => void;
  onCancel: () => void;
};

/** Formulário compartilhado entre a criação e a edição de postagens. */
export function PostForm({
  initialValues,
  author,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const contentRef = useRef<TextFieldHandle>(null);
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit() {
    if (submitting) return;

    const values = { title: title.trim(), content: content.trim() };
    const invalid = validatePost(values);
    setValidationError(invalid);
    if (!invalid) onSubmit(values);
  }

  const shownError = validationError ?? error;

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <Text style={styles.label}>Autor</Text>
        <Text style={styles.readOnly} accessibilityLabel={`Autor: ${author}`}>
          {author}
        </Text>
      </View>

      <TextField
        label="Título"
        value={title}
        onChangeText={setTitle}
        maxLength={TITLE_MAX_LENGTH}
        placeholder="Ex.: Trabalho de Matemática — Entrega dia 12"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => contentRef.current?.focus()}
      />

      <View style={styles.field}>
        <TextField
          ref={contentRef}
          label="Conteúdo"
          value={content}
          onChangeText={setContent}
          placeholder="Escreva aqui o conteúdo da postagem."
          multiline
        />
        <Text style={styles.hint}>Mínimo de {CONTENT_MIN_LENGTH} caracteres.</Text>
      </View>

      {shownError ? <Banner text={shownError} /> : null}

      <View style={styles.actions}>
        <Button label={submitLabel} onPress={handleSubmit} loading={submitting} />
        <Button label="Cancelar" variant="secondary" disabled={submitting} onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink900 },
  readOnly: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink500,
    backgroundColor: colors.paper050,
    borderWidth: 1,
    borderColor: colors.ink100,
    borderRadius: radius.s,
  },
  hint: { fontSize: 13, color: colors.ink500 },
  actions: { gap: 12 },
});
