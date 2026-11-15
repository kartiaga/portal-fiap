import { isValidElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/button';
import { Icon, type IconName } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { IconSize, MinTouchSize, Spacing, Typography } from '@/theme';

/** Acima desta escala de fonte, a ação do cabeçalho mostra só o ícone. */
const ICON_ONLY_FONT_SCALE = 1.3;
/** O título de tela cresce com a fonte do usuário só até aqui, como o título grande do iOS. */
const TITLE_MAX_FONT_SCALE = 1.3;

export type ScreenHeaderAction = {
  /** Texto curto do botão ("Criar"): o título da aba já diz o assunto. */
  label: string;
  /** Nome completo para o leitor de tela ("Nova postagem"). Sem ele, vale o `label`. */
  accessibilityLabel?: string;
  icon: IconName;
  onPress: () => void;
};

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /**
   * Ação primária à direita do título. Como objeto, vira um botão pequeno com rótulo e, com fonte
   * grande, um círculo só com o ícone (o rótulo continua como rótulo acessível).
   */
  action?: ScreenHeaderAction | ReactNode;
};

function isHeaderAction(action: ScreenHeaderProps['action']): action is ScreenHeaderAction {
  return typeof action === 'object' && action !== null && !isValidElement(action) && 'onPress' in action;
}

/** Título grande das telas de aba, que não têm cabeçalho de navegação. */
export function ScreenHeader({ title, subtitle, action }: ScreenHeaderProps) {
  const theme = useTheme();
  const { fontScale } = useWindowDimensions();

  let actionNode: ReactNode = null;
  if (isHeaderAction(action)) {
    actionNode =
      fontScale > ICON_ONLY_FONT_SCALE ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel ?? action.label}
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.iconAction,
            { backgroundColor: pressed ? theme.tintPressed : theme.tint },
          ]}>
          <Icon name={action.icon} size={IconSize.large} color={theme.onTint} />
        </Pressable>
      ) : (
        <Button
          label={action.label}
          accessibilityLabel={action.accessibilityLabel}
          icon={action.icon}
          size="small"
          onPress={action.onPress}
        />
      );
  } else if (action) {
    actionNode = action;
  }

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}
          style={[Typography.display, styles.title, { color: theme.text }]}>
          {title}
        </Text>
        {actionNode}
      </View>
      {subtitle ? (
        <Text style={[Typography.callout, { color: theme.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
  },
  iconAction: {
    width: MinTouchSize,
    height: MinTouchSize,
    borderRadius: MinTouchSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
