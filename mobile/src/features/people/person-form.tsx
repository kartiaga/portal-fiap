import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Banner } from '@/components/banner';
import { Button } from '@/components/button';
import { FormScreen } from '@/components/form-screen';
import { ModalCancel } from '@/components/modal-cancel';
import { SegmentedControl } from '@/components/segmented-control';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { useTheme } from '@/hooks/use-theme';
import { capitalize } from '@/lib/format';
import { setFlashNotice } from '@/lib/notice';
import { Spacing, Typography } from '@/theme';

import { createPerson, personError, type PersonRole } from './api';
import { CREATABLE_ROLES, peopleConfig } from './config';
import { PersonFormFields } from './form-fields';
import { hasErrors, validatePersonForm, type PersonFieldErrors } from './form-validation';
import { canManagePeople } from './permissions';

const ROLE_OPTIONS = CREATABLE_ROLES.map((role) => ({
  value: role,
  label: capitalize(peopleConfig[role].singular),
}));

/**
 * Cadastro de professor ou estudante, aberto em modal: o perfil é escolhido no topo (já vem o do
 * filtro da lista, quando há). Dando certo, volta para a aba Pessoas com o aviso. Sair pelo
 * "Cancelar" do cabeçalho com algo digitado pede confirmação.
 */
export function PersonForm({ initialRole = 'TEACHER' }: { initialRole?: PersonRole }) {
  const theme = useTheme();
  const { user } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<PersonRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<PersonFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const config = peopleConfig[role];
  const dirty = name !== '' || email !== '' || password !== '';
  const { guarding, allowLeave } = useDiscardGuard(dirty && !submitting);

  if (!canManagePeople(user?.role)) return <Redirect href="/" />;

  function leave() {
    if (router.canGoBack()) router.back();
    else router.replace('/people');
  }

  async function handleSubmit() {
    if (submitting) return;
    const errors = validatePersonForm(name, email, password);
    setFieldErrors(errors);
    setError(null);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await createPerson({ name: name.trim(), email: email.trim().toLowerCase(), password, role });
      setFlashNotice({ kind: 'success', text: `${capitalize(config.singular)} cadastrado com sucesso.` });
      allowLeave();
      leave();
    } catch (caught) {
      setError(personError(caught, 'save'));
      setSubmitting(false);
    }
  }

  return (
    <FormScreen>
      <ModalCancel guarding={guarding} onCancel={leave} />
      <View style={styles.form}>
        <Text style={[Typography.callout, { color: theme.textSecondary }]}>
          A pessoa entra no app com o e-mail e a senha definidos aqui.
        </Text>
        <SegmentedControl
          accessibilityLabel="Perfil"
          options={ROLE_OPTIONS}
          value={role}
          onChange={setRole}
        />
        <PersonFormFields
          name={name}
          email={email}
          password={password}
          errors={fieldErrors}
          disabled={submitting}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={() => void handleSubmit()}
        />
        {error ? <Banner text={error} /> : null}
        <Button
          label={`Cadastrar ${config.singular}`}
          size="large"
          onPress={() => void handleSubmit()}
          loading={submitting}
        />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.four,
  },
});
