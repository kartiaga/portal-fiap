import { TextField } from '@/components/text-field';

type Props = {
  name: string;
  email: string;
  password: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  editing?: boolean;
};

export function PersonFormFields({
  name, email, password, onNameChange, onEmailChange, onPasswordChange, editing = false,
}: Props) {
  return (
    <>
      <TextField label="Nome" value={name} onChangeText={onNameChange} placeholder="Nome completo" autoComplete="name" />
      <TextField label="E-mail" value={email} onChangeText={onEmailChange} placeholder="usuario@fiap.com.br" autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" />
      <TextField label={editing ? 'Nova senha (opcional)' : 'Senha'} value={password} onChangeText={onPasswordChange} secureTextEntry autoCapitalize="none" autoComplete="new-password" />
    </>
  );
}
