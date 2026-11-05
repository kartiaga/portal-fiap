import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';

type BannerProps = {
  kind?: 'error' | 'success';
  text: string;
};

export function Banner({ kind = 'error', text }: BannerProps) {
  const isError = kind === 'error';

  return (
    <View
      accessibilityRole={isError ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={[styles.banner, isError ? styles.error : styles.success]}>
      <Text style={{ fontSize: 14, color: isError ? colors.error : colors.green600 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { padding: 12, borderWidth: 1, borderRadius: radius.s },
  error: { backgroundColor: colors.errorBg, borderColor: colors.errorBorder },
  success: { backgroundColor: colors.green100, borderColor: colors.green100 },
});
