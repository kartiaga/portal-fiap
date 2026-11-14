import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-context';
import { AccentRule } from '@/components/accent-rule';
import { AuthHero } from '@/components/auth-hero';
import { Banner } from '@/components/banner';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { TextField, type TextFieldHandle } from '@/components/text-field';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api';
import { IconSize, MaxContentWidth, MinTouchSize, Spacing, Typography } from '@/theme';

const MIN_PASSWORD_LENGTH = 8;
const HERO_RATIO = 0.3;
const HERO_MIN_HEIGHT = 200;

type FieldErrors = { email?: string; password?: string };

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Informe um e-mail válido.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return errors;
}

function getLoginError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'E-mail ou senha incorretos.';
    if (error.status === 0) return error.message;
  }
  return 'Não foi possível entrar. Tente novamente.';
}

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, endReason } = useSession();
  const passwordRef = useRef<TextFieldHandle>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Aviso de sessão expirada: some ao tentar entrar de novo, para não competir com o erro.
  const [showExpired, setShowExpired] = useState(endReason === 'expired');

  async function handleSubmit() {
    if (submitting) return;

    const normalizedEmail = email.trim();
    const errors = validate(normalizedEmail, password);
    setFieldErrors(errors);
    setFormError(null);
    setShowExpired(false);
    if (errors.email || errors.password) return;

    setSubmitting(true);
    try {
      await signIn(normalizedEmail, password);
      // Com a sessão criada, o guard do layout raiz troca esta tela pela área logada.
    } catch (caught) {
      setFormError(getLoginError(caught));
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never">
          <AuthHero ratio={HERO_RATIO} minHeight={HERO_MIN_HEIGHT} />

          {router.canGoBack() ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              hitSlop={Spacing.two}
              onPress={() => router.back()}
              style={[styles.back, { top: insets.top + Spacing.two }]}>
              <Icon name="chevron-back" size={IconSize.large} color={theme.onTint} />
            </Pressable>
          ) : null}

          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.four) }]}>
            <View style={styles.header}>
              <Text accessibilityRole="header" style={[Typography.display, { color: theme.text }]}>
                Entrar
              </Text>
              <AccentRule />
              <Text style={[Typography.body, { color: theme.textSecondary }]}>
                Use seu e-mail institucional e sua senha.
              </Text>
            </View>

            {showExpired ? (
              <Banner kind="info" text="Sua sessão expirou. Entre novamente para continuar." />
            ) : null}

            <View style={styles.form}>
              <TextField
                label="E-mail"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                error={fieldErrors.email}
                editable={!submitting}
                placeholder="voce@fiap.com.br"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                textContentType="username"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <TextField
                ref={passwordRef}
                label="Senha"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                error={fieldErrors.password}
                editable={!submitting}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
              />

              {formError ? <Banner text={formError} /> : null}
            </View>

            <Button label="Entrar" size="large" onPress={handleSubmit} loading={submitting} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  back: {
    position: 'absolute',
    left: Spacing.three,
    minWidth: MinTouchSize,
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.two,
  },
  form: {
    gap: Spacing.four,
  },
});
