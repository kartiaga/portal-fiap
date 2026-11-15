import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner } from '@/components/banner';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { TextField, type TextFieldHandle } from '@/components/text-field';
import { useTheme } from '@/hooks/use-theme';
import type { PostInput } from '@/lib/posts';
import { ControlHeight, IconSize, Spacing, Typography } from '@/theme';

// Mesmos limites da API (create-post.dto.ts e update-post.dto.ts) e do frontend web,
// para o erro aparecer antes da chamada de rede. O título é varchar(255) no banco.
export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 255;
export const CONTENT_MIN_LENGTH = 10;
/** O contador do título só aparece perto do limite, para não pesar no formulário. */
export const TITLE_COUNTER_FROM = 200;
/** O título cresce até 3 linhas e depois rola dentro do campo. */
const TITLE_MAX_LINES = 3;

type FieldErrors = { title?: string; content?: string };

export function validatePost({ title, content }: PostInput): FieldErrors {
  const errors: FieldErrors = {};
  if (title.length < TITLE_MIN_LENGTH) {
    errors.title = `O título deve ter pelo menos ${TITLE_MIN_LENGTH} caracteres.`;
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres.`;
  }
  if (content.length < CONTENT_MIN_LENGTH) {
    errors.content = `O conteúdo deve ter pelo menos ${CONTENT_MIN_LENGTH} caracteres.`;
  }
  return errors;
}

type PostFormProps = {
  /** Valores iniciais dos campos; ausentes na criação. */
  initialValues?: PostInput;
  /**
   * Nome de quem escreveu, quando a pessoa edita a postagem de outra (admin). Aparece como aviso
   * no topo; na criação e na edição da própria postagem não aparece.
   */
  otherAuthor?: string | null;
  submitLabel: string;
  submitting: boolean;
  /** Erro devolvido pela tela ao enviar, como uma falha da API. */
  error: string | null;
  onSubmit: (values: PostInput) => void;
  /** Avisa a tela quando o formulário passa a ter (ou deixa de ter) alterações não salvas. */
  onDirtyChange?: (dirty: boolean) => void;
};

/**
 * Formulário compartilhado entre a criação e a edição de postagens. Não tem "Cancelar": sair é
 * pelo cabeçalho (Cancelar no modal, voltar na edição), que pede confirmação se houver alteração.
 */
export function PostForm({
  initialValues,
  otherAuthor,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onDirtyChange,
}: PostFormProps) {
  const theme = useTheme();
  const contentRef = useRef<TextFieldHandle>(null);
  const initialTitle = initialValues?.title ?? '';
  const initialContent = initialValues?.content ?? '';
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const dirty = title !== initialTitle || content !== initialContent;
  // Na edição, salvar sem mudar nada não faz sentido; na criação o botão fica sempre ativo
  // para que a validação mostre o que falta.
  const canSubmit = !initialValues || dirty;

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  function handleSubmit() {
    if (submitting || !canSubmit) return;

    const values = { title: title.trim(), content: content.trim() };
    const errors = validatePost(values);
    setFieldErrors(errors);
    if (!errors.title && !errors.content) onSubmit(values);
  }

  const contentLength = content.trim().length;
  const atTitleLimit = title.length >= TITLE_MAX_LENGTH;

  return (
    <View style={styles.form}>
      {otherAuthor ? (
        <View style={styles.otherAuthor}>
          <Icon name="person-outline" size={IconSize.small} color={theme.textSecondary} />
          <Text style={[Typography.callout, styles.otherAuthorText, { color: theme.textSecondary }]}>
            Editando a postagem de {otherAuthor}
          </Text>
        </View>
      ) : null}

      <View style={styles.field}>
        <TextField
          label="Título"
          value={title}
          onChangeText={setTitle}
          error={fieldErrors.title}
          editable={!submitting}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="Ex.: Trabalho de Matemática — Entrega dia 12"
          // Várias linhas para mostrar o título inteiro; o Enter não quebra linha, vai ao conteúdo.
          multiline
          submitBehavior="submit"
          returnKeyType="next"
          onSubmitEditing={() => contentRef.current?.focus()}
          style={styles.titleInput}
        />
        {title.length >= TITLE_COUNTER_FROM ? (
          <Text
            accessibilityLabel={`${title.length} de ${TITLE_MAX_LENGTH} caracteres no título`}
            style={[Typography.meta, styles.counter, { color: atTitleLimit ? theme.danger : theme.textSecondary }]}>
            {title.length}/{TITLE_MAX_LENGTH}
          </Text>
        ) : null}
      </View>

      <TextField
        ref={contentRef}
        label="Conteúdo"
        value={content}
        onChangeText={setContent}
        error={fieldErrors.content}
        hint={
          contentLength < CONTENT_MIN_LENGTH
            ? `Mínimo de ${CONTENT_MIN_LENGTH} caracteres.`
            : `${contentLength} caracteres`
        }
        editable={!submitting}
        placeholder="Escreva aqui o conteúdo da postagem."
        multiline
      />

      {error ? <Banner text={error} /> : null}

      <Button
        label={submitLabel}
        size="large"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!canSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.four,
  },
  otherAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  otherAuthorText: {
    flex: 1,
  },
  field: {
    gap: Spacing.one,
  },
  titleInput: {
    // Desfaz a altura do campo de conteúdo: começa com uma linha e cresce até três.
    minHeight: ControlHeight.field,
    maxHeight: Typography.body.lineHeight * TITLE_MAX_LINES + Spacing.two * 2,
    paddingTop: Spacing.two,
  },
  counter: {
    alignSelf: 'flex-end',
  },
});
