import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { renderRouter } from 'expo-router/testing-library';
import { Alert } from 'react-native';

import { setAuthToken } from '@/lib/api';
import type { Post } from '@/lib/posts';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);
const fetchMock = jest.fn();
const alertSpy = jest.spyOn(Alert, 'alert');

const USER_ID = 'user-1';

function makeToken(role: string): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub: USER_ID, role, exp })).toString('base64url');
  return `header.${payload}.signature`;
}

function makePost(id: string, authorId = USER_ID, authorName: string | null = 'Ana'): Post {
  return {
    id,
    title: `Título ${id}`,
    content: `Conteúdo ${id}`,
    authorId,
    authorName,
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-15T12:00:00.000Z',
  };
}

function json(status: number, body: unknown = {}) {
  return { ok: status < 400, status, json: async () => body };
}

function page(items: Post[], nextCursor: string | null = null) {
  return json(200, { items, nextCursor, hasMore: nextCursor !== null });
}

type Handler = (url: string, init: RequestInit) => unknown;

function mockApi(handler: Handler) {
  fetchMock.mockImplementation(async (url: string, init: RequestInit) => handler(url, init));
}

function requests(method: string) {
  return fetchMock.mock.calls.filter(([, init]) => (init.method ?? 'GET') === method);
}

async function renderAdmin(role = 'TEACHER') {
  store.getItemAsync.mockResolvedValue(makeToken(role));
  return renderRouter('src/app', { initialUrl: '/admin' });
}

/** Responde ao alerta de confirmação como se o usuário tocasse no botão indicado. */
function answerConfirmation(buttonText: string) {
  const buttons = alertSpy.mock.lastCall?.[2] ?? [];
  buttons.find((button) => button.text === buttonText)?.onPress?.();
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
});

describe('listagem', () => {
  it('mostra título, autor e trecho das postagens', async () => {
    mockApi(() => page([makePost('a', 'outro', 'Carlos')]));
    await renderAdmin();

    expect(await screen.findByText('Título a')).toBeOnTheScreen();
    expect(screen.getByText('Conteúdo a')).toBeOnTheScreen();
    expect(screen.getByText(/^Carlos · Atualizada em/)).toBeOnTheScreen();
  });

  it('funciona quando a API não informa o nome do autor', async () => {
    mockApi(() => page([makePost('a', 'outro', null)]));
    await renderAdmin();
    expect(await screen.findByText(/^Autor não informado/)).toBeOnTheScreen();
  });

  it('mostra aviso quando não há postagens', async () => {
    mockApi(() => page([]));
    await renderAdmin();
    expect(await screen.findByText('Nenhuma postagem cadastrada.')).toBeOnTheScreen();
  });

  it('permite tentar de novo depois de uma falha', async () => {
    mockApi(() => json(500));
    await renderAdmin();

    const retry = await screen.findByRole('button', { name: 'Tentar novamente' });
    expect(screen.getByText('Não foi possível carregar as postagens.')).toBeOnTheScreen();

    mockApi(() => page([makePost('a')]));
    await fireEvent.press(retry);

    expect(await screen.findByText('Título a')).toBeOnTheScreen();
  });

  it('carrega a próxima página pelo cursor, sem repetir postagens', async () => {
    mockApi((url) =>
      url.includes('cursor=c1')
        ? page([makePost('a'), makePost('b')])
        : page([makePost('a')], 'c1'),
    );
    await renderAdmin();
    await screen.findByText('Título a');

    await fireEvent(screen.getByTestId('admin-posts-list'), 'endReached');

    expect(await screen.findByText('Título b')).toBeOnTheScreen();
    expect(screen.getAllByText('Título a')).toHaveLength(1);
  });

  it('não pede outra página quando não há mais postagens', async () => {
    mockApi(() => page([makePost('a')]));
    await renderAdmin();
    await screen.findByText('Título a');
    const calls = fetchMock.mock.calls.length;

    await fireEvent(screen.getByTestId('admin-posts-list'), 'endReached');

    expect(fetchMock.mock.calls).toHaveLength(calls);
  });
});

describe('permissões', () => {
  it('professor só vê as ações das próprias postagens', async () => {
    mockApi(() => page([makePost('minha'), makePost('alheia', 'outro')]));
    await renderAdmin('TEACHER');
    await screen.findByText('Título minha');

    expect(screen.getByRole('button', { name: 'Excluir Título minha' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Editar Título minha' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Excluir Título alheia' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Editar Título alheia' })).toBeNull();
  });

  it('admin vê as ações de todas as postagens', async () => {
    mockApi(() => page([makePost('alheia', 'outro')]));
    await renderAdmin('ADMIN');
    await screen.findByText('Título alheia');

    expect(screen.getByRole('button', { name: 'Excluir Título alheia' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Editar Título alheia' })).toBeOnTheScreen();
  });
});

describe('edição', () => {
  it('abre a tela de edição da postagem', async () => {
    mockApi(() => page([makePost('a')]));
    await renderAdmin();

    await fireEvent.press(await screen.findByRole('button', { name: 'Editar Título a' }));

    expect(await screen.findByText('O formulário de edição ainda será implementado.')).toBeOnTheScreen();
    expect(screen).toHavePathname('/posts/a/edit');
  });
});

describe('exclusão', () => {
  async function pressDelete(id = 'a') {
    await fireEvent.press(await screen.findByRole('button', { name: `Excluir Título ${id}` }));
    expect(alertSpy).toHaveBeenCalled();
  }

  it('não chama a API se o usuário cancelar', async () => {
    mockApi(() => page([makePost('a')]));
    await renderAdmin();
    await pressDelete();

    answerConfirmation('Cancelar');

    expect(requests('DELETE')).toHaveLength(0);
    expect(screen.getByText('Título a')).toBeOnTheScreen();
  });

  it('exclui a postagem depois da confirmação e mantém as demais', async () => {
    mockApi((_url, init) =>
      init.method === 'DELETE' ? json(200) : page([makePost('a'), makePost('b')]),
    );
    await renderAdmin();
    await pressDelete();

    answerConfirmation('Excluir');

    expect(await screen.findByText('Postagem excluída.')).toBeOnTheScreen();
    expect(requests('DELETE')[0][0]).toMatch(/\/posts\/a$/);
    expect(screen.queryByText('Título a')).toBeNull();
    expect(screen.getByText('Título b')).toBeOnTheScreen();
  });

  it.each([
    [403, 'Você não tem permissão para excluir esta postagem.', true],
    [500, 'Não foi possível excluir a postagem.', true],
    [404, 'Esta postagem já havia sido excluída.', false],
  ])('trata a resposta %i da API', async (status, message, keepsPost) => {
    mockApi((_url, init) => (init.method === 'DELETE' ? json(status) : page([makePost('a')])));
    await renderAdmin();
    await pressDelete();

    answerConfirmation('Excluir');

    expect(await screen.findByText(message)).toBeOnTheScreen();
    await waitFor(() =>
      keepsPost
        ? expect(screen.getByText('Título a')).toBeOnTheScreen()
        : expect(screen.queryByText('Título a')).toBeNull(),
    );
  });

  it('não deixa uma resposta atrasada trazer de volta a postagem excluída', async () => {
    let finishRefresh: (value: unknown) => void = () => undefined;
    let listCalls = 0;
    mockApi((_url, init) => {
      if (init.method === 'DELETE') return json(200);
      listCalls += 1;
      return listCalls === 1
        ? page([makePost('a')])
        : new Promise((resolve) => (finishRefresh = resolve));
    });
    await renderAdmin();
    await screen.findByText('Título a');

    await fireEvent(screen.getByTestId('admin-posts-list'), 'refresh');
    await pressDelete();
    answerConfirmation('Excluir');
    await screen.findByText('Postagem excluída.');

    await act(async () => {
      finishRefresh(page([makePost('a')]));
      // Os testes do Expo Router usam timers simulados, então a espera é por microtarefas.
      for (let i = 0; i < 20; i += 1) await Promise.resolve();
    });

    expect(screen.queryByText('Título a')).toBeNull();
  });
});
