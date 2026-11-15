import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { BorderWidth, IconSize, MinTouchSize, Radius } from '@/theme';

type FilterButtonProps = {
  /** Quantos filtros estão ativos; com pelo menos um, aparece um ponto no ícone. */
  activeCount: number;
  onPress: () => void;
  testID?: string;
};

const DOT_SIZE = 10;

/**
 * Botão só com o ícone de filtro, ao lado do campo de busca. O ponto vermelho avisa que há filtro
 * ligado e o rótulo acessível diz quantos, já que o ícone sozinho não diz nada ao leitor de tela.
 */
export function FilterButton({ activeCount, onPress, testID }: FilterButtonProps) {
  const theme = useTheme();
  const active = activeCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        active ? `Filtros, ${activeCount} ${activeCount === 1 ? 'ativo' : 'ativos'}` : 'Filtros'
      }
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
        },
      ]}>
      <Icon name="options-outline" size={IconSize.large} color={active ? theme.tintText : theme.textSecondary} />
      {active ? (
        <View style={[styles.dot, { backgroundColor: theme.tint, borderColor: theme.backgroundElement }]} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MinTouchSize,
    height: MinTouchSize,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: BorderWidth.strong,
  },
});
