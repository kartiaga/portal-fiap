import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  /** Use quando o texto sozinho for ambíguo, como em uma lista de botões "Editar". */
  accessibilityLabel?: string;
};

const CONTENT_COLOR = {
  primary: colors.paper000,
  secondary: colors.ink900,
  danger: colors.red700,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel = label,
}: ButtonProps) {
  const inactive = loading || disabled;
  const contentColor = CONTENT_COLOR[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.outlined,
        pressed && variant === 'primary' && styles.primaryPressed,
        inactive && styles.inactive,
      ]}>
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <Text style={[styles.label, { color: contentColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: { backgroundColor: colors.red600 },
  primaryPressed: { backgroundColor: colors.red700 },
  outlined: { backgroundColor: colors.paper000, borderColor: colors.ink100 },
  inactive: { opacity: 0.6 },
  label: { fontSize: 15, fontWeight: '600' },
});
