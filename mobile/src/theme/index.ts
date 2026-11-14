/**
 * Tokens do design system do app. As regras de uso estão em `docs/design-system.md`;
 * mude os dois juntos. Telas e componentes leem as cores por `useTheme()`, nunca daqui direto.
 */
import { Platform, StyleSheet } from 'react-native';

export const Colors = {
  light: {
    text: '#19181C',
    textSecondary: '#5B5964',
    /** Só placeholder e conteúdo desabilitado: não passa em contraste para texto de leitura. */
    textTertiary: '#76717F',

    background: '#F6F4F5',
    surface: '#FFFFFF',
    backgroundElement: '#EFEBEC',
    backgroundSelected: '#E6E3EA',
    /** Bordas de cartão e divisores (decorativos). */
    border: '#E6E3EA',
    /** Linha de base dos campos: 3:1 sobre o fundo e a superfície (WCAG 1.4.11). */
    borderInput: '#8A8694',
    /** Opção escolhida do controle segmentado, mais clara que o trilho. */
    segmentSelected: '#FFFFFF',

    /** Vermelho FIAP: preenchimento de ação primária e cor de destaque. */
    tint: '#E4002B',
    tintPressed: '#A3001F',
    onTint: '#FFFFFF',
    /** Vermelho usado como texto ou ícone sobre o fundo. */
    tintText: '#C4102E',
    tintSoft: '#FCE8EB',

    success: '#1E7A50',
    successSoft: '#E4F3EB',
    info: '#2352A0',
    infoSoft: '#E4ECF9',
    danger: '#B3241C',
    dangerSoft: '#FDF0EF',

    /** Fundo escurecido atrás de diálogos. */
    scrim: 'rgba(25, 24, 28, 0.55)',
    /** Traços decorativos sobre o topo vermelho das telas de entrada. */
    onTintDecoration: 'rgba(255, 255, 255, 0.16)',
  },
  dark: {
    text: '#F6F4F5',
    textSecondary: '#B1ADBB',
    textTertiary: '#7D7989',

    background: '#121114',
    surface: '#1D1C21',
    backgroundElement: '#26252B',
    backgroundSelected: '#33313A',
    border: '#33313A',
    borderInput: '#706C7A',
    segmentSelected: '#46444F',

    tint: '#E4002B',
    tintPressed: '#C4102E',
    onTint: '#FFFFFF',
    tintText: '#FF4D63',
    tintSoft: '#3A1219',

    success: '#5CC794',
    successSoft: '#12301F',
    info: '#7FA8F0',
    infoSoft: '#14233F',
    danger: '#FF7A70',
    dangerSoft: '#3A1512',

    scrim: 'rgba(0, 0, 0, 0.6)',
    onTintDecoration: 'rgba(255, 255, 255, 0.16)',
  },
} as const;

export type Theme = { [K in keyof typeof Colors.light]: string };
export type ThemeColor = keyof Theme;

/** Monoespaçada do sistema, usada só no estilo `meta` (datas, contadores). */
export const MonoFont = Platform.select({ ios: 'Menlo', default: 'monospace' });

/** Escala tipográfica sobre a fonte do sistema. */
export const Typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  /** Título de uma postagem aberta. */
  article: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  /** Texto corrido de uma postagem aberta: maior e mais espaçado para leitura longa. */
  reading: { fontSize: 17, lineHeight: 28, fontWeight: '400' },
  callout: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  meta: { fontSize: 12, lineHeight: 16, fontWeight: '500', fontFamily: MonoFont },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 6,
  medium: 12,
  large: 20,
  pill: 999,
} as const;

/** Área de toque mínima (44 pt no iOS, 48 dp no Android). */
export const MinTouchSize = Platform.select({ ios: 44, default: 48 });

/** Tamanhos de ícone. `xlarge` só na marca circular dos estados vazios. */
export const IconSize = {
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 28,
} as const;

/** Diâmetros do avatar: cartão de postagem, linha de lista e cartão de perfil. */
export const AvatarSize = {
  small: 32,
  medium: 40,
  large: 64,
} as const;

/** Alturas mínimas de controle. `small` cabe em cabeçalho e cartão (com `hitSlop` chega a 44). */
export const ControlHeight = {
  small: 36,
  medium: MinTouchSize,
  /** Campo de texto de formulário. */
  field: 48,
  large: 56,
} as const;

/** Altura mínima de uma linha de lista agrupada (ex.: aba Conta). */
export const RowHeight = 52;

export const BorderWidth = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  strong: 2,
} as const;

/** Espaçamento entre letras: `wide` nas marcas em caixa alta ("PORTAL"), `tight` na marca grande "FIAP". */
export const Tracking = {
  wide: 2,
  tight: -1,
} as const;

/** Largura máxima do conteúdo em telas largas (tablet). */
export const MaxContentWidth = 720;
