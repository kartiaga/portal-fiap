import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { renderRouter } from 'expo-router/testing-library';
import { Alert } from 'react-native';

import { setAuthToken } from '@/lib/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
// O módulo é nativo: o File simulado só guarda o endereço do arquivo local.
jest.mock('expo-file-system', () => ({
  File: function MockFile(this: { uri: string }, uri: string) {
    this.uri = uri;
  },
}));

const store = jest.mocked(SecureStore);
const picker = jest.mocked(ImagePicker);
const fetchMock = jest.fn();
const alertSpy = jest.spyOn(Alert, 'alert');

const ME = '33333333-3333-4333-8333-333333333333';
const STORAGE_URL = 'http://localhost:9000/portal-fiap';
const NEW_KEY = `avatars/${ME}/11111111-2222-4333-8444-555555555555.jpg`;
const NEW_URL = `${STORAGE_URL}/${NEW_KEY}`;
const OLD_URL = `${STORAGE_URL}/avatars/${ME}/antiga.jpg`;

function makeToken(role: string): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub: ME, role, exp })).toString('base64url');
  return `header.${payload}.signature`;
}

function response(status: number, body: unknown = {}) {
  return { ok: status < 400, status, json: async () => body };
}

type ApiOptions = {
  avatarUrl?: string | null;
  uploadStatus?: number;
  storageStatus?: number;
  maxBytes?: number;
};

/** Simula a API e o armazenamento (MinIO) para a troca de foto. */
function mockApi(role: string, { avatarUrl = null, uploadStatus = 200, storageStatus = 204, maxBytes = 5 * 1024 * 1024 }: ApiOptions = {}) {
  const me = {
    id: ME,
    name: 'Ana Souza',
    email: 'ana@fiap.com.br',
    role,
    avatarUrl,
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
  };
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    if (url === STORAGE_URL) return response(storageStatus);
    const { pathname } = new URL(url);
    if (pathname === `/users/${ME}/avatar/upload`) {
      if (uploadStatus !== 200) return response(uploadStatus, { message: 'x' });
      return response(200, {
        url: STORAGE_URL,
        fields: { key: NEW_KEY, 'Content-Type': 'image/jpeg', Policy: 'p' },
        key: NEW_KEY,
        maxBytes,
      });
    }
    if (pathname === `/users/${ME}/avatar` && init?.method === 'PUT') return response(200, { avatarUrl: NEW_URL });
    if (pathname === `/users/${ME}/avatar` && init?.method === 'DELETE') return response(200, { avatarUrl: null });
    if (pathname === `/users/${ME}`) return response(200, me);
    return response(200, { items: [], nextCursor: null, hasMore: false });
  });
}

/**
 * No app, o FormData é o do React Native, que aceita { uri, name, type } como arquivo. O do Node,
 * usado nos testes, transformaria o objeto em texto: este só registra o que foi anexado, em ordem.
 */
class RecordingFormData {
  parts: [string, unknown][] = [];

  append(name: string, value: unknown) {
    this.parts.push([name, value]);
  }
}

function pickPhoto(asset: Partial<ImagePicker.ImagePickerAsset> = {}) {
  picker.launchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [
      { uri: 'file:///tmp/foto.jpg', width: 400, height: 400, mimeType: 'image/jpeg', fileName: 'foto.jpg', fileSize: 120_000, ...asset },
    ],
  });
}

/** Responde ao menu de opções da foto como se a pessoa tocasse no botão indicado. */
function chooseInMenu(buttonText: string) {
  const buttons = alertSpy.mock.lastCall?.[2] ?? [];
  buttons.find((button) => button.text === buttonText)?.onPress?.();
}

async function openAccount(role: string, options?: ApiOptions) {
  mockApi(role, options);
  store.getItemAsync.mockResolvedValue(makeToken(role));
  await renderRouter('src/app', { initialUrl: '/account' });
  await screen.findByText('Ana Souza');
}

function calls(method: string, matcher: (url: string) => boolean) {
  return fetchMock.mock.calls.filter(([url, init]) => (init?.method ?? 'GET') === method && matcher(String(url)));
}

/** Endereços das fotos de perfil na tela (o avatar é decorativo, então fica fora do leitor de tela). */
function shownImages(): string[] {
  return screen
    .queryAllByTestId('avatar-photo', { includeHiddenElements: true })
    .map((image) => image.props.source?.uri as string);
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  setAuthToken(null);
  global.fetch = fetchMock;
  store.setItemAsync.mockResolvedValue(undefined);
  store.deleteItemAsync.mockResolvedValue(undefined);
});

describe('foto de perfil na Conta', () => {
  it.each(['STUDENT', 'TEACHER', 'ADMIN'])('%s escolhe uma foto, que vai ao armazenamento e aparece no avatar', async (role) => {
    await openAccount(role);
    pickPhoto();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    expect(alertSpy).toHaveBeenCalledWith('Foto de perfil', undefined, expect.any(Array));
    chooseInMenu('Escolher da galeria');

    expect(await screen.findByText('Foto atualizada.')).toBeOnTheScreen();
    expect(shownImages()).toContain(NEW_URL);
    // Os três passos, em ordem: autorização, envio ao armazenamento e confirmação.
    const paths = fetchMock.mock.calls.map(([url, init]) => `${init?.method ?? 'GET'} ${String(url).replace('http://localhost:3001', '')}`);
    const upload = paths.findIndex((entry) => entry === `POST /users/${ME}/avatar/upload`);
    const storage = paths.findIndex((entry) => entry === `POST ${STORAGE_URL}`);
    const confirm = paths.findIndex((entry) => entry === `PUT /users/${ME}/avatar`);
    expect(upload).toBeGreaterThan(-1);
    expect(storage).toBeGreaterThan(upload);
    expect(confirm).toBeGreaterThan(storage);
    expect(JSON.parse(calls('PUT', (url) => url.endsWith('/avatar'))[0][1].body as string)).toEqual({ key: NEW_KEY });
  });

  it('abre a galeria com recorte quadrado, sem dados extras da foto', async () => {
    await openAccount('TEACHER');
    pickPhoto();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    chooseInMenu('Escolher da galeria');
    await screen.findByText('Foto atualizada.');

    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], exif: false }),
    );
  });

  it('envia o formulário com os campos assinados primeiro e o arquivo por último', async () => {
    const OriginalFormData = global.FormData;
    global.FormData = RecordingFormData as unknown as typeof FormData;
    try {
      await sendPhotoAndCollectForm();
    } finally {
      global.FormData = OriginalFormData;
    }
  });

  async function sendPhotoAndCollectForm() {
    await openAccount('TEACHER');
    pickPhoto();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    chooseInMenu('Escolher da galeria');
    await screen.findByText('Foto atualizada.');

    const [, init] = calls('POST', (url) => url === STORAGE_URL)[0];
    const parts = (init?.body as unknown as RecordingFormData).parts;
    expect(parts.map(([name]) => name)).toEqual(['key', 'Content-Type', 'Policy', 'file']);
    // O arquivo é um File de verdade (o fetch recusa o objeto { uri, name, type } do React Native antigo).
    expect(parts.at(-1)?.[1]).toMatchObject({ uri: 'file:///tmp/foto.jpg' });
    expect(parts.at(-1)?.[1]).not.toHaveProperty('type');
    // O Content-Type do multipart é montado pelo fetch (com o boundary), nunca à mão.
    expect((init?.headers ?? {}) as Record<string, string>).not.toHaveProperty('Content-Type');
  }

  it('cancelar a escolha não envia nada', async () => {
    await openAccount('TEACHER');
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null });
    const before = fetchMock.mock.calls.length;

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    chooseInMenu('Escolher da galeria');

    await waitFor(() => expect(picker.launchImageLibraryAsync).toHaveBeenCalled());
    expect(fetchMock.mock.calls).toHaveLength(before);
    expect(screen.queryByText('Foto atualizada.')).toBeNull();
  });

  it('avisa e não envia a foto quando ela passa do limite da API', async () => {
    await openAccount('TEACHER', { maxBytes: 5 * 1024 * 1024 });
    pickPhoto({ fileSize: 6 * 1024 * 1024 });

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    chooseInMenu('Escolher da galeria');

    expect(await screen.findByText('A foto é muito grande. Escolha uma de até 5 MB.')).toBeOnTheScreen();
    expect(calls('POST', (url) => url === STORAGE_URL)).toHaveLength(0);
  });

  it('avisa quando o formato da foto não é aceito', async () => {
    await openAccount('TEACHER');
    pickPhoto({ mimeType: 'image/heic', fileName: 'foto.heic', uri: 'file:///tmp/foto.heic' });

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    chooseInMenu('Escolher da galeria');

    expect(await screen.findByText('Use uma foto JPEG, PNG ou WebP.')).toBeOnTheScreen();
    expect(calls('POST', (url) => url.includes('/avatar/upload'))).toHaveLength(0);
  });

  it('avisa quando o armazenamento de fotos não está disponível (503)', async () => {
    await openAccount('TEACHER', { uploadStatus: 503 });
    pickPhoto();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    chooseInMenu('Escolher da galeria');

    expect(await screen.findByText('O envio de fotos não está disponível no momento.')).toBeOnTheScreen();
  });

  it('avisa quando o armazenamento recusa o arquivo, sem confirmar na API', async () => {
    await openAccount('TEACHER', { storageStatus: 400 });
    pickPhoto();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    chooseInMenu('Escolher da galeria');

    expect(await screen.findByText('Não foi possível atualizar a foto. Tente de novo.')).toBeOnTheScreen();
    expect(calls('PUT', (url) => url.endsWith('/avatar'))).toHaveLength(0);
    // O botão volta a funcionar para outra tentativa.
    expect(screen.getByRole('button', { name: 'Alterar foto de perfil' })).toBeEnabled();
  });

  it('mostra a foto atual e deixa removê-la, voltando às iniciais', async () => {
    await openAccount('TEACHER', { avatarUrl: OLD_URL });
    expect(shownImages()).toContain(OLD_URL);

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    const labels = (alertSpy.mock.lastCall?.[2] ?? []).map((button) => button.text);
    expect(labels).toEqual(['Escolher da galeria', 'Remover foto', 'Cancelar']);
    chooseInMenu('Remover foto');

    expect(await screen.findByText('Foto removida.')).toBeOnTheScreen();
    expect(calls('DELETE', (url) => url.endsWith('/avatar'))).toHaveLength(1);
    expect(shownImages()).not.toContain(OLD_URL);
    expect(screen.getByText('AS', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('sem foto, o menu não oferece remover', async () => {
    await openAccount('STUDENT');

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));

    const labels = (alertSpy.mock.lastCall?.[2] ?? []).map((button) => button.text);
    expect(labels).toEqual(['Escolher da galeria', 'Cancelar']);
  });

  it('o estudante vê o próprio nome e e-mail na Conta, mas não "Editar meus dados"', async () => {
    await openAccount('STUDENT');

    expect(screen.getByText('ana@fiap.com.br')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Editar meus dados' })).toBeNull();
  });
});

describe('celular na rede: o MinIO anunciado como localhost', () => {
  const original = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    if (original === undefined) delete process.env.EXPO_PUBLIC_API_URL;
    else process.env.EXPO_PUBLIC_API_URL = original;
  });

  it('envia a foto ao IP da máquina, e não ao localhost do próprio celular', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.0.194:3001';
    mockApi('TEACHER');
    // O armazenamento só responde no endereço que o celular alcança.
    const base = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) =>
      url === 'http://192.168.0.194:9000/portal-fiap'
        ? response(204)
        : url === STORAGE_URL
          ? Promise.reject(new TypeError('Network request failed'))
          : base(url, init),
    );
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    await renderRouter('src/app', { initialUrl: '/account' });
    await screen.findByText('Ana Souza');
    pickPhoto();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    chooseInMenu('Escolher da galeria');

    expect(await screen.findByText('Foto atualizada.')).toBeOnTheScreen();
    // A foto nova também é buscada no endereço alcançável.
    expect(shownImages()).toContain('http://192.168.0.194:9000/portal-fiap/' + NEW_KEY);
  });

  it('sem conexão com o armazenamento, avisa para verificar a conexão', async () => {
    mockApi('TEACHER');
    const base = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) =>
      url === STORAGE_URL ? Promise.reject(new TypeError('Network request failed')) : base(url, init),
    );
    store.getItemAsync.mockResolvedValue(makeToken('TEACHER'));
    await renderRouter('src/app', { initialUrl: '/account' });
    await screen.findByText('Ana Souza');
    pickPhoto();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
    chooseInMenu('Escolher da galeria');

    expect(
      await screen.findByText('Não foi possível enviar a foto. Verifique a conexão e tente de novo.'),
    ).toBeOnTheScreen();
    expect(calls('PUT', (url) => url.endsWith('/avatar'))).toHaveLength(0);
  });
});
