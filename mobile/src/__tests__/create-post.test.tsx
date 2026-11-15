import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { renderRouter } from 'expo-router/testing-library';
import { Alert } from 'react-native';

import { validatePost } from '@/components/post-form';
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
const EMPTY_FEED = 'Quando houver avisos, eles aparecem aqui.';

function makeToken(role: string): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub: 'user-1', role, exp })).toString('base64url');
  return `header.${payload}.signature`;
}

const CREATED: Post = {
  id: 'nova',
  title: 'Aula de hoje',
  content: 'Conteúdo da aula de hoje.',
  authorId: 'user-1',
  authorName: 'Ana',
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: '2026-01-10T12:00:00.000Z',
};

function json(status: number, body: unknown = {}) {
  return { ok: status < 400, status, json: async () => body };
}

const emptyPage = json(200, { items: [], nextCursor: null, hasMore: false });

type Handler = (url: string, init: RequestInit) => unknown;

function mockApi(handler: Handler) {
  fetchMock.mockImplementation(async (url: string, init: RequestInit) => handler(url, init));
}

function requests(method: string) {
  return fetchMock.mock.calls.filter(([, init]) => (init.method ?? 'GET') === method);
}

/**
 * Abre a criação pela aba Posts, para que exista uma tela para onde voltar. As abas nativas
 * montam todas as telas, e Gerenciar também tem "Nova postagem": a primeira é a da aba Posts.
 */
async function openForm(role = 'TEACHER') {
  store.getItemAsync.mockResolvedValue(makeToken(role));
  await renderRouter('src/app', { initialUrl: '/' });
  const [button] = await screen.findAllByRole('button', { name: 'Nova postagem' });
  await fireEvent.press(button);
  await screen.findByLabelText('Título');
}

/** Responde ao último `Alert.alert` tocando no botão com este texto. */
async function answerAlert(text: string) {
  const buttons = alertSpy.mock.lastCall?.[2] ?? [];
  await act(async () => buttons.find((button) => button.text === text)?.onPress?.());
}

async function fillForm(title: string, content: string) {
  await fireEvent.changeText(screen.getByLabelText('Título'), title);
  await fireEvent.changeText(screen.getByLabelText('Conteúdo'), content);
}

async function submit() {
  await fireEvent.press(screen.getByRole('button', { name: 'Publicar postagem' }));
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
});

describe('validação', () => {
  it.each([
    [{ title: 'ab', content: 'Conteúdo válido.' }, { title: 'O título deve ter pelo menos 3 caracteres.' }],
    [{ title: 'a'.repeat(256), content: 'Conteúdo válido.' }, { title: 'O título deve ter no máximo 255 caracteres.' }],
    [{ title: 'Título', content: 'curto' }, { content: 'O conteúdo deve ter pelo menos 10 caracteres.' }],
    [{ title: 'ab', content: 'curto' }, {
      title: 'O título deve ter pelo menos 3 caracteres.',
      content: 'O conteúdo deve ter pelo menos 10 caracteres.',
    }],
    [{ title: 'Título', content: 'Conteúdo válido.' }, {}],
  ])('aplica as regras da API a %j', (values, errors) => {
    expect(validatePost(values)).toEqual(errors);
  });

  it('mostra o erro sem chamar a API e ignora espaços nas pontas', async () => {
    mockApi(() => emptyPage);
    await openForm();
    await fillForm('  ab  ', 'Conteúdo válido.');

    await submit();

    expect(await screen.findByText('O título deve ter pelo menos 3 caracteres.')).toBeOnTheScreen();
    expect(requests('POST')).toHaveLength(0);
  });
});

describe('acesso', () => {
  it('estudante não vê o botão de nova postagem', async () => {
    mockApi(() => emptyPage);
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT'));
    await renderRouter('src/app', { initialUrl: '/' });

    expect(await screen.findByText(EMPTY_FEED)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Nova postagem' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Criar a primeira' })).toBeNull();
  });

  it('estudante não abre o formulário por link direto', async () => {
    mockApi(() => json(404));
    store.getItemAsync.mockResolvedValue(makeToken('STUDENT'));
    await renderRouter('src/app', { initialUrl: '/posts/new' });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByLabelText('Título')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Publicar postagem' })).toBeNull();
  });

  it('não mostra bloco de autor nem botão Cancelar no rodapé', async () => {
    mockApi(() => emptyPage);
    await openForm();

    expect(screen.queryByText(/Editando a postagem de/)).toBeNull();
    // O único "Cancelar" é o do cabeçalho do modal.
    expect(screen.getAllByRole('button', { name: 'Cancelar' })).toHaveLength(1);
  });
});

describe('envio', () => {
  it('publica, volta para a lista atualizada e exibe o aviso', async () => {
    let created = false;
    mockApi((_url, init) => {
      if (init.method === 'POST') {
        created = true;
        return json(201, CREATED);
      }
      return created
        ? json(200, { items: [CREATED], nextCursor: null, hasMore: false })
        : emptyPage;
    });
    await openForm();
    await fillForm('  Aula de hoje ', ' Conteúdo da aula de hoje. ');

    await submit();

    expect(await screen.findByText('Postagem publicada.')).toBeOnTheScreen();
    expect(await screen.findByText('Aula de hoje')).toBeOnTheScreen();
    expect(screen).toHavePathname('/');

    const [url, init] = requests('POST')[0];
    expect(url).toMatch(/\/posts$/);
    expect(JSON.parse(init.body as string)).toEqual({
      title: 'Aula de hoje',
      content: 'Conteúdo da aula de hoje.',
    });
  });

  it.each([
    [403, 'Você não tem permissão para publicar postagens.'],
    [500, 'Não foi possível publicar a postagem.'],
  ])('mantém o formulário preenchido quando a API responde %i', async (status, message) => {
    mockApi((_url, init) => (init.method === 'POST' ? json(status) : emptyPage));
    await openForm();
    await fillForm('Aula de hoje', 'Conteúdo da aula de hoje.');

    await submit();

    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(screen.getByLabelText('Título')).toHaveDisplayValue('Aula de hoje');
    expect(screen).toHavePathname('/posts/new');
  });

  it('Cancelar no cabeçalho fecha direto quando nada foi digitado', async () => {
    mockApi(() => emptyPage);
    await openForm();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByText(EMPTY_FEED)).toBeOnTheScreen();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen).toHavePathname('/');
  });
});

describe('proteção contra descarte', () => {
  it('pede confirmação ao cancelar com algo digitado e continua editando', async () => {
    mockApi(() => emptyPage);
    await openForm();
    await fillForm('Aula de hoje', '');

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(alertSpy).toHaveBeenCalledWith(
      'Descartar alterações?',
      'O que você escreveu será perdido.',
      expect.any(Array),
    );
    await answerAlert('Continuar editando');
    expect(screen).toHavePathname('/posts/new');
    expect(screen.getByLabelText('Título')).toHaveDisplayValue('Aula de hoje');
  });

  it('descarta e volta para a lista sem chamar a API', async () => {
    mockApi(() => emptyPage);
    await openForm();
    await fillForm('Aula de hoje', 'Conteúdo da aula de hoje.');

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    await answerAlert('Descartar');

    expect(await screen.findByText(EMPTY_FEED)).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
    expect(requests('POST')).toHaveLength(0);
    expect(screen.queryByText('Postagem publicada.')).toBeNull();
  });

  it('não pergunta nada depois de publicar com sucesso', async () => {
    mockApi((_url, init) => (init.method === 'POST' ? json(201, CREATED) : emptyPage));
    await openForm();
    await fillForm('Aula de hoje', 'Conteúdo da aula de hoje.');

    await submit();

    expect(await screen.findByText('Postagem publicada.')).toBeOnTheScreen();
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
