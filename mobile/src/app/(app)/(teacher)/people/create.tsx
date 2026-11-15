import { useLocalSearchParams } from 'expo-router';

import { parseListedRole } from '@/features/people/config';
import { PersonForm } from '@/features/people/person-form';

/** Cadastro de pessoa, em modal. O perfil do filtro da lista já vem escolhido. */
export default function CreatePersonScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();

  return <PersonForm initialRole={parseListedRole(role)} />;
}
