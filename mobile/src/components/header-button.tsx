import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { MinTouchSize, Spacing, Typography } from '@/theme';

type HeaderButtonProps = {
  label: string;
  onPress: () => void;
  /** Quando o texto sozinho é ambíguo, como "Editar" numa postagem: "Editar Título". */
  accessibilityLabel?: string;
  disabled?: boolean;
};

/**
 * Botão de texto do cabeçalho do Stack ("Cancelar" nos modais, "Editar" na leitura). Usa a cor
 * do cabeçalho (`tintText`, a mesma do voltar) e peso regular, como os itens de barra do iOS.
 */
export function HeaderButton({ label, onPress, accessibilityLabel = label, disabled = false }: HeaderButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={Spacing.two}
      onPress={onPress}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.dimmed]}>
      <Text style={[styles.label, { color: theme.tintText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MinTouchSize,
    justifyContent: 'center',
  },
  label: {
    // Tamanho do `headline` (17/22), mas em peso regular, como os itens de barra do iOS.
    fontSize: Typography.headline.fontSize,
    lineHeight: Typography.headline.lineHeight,
    fontWeight: '400',
  },
  dimmed: {
    opacity: 0.5,
  },
});
