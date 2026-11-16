import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SelfBadge } from '@/components/badge';
import { Icon } from '@/components/icon';
import { underlineFor } from '@/components/text-field';
import { useTheme } from '@/hooks/use-theme';
import { ControlHeight, IconSize, Spacing, Typography } from '@/theme';

type AuthorFieldProps = {
  /** Nome de quem assina a postagem; `null` enquanto ainda não se sabe. */
  name: string | null;
  isSelf: boolean;
  /** Frase abaixo do campo, com a regra que vale para quem está vendo. */
  hint?: string;
  /** Com isto, o campo abre a escolha do autor (só o administrador escolhe). */
  onPress?: () => void;
  disabled?: boolean;
};

/**
 * Campo "Autor" do formulário de postagem, com o mesmo rótulo e a mesma linha de base dos campos
 * de texto. Não é digitado: o autor vem do login. Só leitura para o professor e na edição; para o
 * administrador, criando uma postagem, abre a lista de professores.
 */
export function AuthorField({ name, isSelf, hint, onPress, disabled = false }: AuthorFieldProps) {
  const theme = useTheme();
  const shownName = name ?? (isSelf ? 'Você' : 'Autor não informado');
  const editable = Boolean(onPress) && !disabled;

  const value = (
    <>
      <Icon name="person-outline" size={IconSize.medium} color={theme.textSecondary} />
      <Text
        numberOfLines={1}
        style={[Typography.body, styles.name, { color: editable ? theme.text : theme.textSecondary }]}>
        {shownName}
      </Text>
      {isSelf && name ? <SelfBadge /> : null}
      {onPress ? (
        <View style={styles.chevron}>
          <Icon name="chevron-forward" size={IconSize.medium} color={theme.textTertiary} />
        </View>
      ) : null}
    </>
  );
  const frame = [styles.row, underlineFor(theme, { error: false, focused: false, editable })];

  return (
    <View style={styles.container}>
      <Text style={[Typography.label, { color: theme.text }]}>Autor</Text>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Autor: ${shownName}${isSelf && name ? ', você' : ''}`}
          accessibilityHint="Escolhe outro professor como autor"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onPress}
          style={({ pressed }) => [frame, pressed && { backgroundColor: theme.backgroundSelected }]}>
          {value}
        </Pressable>
      ) : (
        <View accessible accessibilityLabel={`Autor: ${shownName}${isSelf && name ? ', você' : ''}`} style={frame}>
          {value}
        </View>
      )}
      {hint ? <Text style={[Typography.callout, { color: theme.textSecondary }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: ControlHeight.field,
  },
  name: {
    flexShrink: 1,
  },
  chevron: {
    marginStart: 'auto',
  },
});
