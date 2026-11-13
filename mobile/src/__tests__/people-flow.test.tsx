import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { renderRouter } from 'expo-router/testing-library';

import { setAuthToken } from '@/lib/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);
const fetchMock = jest.fn();
const teacher = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Maria Silva',
  email: 'maria@fiap.com.br',
  role: 'TEACHER',
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
};

function response(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

beforeEach(() => {
  jest.clearAllMocks();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.getItemAsync.mockResolvedValue(`header.${Buffer.from(JSON.stringify({
    sub: '11111111-1111-4111-8111-111111111111',
    role: 'TEACHER',
    exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64url')}.signature`);
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
  fetchMock.mockImplementation((url: string, init?: RequestInit) => {
    const request = new URL(url);
    if (request.pathname === '/users' && request.searchParams.get('role') === 'TEACHER') {
      return Promise.resolve(response({ items: [teacher], nextCursor: null, hasMore: false }));
    }
    if (request.pathname === `/users/${teacher.id}` && init?.method === 'DELETE') {
      return Promise.resolve(response({ message: 'User deleted successfully' }));
    }
    if (request.pathname === `/users/${teacher.id}` && init?.method === 'PUT') {
      return Promise.resolve(response({ ...teacher, name: 'Maria Souza' }));
    }
    if (request.pathname === `/users/${teacher.id}`) return Promise.resolve(response(teacher));
    throw new Error(`Unexpected request: ${url}`);
  });
});

it('consulta professores no backend e exige confirmação antes de excluir', async () => {
  await renderRouter('src/app', { initialUrl: '/teachers' });

  expect(await screen.findByText('Maria Silva')).toBeOnTheScreen();
  expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('role')).toBe('TEACHER');

  await fireEvent.press(screen.getByRole('button', { name: 'Excluir maria@fiap.com.br' }));
  expect(screen.getByText('Excluir professor?')).toBeOnTheScreen();
  expect(fetchMock).toHaveBeenCalledTimes(1);

  await fireEvent.press(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(fetchMock.mock.calls[1][1].method).toBe('DELETE');
  expect(await screen.findByText('professor excluído com sucesso.')).toBeOnTheScreen();
});

it('abre a edição pela lista, carrega os dados reais e salva sem alterar o papel', async () => {
  await renderRouter('src/app', { initialUrl: '/teachers' });
  await screen.findByText('Maria Silva');

  await fireEvent.press(screen.getByRole('button', { name: 'Editar maria@fiap.com.br' }));

  expect(await screen.findByDisplayValue('Maria Silva')).toBeOnTheScreen();
  expect(screen.getByDisplayValue('maria@fiap.com.br')).toBeOnTheScreen();
  expect(fetchMock.mock.calls.some(([url]) => new URL(url).pathname === `/users/${teacher.id}`)).toBe(true);

  await fireEvent.changeText(screen.getByLabelText('Nome'), 'Maria Souza');
  await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));

  await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init.method === 'PUT')).toBe(true));
  const put = fetchMock.mock.calls.find(([, init]) => init.method === 'PUT');
  expect(JSON.parse(put?.[1].body as string)).toEqual({ name: 'Maria Souza', email: 'maria@fiap.com.br' });
  expect(await screen.findByText('professor atualizado com sucesso.')).toBeOnTheScreen();
});
