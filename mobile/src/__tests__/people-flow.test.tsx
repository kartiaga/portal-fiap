import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { renderRouter } from 'expo-router/testing-library';
import { Alert } from 'react-native';

import { setAuthToken } from '@/lib/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);
const fetchMock = jest.fn();
const alertSpy = jest.spyOn(Alert, 'alert');
const SELF_ID = '11111111-1111-4111-8111-111111111111';

/** Responde ao alerta de confirmação como se o usuário tocasse no botão indicado. */
function answerConfirmation(buttonText: string) {
  const buttons = alertSpy.mock.lastCall?.[2] ?? [];
  buttons.find((button) => button.text === buttonText)?.onPress?.();
}

const teacher = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Maria Silva',
  email: 'maria@fiap.com.br',
  role: 'TEACHER',
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
};

function response(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

beforeEach(() => {
  jest.clearAllMocks();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.getItemAsync.mockResolvedValue(`header.${Buffer.from(JSON.stringify({
    sub: SELF_ID,
    role: 'TEACHER',
    exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64url')}.signature`);
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
  fetchMock.mockImplementation((url: string, init?: RequestInit) => {
    const request = new URL(url);
    if (request.pathname === '/users') {
      const items = request.searchParams.get('role') === 'TEACHER' ? [teacher] : [];
      return Promise.resolve(response({ items, nextCursor: null, hasMore: false }));
    }
    if (request.pathname === `/users/${teacher.id}` && init?.method === 'DELETE') {
      return Promise.resolve(response({ message: 'User deleted successfully' }));
    }
    if (request.pathname === `/users/${teacher.id}` && init?.method === 'PUT') {
      return Promise.resolve(response({ ...teacher, name: 'Maria Souza' }));
    }
    if (request.pathname === `/users/${teacher.id}`) return Promise.resolve(response(teacher));
    throw new Error(`Unexpected request: ${url}`);
  });
});

async function openPeople() {
  await renderRouter('src/app', { initialUrl: '/people' });
  expect(await screen.findByText('Maria Silva')).toBeOnTheScreen();
}

it('lista professores primeiro e troca para estudantes pelo seletor', async () => {
  await openPeople();
  expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('role')).toBe('TEACHER');

  await fireEvent.press(screen.getByRole('tab', { name: 'Estudantes' }));

  expect(await screen.findByText('Nenhum estudante cadastrado')).toBeOnTheScreen();
  expect(screen.queryByText('Maria Silva')).toBeNull();
  expect(new URL(fetchMock.mock.lastCall?.[0]).searchParams.get('role')).toBe('STUDENT');
});

it('envia a busca por e-mail para a API', async () => {
  await openPeople();

  await fireEvent.changeText(screen.getByLabelText('Buscar por e-mail'), ' maria ');

  await waitFor(() =>
    expect(new URL(fetchMock.mock.lastCall?.[0]).searchParams.get('search')).toBe('maria'),
  );
});

it('exclui pela tela de edição, só depois da confirmação', async () => {
  await openPeople();
  await fireEvent.press(screen.getByRole('button', { name: 'Maria Silva, maria@fiap.com.br' }));
  await screen.findByDisplayValue('Maria Silva');

  await fireEvent.press(screen.getByRole('button', { name: 'Excluir maria@fiap.com.br' }));
  expect(alertSpy).toHaveBeenCalledWith('Excluir professor?', expect.any(String), expect.any(Array));
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(false);

  answerConfirmation('Excluir');

  await waitFor(() =>
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(true),
  );
  expect(await screen.findByText('Professor excluído com sucesso.')).toBeOnTheScreen();
  expect(screen).toHavePathname('/people');
});

it('abre a edição pela lista, carrega os dados reais e salva sem alterar o papel', async () => {
  await openPeople();

  await fireEvent.press(screen.getByRole('button', { name: 'Maria Silva, maria@fiap.com.br' }));

  expect(await screen.findByDisplayValue('Maria Silva')).toBeOnTheScreen();
  expect(screen.getByDisplayValue('maria@fiap.com.br')).toBeOnTheScreen();
  expect(fetchMock.mock.calls.some(([url]) => new URL(url).pathname === `/users/${teacher.id}`)).toBe(true);

  await fireEvent.changeText(screen.getByLabelText('Nome'), 'Maria Souza');
  await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));

  await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(true));
  const put = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
  expect(JSON.parse(put?.[1].body as string)).toEqual({ name: 'Maria Souza', email: 'maria@fiap.com.br' });
  expect(await screen.findByText('Professor atualizado com sucesso.')).toBeOnTheScreen();
});

it('mostra o erro de cada campo no cadastro sem chamar a API', async () => {
  await renderRouter('src/app', { initialUrl: '/teachers/create' });

  await fireEvent.press(await screen.findByRole('button', { name: 'Cadastrar professor' }));

  expect(screen.getByText('Informe um nome com pelo menos 2 caracteres.')).toBeOnTheScreen();
  expect(screen.getByText('Informe um e-mail válido.')).toBeOnTheScreen();
  expect(screen.getByText('A senha deve ter pelo menos 8 caracteres.')).toBeOnTheScreen();
  expect(fetchMock).not.toHaveBeenCalled();
});

it('o cartão da pessoa anuncia nome e e-mail, e a ação na dica', async () => {
  await openPeople();

  const card = screen.getByRole('button', { name: 'Maria Silva, maria@fiap.com.br' });
  expect(card.props.accessibilityHint).toBe('Abre a edição');
});

it('só habilita "Salvar alterações" depois de alguma alteração', async () => {
  await renderRouter('src/app', { initialUrl: `/teachers/${teacher.id}/edit` });

  await screen.findByDisplayValue('Maria Silva');
  expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();

  await fireEvent.changeText(screen.getByLabelText('Nome'), 'Maria Souza');
  expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();
});

it.each([
  ['não existe', { ok: false, status: 404, json: async () => ({}) }, 'Usuário não encontrado. Atualize a lista.'],
  ['é de outra lista', response({ ...teacher, role: 'STUDENT' }), 'Este usuário não pertence a esta lista.'],
])('oferece "Voltar" quando a pessoa %s', async (_label, answer, message) => {
  fetchMock.mockImplementation((url: string) =>
    Promise.resolve(new URL(url).pathname.startsWith('/users/') ? answer : response({ items: [], nextCursor: null, hasMore: false })),
  );
  await renderRouter('src/app', { initialUrl: `/teachers/${teacher.id}/edit` });

  expect(await screen.findByText(message)).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Voltar' })).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Tentar novamente' })).toBeNull();
});

it('cadastro em modal: Cancelar no cabeçalho pede confirmação se algo foi digitado', async () => {
  await openPeople();
  await fireEvent.press(screen.getByRole('button', { name: 'Novo professor' }));
  await fireEvent.changeText(await screen.findByLabelText('Nome'), 'Novo Nome');

  await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

  expect(alertSpy).toHaveBeenCalledWith('Descartar alterações?', expect.any(String), expect.any(Array));
  expect(screen).toHavePathname('/teachers/create');
  expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);
});

it('professor não pode excluir a própria conta', async () => {
  const self = { ...teacher, id: SELF_ID, email: 'eu@fiap.com.br' };
  fetchMock.mockImplementation(() => Promise.resolve(response(self)));
  await renderRouter('src/app', { initialUrl: `/teachers/${SELF_ID}/edit` });

  expect(await screen.findByText('Você não pode excluir sua própria conta.')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Excluir eu@fiap.com.br' })).toBeNull();
});
