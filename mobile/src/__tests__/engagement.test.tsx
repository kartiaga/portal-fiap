import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { Alert } from 'react-native';

import type { Comment } from '@/features/comments/api';
import type { Liker } from '@/features/likes/api';
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

const ME = 'user-1';

function makeToken(role: string, sub = ME): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub, role, exp })).toString('base64url');
  return `header.${payload}.signature`;
}

const POST: Post = {
  id: 'a',
  title: 'Introdução ao React Native',
  content: 'Conteúdo completo da postagem, com todos os parágrafos da aula.',
  authorId: 'autor-1',
  authorName: 'Carlos',
  likeCount: 2,
  commentCount: 1,
  likedByMe: false,
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: '2026-01-10T12:00:00.000Z',
};

const OTHER_COMMENT: Comment = {
  id: 'c1',
  postId: 'a',
  authorId: 'outro-estudante',
  authorName: 'Bruna Lima',
  content: 'Gostei muito da aula!',
  createdAt: '2026-01-11T12:00:00.000Z',
};

const OWN_COMMENT: Comment = {
  ...OTHER_COMMENT,
  id: 'c2',
  authorId: ME,
  authorName: 'Ana Souza',
  content: 'Tenho uma dúvida sobre o exercício.',
};

const LIKERS: Liker[] = [
  { userId: ME, name: 'Ana Souza', likedAt: '2026-01-12T12:00:00.000Z' },
  { userId: 'outro-estudante', name: 'Bruna Lima', likedAt: '2026-01-11T12:00:00.000Z' },
];

function json(status: number, body: unknown = {}) {
  return { ok: status < 400, status, json: async () => body };
}

function page<T>(items: T[]) {
  return { items, nextCursor: null, hasMore: false };
}

type Handler = (url: string, method: string, body: unknown) => unknown;

function mockApi(handler: Handler) {
  fetchMock.mockImplementation(async (url: string, init: RequestInit = {}) =>
    handler(url, init.method ?? 'GET', init.body ? JSON.parse(String(init.body)) : undefined),
  );
}

function requests(method: string, path: string) {
  return fetchMock.mock.calls.filter(
    ([url, init]: [string, RequestInit | undefined]) =>
      (init?.method ?? 'GET') === method && url.includes(path),
  );
}

async function renderAt(url: string, role = 'STUDENT', sub = ME) {
  store.getItemAsync.mockResolvedValue(makeToken(role, sub));
  return renderRouter('src/app', { initialUrl: url });
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
});

describe('curtidas no feed', () => {
  it('o coração curte e o número mostra o total atualizado', async () => {
    mockApi((url, method) => {
      if (url.endsWith('/posts/a/like') && method === 'POST') return json(200, { likeCount: 3, likedByMe: true });
      return json(200, page([POST]));
    });
    await renderAt('/');

    const count = await screen.findByRole('button', { name: `Ver quem curtiu ${POST.title}` });
    expect(within(count).getByText('2')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: `Curtir ${POST.title}` }));

    expect(await screen.findByRole('button', { name: `Descurtir ${POST.title}` })).toBeOnTheScreen();
    expect(within(screen.getByRole('button', { name: `Ver quem curtiu ${POST.title}` })).getByText('3')).toBeOnTheScreen();
    expect(requests('POST', '/posts/a/like')).toHaveLength(1);
    expect(screen).toHavePathname('/');
  });

  it('desfaz a curtida na tela e avisa quando a API falha', async () => {
    mockApi((url, method) => {
      if (url.endsWith('/posts/a/like') && method === 'POST') return json(500);
      return json(200, page([POST]));
    });
    await renderAt('/');

    await fireEvent.press(await screen.findByRole('button', { name: `Curtir ${POST.title}` }));

    expect(await screen.findByText('Não foi possível curtir a postagem.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: `Curtir ${POST.title}` })).toBeOnTheScreen();
    expect(within(screen.getByRole('button', { name: `Ver quem curtiu ${POST.title}` })).getByText('2')).toBeOnTheScreen();
  });

  it('sem curtidas, o número não abre nada', async () => {
    mockApi(() => json(200, page([{ ...POST, likeCount: 0 }])));
    await renderAt('/');

    expect(await screen.findByLabelText('0 curtidas')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: `Ver quem curtiu ${POST.title}` })).toBeNull();
  });

  it('tocar no número abre a folha com quem curtiu', async () => {
    mockApi((url) => (url.includes('/posts/a/likes') ? json(200, page(LIKERS)) : json(200, page([POST]))));
    await renderAt('/');

    await fireEvent.press(await screen.findByRole('button', { name: `Ver quem curtiu ${POST.title}` }));

    expect(await screen.findByRole('header', { name: 'Curtidas' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/posts/a/likes');
    const list = screen.getByTestId('likes-list');
    expect(within(list).getByText('Ana Souza')).toBeOnTheScreen();
    expect(within(list).getByText('Bruna Lima')).toBeOnTheScreen();
    expect(within(list).getByText('Você')).toBeOnTheScreen();
  });
});

describe('comentários no feed', () => {
  it('o balão abre a folha e, ao fechar, o cartão mostra o novo total sem recarregar a lista', async () => {
    let commentCount = 1;
    mockApi((url, method, body) => {
      if (url.includes('/comments') && method === 'POST') {
        commentCount += 1;
        return json(201, { ...OWN_COMMENT, id: 'novo', content: (body as { content: string }).content });
      }
      if (url.includes('/comments')) return json(200, page([OTHER_COMMENT]));
      if (url.endsWith('/posts/a')) return json(200, { ...POST, commentCount });
      return json(200, page([POST]));
    });
    await renderAt('/');

    await fireEvent.press(await screen.findByRole('button', { name: `Comentários de ${POST.title}` }));
    expect(await screen.findByText(OTHER_COMMENT.content)).toBeOnTheScreen();
    expect(screen).toHavePathname('/posts/a/comments');

    await fireEvent.changeText(screen.getByLabelText('Seu comentário'), 'Ótima aula!');
    await fireEvent.press(screen.getByRole('button', { name: 'Publicar comentário' }));
    expect(await screen.findByText('Ótima aula!')).toBeOnTheScreen();

    const listRequests = requests('GET', '/posts?').length;
    await act(() => router.back());

    const button = await screen.findByRole('button', { name: `Comentários de ${POST.title}` });
    await waitFor(() => expect(within(button).getByText('2')).toBeOnTheScreen());
    expect(requests('GET', '/posts?')).toHaveLength(listRequests);
  });
});

describe('leitura', () => {
  it('não mostra os comentários na tela: o link abre a folha', async () => {
    mockApi((url) => (url.includes('/comments') ? json(200, page([OTHER_COMMENT])) : json(200, POST)));
    await renderAt('/posts/a');

    await fireEvent.press(await screen.findByRole('button', { name: 'Ver o comentário' }));

    expect(await screen.findByText(OTHER_COMMENT.content)).toBeOnTheScreen();
    expect(screen).toHavePathname('/posts/a/comments');
  });

  it('convida a comentar quando não há comentários', async () => {
    mockApi(() => json(200, { ...POST, commentCount: 0 }));
    await renderAt('/posts/a');

    expect(await screen.findByRole('button', { name: 'Adicionar um comentário' })).toBeOnTheScreen();
    expect(requests('GET', '/comments')).toHaveLength(0);
  });

  it('descurte uma postagem já curtida', async () => {
    mockApi((url, method) => {
      if (url.endsWith('/posts/a/like') && method === 'DELETE') return json(200, { likeCount: 1, likedByMe: false });
      return json(200, { ...POST, likedByMe: true });
    });
    await renderAt('/posts/a');

    await fireEvent.press(await screen.findByRole('button', { name: 'Descurtir' }));

    expect(await screen.findByRole('button', { name: 'Curtir' })).toBeOnTheScreen();
    expect(within(screen.getByRole('button', { name: 'Ver quem curtiu' })).getByText('1')).toBeOnTheScreen();
    expect(requests('DELETE', '/posts/a/like')).toHaveLength(1);
  });
});

describe('folha de comentários', () => {
  it('mostra quando ainda não há comentários', async () => {
    mockApi((url) => (url.includes('/comments') ? json(200, page([])) : json(200, POST)));
    await renderAt('/posts/a/comments');

    expect(await screen.findByText('Nenhum comentário ainda')).toBeOnTheScreen();
    expect(screen.getByText('Seja o primeiro a comentar.')).toBeOnTheScreen();
  });

  it('publica um comentário, que entra no topo; o campo começa vazio e o botão, desligado', async () => {
    mockApi((url, method, body) => {
      if (url.includes('/comments') && method === 'POST') {
        return json(201, { ...OWN_COMMENT, id: 'novo', content: (body as { content: string }).content });
      }
      return json(200, page([OTHER_COMMENT]));
    });
    await renderAt('/posts/a/comments');

    expect(await screen.findByText(OTHER_COMMENT.content)).toBeOnTheScreen();
    const send = screen.getByRole('button', { name: 'Publicar comentário' });
    expect(send).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Seu comentário'), '  Ótima explicação!  ');
    expect(send).toBeEnabled();
    await fireEvent.press(send);

    expect(await screen.findByText('Ótima explicação!')).toBeOnTheScreen();
    expect(screen.getByLabelText('Seu comentário')).toHaveDisplayValue('');
    const items = within(screen.getByTestId('comments-list')).getAllByText(/Ótima explicação!|Gostei muito/);
    expect(items[0]).toHaveTextContent('Ótima explicação!');
    const [[, init]] = requests('POST', '/posts/a/comments');
    expect(JSON.parse(String(init.body))).toEqual({ content: 'Ótima explicação!' });
  });

  it('mantém o texto e mostra o erro quando o envio falha', async () => {
    mockApi((url, method) => (url.includes('/comments') && method === 'POST' ? json(500) : json(200, page([]))));
    await renderAt('/posts/a/comments');

    await fireEvent.changeText(await screen.findByLabelText('Seu comentário'), 'Meu comentário');
    await fireEvent.press(screen.getByRole('button', { name: 'Publicar comentário' }));

    expect(await screen.findByText('Não foi possível publicar o comentário.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Seu comentário')).toHaveDisplayValue('Meu comentário');
  });

  it('cada um só pode excluir o próprio comentário', async () => {
    mockApi(() => json(200, page([OWN_COMMENT, OTHER_COMMENT])));
    await renderAt('/posts/a/comments', 'STUDENT');

    await screen.findByText(OTHER_COMMENT.content);
    expect(screen.getByRole('button', { name: 'Excluir comentário de Ana Souza' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Excluir comentário de Bruna Lima' })).toBeNull();
  });

  it('o autor da postagem não pode excluir comentários de outras pessoas', async () => {
    mockApi(() => json(200, page([OTHER_COMMENT])));
    await renderAt('/posts/a/comments', 'TEACHER', POST.authorId);

    await screen.findByText(OTHER_COMMENT.content);
    expect(screen.queryByRole('button', { name: 'Excluir comentário de Bruna Lima' })).toBeNull();
  });

  it('o administrador pode excluir qualquer comentário', async () => {
    mockApi(() => json(200, page([OTHER_COMMENT])));
    await renderAt('/posts/a/comments', 'ADMIN', 'admin-1');

    expect(await screen.findByRole('button', { name: 'Excluir comentário de Bruna Lima' })).toBeOnTheScreen();
  });

  it('exclui só depois de confirmar e tira o comentário da lista', async () => {
    mockApi((url, method) =>
      url.includes('/comments/c2') && method === 'DELETE' ? json(200, {}) : json(200, page([OWN_COMMENT])),
    );
    await renderAt('/posts/a/comments');

    await fireEvent.press(await screen.findByRole('button', { name: 'Excluir comentário de Ana Souza' }));

    expect(alertSpy).toHaveBeenCalledWith('Excluir comentário', expect.any(String), expect.any(Array));
    expect(requests('DELETE', '/comments/c2')).toHaveLength(0);

    const buttons = alertSpy.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    await act(async () => buttons.find((button) => button.text === 'Excluir')?.onPress?.());

    await waitFor(() => expect(screen.queryByText(OWN_COMMENT.content)).toBeNull());
    expect(requests('DELETE', '/posts/a/comments/c2')).toHaveLength(1);
    expect(screen.getByText('Nenhum comentário ainda')).toBeOnTheScreen();
  });
});
