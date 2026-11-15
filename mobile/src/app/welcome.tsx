import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentRule } from '@/components/accent-rule';
import { AuthHero } from '@/components/auth-hero';
import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { ControlHeight, IconSize, MaxContentWidth, Spacing, Typography } from '@/theme';

const HERO_RATIO = 0.55;
const HERO_MIN_HEIGHT = 300;
const CONTINUE_SIZE = ControlHeight.large;

/** Primeira tela de quem não tem sessão. Só apresenta o app e leva ao login. */
export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AuthHero ratio={HERO_RATIO} minHeight={HERO_MIN_HEIGHT} brand="large" />

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.four) }]}>
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={[Typography.display, { color: theme.text }]}>
            {/* Espaço inquebrável: a marca não fica sozinha na segunda linha. */}
            Boas-vindas ao Portal{'\u00A0'}FIAP
          </Text>
          <AccentRule />
          <Text style={[Typography.body, { color: theme.textSecondary }]}>
            Avisos e materiais da escola, num só lugar.
          </Text>
        </View>

        {/* Controle próprio de propósito: é navegação, não ação de formulário. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continuar"
          onPress={() => router.push('/login')}
          style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
          testID="welcome-continue">
          <Text style={[Typography.headline, { color: theme.text }]}>Continuar</Text>
          <View style={[styles.arrow, { backgroundColor: theme.tint }]}>
            <Icon name="arrow-forward" size={IconSize.large} color={theme.onTint} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
  },
  copy: {
    gap: Spacing.three,
  },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: Spacing.three,
    minHeight: CONTINUE_SIZE,
  },
  arrow: {
    width: CONTINUE_SIZE,
    height: CONTINUE_SIZE,
    borderRadius: CONTINUE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
