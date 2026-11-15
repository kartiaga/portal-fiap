import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { IconSize, Radius, Spacing, Typography } from '@/theme';

type FilterTagProps = {
  label: string;
  onRemove: () => void;
};

/**
 * Etiqueta de um filtro ativo, abaixo da busca ("Perfil: Professores ×"). Tocar remove o filtro,
 * então ele não fica ligado sem o usuário perceber.
 */
export function FilterTag({ label, onRemove }: FilterTagProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remover filtro ${label}`}
        hitSlop={Spacing.two}
        onPress={onRemove}
        style={({ pressed }) => [
          styles.tag,
          { backgroundColor: pressed ? theme.backgroundSelected : theme.tintSoft },
        ]}>
        <Text numberOfLines={1} style={[Typography.label, { color: theme.tintText }]}>
          {label}
        </Text>
        <Icon name="close" size={IconSize.small} color={theme.tintText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    maxWidth: '100%',
    paddingVertical: Spacing.one + Spacing.half,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    borderRadius: Radius.pill,
  },
});
