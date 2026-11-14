import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { BorderWidth, IconSize, MinTouchSize, Radius, Spacing, Typography } from '@/theme';

export type FilterOption = { value: string; label: string };

export type FilterGroup = {
  /** Nome do parâmetro de rota que guarda a escolha deste grupo. */
  key: string;
  label: string;
  options: readonly FilterOption[];
};

/** Escolhas atuais por grupo. Valor vazio é "sem filtro" naquele grupo. */
export type FilterValues = Record<string, string>;

type FilterSheetProps = {
  title?: string;
  groups: readonly FilterGroup[];
  /** Escolhas com que a folha abre (vêm dos parâmetros da tela que a abriu). */
  initial: FilterValues;
  onApply: (values: FilterValues) => void;
  /** Aplica "sem filtro" em todos os grupos. */
  onClear: () => void;
};

/**
 * Conteúdo da folha de filtros. A folha em si é uma rota com `presentation: 'formSheet'`, então o
 * arrastar para fechar, o teclado e a acessibilidade são do sistema; aqui fica só a lista de
 * opções (uma escolha por grupo) e os botões. As escolhas só valem ao tocar em "Aplicar".
 */
export function FilterSheet({ title = 'Filtros', groups, initial, onApply, onClear }: FilterSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<FilterValues>(initial);

  return (
    <View
      style={[
        styles.sheet,
        { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, Spacing.three) },
      ]}>
      <Text accessibilityRole="header" style={[Typography.title, { color: theme.text }]}>
        {title}
      </Text>

      {groups.map((group) => (
        <View
          key={group.key}
          accessibilityRole="radiogroup"
          accessibilityLabel={group.label}
          style={styles.group}>
          <Text style={[Typography.label, { color: theme.textSecondary }]}>{group.label}</Text>
          <View style={[styles.options, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {group.options.map((option, index) => {
              const selected = (values[group.key] ?? '') === option.value;

              return (
                <Pressable
                  key={option.value || 'all'}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ checked: selected }}
                  onPress={() => setValues((current) => ({ ...current, [group.key]: option.value }))}
                  style={({ pressed }) => [
                    styles.option,
                    index > 0 && { borderTopWidth: BorderWidth.hairline, borderTopColor: theme.border },
                    pressed && { backgroundColor: theme.backgroundSelected },
                  ]}>
                  <Text
                    style={[
                      Typography.body,
                      styles.optionLabel,
                      { color: theme.text, fontWeight: selected ? '600' : '400' },
                    ]}>
                    {option.label}
                  </Text>
                  {selected ? <Icon name="checkmark" size={IconSize.medium} color={theme.tintText} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label="Limpar" variant="secondary" size="large" onPress={onClear} />
        </View>
        <View style={styles.action}>
          <Button label="Aplicar" size="large" onPress={() => onApply(values)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: Spacing.four,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  group: {
    gap: Spacing.two,
  },
  options: {
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
  },
  optionLabel: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  action: {
    flex: 1,
  },
});
