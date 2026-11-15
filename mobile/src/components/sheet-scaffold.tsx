import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { SheetHeader } from '@/components/sheet-header';
import { useTheme } from '@/hooks/use-theme';

/** Recuos que o conteúdo precisa para não ficar sob o título (em cima) e o rodapé (embaixo). */
export type SheetInsets = { top: number; bottom: number };

type SheetScaffoldProps = {
  title: string;
  /** Aviso logo abaixo do título (erro ao excluir, falha ao atualizar). */
  banner?: ReactNode;
  /** Fixo no pé da folha, como o campo de comentário. */
  footer?: ReactNode;
  /** O conteúdo (em geral uma FlatList) ocupa a folha inteira e aplica os recuos recebidos. */
  children: (insets: SheetInsets) => ReactNode;
};

/**
 * Estrutura das folhas de lista (`formSheet`): a lista ocupa a folha inteira e o título e o rodapé
 * ficam por cima, fixos, com fundo opaco.
 *
 * Por que não empilhar título, lista e rodapé: no iOS, o react-native-screens procura a lista da
 * folha e força o tamanho dela para a folha inteira, a partir do topo
 * (`RNSScreen.applyFrameCorrectionForDescendantScrollView`). Ele só desconta um título quando a
 * folha tem exatamente dois filhos (título e lista); com um rodapé, a lista cobria o título.
 * Ocupando a folha inteira de propósito, o resultado é o mesmo com ou sem essa correção.
 */
export function SheetScaffold({ title, banner, footer, children }: SheetScaffoldProps) {
  const theme = useTheme();
  const [insets, setInsets] = useState<SheetInsets>({ top: 0, bottom: 0 });

  const measure = (edge: keyof SheetInsets) => (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setInsets((current) => (current[edge] === height ? current : { ...current, [edge]: height }));
  };

  return (
    <View style={[styles.sheet, { backgroundColor: theme.background }]}>
      <View style={StyleSheet.absoluteFill}>{children(insets)}</View>

      <View
        collapsable={false}
        onLayout={measure('top')}
        style={[styles.top, { backgroundColor: theme.background }]}>
        <SheetHeader title={title} />
        {banner}
      </View>

      {footer ? (
        <View collapsable={false} onLayout={measure('bottom')} style={styles.bottom}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
