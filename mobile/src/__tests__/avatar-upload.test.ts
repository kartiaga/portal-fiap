import { ApiError } from '@/lib/api';
import { AvatarError, avatarErrorMessage, contentTypeOf } from '@/features/profile/avatar';

describe('contentTypeOf', () => {
  it('usa o tipo informado pelo seletor quando a API o aceita', () => {
    expect(contentTypeOf({ uri: 'file:///a', mimeType: 'image/png' })).toBe('image/png');
    expect(contentTypeOf({ uri: 'file:///a', mimeType: 'image/webp' })).toBe('image/webp');
  });

  it('sem tipo, deduz pela extensão do arquivo ou do endereço', () => {
    expect(contentTypeOf({ uri: 'file:///tmp/x.JPG' })).toBe('image/jpeg');
    expect(contentTypeOf({ uri: 'file:///tmp/x?cache=1', fileName: 'minha.png' })).toBe('image/png');
    expect(contentTypeOf({ uri: 'file:///tmp/x.jpeg?v=2' })).toBe('image/jpeg');
  });

  it('recusa formatos que a API não aceita', () => {
    expect(contentTypeOf({ uri: 'file:///a.heic', mimeType: 'image/heic' })).toBeNull();
    expect(contentTypeOf({ uri: 'file:///a.gif' })).toBeNull();
    expect(contentTypeOf({ uri: 'file:///sem-extensao' })).toBeNull();
  });
});

describe('avatarErrorMessage', () => {
  it('mostra a mensagem pronta dos erros do próprio módulo', () => {
    expect(avatarErrorMessage(new AvatarError('A foto é muito grande.'))).toBe('A foto é muito grande.');
  });

  it('traduz os erros da API', () => {
    expect(avatarErrorMessage(new ApiError('x', 503))).toBe('O envio de fotos não está disponível no momento.');
    expect(avatarErrorMessage(new ApiError('x', 403))).toBe('Você não pode alterar esta foto.');
    expect(avatarErrorMessage(new ApiError('Sem conexão.', 0))).toBe('Sem conexão.');
  });

  it('usa uma mensagem genérica para o resto', () => {
    expect(avatarErrorMessage(new ApiError('x', 500))).toBe('Não foi possível atualizar a foto. Tente de novo.');
    expect(avatarErrorMessage(new Error('boom'))).toBe('Não foi possível atualizar a foto. Tente de novo.');
  });
});
