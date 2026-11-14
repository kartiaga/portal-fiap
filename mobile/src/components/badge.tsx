import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography, type Theme } from '@/theme';

export type BadgeTone = 'brand' | 'info' | 'success' | 'neutral';

function paletteFor(tone: BadgeTone, theme: Theme) {
  switch (tone) {
    case 'brand':
      return { background: theme.tintSoft, text: theme.tintText };
    case 'info':
      return { background: theme.infoSoft, text: theme.info };
    case 'success':
      return { background: theme.successSoft, text: theme.success };
    case 'neutral':
      return { background: theme.backgroundElement, text: theme.textSecondary };
  }
}

/** Selo em pílula: fundo suave e texto na cor cheia. O texto é o sinal; a cor só reforça. */
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const theme = useTheme();
  const colors = paletteFor(tone, theme);

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text numberOfLines={1} style={[Typography.label, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

/** Selo "Você": marca o que é do usuário conectado (postagem própria, a própria conta). */
export function SelfBadge() {
  return <Badge label="Você" tone="brand" />;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
});
