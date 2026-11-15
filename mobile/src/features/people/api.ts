import { ApiError, apiFetch } from '@/lib/api';

/** Perfis que o administrador cadastra (todos, inclusive outro administrador). */
export type PersonRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

/** Perfis que aparecem nas listas e no filtro. */
export type ListedRole = PersonRole;

export type Person = {
  id: string;
  email: string;
  name: string | null;
  role: ListedRole;
  /** Endereço público da foto de perfil; `null` ou ausente sem foto. */
  avatarUrl?: string | null;
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

/**
 * Sem `role`, a API devolve todos os perfis que o usuário pode ver (professor: professores e
 * estudantes; administrador: todos). `search` filtra por nome ou e-mail (busca parcial na API).
 */
export function listPeoplePage(
  role?: ListedRole,
  cursor?: string | null,
  search?: string,
): Promise<PeoplePage> {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  params.set('limit', '20');
  if (cursor) params.set('cursor', cursor);
  if (search) params.set('search', search);
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
