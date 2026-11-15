import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
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
    expect(screen.getByText('Carlos')).toBeOnTheScreen();
    expect(screen.getByText(/^Editada \d{2}\/\d{2}\/\d{4}$/)).toBeOnTheScreen();
  });

  it('funciona quando a API não informa o nome do autor', async () => {
    mockApi(() => page([makePost('a', 'outro', null)]));
    await renderAdmin();
    expect(await screen.findByText(/^Autor não informado/)).toBeOnTheScreen();
  });

  it('administrador sem postagens vê o aviso de lista vazia', async () => {
    mockApi(() => page([]));
    await renderAdmin('ADMIN');
    expect(await screen.findByText('Nenhuma postagem cadastrada.')).toBeOnTheScreen();
  });

  it('professor sem postagens é convidado a criar a primeira', async () => {
    mockApi(() => page([]));
    await renderAdmin('TEACHER');
    expect(await screen.findByText('Você ainda não publicou nada')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Criar a primeira' })).toBeOnTheScreen();
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

describe('cabeçalho e busca', () => {
  it.each([
    ['TEACHER', 'As postagens que você publicou'],
    ['ADMIN', 'Edite ou exclua qualquer postagem'],
  ])('explica o alcance da permissão (%s) e oferece "Nova postagem"', async (role, subtitle) => {
    mockApi(() => page([makePost('a')]));
    await renderAdmin(role);

    expect(await screen.findByText(subtitle)).toBeOnTheScreen();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Nova postagem' }).at(-1)!);
    expect(await screen.findByLabelText('Título')).toBeOnTheScreen();
    expect(screen).toHavePathname('/posts/new');
  });

  it('busca postagens pelo termo, como no feed', async () => {
    mockApi((url) =>
      url.includes('/posts/search') ? json(200, [makePost('node')]) : page([makePost('a')]),
    );
    await renderAdmin();
    await screen.findByText('Título a');

    await fireEvent.changeText(screen.getByTestId('admin-search'), ' node ');
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText('Título node')).toBeOnTheScreen();
    expect(within(screen.getByTestId('admin-posts-list')).queryByText('Título a')).toBeNull();
    const searches = fetchMock.mock.calls.map(([url]) => String(url)).filter((url) => url.includes('/posts/search'));
    expect(searches.at(-1)).toMatch(/term=node$/);
  });

  it('avisa quando a busca não encontra nada', async () => {
    mockApi((url) => (url.includes('/posts/search') ? json(200, []) : page([makePost('a')])));
    await renderAdmin();
    await screen.findByText('Título a');

    await fireEvent.changeText(screen.getByTestId('admin-search'), 'inexistente');
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(
      await within(screen.getByTestId('admin-posts-list')).findByText(
        'Nenhuma postagem encontrada para esta busca.',
      ),
    ).toBeOnTheScreen();
  });
});

/** Parâmetros dos pedidos de listagem de postagens (`GET /posts`, sem a busca). */
function listRequests() {
  return fetchMock.mock.calls
    .map(([url]) => new URL(String(url)))
    .filter((request) => request.pathname === '/posts');
}

describe('filtro por autor', () => {
  it('o professor pede só as próprias postagens à API e não tem filtro', async () => {
    mockApi(() => page([makePost('minha')]));
    await renderAdmin('TEACHER');
    await screen.findByText('Título minha');

    expect(listRequests()[0]?.searchParams.get('authorId')).toBe(USER_ID);
    expect(screen.queryByTestId('admin-filter')).toBeNull();
  });

  it('a busca do professor mostra só as dele (a API busca em todas)', async () => {
    mockApi((url) =>
      url.includes('/posts/search')
        ? json(200, [makePost('minha'), makePost('alheia', 'outro', 'Bruno')])
        : page([makePost('a')]),
    );
    await renderAdmin('TEACHER');
    await screen.findByText('Título a');

    await fireEvent.changeText(screen.getByTestId('admin-search'), 'titulo');
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText('Título minha')).toBeOnTheScreen();
    expect(screen.queryByText('Título alheia')).toBeNull();
  });

  it('o administrador começa vendo todas e filtra "Só as minhas" pela folha', async () => {
    mockApi(() => page([makePost('minha'), makePost('alheia', 'outro', 'Bruno')]));
    await renderAdmin('ADMIN');
    await screen.findByText('Título alheia');
    expect(listRequests()[0]?.searchParams.has('authorId')).toBe(false);

    await fireEvent.press(screen.getByTestId('admin-filter'));
    await fireEvent.press(await screen.findByRole('radio', { name: 'Só as minhas' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar' }));

    expect(await screen.findByText('Autor: só as minhas')).toBeOnTheScreen();
    expect(screen).toHavePathname('/admin');
    expect(listRequests().at(-1)?.searchParams.get('authorId')).toBe(USER_ID);
    expect(screen.getByRole('button', { name: 'Filtros, 1 ativo' })).toBeOnTheScreen();
  });

  it('remover a etiqueta volta a listar todas', async () => {
    mockApi(() => page([makePost('minha')]));
    await renderAdmin('ADMIN');
    await screen.findByText('Título minha');
    await fireEvent.press(screen.getByTestId('admin-filter'));
    await fireEvent.press(await screen.findByRole('radio', { name: 'Só as minhas' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Aplicar' }));
    await screen.findByText('Autor: só as minhas');

    await fireEvent.press(screen.getByRole('button', { name: 'Remover filtro Autor: só as minhas' }));

    await waitFor(() => expect(screen.queryByText('Autor: só as minhas')).toBeNull());
    await waitFor(() => expect(listRequests().at(-1)?.searchParams.has('authorId')).toBe(false));
  });

  it('o professor que abre a folha de filtros de postagens por link volta para os posts', async () => {
    mockApi(() => page([makePost('a')]));
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    await renderRouter('src/app', { initialUrl: '/filters/posts' });

    expect(await screen.findByRole('header', { name: 'Posts' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
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

describe('cartão', () => {
  it('o administrador vê o selo "Você" só nas próprias postagens', async () => {
    mockApi(() => page([makePost('minha'), makePost('alheia', 'outro', 'Bruno')]));
    await renderAdmin('ADMIN');
    await screen.findByText('Título minha');

    expect(within(screen.getByTestId('admin-posts-list')).getAllByText('Você')).toHaveLength(1);
  });

  it('o professor não vê o selo, porque a lista inteira é dele', async () => {
    mockApi(() => page([makePost('minha')]));
    await renderAdmin('TEACHER');
    await screen.findByText('Título minha');

    expect(within(screen.getByTestId('admin-posts-list')).queryByText('Você')).toBeNull();
  });

  it('tocar no cartão abre a leitura da postagem', async () => {
    mockApi((url) => (url.endsWith('/posts/a') ? json(200, makePost('a')) : page([makePost('a')])));
    await renderAdmin('ADMIN');

    await fireEvent.press(
      await screen.findByRole('button', { name: 'Título a. Ana, sua postagem, editada em 15/01/2026' }),
    );

    expect(screen).toHavePathname('/posts/a');
  });
});

describe('edição', () => {
  it('abre a tela de edição da postagem', async () => {
    mockApi((url) => (url.endsWith('/posts/a') ? json(200, makePost('a')) : page([makePost('a')])));
    await renderAdmin();

    await fireEvent.press(await screen.findByRole('button', { name: 'Editar Título a' }));

    expect(await screen.findByDisplayValue('Título a')).toBeOnTheScreen();
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
