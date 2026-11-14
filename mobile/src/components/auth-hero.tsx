import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { Spacing, Tracking, Typography } from '@/theme';

type AuthHeroProps = {
  /** Fração da altura da tela ocupada pelo topo. */
  ratio: number;
  /** Piso para telas baixas. */
  minHeight: number;
  /**
   * `large`: marca grande ("PORTAL" + "FIAP") no pé do vermelho, para a abertura.
   * `small` (padrão): só "PORTAL FIAP" pequeno no alto, para o login, que precisa do espaço.
   */
  brand?: 'large' | 'small';
};

const RINGS = [1, 1.6, 2.2, 2.8];
/** Quanto o arco sobe a partir da base do topo; maior que a queda do arco na borda direita. */
const CURVE_HEIGHT = 72;
const CURVE_SCALE = 3;
/** Marca grande da abertura; cai para o tamanho menor em topos baixos (telas pequenas). */
const WORDMARK_SIZE = 56;
const WORDMARK_SIZE_COMPACT = 40;
const COMPACT_HERO_HEIGHT = 360;
/** Traço dos anéis: um pouco mais grosso que o contorno fino, para aparecer sobre o vermelho. */
const RING_STROKE = 1.5;

/**
 * Topo vermelho das telas de entrada (boas-vindas e login). É o único lugar em que o vermelho
 * preenche uma área grande. Os anéis e a curva de transição são Views, sem imagem: a curva usa a
 * cor de fundo da tela e por isso acompanha o tema claro e escuro.
 */
export function AuthHero({ ratio, minHeight, brand = 'small' }: AuthHeroProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height: windowHeight } = useWindowDimensions();
  const height = Math.max(minHeight, windowHeight * ratio);
  const ringBase = width * 0.42;
  const large = brand === 'large';
  // Na abertura, os anéis emolduram a marca (perto do meio do vermelho), longe da barra de status.
  const ringCenterY = large ? height * 0.45 : insets.top + height * 0.18;
  const wordmarkSize = height < COMPACT_HERO_HEIGHT ? WORDMARK_SIZE_COMPACT : WORDMARK_SIZE;

  return (
    <View
      accessible={false}
      style={[styles.hero, { backgroundColor: theme.tint, height, paddingTop: insets.top }]}>
      {/* O topo é vermelho nos dois temas, então a barra de status é sempre clara. */}
      <StatusBar style="light" />

      {RINGS.map((scale) => {
        const size = ringBase * scale;
        return (
          <View
            key={scale}
            style={[
              styles.ring,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                right: -size / 2 + width * 0.08,
                top: ringCenterY - size / 2,
                borderColor: theme.onTintDecoration,
              },
            ]}
          />
        );
      })}

      {large ? (
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[styles.wordmarkLarge, { bottom: CURVE_HEIGHT + Spacing.four }]}>
          <Text style={[Typography.meta, styles.tracked, { color: theme.onTint }]}>PORTAL</Text>
          <Text
            maxFontSizeMultiplier={1.2}
            style={[
              styles.fiap,
              { color: theme.onTint, fontSize: wordmarkSize, lineHeight: wordmarkSize },
            ]}>
            FIAP
          </Text>
        </View>
      ) : (
        <Text style={[Typography.meta, styles.tracked, styles.wordmarkSmall, { color: theme.onTint }]}>
          PORTAL FIAP
        </Text>
      )}

      {/* Um círculo grande, deslocado para a esquerda, deixa só um arco assimétrico à mostra. */}
      <View
        style={[
          styles.curve,
          {
            width: width * CURVE_SCALE,
            height: width * CURVE_SCALE,
            borderRadius: (width * CURVE_SCALE) / 2,
            left: width * 0.3 - (width * CURVE_SCALE) / 2,
            top: height - CURVE_HEIGHT,
            backgroundColor: theme.background,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderWidth: RING_STROKE,
  },
  tracked: {
    letterSpacing: Tracking.wide,
  },
  wordmarkSmall: {
    // Abaixo da área do botão de voltar do login.
    marginTop: Spacing.six,
    marginLeft: Spacing.four,
  },
  wordmarkLarge: {
    position: 'absolute',
    left: Spacing.four,
    gap: Spacing.one,
  },
  fiap: {
    fontWeight: '800',
    letterSpacing: Tracking.tight,
  },
  curve: {
    position: 'absolute',
  },
});
