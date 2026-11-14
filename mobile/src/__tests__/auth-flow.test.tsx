import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { renderRouter } from 'expo-router/testing-library';
import { Alert } from 'react-native';

import { setAuthToken } from '@/lib/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);
/** Lista vazia da aba Gerenciar do professor: só aparece para quem pode gerenciar. */
const ADMIN_EMPTY = 'Você ainda não publicou nada';
/** Com espaço inquebrável entre "Portal" e "FIAP" (ver welcome.tsx). */
const WELCOME_TITLE = 'Boas-vindas ao Portal\u00A0FIAP';
const fetchMock = jest.fn();
const alertSpy = jest.spyOn(Alert, 'alert');
const EXPIRED_NOTICE = 'Sua sessão expirou. Entre novamente para continuar.';

/** Responde ao último `Alert.alert` tocando no botão com este texto. */
async function answerAlert(text: string) {
  const buttons = alertSpy.mock.lastCall?.[2] ?? [];
  await act(async () => buttons.find((button) => button.text === text)?.onPress?.());
}

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
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ items: [], nextCursor: null, hasMore: false }),
  });
  global.fetch = fetchMock;
  store.getItemAsync.mockResolvedValue(null);
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
});

/** Sem sessão o app abre na tela de boas-vindas; "Continuar" leva ao login. */
async function openLogin() {
  await fireEvent.press(await screen.findByRole('button', { name: 'Continuar' }));
}

async function fillLogin(email: string, password: string) {
  await fireEvent.changeText(await screen.findByLabelText('E-mail'), email);
  await fireEvent.changeText(screen.getByLabelText('Senha'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
}

describe('sem sessão', () => {
  it.each(['/', '/admin', '/people', '/account'])('redireciona %s para a abertura', async (url) => {
    await renderApp(url);
    expect(await screen.findByText(WELCOME_TITLE)).toBeOnTheScreen();
    expect(screen).toHavePathname('/welcome');
    expect(screen.queryByText(ADMIN_EMPTY)).toBeNull();
  });

  it('a abertura leva ao login', async () => {
    await renderApp();
    await openLogin();

    expect(await screen.findByLabelText('Senha')).toBeOnTheScreen();
    expect(screen).toHavePathname('/login');
  });

  it('descarta token expirado salvo no aparelho', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER', -10));
    await renderApp('/admin');

    expect(await screen.findByText(WELCOME_TITLE)).toBeOnTheScreen();
    expect(store.deleteItemAsync).toHaveBeenCalled();
  });
});

describe('login', () => {
  it('valida os campos sem chamar a API', async () => {
    await renderApp('/login');
    await fillLogin('invalido', '1234');

    expect(await screen.findByText('Informe um e-mail válido.')).toBeOnTheScreen();
    expect(screen.getByText('A senha deve ter pelo menos 8 caracteres.')).toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mostra erro para credenciais recusadas e continua no login', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    await renderApp('/login');
    await fillLogin('ana@fiap.com.br', 'senha-errada');

    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeOnTheScreen();
    expect(store.setItemAsync).not.toHaveBeenCalled();
  });

  it('salva o token e entra no app', async () => {
    const token = makeToken('TEACHER');
    const emptyPage = { items: [], nextCursor: null, hasMore: false };
    fetchMock.mockImplementation(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () => (url.endsWith('/login') ? { token } : emptyPage),
    }));
    await renderApp();
    await openLogin();
    await fillLogin(' ana@fiap.com.br ', '12345678');

    expect(await screen.findByRole('header', { name: 'Posts' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).email).toBe('ana@fiap.com.br');
    expect(store.setItemAsync).toHaveBeenCalledWith(expect.any(String), token);
  });
});

describe('com sessão', () => {
  it('permite a professor acessar a administração', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    await renderApp('/admin');
    expect(await screen.findByText(ADMIN_EMPTY)).toBeOnTheScreen();
  });

  it('não deixa a abertura nem o login abertos para quem já entrou', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT'));
    await renderApp('/login');

    expect(await screen.findByRole('header', { name: 'Posts' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
  });

  it.each(['/admin', '/people'])('leva o estudante de %s para os posts', async (url) => {
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT'));
    await renderApp(url);

    expect(await screen.findByRole('header', { name: 'Posts' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
    expect(screen.queryByText(ADMIN_EMPTY)).toBeNull();
  });

  it('mostra o perfil na aba Conta', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT'));
    await renderApp('/account');

    expect(await screen.findByText('Conta de estudante')).toBeOnTheScreen();
    expect(screen.getByText('Estudante')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Editar meus dados' })).toBeNull();
    // A API não libera GET /users/:id para estudante, então a tela não tenta buscar.
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/users/'))).toBe(false);
  });

  it('sair pede confirmação, apaga o token e vai direto para o login', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('ADMIN'));
    await renderApp('/account');

    await fireEvent.press(await screen.findByRole('button', { name: 'Sair' }));
    expect(alertSpy).toHaveBeenCalledWith('Sair da conta?', expect.any(String), expect.any(Array));
    expect(store.deleteItemAsync).not.toHaveBeenCalled();

    await answerAlert('Sair');

    expect(await screen.findByLabelText('Senha')).toBeOnTheScreen();
    expect(screen).toHavePathname('/login');
    expect(screen.queryByText(EXPIRED_NOTICE)).toBeNull();
    await waitFor(() => expect(store.deleteItemAsync).toHaveBeenCalled());
  });

  it('cancelar a saída mantém a sessão', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('ADMIN'));
    await renderApp('/account');

    await fireEvent.press(await screen.findByRole('button', { name: 'Sair' }));
    await answerAlert('Cancelar');

    expect(screen).toHavePathname('/account');
    expect(store.deleteItemAsync).not.toHaveBeenCalled();
  });
});

describe('sessão expirada', () => {
  it('um 401 leva ao login com o aviso de sessão expirada', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    await renderApp('/');

    expect(await screen.findByText(EXPIRED_NOTICE)).toBeOnTheScreen();
    expect(screen).toHavePathname('/login');
    await waitFor(() => expect(store.deleteItemAsync).toHaveBeenCalled());
  });

  it('a validade do token vencendo com o app aberto também leva ao login com aviso', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT', 60));
    await renderApp('/');
    await screen.findByRole('header', { name: 'Posts' });

    await act(async () => {
      jest.advanceTimersByTime(61_000);
    });

    expect(await screen.findByText(EXPIRED_NOTICE)).toBeOnTheScreen();
    expect(screen).toHavePathname('/login');
  });

  it('o aviso some ao tentar entrar de novo', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    await renderApp('/');
    await screen.findByText(EXPIRED_NOTICE);

    await fillLogin('ana@fiap.com.br', 'senha-errada');

    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeOnTheScreen();
    expect(screen.queryByText(EXPIRED_NOTICE)).toBeNull();
  });
});

describe('link inexistente', () => {
  it.each([null, 'STUDENT'])('mostra a página não encontrada em português (sessão: %s)', async (role) => {
    store.getItemAsync.mockResolvedValue(role ? makeToken(role) : null);
    await renderApp('/nao-existe');

    expect(await screen.findByText('Página não encontrada')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Voltar para Posts' })).toBeOnTheScreen();
  });

  it('"Voltar para Posts" leva às postagens', async () => {
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT'));
    await renderApp('/nao-existe');

    await fireEvent.press(await screen.findByRole('button', { name: 'Voltar para Posts' }));

    expect(await screen.findByRole('header', { name: 'Posts' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
  });
});
