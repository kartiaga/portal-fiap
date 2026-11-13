export function validatePersonForm(name: string, email: string, password: string, editing = false): string | null {
  if (name.trim().length < 2) return 'Informe um nome com pelo menos 2 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Informe um e-mail válido.';
  if ((!editing || password.length > 0) && password.length < 8) {
    return 'A senha deve ter pelo menos 8 caracteres.';
  }
  return null;
}
