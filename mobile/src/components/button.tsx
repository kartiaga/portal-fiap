import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import {
  BorderWidth,
  ControlHeight,
  IconSize,
  Radius,
  Spacing,
  Typography,
  type Theme,
} from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerGhost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /**
   * `primary`: ação principal, uma por tela. `secondary`: contorno neutro. `ghost`: só texto,
   * neutro. `danger`: destrutiva com contorno (zona de exclusão). `dangerGhost`: destrutiva só
   * com texto e ícone, para listas. As duas destrutivas pedem `Alert.alert` antes de executar.
   */
  variant?: ButtonVariant;
  /** `large` é o botão de largura total da base de formulários; `small` cabe em cabeçalho e cartão. */
  size?: 'small' | 'medium' | 'large';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Use quando o texto sozinho for ambíguo, como em uma lista de botões "Editar". */
  accessibilityLabel?: string;
  testID?: string;
};

function paletteFor(variant: ButtonVariant, theme: Theme, pressed: boolean, disabled: boolean) {
  // Primário desabilitado fica neutro: um bloco vermelho desbotado ainda parece a ação da tela.
  if (variant === 'primary' && disabled) {
    return { background: theme.backgroundElement, border: 'transparent', content: theme.textTertiary };
  }
  switch (variant) {
    case 'primary':
      return {
        background: pressed ? theme.tintPressed : theme.tint,
        border: 'transparent',
        content: theme.onTint,
      };
    case 'secondary':
      return {
        background: pressed ? theme.backgroundSelected : theme.surface,
        border: theme.border,
        content: theme.text,
      };
    case 'ghost':
      return {
        background: pressed ? theme.backgroundSelected : 'transparent',
        border: 'transparent',
        content: theme.text,
      };
    case 'danger':
      return {
        background: pressed ? theme.dangerSoft : 'transparent',
        border: theme.danger,
        content: theme.danger,
      };
    case 'dangerGhost':
      return {
        background: pressed ? theme.dangerSoft : 'transparent',
        border: 'transparent',
        content: theme.danger,
      };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  accessibilityLabel = label,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const inactive = loading || disabled;
  // Carregando, o primário continua vermelho (com o indicador); só o desabilitado fica neutro.
  const neutralDisabled = variant === 'primary' && disabled && !loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      hitSlop={size === 'small' ? Spacing.one : undefined}
      testID={testID}
      style={({ pressed }) => {
        const palette = paletteFor(variant, theme, pressed, neutralDisabled);
        return [
          styles.base,
          styles[size],
          { backgroundColor: palette.background, borderColor: palette.border },
          inactive && !neutralDisabled && styles.inactive,
        ];
      }}>
      {({ pressed }) => {
        const { content } = paletteFor(variant, theme, pressed, neutralDisabled);
        const textStyle = size === 'small' ? Typography.label : Typography.headline;

        return loading ? (
          <ActivityIndicator color={content} />
        ) : (
          <View style={styles.content}>
            {icon ? (
              <Icon
                name={icon}
                size={size === 'small' ? IconSize.small : IconSize.medium}
                color={content}
              />
            ) : null}
            <Text numberOfLines={1} style={[textStyle, { color: content }]}>
              {label}
            </Text>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.medium,
  },
  small: {
    minHeight: ControlHeight.small,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  medium: {
    minHeight: ControlHeight.medium,
    paddingHorizontal: Spacing.four,
  },
  large: {
    alignSelf: 'stretch',
    minHeight: ControlHeight.large,
    paddingHorizontal: Spacing.four,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inactive: {
    opacity: 0.55,
  },
});
