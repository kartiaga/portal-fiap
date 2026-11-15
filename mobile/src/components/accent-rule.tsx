import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme';

/** Traço vermelho curto sob o título das telas de entrada. Decorativo. */
export function AccentRule() {
  const theme = useTheme();
  return <View accessible={false} style={[styles.rule, { backgroundColor: theme.tint }]} />;
}

const styles = StyleSheet.create({
  rule: {
    width: Spacing.five + Spacing.two,
    height: Spacing.one,
    borderRadius: Spacing.half,
  },
});
