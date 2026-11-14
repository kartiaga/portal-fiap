import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { renderRouter } from 'expo-router/testing-library';

import { SUCCESS_NOTICE_MS } from '@/hooks/use-notice';
import { setAuthToken } from '@/lib/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);
const fetchMock = jest.fn();
const SELF_ID = '33333333-3333-4333-8333-333333333333';

function makeToken(role: string): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub: SELF_ID, role, exp })).toString('base64url');
  return `header.${payload}.signature`;
}

function response(status: number, body: unknown = {}) {
  return { ok: status < 400, status, json: async () => body };
}

function mockUsersApi(role: string) {
  let me = {
    id: SELF_ID,
    name: 'Admin FIAP',
    email: 'admin@fiap.com.br',
    role,
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
  };
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    const { pathname } = new URL(url);
    if (pathname === `/users/${SELF_ID}`) {
      if (init?.method === 'PUT') me = { ...me, ...JSON.parse(init.body as string) };
      return response(200, me);
    }
    return response(200, { items: [], nextCursor: null, hasMore: false });
  });
}

function puts() {
  return fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT');
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
});

describe('Conta', () => {
  it('mostra nome, e-mail e perfil, sem a linha "Perfil" repetida', async () => {
    mockUsersApi('ADMIN');
    store.getItemAsync.mockResolvedValue(makeToken('ADMIN'));
    await renderRouter('src/app', { initialUrl: '/account' });

    expect(await screen.findByText('Admin FIAP')).toBeOnTheScreen();
    expect(screen.getByText('admin@fiap.com.br')).toBeOnTheScreen();
    expect(screen.getByText('Administrador')).toBeOnTheScreen();
    expect(screen.queryByText('Perfil')).toBeNull();
    expect(screen.getByText(/^Sessão válida até /)).toBeOnTheScreen();
  });
});

describe('Editar meus dados', () => {
  it.each(['ADMIN', 'TEACHER'])('%s edita a própria conta e volta para a Conta com aviso', async (role) => {
    mockUsersApi(role);
    store.getItemAsync.mockResolvedValue(makeToken(role));
    await renderRouter('src/app', { initialUrl: '/account' });

    await fireEvent.press(await screen.findByRole('button', { name: 'Editar meus dados' }));

    expect(await screen.findByDisplayValue('Admin FIAP')).toBeOnTheScreen();
    expect(screen).toHavePathname('/account/edit');
    // A própria conta não tem zona de exclusão.
    expect(screen.queryByText('Excluir conta')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Admin Revisado');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByText('Seus dados foram atualizados.')).toBeOnTheScreen();
    expect(screen).toHavePathname('/account');
    expect(await screen.findByText('Admin Revisado')).toBeOnTheScreen();
    expect(JSON.parse(puts()[0][1].body as string)).toEqual({
      name: 'Admin Revisado',
      email: 'admin@fiap.com.br',
    });
  });

  it('o aviso de sucesso some sozinho depois de alguns segundos', async () => {
    mockUsersApi('TEACHER');
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    await renderRouter('src/app', { initialUrl: '/account' });

    await fireEvent.press(await screen.findByRole('button', { name: 'Editar meus dados' }));
    await fireEvent.changeText(await screen.findByLabelText('Nome'), 'Outro Nome');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText('Seus dados foram atualizados.');

    await act(async () => {
      jest.advanceTimersByTime(SUCCESS_NOTICE_MS);
    });

    await waitFor(() => expect(screen.queryByText('Seus dados foram atualizados.')).toBeNull());
  });

  it('estudante não abre "Meus dados" por link direto', async () => {
    mockUsersApi('STUDENT');
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT'));
    await renderRouter('src/app', { initialUrl: '/account/edit' });

    await waitFor(() => expect(screen).not.toHavePathname('/account/edit'));
    expect(screen.queryByLabelText('Nome')).toBeNull();
  });
});
