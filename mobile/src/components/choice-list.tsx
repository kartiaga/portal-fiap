import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { BorderWidth, IconSize, MinTouchSize, Radius, Spacing, Typography } from '@/theme';

export type Choice<T extends string> = {
  value: T;
  label: string;
  /** Uma frase abaixo do rótulo, quando a opção precisa de explicação (ex.: o que cada perfil pode). */
  description?: string;
};

type ChoiceListProps<T extends string> = {
  /** Nome do grupo para o leitor de tela; o rótulo visível fica com quem usa. */
  accessibilityLabel: string;
  options: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

/**
 * Escolha única em lista, como nos Ajustes do iOS: cartão com uma linha por opção e marca de
 * seleção à direita. Usada na folha de filtros e no perfil do cadastro de pessoa.
 */
export function ChoiceList<T extends string>({
  accessibilityLabel,
  options,
  value,
  onChange,
  disabled = false,
}: ChoiceListProps<T>) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value || 'all'}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityHint={option.description}
            accessibilityState={{ checked: selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              index > 0 && { borderTopWidth: BorderWidth.hairline, borderTopColor: theme.border },
              pressed && { backgroundColor: theme.backgroundSelected },
            ]}>
            <View style={styles.text}>
              <Text style={[Typography.body, { color: theme.text, fontWeight: selected ? '600' : '400' }]}>
                {option.label}
              </Text>
              {option.description ? (
                <Text style={[Typography.callout, { color: theme.textSecondary }]}>{option.description}</Text>
              ) : null}
            </View>
            {selected ? <Icon name="checkmark" size={IconSize.medium} color={theme.tintText} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: BorderWidth.thin,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: MinTouchSize + Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
});
