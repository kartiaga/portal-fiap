import { fireEvent, screen, waitFor } from '@testing-library/react-native';
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

const USER_ID = 'user-1';

function makeToken(role: string): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub: USER_ID, role, exp })).toString('base64url');
  return `header.${payload}.signature`;
}

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'a',
    title: 'Título original',
    content: 'Conteúdo original da postagem.',
    authorId: USER_ID,
    authorName: 'Ana',
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z',
    ...overrides,
  };
}

function json(status: number, body: unknown = {}) {
  return { ok: status < 400, status, json: async () => body };
}

type Handler = (url: string, init: RequestInit) => unknown;

function mockApi(handler: Handler) {
  fetchMock.mockImplementation(async (url: string, init: RequestInit) => handler(url, init));
}

function requests(method: string) {
  return fetchMock.mock.calls.filter(([, init]) => (init.method ?? 'GET') === method);
}

/**
 * Simula a API: GET devolve a postagem atual e PUT a substitui, como o servidor faria.
 * `putResponse` permite forçar uma resposta de erro na edição.
 */
function mockPostApi(initial: Post, putResponse?: { status: number }) {
  let current = initial;
  mockApi((url, init) => {
    if (init.method === 'PUT') {
      if (putResponse) return json(putResponse.status);
      current = { ...current, ...JSON.parse(init.body as string) };
      return json(200, current);
    }
    if (url.includes('/posts?')) return json(200, { items: [current], nextCursor: null, hasMore: false });
    return json(200, current);
  });
}

async function render(initialUrl: string, role = 'TEACHER') {
  store.getItemAsync.mockResolvedValue(makeToken(role));
  return renderRouter('src/app', { initialUrl });
}

async function changeTitle(title: string) {
  await fireEvent.changeText(await screen.findByLabelText('Título'), title);
}

async function save() {
  await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
});

describe('carregamento', () => {
  it('preenche o formulário com os dados atuais da postagem', async () => {
    mockPostApi(makePost());
    await render('/posts/a/edit');

    expect(await screen.findByDisplayValue('Título original')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('Conteúdo original da postagem.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Autor: Ana')).toBeOnTheScreen();
  });

  it('avisa quando a postagem não existe', async () => {
    mockApi(() => json(404));
    await render('/posts/a/edit');

    expect(
      await screen.findByText('Postagem não encontrada. Ela pode ter sido excluída.'),
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText('Título')).toBeNull();
  });

  it('permite tentar de novo depois de uma falha', async () => {
    mockApi(() => json(500));
    await render('/posts/a/edit');

    const retry = await screen.findByRole('button', { name: 'Tentar novamente' });
    mockPostApi(makePost());
    await fireEvent.press(retry);

    expect(await screen.findByDisplayValue('Título original')).toBeOnTheScreen();
  });
});

describe('permissões', () => {
  it('professor não edita postagem de outro autor, mesmo por link direto', async () => {
    mockPostApi(makePost({ authorId: 'outro' }));
    await render('/posts/a/edit', 'TEACHER');

    expect(
      await screen.findByText('Você não tem permissão para editar esta postagem.'),
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText('Título')).toBeNull();
  });

  it('admin edita postagem de outro autor', async () => {
    mockPostApi(makePost({ authorId: 'outro' }));
    await render('/posts/a/edit', 'ADMIN');

    expect(await screen.findByDisplayValue('Título original')).toBeOnTheScreen();
  });

  it.each([
    ['autor', 'TEACHER', USER_ID, true],
    ['outro professor', 'TEACHER', 'outro', false],
    ['estudante', 'STUDENT', 'outro', false],
  ])('na leitura, mostra o botão Editar só para quem pode editar (%s)', async (_label, role, authorId, visible) => {
    mockPostApi(makePost({ authorId }));
    await render('/posts/a', role);
    await screen.findByText('Conteúdo original da postagem.');

    const button = screen.queryByRole('button', { name: 'Editar Título original' });
    if (visible) expect(button).toBeOnTheScreen();
    else expect(button).toBeNull();
  });

  it('estudante não abre a edição por link direto', async () => {
    mockPostApi(makePost());
    await render('/posts/a/edit', 'STUDENT');

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByLabelText('Título')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Salvar alterações' })).toBeNull();
  });
});

describe('envio', () => {
  it('salva a partir da leitura e volta para ela atualizada, com aviso', async () => {
    mockPostApi(makePost());
    await render('/posts/a');

    await fireEvent.press(await screen.findByRole('button', { name: 'Editar Título original' }));
    await changeTitle('  Título revisado ');
    await save();

    expect(await screen.findByText('Postagem atualizada.')).toBeOnTheScreen();
    expect(await screen.findByRole('header', { name: 'Título revisado' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/posts/a');

    const [url, init] = requests('PUT')[0];
    expect(url).toMatch(/\/posts\/a$/);
    expect(JSON.parse(init.body as string)).toEqual({
      title: 'Título revisado',
      content: 'Conteúdo original da postagem.',
    });
  });

  it('salva a partir da página administrativa e volta para ela, com aviso', async () => {
    mockPostApi(makePost());
    await render('/admin');

    await fireEvent.press(await screen.findByRole('button', { name: 'Editar Título original' }));
    await changeTitle('Título revisado');
    await save();

    expect(await screen.findByText('Postagem atualizada.')).toBeOnTheScreen();
    expect(await screen.findByText('Título revisado')).toBeOnTheScreen();
    expect(screen).toHavePathname('/admin');
  });

  it('sem histórico, volta para a leitura da postagem', async () => {
    mockPostApi(makePost());
    await render('/posts/a/edit');

    await changeTitle('Título revisado');
    await save();

    expect(await screen.findByText('Postagem atualizada.')).toBeOnTheScreen();
    expect(screen).toHavePathname('/posts/a');
  });

  it('valida os campos sem chamar a API', async () => {
    mockPostApi(makePost());
    await render('/posts/a/edit');

    await changeTitle('ab');
    await save();

    expect(await screen.findByText('O título deve ter pelo menos 3 caracteres.')).toBeOnTheScreen();
    expect(requests('PUT')).toHaveLength(0);
  });

  it.each([
    [403, 'Você não tem permissão para editar esta postagem.'],
    [404, 'Esta postagem não existe mais. Ela pode ter sido excluída.'],
    [500, 'Não foi possível salvar as alterações.'],
  ])('mantém o que foi digitado quando a API responde %i', async (status, message) => {
    mockPostApi(makePost(), { status });
    await render('/posts/a/edit');

    await changeTitle('Título revisado');
    await save();

    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(screen.getByLabelText('Título')).toHaveDisplayValue('Título revisado');
    expect(screen).toHavePathname('/posts/a/edit');
  });

  it('cancelar volta sem salvar', async () => {
    mockPostApi(makePost());
    await render('/posts/a');

    await fireEvent.press(await screen.findByRole('button', { name: 'Editar Título original' }));
    await changeTitle('Título revisado');
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByRole('header', { name: 'Título original' })).toBeOnTheScreen();
    expect(requests('PUT')).toHaveLength(0);
    expect(screen.queryByText('Postagem atualizada.')).toBeNull();
  });
});
