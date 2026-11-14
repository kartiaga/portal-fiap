import { ApiError, setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import { createPerson, deletePerson, getPerson, listPeoplePage, personError, updatePerson } from '@/features/people/api';

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
  setAuthToken(null);
  setUnauthorizedHandler(null);
});

function respond(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

function lastRequest() {
  const [url, init] = fetchMock.mock.lastCall as [string, RequestInit];
  return { path: new URL(url).pathname + new URL(url).search, init };
}

it('envia o perfil e o cursor ao backend para paginar sem filtrar localmente', async () => {
  const page = { items: [{ id: '1', role: 'TEACHER', name: 'Ana' }], nextCursor: 'cursor+1', hasMore: true };
  fetchMock.mockResolvedValue(respond(page));

  await expect(listPeoplePage('TEACHER')).resolves.toEqual(page);
  expect(lastRequest().path).toBe('/users?role=TEACHER&limit=20');

  await expect(listPeoplePage('STUDENT', 'cursor+1')).resolves.toEqual(page);
  expect(lastRequest().path).toBe('/users?role=STUDENT&limit=20&cursor=cursor%2B1');
});

it('usa os endpoints reais de cadastro, consulta, edição e exclusão', async () => {
  fetchMock.mockResolvedValue(respond({}));

  await createPerson({ name: 'Ana', email: 'ana@fiap.com.br', password: '12345678', role: 'TEACHER' });
  expect(lastRequest().path).toBe('/users');
  expect(lastRequest().init.method).toBe('POST');
  expect(JSON.parse(lastRequest().init.body as string)).toEqual({ name: 'Ana', email: 'ana@fiap.com.br', password: '12345678', role: 'TEACHER' });

  await getPerson('abc');
  expect(lastRequest().path).toBe('/users/abc');
  expect(lastRequest().init.method).toBeUndefined();

  await updatePerson('abc', { name: 'Ana Maria', email: 'ana@fiap.com.br' });
  expect(lastRequest().path).toBe('/users/abc');
  expect(lastRequest().init.method).toBe('PUT');
  expect(JSON.parse(lastRequest().init.body as string)).toEqual({ name: 'Ana Maria', email: 'ana@fiap.com.br' });

  await deletePerson('abc');
  expect(lastRequest().path).toBe('/users/abc');
  expect(lastRequest().init.method).toBe('DELETE');
});

it('explica o bloqueio da exclusão quando há postagens', () => {
  expect(personError(new ApiError('conflict', 409), 'delete')).toContain('postagens');
  expect(personError(new ApiError('forbidden', 403), 'save')).toContain('permissão');
});
