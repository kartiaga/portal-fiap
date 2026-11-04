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

function makeToken(role: string, secondsToExpire = 3600): string {
  const exp = Math.floor(Date.now() / 1000) + secondsToExpire;
  const payload = Buffer.from(JSON.stringify({ sub: 'id-1', role, exp })).toString('base64url');
  return `header.${payload}.signature`;
}

function renderApp(initialUrl = '/') {
  return renderRouter('src/app', { initialUrl });
}

beforeEach(() => {
  jest.clearAllMocks();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.getItemAsync.mockResolvedValue(null);
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
});

async function fillLogin(email: string, password: string) {
  await fireEvent.changeText(await screen.findByLabelText('E-mail'), email);
  await fireEvent.changeText(screen.getByLabelText('Senha'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
}

describe('sem sessão', () => {
  it.each(['/', '/admin'])('redireciona %s para o login', async (url) => {
    await renderApp(url);
    expect(await screen.findByLabelText('Senha')).toBeOnTheScreen();
    expect(screen.queryByText('Página administrativa de postagens.')).toBeNull();
  });

  it('descarta token expirado salvo no aparelho', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER', -10));
    await renderApp('/admin');

    expect(await screen.findByLabelText('Senha')).toBeOnTheScreen();
    expect(store.deleteItemAsync).toHaveBeenCalled();
  });
});

describe('login', () => {
  it('valida os campos sem chamar a API', async () => {
    await renderApp();
    await fillLogin('invalido', '12345678');

    expect(await screen.findByText('Informe um e-mail válido.')).toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mostra erro para credenciais recusadas e continua no login', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    await renderApp();
    await fillLogin('ana@fiap.com.br', 'senha-errada');

    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeOnTheScreen();
    expect(store.setItemAsync).not.toHaveBeenCalled();
  });

  it('salva o token e entra no app', async () => {
    const token = makeToken('TEACHER');
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ token }) });
    await renderApp();
    await fillLogin(' ana@fiap.com.br ', '12345678');

    expect(await screen.findByText('Perfil: Professor(a)')).toBeOnTheScreen();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).email).toBe('ana@fiap.com.br');
    expect(store.setItemAsync).toHaveBeenCalledWith(expect.any(String), token);
  });
});

describe('com sessão', () => {
  it('permite a professor acessar a administração', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    await renderApp('/admin');
    expect(await screen.findByText('Página administrativa de postagens.')).toBeOnTheScreen();
  });

  it('volta para a tela inicial a partir da administração, mesmo sem histórico', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    await renderApp('/admin');

    await fireEvent.press(await screen.findByRole('button', { name: 'Voltar' }));

    expect(await screen.findByText('Perfil: Professor(a)')).toBeOnTheScreen();
  });

  it('abre a administração pelo botão da tela inicial e volta', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    await renderApp();

    await fireEvent.press(await screen.findByRole('button', { name: 'Administrar postagens' }));
    expect(await screen.findByText('Página administrativa de postagens.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(await screen.findByText('Perfil: Professor(a)')).toBeOnTheScreen();
  });

  it('impede estudante de acessar a administração', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT'));
    await renderApp('/admin');

    expect(await screen.findByText('Perfil: Estudante')).toBeOnTheScreen();
    expect(screen.queryByText('Página administrativa de postagens.')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Administrar postagens' })).toBeNull();
  });

  it('sair apaga o token e volta ao login', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('ADMIN'));
    await renderApp();

    await fireEvent.press(await screen.findByRole('button', { name: 'Sair' }));

    expect(await screen.findByLabelText('Senha')).toBeOnTheScreen();
    await waitFor(() => expect(store.deleteItemAsync).toHaveBeenCalled());
  });
});
