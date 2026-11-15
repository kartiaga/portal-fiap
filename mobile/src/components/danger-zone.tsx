import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { useTheme } from '@/hooks/use-theme';
import { BorderWidth, Spacing, Typography } from '@/theme';

type DangerZoneProps = {
  title: string;
  /** Consequência da exclusão, em uma frase. */
  description: string;
  /** Sem rótulo, a zona só explica (ex.: "Você não pode excluir sua própria conta."). */
  buttonLabel?: string;
  accessibilityLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

/**
 * Zona de exclusão no fim de uma tela de edição (postagem e pessoa): divisor, título, a
 * consequência e o botão `danger` do tamanho do texto, alinhado à esquerda. O botão abre um
 * `Alert` de confirmação na tela.
 */
export function DangerZone({
  title,
  description,
  buttonLabel,
  accessibilityLabel,
  loading = false,
  disabled = false,
  onPress,
}: DangerZoneProps) {
  const theme = useTheme();

  return (
    <View style={[styles.zone, { borderTopColor: theme.border }]}>
      <Text accessibilityRole="header" style={[Typography.headline, { color: theme.text }]}>
        {title}
      </Text>
      <Text style={[Typography.callout, { color: theme.textSecondary }]}>{description}</Text>
      {buttonLabel && onPress ? (
        <View style={styles.button}>
          <Button
            label={buttonLabel}
            icon="trash-outline"
            variant="danger"
            accessibilityLabel={accessibilityLabel}
            loading={loading}
            disabled={disabled}
            onPress={onPress}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    gap: Spacing.two,
    marginTop: Spacing.five,
    paddingTop: Spacing.four,
    borderTopWidth: BorderWidth.hairline,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
});
