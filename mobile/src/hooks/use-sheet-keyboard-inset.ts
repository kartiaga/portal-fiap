import { useEffect, useState } from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';

/**
 * Quanto do rodapé de uma folha (`formSheet`) o teclado cobre, para somar ao recuo de baixo.
 *
 * - iOS: a folha nativa se redimensiona acima do teclado sozinha, então é 0.
 * - Android: o react-native-screens sobe a folha só até ela encostar no topo da tela
 *   (`SheetAnimationCoordinator.computeSheetOffsetYWithIMEPresent`); o que sobra do teclado cobre
 *   a parte de baixo. Esse resto é `altura do teclado - espaço livre acima da folha`.
 */
export function useSheetKeyboardInset(detent: number): number {
  const { height } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (event) =>
      setKeyboardHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return Math.max(0, keyboardHeight - height * (1 - detent));
}
