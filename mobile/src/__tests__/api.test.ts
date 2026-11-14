import { ApiError, apiFetch, setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import { getPosts } from '@/lib/posts';

const fetchMock = jest.fn();

function respondWith(status: number, body: unknown = {}) {
  return { ok: status < 400, status, json: async () => body };
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
  setAuthToken(null);
  setUnauthorizedHandler(null);
});

it('envia o token da sessão', async () => {
  setAuthToken('abc');
  fetchMock.mockResolvedValue(respondWith(200, { ok: true }));

  await expect(apiFetch('/posts')).resolves.toEqual({ ok: true });
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer abc');
});

it('encerra a sessão quando a API recusa o token atual', async () => {
  const onUnauthorized = jest.fn();
  setUnauthorizedHandler(onUnauthorized);
  setAuthToken('abc');
  fetchMock.mockResolvedValue(respondWith(401, { message: 'Unauthorized' }));

  await expect(apiFetch('/posts')).rejects.toMatchObject({ status: 401 });
  expect(onUnauthorized).toHaveBeenCalledTimes(1);
});

it('não encerra a sessão em login recusado, pois não há token', async () => {
  const onUnauthorized = jest.fn();
  setUnauthorizedHandler(onUnauthorized);
  fetchMock.mockResolvedValue(respondWith(401));

  await expect(apiFetch('/login', { method: 'POST' })).rejects.toBeInstanceOf(ApiError);
  expect(onUnauthorized).not.toHaveBeenCalled();
});

it('ignora o 401 atrasado de um token antigo', async () => {
  const onUnauthorized = jest.fn();
  setUnauthorizedHandler(onUnauthorized);
  setAuthToken('antigo');

  let resolveFetch: (value: unknown) => void = () => undefined;
  fetchMock.mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));
  const request = apiFetch('/posts');

  setAuthToken('novo');
  resolveFetch(respondWith(401));

  await expect(request).rejects.toMatchObject({ status: 401 });
  expect(onUnauthorized).not.toHaveBeenCalled();
});

it('reporta falha de rede com status 0', async () => {
  fetchMock.mockRejectedValue(new TypeError('Network request failed'));
  await expect(apiFetch('/posts')).rejects.toMatchObject({ status: 0 });
});

describe('getPosts', () => {
  it('pede só as postagens de um autor à API, com o cursor da página', async () => {
    fetchMock.mockResolvedValue(respondWith(200, { items: [], nextCursor: null, hasMore: false }));

    await getPosts();
    expect(new URL(fetchMock.mock.lastCall?.[0]).search).toBe('?limit=20');

    await getPosts('c1', 'autor-1');
    expect(new URL(fetchMock.mock.lastCall?.[0]).search).toBe('?limit=20&cursor=c1&authorId=autor-1');
  });
});
