import { ApiError, apiFetch, setAuthToken, setUnauthorizedHandler } from '@/lib/api';

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
