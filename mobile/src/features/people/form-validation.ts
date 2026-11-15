export type PersonFieldErrors = { name?: string; email?: string; password?: string };

/** Mesmas regras do cadastro na API. Na edição, a senha só é validada se algo for digitado. */
export function validatePersonForm(
  name: string,
  email: string,
  password: string,
  editing = false,
): PersonFieldErrors {
  const errors: PersonFieldErrors = {};
  if (name.trim().length < 2) errors.name = 'Informe um nome com pelo menos 2 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Informe um e-mail válido.';
  if ((!editing || password.length > 0) && password.length < 8) {
    errors.password = 'A senha deve ter pelo menos 8 caracteres.';
  }
  return errors;
}

export function hasErrors(errors: PersonFieldErrors): boolean {
  return Boolean(errors.name || errors.email || errors.password);
}
