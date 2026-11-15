import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { SheetHeader } from '@/components/sheet-header';
import { useTheme } from '@/hooks/use-theme';

/** Recuos que o conteúdo precisa para não ficar sob o título (em cima) e o rodapé (embaixo). */
export type SheetInsets = { top: number; bottom: number };

type SheetScaffoldProps = {
  title: string;
  /** Logo abaixo do título, fixo: um aviso (erro ao excluir, falha ao atualizar) ou uma busca. */
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
 * O tamanho da lista vem só do layout do React Native. No iOS, o react-native-screens procura a
 * lista da folha seguindo sempre o primeiro filho de cada view e força o tamanho dela
 * (`RNSScreen.applyFrameCorrectionForDescendantScrollView`), mas só quando a folha se redimensiona,
 * durante a animação de abertura. O tamanho que ele aplica depende do momento: já cobriu o título
 * e já deixou a folha com o meio em branco, de forma intermitente, conforme a resposta da API
 * chegava antes ou depois da animação. O primeiro filho daqui é uma view vazia, de propósito: a
 * busca para nela e não chega à lista.
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
      {/* Precisa ser o primeiro filho e não pode ser achatada (`collapsable`): ver acima. */}
      <View collapsable={false} pointerEvents="none" style={styles.scrollViewSearchStop} />
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
  scrollViewSearchStop: {
    position: 'absolute',
    width: 0,
    height: 0,
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
