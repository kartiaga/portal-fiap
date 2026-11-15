import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { BorderWidth, Spacing, Typography } from '@/theme';

/**
 * Título centralizado das folhas de lista (comentários, curtidas), com um divisor embaixo. O
 * puxador e o arrastar para fechar são da folha nativa.
 */
export function SheetHeader({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <Text accessibilityRole="header" style={[Typography.headline, { color: theme.text }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    // Espaço para o puxador da folha, que fica sobre o conteúdo.
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: BorderWidth.hairline,
  },
});
