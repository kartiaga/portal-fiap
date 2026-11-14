import { useLocalSearchParams } from 'expo-router';

import { parseListedRole } from '@/features/people/config';
import { PersonForm } from '@/features/people/person-form';

/** Cadastro de pessoa, em modal. O perfil do filtro da lista já vem escolhido (administrador não se cadastra). */
export default function CreatePersonScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const parsed = parseListedRole(role);

  return <PersonForm initialRole={parsed === 'TEACHER' || parsed === 'STUDENT' ? parsed : undefined} />;
}
