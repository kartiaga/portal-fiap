import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography } from '@/theme';

type ListFooterProps = {
  loading: boolean;
  /** Falha ao carregar a próxima página: fica onde a página faltou, com a saída ao lado. */
  error: string | null;
  onRetry: () => void;
  /** Rótulo acessível do indicador, como "Carregando mais postagens". */
  loadingLabel: string;
};

/** Rodapé de lista paginada: indicador ao carregar a próxima página ou o erro com "Tentar novamente". */
export function ListFooter({ loading, error, onRetry, loadingLabel }: ListFooterProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <ActivityIndicator color={theme.tint} style={styles.footer} accessibilityLabel={loadingLabel} />
    );
  }

  if (error) {
    return (
      <View style={[styles.footer, styles.error]}>
        <Text
          accessibilityRole="alert"
          style={[Typography.callout, styles.text, { color: theme.danger }]}>
          {error}
        </Text>
        <Button label="Tentar novamente" variant="secondary" size="small" onPress={onRetry} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: Spacing.three,
  },
  error: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  text: {
    textAlign: 'center',
  },
});
