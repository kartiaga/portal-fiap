import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { ApiError, getErrorMessage } from '@/lib/api';
import { BorderWidth, IconSize, MinTouchSize, Radius, Spacing, Typography } from '@/theme';

import { COMMENT_MAX_LENGTH } from './api';

/** Altura de uma linha do campo; ele cresce até `MAX_LINES` e depois rola por dentro. */
const LINE_HEIGHT = 22;
const MAX_LINES = 5;
const INPUT_PADDING = Platform.select({ ios: 10, default: 6 });
const SEND_SIZE = 32;

type CommentComposerProps = {
  /** Publica o comentário. Se falhar, o texto continua no campo e o erro aparece acima dele. */
  onSubmit: (content: string) => Promise<void>;
  /** Recuo de baixo: área segura e, no Android, a parte que o teclado cobre. */
  bottomInset: number;
};

/**
 * Barra de comentário no pé da folha, como no Instagram: um campo em pílula que começa com uma
 * linha e cresce com o texto, e o botão de enviar dentro dele (vermelho só quando há texto).
 */
export function CommentComposer({ onSubmit, bottomInset }: CommentComposerProps) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const content = text.trim();
  const canSend = content.length > 0 && !sending;

  async function submit() {
    if (!canSend) return;
    setSending(true);
    setError(null);

    try {
      await onSubmit(content);
      setText('');
    } catch (failure) {
      setError(
        failure instanceof ApiError && failure.status === 404
          ? 'Esta postagem não existe mais.'
          : getErrorMessage(failure, 'Não foi possível publicar o comentário.'),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <View
      style={[
        styles.bar,
        { borderTopColor: theme.border, backgroundColor: theme.background, paddingBottom: bottomInset },
      ]}>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[Typography.callout, { color: theme.danger }]}>
          {error}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          { backgroundColor: theme.backgroundElement, borderColor: focused ? theme.tint : 'transparent' },
        ]}>
        <TextInput
          accessibilityLabel="Seu comentário"
          placeholder="Adicione um comentário…"
          placeholderTextColor={theme.textTertiary}
          selectionColor={theme.tint}
          cursorColor={theme.tint}
          multiline
          value={text}
          onChangeText={(value) => {
            setText(value);
            if (error) setError(null);
          }}
          maxLength={COMMENT_MAX_LENGTH}
          editable={!sending}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Publicar comentário"
          accessibilityState={{ disabled: !canSend, busy: sending }}
          disabled={!canSend}
          hitSlop={(MinTouchSize - SEND_SIZE) / 2}
          onPress={() => void submit()}
          style={[styles.send, { backgroundColor: canSend || sending ? theme.tint : theme.backgroundSelected }]}>
          {sending ? (
            <ActivityIndicator size="small" color={theme.onTint} />
          ) : (
            <Icon name="arrow-up" size={IconSize.medium} color={canSend ? theme.onTint : theme.textTertiary} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderTopWidth: BorderWidth.hairline,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingStart: Spacing.three,
    // O botão de enviar fica dentro da pílula, a 4 pt da borda.
    paddingEnd: Spacing.one,
    paddingVertical: Spacing.one,
    borderRadius: Radius.large,
    // Sempre 2 px (transparente em repouso): o foco pinta a borda sem mudar o tamanho.
    borderWidth: BorderWidth.strong,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    lineHeight: LINE_HEIGHT,
    // Sem altura fixa: o campo de várias linhas cresce com o texto até o máximo e então rola.
    minHeight: SEND_SIZE,
    maxHeight: LINE_HEIGHT * MAX_LINES + INPUT_PADDING * 2,
    paddingTop: INPUT_PADDING - Spacing.one,
    paddingBottom: INPUT_PADDING - Spacing.one,
    textAlignVertical: 'center',
  },
  send: {
    width: SEND_SIZE,
    height: SEND_SIZE,
    borderRadius: SEND_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
