import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Button } from '@/components/button';
import { colors, radius } from '@/theme';

import { getPerson, personError, updatePerson, type PersonRole } from './api';
import { peopleConfig } from './config';
import { PersonFormFields } from './form-fields';
import { validatePersonForm } from './form-validation';
import { canManagePeople } from './permissions';

export function PersonEdit({ role }: { role: PersonRole }) {
  const { user } = useSession();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const config = peopleConfig[role];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canManagePeople(user?.role)) return;
    let active = true;
    async function load() {
      try {
        const person = await getPerson(id);
        if (!active) return;
        if (person.role !== role) {
          setLoadError('Este usuário não pertence a esta lista.');
          return;
        }
        setName(person.name ?? '');
        setEmail(person.email);
        setLoaded(true);
        setLoadError(null);
      } catch (caught) {
        if (active) setLoadError(personError(caught, 'load'));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id, role, reloadKey, user?.role]);

  if (!canManagePeople(user?.role)) return <Redirect href="/" />;

  async function handleSave() {
    if (saving || !loaded) return;
    const validationError = validatePersonForm(name, email, password, true);
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      await updatePerson(id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        ...(password ? { password } : {}),
      });
      router.replace({ pathname: config.listPath, params: { notice: `${config.singular} atualizado com sucesso.` } });
    } catch (caught) {
      setSaveError(personError(caught, 'save'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: `Editar ${config.singular}` }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title} accessibilityRole="header">Editar {config.singular}</Text>
        {loading ? <ActivityIndicator color={colors.red600} accessibilityLabel="Carregando usuário" /> : null}
        {loadError ? (
          <View style={styles.alert} accessibilityRole="alert">
            <Text style={styles.alertText}>{loadError}</Text>
            <Button label="Tentar novamente" variant="secondary" onPress={() => { setLoaded(false); setLoading(true); setReloadKey((value) => value + 1); }} />
          </View>
        ) : null}
        {loaded && !loading ? (
          <View style={styles.form}>
            <PersonFormFields editing name={name} email={email} password={password} onNameChange={setName} onEmailChange={setEmail} onPasswordChange={setPassword} />
            <Text style={styles.hint}>Deixe a nova senha em branco para manter a atual.</Text>
            {saveError ? <View style={styles.alert} accessibilityRole="alert"><Text style={styles.alertText}>{saveError}</Text></View> : null}
            <Button label="Salvar alterações" onPress={handleSave} loading={saving} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper050 },
  content: { padding: 24, gap: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink900 },
  form: { gap: 16 },
  hint: { fontSize: 13, color: colors.ink500 },
  alert: { padding: 12, gap: 12, backgroundColor: colors.errorBg, borderColor: colors.errorBorder, borderWidth: 1, borderRadius: radius.s },
  alertText: { color: colors.error },
});
