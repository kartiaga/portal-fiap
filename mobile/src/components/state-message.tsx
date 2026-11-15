import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Icon, type IconName } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { AvatarSize, IconSize, Spacing, Typography } from '@/theme';

type StateMessageProps = {
  icon?: IconName;
  title?: string;
  message: string;
  /** Rótulo e ação do botão; sem eles, só o texto aparece. */
  actionLabel?: string;
  onAction?: () => void;
  /** Erros usam o vermelho de erro na marca; estados vazios, o vermelho da marca. */
  tone?: 'neutral' | 'error';
};

/** Estado vazio ou de erro: marca circular, título, uma frase e, se couber, a saída. */
export function StateMessage({
  icon = 'document-text-outline',
  title,
  message,
  actionLabel,
  onAction,
  tone = 'neutral',
}: StateMessageProps) {
  const theme = useTheme();
  const accent = tone === 'error' ? theme.danger : theme.tintText;

  return (
    <View style={styles.container}>
      <View style={[styles.mark, { borderColor: accent }]}>
        <Icon name={tone === 'error' ? 'cloud-offline-outline' : icon} size={IconSize.xlarge} color={accent} />
      </View>
      {title ? (
        <Text style={[Typography.headline, styles.text, { color: theme.text }]}>{title}</Text>
      ) : null}
      <Text style={[Typography.callout, styles.text, { color: theme.textSecondary }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} variant="secondary" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

/** Carregando a tela inteira. */
export function LoadingState({ label = 'Carregando' }: { label?: string }) {
  const theme = useTheme();

  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={theme.tint} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  mark: {
    width: AvatarSize.large,
    height: AvatarSize.large,
    borderRadius: AvatarSize.large / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  text: {
    textAlign: 'center',
  },
  action: {
    marginTop: Spacing.two,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
  },
});
