import { act, fireEvent, screen } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { renderRouter } from 'expo-router/testing-library';

import { setAuthToken } from '@/lib/api';
import type { Post } from '@/lib/posts';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);
const fetchMock = jest.fn();

function makeToken(role: string): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub: 'user-1', role, exp })).toString('base64url');
  return `header.${payload}.signature`;
}

function makePost(id: string, authorName: string | null = 'Ana'): Post {
  return {
    id,
    title: `Título ${id}`,
    content: `Conteúdo ${id}`,
    authorId: 'autor-1',
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

function mockApi(handler: (url: string) => unknown) {
  fetchMock.mockImplementation(async (url: string) => handler(url));
}

function calledUrls(): string[] {
  return fetchMock.mock.calls.map(([url]) => url);
}

async function renderHome(role = 'STUDENT') {
  store.getItemAsync.mockResolvedValue(makeToken(role));
  return renderRouter('src/app', { initialUrl: '/' });
}

/** Digita na busca e espera o tempo do debounce. */
async function typeSearch(text: string) {
  await fireEvent.changeText(screen.getByLabelText('Buscar postagens'), text);
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
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
  it('mostra título, autor e trecho de cada postagem', async () => {
    mockApi(() => page([makePost('a', 'Carlos'), makePost('b')]));
    await renderHome();

    expect(await screen.findByText('Título a')).toBeOnTheScreen();
    expect(screen.getByText('Conteúdo a')).toBeOnTheScreen();
    expect(screen.getByText(/^Por Carlos · /)).toBeOnTheScreen();
    expect(screen.getByText('Título b')).toBeOnTheScreen();
  });

  it('funciona quando a API não informa o nome do autor', async () => {
    mockApi(() => page([makePost('a', null)]));
    await renderHome();
    expect(await screen.findByText(/^Por Autor não informado/)).toBeOnTheScreen();
  });

  it('mostra aviso quando não há postagens', async () => {
    mockApi(() => page([]));
    await renderHome();
    expect(await screen.findByText('Nenhuma postagem publicada.')).toBeOnTheScreen();
  });

  it('permite tentar de novo depois de uma falha', async () => {
    mockApi(() => json(500));
    await renderHome();

    const retry = await screen.findByRole('button', { name: 'Tentar novamente' });
    expect(screen.getByText('Não foi possível carregar as postagens.')).toBeOnTheScreen();

    mockApi(() => page([makePost('a')]));
    await fireEvent.press(retry);

    expect(await screen.findByText('Título a')).toBeOnTheScreen();
  });

  it('carrega a próxima página pelo cursor, sem repetir postagens', async () => {
    mockApi((url) =>
      url.includes('cursor=c1') ? page([makePost('a'), makePost('b')]) : page([makePost('a')], 'c1'),
    );
    await renderHome();
    await screen.findByText('Título a');

    await fireEvent(screen.getByTestId('posts-list'), 'endReached');

    expect(await screen.findByText('Título b')).toBeOnTheScreen();
    expect(screen.getAllByText('Título a')).toHaveLength(1);
  });
});

describe('busca', () => {
  it('busca pelo termo digitado depois de uma pausa na digitação', async () => {
    mockApi((url) =>
      url.includes('/posts/search') ? json(200, [makePost('node')]) : page([makePost('a')]),
    );
    await renderHome();
    await screen.findByText('Título a');

    await fireEvent.changeText(screen.getByLabelText('Buscar postagens'), 'no');
    await fireEvent.changeText(screen.getByLabelText('Buscar postagens'), ' node ');
    expect(calledUrls().some((url) => url.includes('/posts/search'))).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText('Título node')).toBeOnTheScreen();
    expect(screen.queryByText('Título a')).toBeNull();
    const searches = calledUrls().filter((url) => url.includes('/posts/search'));
    expect(searches).toHaveLength(1);
    expect(searches[0]).toMatch(/\/posts\/search\?term=node$/);
  });

  it('avisa quando a busca não encontra postagens', async () => {
    mockApi((url) => (url.includes('/posts/search') ? json(200, []) : page([makePost('a')])));
    await renderHome();
    await screen.findByText('Título a');

    await typeSearch('inexistente');

    expect(await screen.findByText('Nenhuma postagem encontrada para esta busca.')).toBeOnTheScreen();
  });

  it('volta para a lista completa ao apagar o termo', async () => {
    mockApi((url) =>
      url.includes('/posts/search') ? json(200, [makePost('node')]) : page([makePost('a')]),
    );
    await renderHome();
    await screen.findByText('Título a');

    await typeSearch('node');
    await screen.findByText('Título node');
    await typeSearch('');

    expect(await screen.findByText('Título a')).toBeOnTheScreen();
    expect(screen.queryByText('Título node')).toBeNull();
  });

  it('mostra erro se a busca falhar, mantendo a lista atual', async () => {
    mockApi((url) => (url.includes('/posts/search') ? json(500) : page([makePost('a')])));
    await renderHome();
    await screen.findByText('Título a');

    await typeSearch('node');

    expect(await screen.findByText('Não foi possível buscar as postagens.')).toBeOnTheScreen();
    expect(screen.getByText('Título a')).toBeOnTheScreen();
  });
});

describe('perfis', () => {
  it('estudante vê a lista, sem o acesso à administração', async () => {
    mockApi(() => page([makePost('a')]));
    await renderHome('STUDENT');

    expect(await screen.findByText('Título a')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Administrar postagens' })).toBeNull();
  });

  it('professor vê o acesso à administração', async () => {
    mockApi(() => page([makePost('a')]));
    await renderHome('TEACHER');

    expect(await screen.findByRole('button', { name: 'Administrar postagens' })).toBeOnTheScreen();
  });
});
