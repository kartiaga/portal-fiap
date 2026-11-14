import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
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

function person(id: string, name: string, email: string, role: string) {
  return {
    id,
    name,
    email,
    role,
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
  };
}

const teacher = person('22222222-2222-4222-8222-222222222222', 'Maria Silva', 'maria@fiap.com.br', 'TEACHER');
const student = person('33333333-3333-4333-8333-333333333333', 'João Souza', 'joao@fiap.com.br', 'STUDENT');
const admin = person('44444444-4444-4444-8444-444444444444', 'Admin FIAP', 'admin@fiap.com.br', 'ADMIN');

function response(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

function signInAs(role: string) {
  store.getItemAsync.mockResolvedValue(
    `header.${Buffer.from(
      JSON.stringify({ sub: SELF_ID, role, exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString('base64url')}.signature`,
  );
}

/** Pedidos de listagem (`GET /users`) feitos até agora. */
function listRequests() {
  return fetchMock.mock.calls
    .map(([url]) => new URL(url))
    .filter((request) => request.pathname === '/users');
}

beforeEach(() => {
  jest.clearAllMocks();
  setAuthToken(null);
  global.fetch = fetchMock;
  signInAs('ADMIN');
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
  fetchMock.mockImplementation((url: string, init?: RequestInit) => {
    const request = new URL(url);
    if (request.pathname === '/users' && !init?.method) {
      // Como a API: sem perfil, o professor vê professores e estudantes; o administrador, todos.
      const role = request.searchParams.get('role');
      const items = role
        ? [teacher, student, admin].filter((item) => item.role === role)
        : [teacher, student];
      return Promise.resolve(response({ items, nextCursor: null, hasMore: false }));
    }
    if (request.pathname === '/users' && init?.method === 'POST') return Promise.resolve(response('ok'));
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

/** Abre a folha de filtros, escolhe a opção e aplica. */
async function filterBy(optionName: string) {
  await fireEvent.press(screen.getByTestId('people-filter'));
  await fireEvent.press(await screen.findByRole('radio', { name: optionName }));
  await fireEvent.press(screen.getByRole('button', { name: 'Aplicar' }));
}

describe('lista', () => {
  it('mostra todos os perfis juntos, cada cartão com o selo do perfil', async () => {
    await openPeople();

    expect(await screen.findByText('João Souza')).toBeOnTheScreen();
    expect(listRequests()[0]?.searchParams.has('role')).toBe(false);
    // As outras abas também ficam montadas (a Conta mostra o próprio perfil), então só a lista conta.
    const list = within(screen.getByTestId('people-list'));
    expect(list.getByText('Professor')).toBeOnTheScreen();
    expect(list.getByText('Estudante')).toBeOnTheScreen();
  });

  it('o cartão anuncia nome, perfil e e-mail, e a ação na dica', async () => {
    await openPeople();

    const card = screen.getByRole('button', { name: 'Maria Silva, Professor, maria@fiap.com.br' });
    expect(card.props.accessibilityHint).toBe('Abre a edição');
  });

  it('envia a busca por e-mail para a API', async () => {
    await openPeople();

    await fireEvent.changeText(screen.getByLabelText('Buscar por e-mail'), ' maria ');

    await waitFor(() => expect(listRequests().at(-1)?.searchParams.get('search')).toBe('maria'));
  });
});

describe('filtro por perfil', () => {
  it('abre a folha pelo ícone ao lado da busca e filtra pelo perfil escolhido', async () => {
    await openPeople();
    expect(screen.getByTestId('people-filter').props.accessibilityLabel).toBe('Filtros');

    await filterBy('Estudantes');

    expect(await screen.findByText('Perfil: Estudantes')).toBeOnTheScreen();
    expect(await screen.findByText('João Souza')).toBeOnTheScreen();
    expect(screen.queryByText('Maria Silva')).toBeNull();
    expect(screen).toHavePathname('/people');
    expect(listRequests().at(-1)?.searchParams.get('role')).toBe('STUDENT');
    // O ponto no ícone avisa que há filtro ligado.
    expect(screen.getByRole('button', { name: 'Filtros, 1 ativo' })).toBeOnTheScreen();
  });

  it('remover a etiqueta volta a listar todos', async () => {
    await openPeople();
    await filterBy('Estudantes');
    await screen.findByText('Perfil: Estudantes');

    await fireEvent.press(screen.getByRole('button', { name: 'Remover filtro Perfil: Estudantes' }));

    expect(await screen.findByText('Maria Silva')).toBeOnTheScreen();
    expect(screen.queryByText('Perfil: Estudantes')).toBeNull();
    expect(listRequests().at(-1)?.searchParams.has('role')).toBe(false);
    expect(screen.getByTestId('people-filter').props.accessibilityLabel).toBe('Filtros');
  });

  it('"Limpar" na folha desliga o filtro e fecha a folha', async () => {
    await openPeople();
    await filterBy('Estudantes');
    await screen.findByText('Perfil: Estudantes');

    await fireEvent.press(screen.getByRole('button', { name: 'Filtros, 1 ativo' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Limpar' }));

    expect(await screen.findByText('Maria Silva')).toBeOnTheScreen();
    expect(screen.queryByText('Perfil: Estudantes')).toBeNull();
    expect(screen).toHavePathname('/people');
  });

  it('a folha abre com o filtro atual marcado', async () => {
    await openPeople();
    await filterBy('Estudantes');
    await screen.findByText('Perfil: Estudantes');

    await fireEvent.press(screen.getByRole('button', { name: 'Filtros, 1 ativo' }));

    expect(await screen.findByRole('radio', { name: 'Estudantes' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Todos' })).not.toBeChecked();
  });

  it('o professor não vê a opção Administradores', async () => {
    signInAs('TEACHER');
    await openPeople();
    await fireEvent.press(screen.getByRole('button', { name: 'Filtros' }));

    expect(await screen.findByRole('radio', { name: 'Professores' })).toBeOnTheScreen();
    expect(screen.queryByRole('radio', { name: 'Administradores' })).toBeNull();
  });

  it('o administrador também filtra por Administradores', async () => {
    await openPeople();

    await filterBy('Administradores');

    expect(await screen.findByText('Perfil: Administradores')).toBeOnTheScreen();
    expect(await screen.findByText('Admin FIAP')).toBeOnTheScreen();
    expect(listRequests().at(-1)?.searchParams.get('role')).toBe('ADMIN');
  });
});

describe('cadastro', () => {
  it('mostra o erro de cada campo sem chamar a API', async () => {
    await renderRouter('src/app', { initialUrl: '/people/create' });

    await fireEvent.press(await screen.findByRole('button', { name: 'Cadastrar professor' }));

    expect(screen.getByText('Informe um nome com pelo menos 2 caracteres.')).toBeOnTheScreen();
    expect(screen.getByText('Informe um e-mail válido.')).toBeOnTheScreen();
    expect(screen.getByText('A senha deve ter pelo menos 8 caracteres.')).toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('escolhe o perfil no formulário e cadastra com ele', async () => {
    await renderRouter('src/app', { initialUrl: '/people/create' });

    await fireEvent.press(await screen.findByRole('tab', { name: 'Estudante' }));
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Ana Lima');
    await fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@fiap.com.br');
    await fireEvent.changeText(screen.getByLabelText('Senha'), '12345678');
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar estudante' }));

    await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true));
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(post?.[1].body as string)).toEqual({
      name: 'Ana Lima',
      email: 'ana@fiap.com.br',
      password: '12345678',
      role: 'STUDENT',
    });
  });

  it('já vem com o perfil do filtro da lista', async () => {
    await openPeople();
    await filterBy('Estudantes');
    await screen.findByText('Perfil: Estudantes');

    await fireEvent.press(screen.getAllByRole('button', { name: 'Nova pessoa' }).at(-1)!);

    expect(await screen.findByRole('button', { name: 'Cadastrar estudante' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/people/create');
  });

  it('Cancelar no cabeçalho pede confirmação se algo foi digitado', async () => {
    await openPeople();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Nova pessoa' }).at(-1)!);
    await fireEvent.changeText(await screen.findByLabelText('Nome'), 'Novo Nome');

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(alertSpy).toHaveBeenCalledWith('Descartar alterações?', expect.any(String), expect.any(Array));
    expect(screen).toHavePathname('/people/create');
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);
  });
});

describe('edição', () => {
  it('abre a edição pela lista, carrega os dados reais e salva sem alterar o papel', async () => {
    await openPeople();

    await fireEvent.press(screen.getByRole('button', { name: 'Maria Silva, Professor, maria@fiap.com.br' }));

    expect(await screen.findByDisplayValue('Maria Silva')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('maria@fiap.com.br')).toBeOnTheScreen();
    expect(screen).toHavePathname(`/people/${teacher.id}/edit`);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Maria Souza');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(true));
    const put = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(JSON.parse(put?.[1].body as string)).toEqual({ name: 'Maria Souza', email: 'maria@fiap.com.br' });
    expect(await screen.findByText('Professor atualizado com sucesso.')).toBeOnTheScreen();
  });

  it('só habilita "Salvar alterações" depois de alguma alteração', async () => {
    await renderRouter('src/app', { initialUrl: `/people/${teacher.id}/edit` });

    await screen.findByDisplayValue('Maria Silva');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Maria Souza');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();
  });

  it('exclui pela tela de edição, só depois da confirmação', async () => {
    await openPeople();
    await fireEvent.press(screen.getByRole('button', { name: 'Maria Silva, Professor, maria@fiap.com.br' }));
    await screen.findByDisplayValue('Maria Silva');

    await fireEvent.press(screen.getByRole('button', { name: 'Excluir maria@fiap.com.br' }));
    expect(alertSpy).toHaveBeenCalledWith('Excluir professor?', expect.any(String), expect.any(Array));
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(false);

    answerConfirmation('Excluir');

    await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(true));
    expect(await screen.findByText('Professor excluído com sucesso.')).toBeOnTheScreen();
    expect(screen).toHavePathname('/people');
  });

  it('o título e a exclusão seguem o perfil da conta aberta', async () => {
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(response(new URL(url).pathname === `/users/${student.id}` ? student : {})),
    );
    await renderRouter('src/app', { initialUrl: `/people/${student.id}/edit` });

    await fireEvent.press(await screen.findByRole('button', { name: 'Excluir joao@fiap.com.br' }));

    expect(alertSpy).toHaveBeenCalledWith('Excluir estudante?', expect.any(String), expect.any(Array));
  });

  it('oferece "Voltar" quando a pessoa não existe', async () => {
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(
        new URL(url).pathname.startsWith('/users/')
          ? { ok: false, status: 404, json: async () => ({}) }
          : response({ items: [], nextCursor: null, hasMore: false }),
      ),
    );
    await renderRouter('src/app', { initialUrl: `/people/${teacher.id}/edit` });

    expect(await screen.findByText('Usuário não encontrado. Atualize a lista.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).toBeNull();
  });

  it('ninguém exclui a própria conta', async () => {
    const self = { ...teacher, id: SELF_ID, email: 'eu@fiap.com.br' };
    fetchMock.mockImplementation(() => Promise.resolve(response(self)));
    await renderRouter('src/app', { initialUrl: `/people/${SELF_ID}/edit` });

    expect(await screen.findByText('Você não pode excluir sua própria conta.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Excluir eu@fiap.com.br' })).toBeNull();
  });
});

describe('professor: só vê a lista', () => {
  beforeEach(() => {
    signInAs('TEACHER');
  });

  it('vê professores e estudantes, com busca e filtro', async () => {
    await openPeople();

    expect(await screen.findByText('João Souza')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Filtros' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Buscar por e-mail')).toBeOnTheScreen();
  });

  it('não tem "Nova pessoa" nem cartões que abrem a edição', async () => {
    await openPeople();

    expect(screen.queryByRole('button', { name: 'Nova pessoa' })).toBeNull();
    // O cartão só informa: continua legível, mas não é um botão.
    expect(screen.getByLabelText('Maria Silva, Professor, maria@fiap.com.br')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Maria Silva, Professor, maria@fiap.com.br' })).toBeNull();
  });

  it.each([
    ['o cadastro', '/people/create'],
    ['a edição', `/people/${teacher.id}/edit`],
  ])('abrir %s por link leva de volta aos posts', async (_label, url) => {
    await renderRouter('src/app', { initialUrl: url });

    expect(await screen.findByRole('header', { name: 'Posts' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);
  });
});
