import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ChoiceList } from '@/components/choice-list';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Typography } from '@/theme';

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
        <View key={group.key} style={styles.group}>
          <Text style={[Typography.label, { color: theme.textSecondary }]}>{group.label}</Text>
          <ChoiceList
            accessibilityLabel={group.label}
            options={group.options}
            value={values[group.key] ?? ''}
            onChange={(value) => setValues((current) => ({ ...current, [group.key]: value }))}
          />
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  action: {
    flex: 1,
  },
});
