import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, LayoutAnimation, Platform } from 'react-native';

import type { Notice } from '@/lib/notice';

/** Quanto tempo o aviso de sucesso fica na tela. */
export const SUCCESS_NOTICE_MS = 4000;

/**
 * Aviso de uma tela (Banner). O de sucesso some sozinho depois de alguns segundos; o de erro fica
 * até ser fechado ou substituído. No iOS o VoiceOver não lê regiões dinâmicas, então o aviso de
 * sucesso também é anunciado.
 */
export function useNotice(initial: Notice | null = null) {
  const [notice, setNotice] = useState<Notice | null>(initial);

  const showNotice = useCallback((next: Notice | null) => setNotice(next), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    if (notice?.kind !== 'success') return;
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(notice.text);

    const timer = setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNotice((current) => (current === notice ? null : current));
    }, SUCCESS_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  return { notice, showNotice, clearNotice };
}
