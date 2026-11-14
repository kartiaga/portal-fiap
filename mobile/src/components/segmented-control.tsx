import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { BorderWidth, MinTouchSize, Radius, Spacing, Typography } from '@/theme';

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Alternância entre poucas visões da mesma lista (ex.: Professores | Estudantes). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              selected && { backgroundColor: theme.segmentSelected, borderColor: theme.border },
            ]}>
            <Text
              numberOfLines={1}
              style={[
                Typography.label,
                // O peso também marca a seleção, não só a cor.
                { color: selected ? theme.text : theme.textSecondary, fontWeight: selected ? '600' : '500' },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: Spacing.half,
    borderRadius: Radius.medium,
  },
  segment: {
    flex: 1,
    minHeight: MinTouchSize - Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium - Spacing.half,
    borderWidth: BorderWidth.thin,
    borderColor: 'transparent',
  },
});
