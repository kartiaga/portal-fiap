import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { IconSize, MinTouchSize, Radius, Spacing, Typography, type Theme } from '@/theme';

export type BannerKind = 'error' | 'success' | 'info';

type BannerProps = {
  kind?: BannerKind;
  text: string;
  /** Mostra o botão de fechar (ícone de 20, área de 44). */
  onDismiss?: () => void;
  /** Ação dentro da faixa, como "Tentar novamente": texto sublinhado, não um botão contornado. */
  action?: { label: string; onPress: () => void };
};

function paletteFor(kind: BannerKind, theme: Theme): { color: string; background: string; icon: IconName } {
  switch (kind) {
    case 'error':
      return { color: theme.danger, background: theme.dangerSoft, icon: 'alert-circle' };
    case 'success':
      return { color: theme.success, background: theme.successSoft, icon: 'checkmark-circle' };
    case 'info':
      return { color: theme.info, background: theme.infoSoft, icon: 'information-circle' };
  }
}

/** Faixa de aviso que não bloqueia a tela: fundo suave, texto na cor cheia e ícone. */
export function Banner({ kind = 'error', text, onDismiss, action }: BannerProps) {
  const theme = useTheme();
  const { color, background, icon } = paletteFor(kind, theme);

  return (
    <View
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: background }]}>
      <Icon name={icon} size={IconSize.medium} color={color} />
      <View style={styles.body}>
        <Text style={[Typography.callout, { color }]}>{text}</Text>
        {action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.label}
            hitSlop={Spacing.two}
            onPress={action.onPress}
            style={styles.action}>
            <Text style={[Typography.label, styles.actionText, { color }]}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
          onPress={onDismiss}
          style={styles.dismiss}>
          <Icon name="close" size={IconSize.medium} color={color} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
  },
  body: {
    flex: 1,
    gap: Spacing.one,
  },
  action: {
    alignSelf: 'flex-start',
  },
  actionText: {
    textDecorationLine: 'underline',
  },
  dismiss: {
    // Área de toque de 44 sem aumentar a faixa: a margem negativa compensa o excesso.
    width: MinTouchSize,
    height: MinTouchSize,
    marginVertical: -Spacing.two - Spacing.one,
    marginRight: -Spacing.three + Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
