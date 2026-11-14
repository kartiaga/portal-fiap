import { PersonEdit } from '@/features/people/person-edit';

/** "Meus dados": professor ou administrador edita a própria conta, aberto pela aba Conta. */
export default function EditOwnAccountScreen() {
  return <PersonEdit self />;
}
