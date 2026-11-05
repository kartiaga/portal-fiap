import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export function Button({ label, onPress, variant = 'primary', loading = false }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && isPrimary && styles.primaryPressed,
        loading && styles.loading,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.paper000 : colors.ink900} />
      ) : (
        <Text style={[styles.label, { color: isPrimary ? colors.paper000 : colors.ink900 }]}>
          {label}
        </Text>
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
  secondary: { backgroundColor: colors.paper000, borderColor: colors.ink100 },
  loading: { opacity: 0.7 },
  label: { fontSize: 15, fontWeight: '600' },
});
