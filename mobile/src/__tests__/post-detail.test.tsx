import { fireEvent, screen } from '@testing-library/react-native';
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

const POST: Post = {
  id: 'a',
  title: 'Introdução ao React Native',
  content: 'Conteúdo completo da postagem, com todos os parágrafos da aula.',
  authorId: 'autor-1',
  authorName: 'Carlos',
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: '2026-01-15T12:00:00.000Z',
};

function json(status: number, body: unknown = {}) {
  return { ok: status < 400, status, json: async () => body };
}

function mockApi(handler: (url: string) => unknown) {
  fetchMock.mockImplementation(async (url: string) => handler(url));
}

async function renderPost(role = 'STUDENT', id = 'a') {
  store.getItemAsync.mockResolvedValue(makeToken(role));
  return renderRouter('src/app', { initialUrl: `/posts/${id}` });
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
});

describe('leitura', () => {
  it('abre a postagem ao tocar nela na lista', async () => {
    mockApi((url) =>
      url.endsWith('/posts/a') ? json(200, POST) : json(200, { items: [POST], nextCursor: null, hasMore: false }),
    );
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT'));
    await renderRouter('src/app', { initialUrl: '/' });

    await fireEvent.press(await screen.findByRole('button', { name: `Ler ${POST.title}` }));

    expect(await screen.findByText('Publicada em 10/01/2026')).toBeOnTheScreen();
    expect(screen).toHavePathname('/posts/a');
  });

  it('mostra título, autor, datas e o conteúdo completo', async () => {
    mockApi(() => json(200, POST));
    await renderPost();

    expect(await screen.findByRole('header', { name: POST.title })).toBeOnTheScreen();
    expect(screen.getByText(POST.content)).toBeOnTheScreen();
    expect(screen.getByText('Por Carlos')).toBeOnTheScreen();
    expect(screen.getByText('Publicada em 10/01/2026')).toBeOnTheScreen();
    expect(screen.getByText('Atualizada em 15/01/2026')).toBeOnTheScreen();
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/posts\/a$/);
  });

  it('não repete a data quando a postagem não foi atualizada', async () => {
    mockApi(() => json(200, { ...POST, authorName: null, updatedAt: POST.createdAt }));
    await renderPost();

    expect(await screen.findByText('Por Autor não informado')).toBeOnTheScreen();
    expect(screen.queryByText(/^Atualizada em/)).toBeNull();
  });
});

describe('erros', () => {
  it('avisa quando a postagem não existe', async () => {
    mockApi(() => json(404, { message: 'Post not found' }));
    await renderPost();

    expect(
      await screen.findByText('Postagem não encontrada. Ela pode ter sido excluída.'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Voltar para a lista' })).toBeOnTheScreen();
  });

  it('volta para a lista a partir de uma postagem inexistente, mesmo sem histórico', async () => {
    mockApi((url) =>
      url.endsWith('/posts/a') ? json(404) : json(200, { items: [], nextCursor: null, hasMore: false }),
    );
    await renderPost();

    await fireEvent.press(await screen.findByRole('button', { name: 'Voltar para a lista' }));

    expect(await screen.findByText('Nenhuma postagem publicada.')).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
  });

  it('permite tentar de novo depois de uma falha', async () => {
    mockApi(() => json(500));
    await renderPost();

    const retry = await screen.findByRole('button', { name: 'Tentar novamente' });
    expect(screen.getByText('Não foi possível carregar a postagem.')).toBeOnTheScreen();

    mockApi(() => json(200, POST));
    await fireEvent.press(retry);

    expect(await screen.findByText(POST.content)).toBeOnTheScreen();
  });
});
