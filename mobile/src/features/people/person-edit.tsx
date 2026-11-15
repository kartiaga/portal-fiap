import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { Button } from '@/components/button';
import { DangerZone } from '@/components/danger-zone';
import { FormScreen } from '@/components/form-screen';
import { LoadingState, StateMessage } from '@/components/state-message';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api';
import { capitalize } from '@/lib/format';
import { setFlashNotice } from '@/lib/notice';
import { Spacing } from '@/theme';

import { deletePerson, getPerson, personError, updatePerson, type ListedRole } from './api';
import { peopleConfig } from './config';
import { PersonFormFields } from './form-fields';
import { hasErrors, validatePersonForm, type PersonFieldErrors } from './form-validation';
import { canManagePeople, canViewPeople } from './permissions';

type PersonEditProps = {
  /**
   * "Meus dados", aberto pela aba Conta: a própria conta, de qualquer perfil, sem exclusão. Sem
   * isso, é a conta aberta pela aba Pessoas (o id vem da rota), com a exclusão no fim da tela.
   */
  self?: boolean;
};

type LoadFailure = { message: string; recoverable: boolean };

/** Edição de uma conta de qualquer perfil, ou a do próprio usuário ("Meus dados"). */
export function PersonEdit({ self = false }: PersonEditProps) {
  const theme = useTheme();
  const { user } = useSession();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = self ? (user?.id ?? '') : params.id;
  // "Meus dados" é liberado a professor e administrador; editar outra conta, só ao administrador.
  const allowed = self ? canViewPeople(user?.role) : canManagePeople(user?.role);

  /** Perfil da conta aberta; só se sabe depois de carregar. */
  const [role, setRole] = useState<ListedRole | null>(null);
  const config = !self && role ? peopleConfig[role] : null;

  const [initial, setInitial] = useState({ name: '', email: '' });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadFailure, setLoadFailure] = useState<LoadFailure | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PersonFieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = loaded && (name !== initial.name || email !== initial.email || password !== '');
  const busy = saving || deleting;
  const { allowLeave } = useDiscardGuard(dirty && !busy);

  useEffect(() => {
    if (!allowed) return;
    let active = true;
    async function load() {
      try {
        const person = await getPerson(id);
        if (!active) return;
        setRole(person.role);
        setInitial({ name: person.name ?? '', email: person.email });
        setName(person.name ?? '');
        setEmail(person.email);
        setLoaded(true);
        setLoadFailure(null);
      } catch (caught) {
        if (!active) return;
        // Tentar de novo só ajuda em falha de rede ou do servidor; 403 e 404 pedem para voltar.
        const recoverable = !(caught instanceof ApiError && (caught.status === 403 || caught.status === 404));
        setLoadFailure({ message: personError(caught, 'load'), recoverable });
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [id, reloadKey, allowed]);

  if (!allowed) return <Redirect href="/" />;

  // Ninguém exclui a própria conta (a API também recusa).
  const selfDeleteBlocked = user?.id === id;

  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace(self ? '/account' : '/people');
  }

  async function handleSave() {
    if (busy || !loaded || !dirty) return;
    const errors = validatePersonForm(name, email, password, true);
    setFieldErrors(errors);
    setSaveError(null);
    if (hasErrors(errors)) return;

    setSaving(true);
    try {
      await updatePerson(id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        ...(password ? { password } : {}),
      });
      setFlashNotice({
        kind: 'success',
        text: config ? `${capitalize(config.singular)} atualizado com sucesso.` : 'Seus dados foram atualizados.',
      });
      allowLeave();
      leave();
    } catch (caught) {
      setSaveError(personError(caught, 'save'));
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!config) return;
    setDeleting(true);
    setSaveError(null);
    try {
      await deletePerson(id);
      setFlashNotice({ kind: 'success', text: `${capitalize(config.singular)} excluído com sucesso.` });
      allowLeave();
      leave();
    } catch (caught) {
      setSaveError(personError(caught, 'delete'));
      setDeleting(false);
    }
  }

  function confirmDelete() {
    if (!config) return;
    Alert.alert(
      `Excluir ${config.singular}?`,
      `Esta ação remove a conta de ${name || email}. Ela não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => void handleDelete() },
      ],
    );
  }

  if (loading) return <LoadingState label="Carregando usuário" />;

  if (!loaded) {
    const recoverable = loadFailure?.recoverable ?? true;
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <StateMessage
          tone="error"
          message={loadFailure?.message ?? ''}
          actionLabel={recoverable ? 'Tentar novamente' : 'Voltar'}
          onAction={
            recoverable
              ? () => {
                  setLoading(true);
                  setReloadKey((value) => value + 1);
                }
              : leave
          }
        />
      </View>
    );
  }

  return (
    <FormScreen>
      {config ? <Stack.Screen options={{ title: `Editar ${config.singular}` }} /> : null}
      <View style={styles.form}>
        <PersonFormFields
          editing
          self={self}
          name={name}
          email={email}
          password={password}
          errors={fieldErrors}
          disabled={busy}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={() => void handleSave()}
        />
        {saveError ? <Banner text={saveError} /> : null}
        <Button
          label="Salvar alterações"
          size="large"
          onPress={() => void handleSave()}
          loading={saving}
          disabled={deleting || !dirty}
        />
      </View>

      {config ? (
        selfDeleteBlocked ? (
          <DangerZone title="Excluir conta" description="Você não pode excluir sua própria conta." />
        ) : (
          <DangerZone
            title="Excluir conta"
            description="A pessoa perde o acesso ao app. Não é possível excluir quem tem postagens."
            buttonLabel={`Excluir ${config.singular}`}
            accessibilityLabel={`Excluir ${initial.email}`}
            loading={deleting}
            disabled={saving}
            onPress={confirmDelete}
          />
        )
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    gap: Spacing.four,
  },
});
