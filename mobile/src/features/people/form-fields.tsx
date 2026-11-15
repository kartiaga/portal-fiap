import { useRef } from 'react';

import { TextField, type TextFieldHandle } from '@/components/text-field';

import type { PersonFieldErrors } from './form-validation';

type Props = {
  name: string;
  email: string;
  password: string;
  errors: PersonFieldErrors;
  disabled?: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  editing?: boolean;
  /** A própria conta ("Meus dados"): o sistema pode sugerir e salvar a nova senha. */
  self?: boolean;
};

export function PersonFormFields({
  name,
  email,
  password,
  errors,
  disabled = false,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  editing = false,
  self = false,
}: Props) {
  const emailRef = useRef<TextFieldHandle>(null);
  const passwordRef = useRef<TextFieldHandle>(null);

  return (
    <>
      <TextField
        label="Nome"
        icon="person-outline"
        value={name}
        onChangeText={onNameChange}
        error={errors.name}
        editable={!disabled}
        placeholder="Nome completo"
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
        label="E-mail"
        icon="mail-outline"
        value={email}
        onChangeText={onEmailChange}
        error={errors.email}
        editable={!disabled}
        placeholder="usuario@fiap.com.br"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label={editing ? 'Nova senha (opcional)' : 'Senha'}
        icon="lock-closed-outline"
        value={password}
        onChangeText={onPasswordChange}
        error={errors.password}
        hint={editing ? 'Deixe em branco para manter a senha atual.' : 'Pelo menos 8 caracteres.'}
        editable={!disabled}
        secureTextEntry
        autoCapitalize="none"
        // Para outra pessoa, nada de sugerir ou salvar a senha; para a própria conta, pode.
        autoComplete={self ? 'new-password' : 'off'}
        textContentType={self ? 'newPassword' : 'none'}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
    </>
  );
}
