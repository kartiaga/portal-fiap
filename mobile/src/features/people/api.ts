import { ApiError, apiFetch } from '@/lib/api';

export type PersonRole = 'TEACHER' | 'STUDENT';

export type Person = {
  id: string;
  email: string;
  name: string | null;
  role: PersonRole | 'ADMIN';
  createdAt: string;
  updatedAt: string;
};

export type PeoplePage = {
  items: Person[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function createPerson(input: {
  name: string;
  email: string;
  password: string;
  role: PersonRole;
}): Promise<void> {
  await apiFetch<string>('/users', { method: 'POST', body: JSON.stringify(input) });
}

export function listPeoplePage(role: PersonRole, cursor?: string): Promise<PeoplePage> {
  const params = new URLSearchParams({ role, limit: '20' });
  if (cursor) params.set('cursor', cursor);
  return apiFetch<PeoplePage>(`/users?${params.toString()}`);
}

export function getPerson(id: string): Promise<Person> {
  return apiFetch<Person>(`/users/${encodeURIComponent(id)}`);
}

export function updatePerson(id: string, input: {
  name: string;
  email: string;
  password?: string;
}): Promise<Person> {
  return apiFetch<Person>(`/users/${encodeURIComponent(id)}`, {
    method: 'PUT', body: JSON.stringify(input),
  });
}

export async function deletePerson(id: string): Promise<void> {
  await apiFetch<{ message: string }>(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function personError(error: unknown, action: 'load' | 'save' | 'delete'): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return error.message;
    if (error.status === 403) return 'Você não tem permissão para gerenciar este usuário.';
    if (error.status === 404) return 'Usuário não encontrado. Atualize a lista.';
    if (error.status === 409) {
      return action === 'delete'
        ? 'Não é possível excluir este usuário porque ele possui postagens.'
        : 'Este e-mail já está em uso.';
    }
    if (error.status === 400) return 'Confira os dados informados e tente novamente.';
  }
  return action === 'load'
    ? 'Não foi possível carregar os usuários.'
    : action === 'delete'
      ? 'Não foi possível excluir o usuário.'
      : 'Não foi possível salvar os dados.';
}
