import { useColorScheme } from 'react-native';

import { Colors, type Theme } from '@/theme';

/** Cores do tema atual. O app segue o tema do sistema (claro ou escuro). */
export function useTheme(): Theme {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
