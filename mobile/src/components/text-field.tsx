import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import {
  BorderWidth,
  ControlHeight,
  IconSize,
  MinTouchSize,
  Radius,
  Spacing,
  Typography,
  type Theme,
} from '@/theme';

export type TextFieldHandle = ComponentRef<typeof TextInput>;

type TextFieldProps = TextInputProps & {
  /** Rótulo acima do campo. Na variante `search` não aparece, mas continua sendo o rótulo acessível. */
  label: string;
  /**
   * `form` (padrão): rótulo acima e linha na base. `search`: campo preenchido e arredondado,
   * sem rótulo visível, para busca e filtro de listas.
   */
  variant?: 'form' | 'search';
  /** Mensagem de erro abaixo do campo; também pinta a linha de base. */
  error?: string | null;
  /** Texto de apoio abaixo do campo, quando não há erro. */
  hint?: string;
  /** Ícone decorativo à esquerda do texto. */
  icon?: IconName;
  /** Controle à direita do texto (ex.: indicador de busca). */
  trailing?: ReactNode;
  ref?: Ref<TextFieldHandle>;
};

/**
 * Linha de base do campo de formulário. A espessura também marca o estado: 1 px em repouso
 * (com 1 px de respiro embaixo, para o layout não pular) e 2 px em foco ou com erro. Também serve
 * a campos que não são de texto, como o de autor da postagem.
 */
export function underlineFor(theme: Theme, { error, focused, editable }: { error: boolean; focused: boolean; editable: boolean }) {
  if (error) return { borderBottomColor: theme.danger, borderBottomWidth: BorderWidth.strong, paddingBottom: 0 };
  if (!editable) return { borderBottomColor: theme.border, borderBottomWidth: BorderWidth.thin, paddingBottom: 1 };
  if (focused) return { borderBottomColor: theme.tint, borderBottomWidth: BorderWidth.strong, paddingBottom: 0 };
  return { borderBottomColor: theme.borderInput, borderBottomWidth: BorderWidth.thin, paddingBottom: 1 };
}

/**
 * Campo de texto com rótulo acima, linha na base (vermelha em foco) e mensagem abaixo.
 * Com `secureTextEntry`, ganha o botão de mostrar e ocultar.
 */
export function TextField({
  label,
  variant = 'form',
  error,
  hint,
  icon,
  trailing,
  secureTextEntry = false,
  editable = true,
  multiline,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isSearch = variant === 'search';

  const frame = isSearch
    ? [
        styles.search,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: focused ? theme.tint : 'transparent',
        },
      ]
    : underlineFor(theme, { error: Boolean(error), focused, editable });

  return (
    <View style={styles.container}>
      {isSearch ? null : (
        <Text style={[Typography.label, { color: theme.text }]}>{label}</Text>
      )}
      <View style={[styles.row, multiline && styles.rowMultiline, frame]}>
        {icon ? (
          <View style={multiline ? styles.iconTop : undefined}>
            <Icon
              name={icon}
              size={IconSize.medium}
              color={focused && !isSearch ? theme.tintText : theme.textSecondary}
            />
          </View>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error ?? undefined}
          placeholderTextColor={theme.textTertiary}
          selectionColor={theme.tint}
          cursorColor={theme.tint}
          editable={editable}
          multiline={multiline}
          secureTextEntry={secureTextEntry && !revealed}
          style={[
            styles.input,
            isSearch && styles.inputSearch,
            multiline && styles.inputMultiline,
            { color: editable ? theme.text : theme.textSecondary },
            style,
          ]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {trailing}
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${revealed ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`}
            hitSlop={Spacing.two}
            onPress={() => setRevealed((current) => !current)}
            style={styles.toggle}>
            <Icon
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={IconSize.medium}
              color={theme.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[Typography.callout, { color: theme.danger }]}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={[Typography.callout, { color: theme.textSecondary }]}>{hint}</Text>
      ) : null}
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
  },
  rowMultiline: {
    alignItems: 'flex-start',
  },
  search: {
    minHeight: MinTouchSize,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    // Sempre 2 px (transparente em repouso): o foco pinta a borda sem mudar o tamanho.
    borderWidth: BorderWidth.strong,
  },
  iconTop: {
    paddingTop: Spacing.three,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    minHeight: ControlHeight.field,
    paddingVertical: Spacing.two,
  },
  inputSearch: {
    minHeight: MinTouchSize - BorderWidth.strong * 2,
  },
  inputMultiline: {
    minHeight: 160,
    lineHeight: Typography.body.lineHeight,
    paddingTop: Spacing.three,
    textAlignVertical: 'top',
  },
  toggle: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
