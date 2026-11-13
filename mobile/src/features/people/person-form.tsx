import { Redirect, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Button } from '@/components/button';
import { colors, radius } from '@/theme';

import { createPerson, personError, type PersonRole } from './api';
import { peopleConfig } from './config';
import { PersonFormFields } from './form-fields';
import { validatePersonForm } from './form-validation';
import { canManagePeople } from './permissions';

export function PersonForm({ role }: { role: PersonRole }) {
  const { user } = useSession();
  const router = useRouter();
  const config = peopleConfig[role];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!canManagePeople(user?.role)) return <Redirect href="/" />;

  async function handleSubmit() {
    if (submitting) return;
    const validationError = validatePersonForm(name, email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await createPerson({ name: name.trim(), email: email.trim().toLowerCase(), password, role });
      router.replace({ pathname: config.listPath, params: { notice: `${config.singular} cadastrado com sucesso.` } });
    } catch (caught) {
      setError(personError(caught, 'save'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: `Cadastrar ${config.singular}` }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title} accessibilityRole="header">Cadastrar {config.singular}</Text>
        <Text style={styles.description}>Preencha os dados de acesso e identificação.</Text>
        <View style={styles.form}>
          <PersonFormFields name={name} email={email} password={password} onNameChange={setName} onEmailChange={setEmail} onPasswordChange={setPassword} />
          {error ? <View style={styles.alert} accessibilityRole="alert"><Text style={styles.alertText}>{error}</Text></View> : null}
          <Button label={`Cadastrar ${config.singular}`} onPress={handleSubmit} loading={submitting} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper050 },
  content: { padding: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink900 },
  description: { fontSize: 15, color: colors.ink500, marginBottom: 16 },
  form: { gap: 16 },
  alert: { padding: 12, backgroundColor: colors.errorBg, borderColor: colors.errorBorder, borderWidth: 1, borderRadius: radius.s },
  alertText: { color: colors.error },
});
