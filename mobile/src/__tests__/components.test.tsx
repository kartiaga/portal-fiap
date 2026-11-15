import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Avatar, initialsOf } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Banner } from '@/components/banner';
import { Button } from '@/components/button';
import { PostMeta } from '@/components/post-meta';
import { RoleBadge } from '@/components/role-badge';
import { ScreenHeader } from '@/components/screen-header';
import { SegmentedControl } from '@/components/segmented-control';
import { TextField } from '@/components/text-field';
import { Colors } from '@/theme';

/** Estilo achatado do primeiro elemento com o texto indicado. */
function styleOf(text: string) {
  const flat = [screen.getByText(text, { includeHiddenElements: true }).props.style].flat(Infinity);
  return Object.assign({}, ...flat.filter(Boolean));
}

const light = Colors.light;

// Escala de fonte controlada por teste (o mock padrão do React Native usa 2).
let mockFontScale = 1;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 393, height: 852, scale: 3, fontScale: mockFontScale }),
}));

beforeEach(() => {
  mockFontScale = 1;
});

describe('Avatar', () => {
  it('usa as iniciais do primeiro e do último nome', () => {
    expect(initialsOf('Maria da Silva')).toBe('MS');
    expect(initialsOf('Ana')).toBe('A');
    expect(initialsOf('  ')).toBe('?');
  });

  it('é tonal por padrão e vermelho cheio na variante solid', async () => {
    await render(<Avatar name="Ana Lima" />);
    expect(styleOf('AL').color).toBe(light.tintText);

    await render(<Avatar name="Ana Lima" variant="solid" />);
    expect(styleOf('AL').color).toBe(light.onTint);
  });

  it('mostra a foto de perfil no lugar das iniciais', async () => {
    await render(<Avatar name="Ana Lima" uri="http://localhost:9000/portal-fiap/avatars/u/a.jpg" />);

    const photo = screen.getByTestId('avatar-photo', { includeHiddenElements: true });
    expect(photo.props.source).toEqual({ uri: 'http://localhost:9000/portal-fiap/avatars/u/a.jpg' });
    expect(screen.queryByText('AL', { includeHiddenElements: true })).toBeNull();
  });

  it('volta às iniciais se a foto não carregar, e tenta de novo com outro endereço', async () => {
    const { rerender } = await render(<Avatar name="Ana Lima" uri="http://x/quebrada.jpg" />);

    await fireEvent(screen.getByTestId('avatar-photo', { includeHiddenElements: true }), 'error');
    expect(screen.getByText('AL', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByTestId('avatar-photo', { includeHiddenElements: true })).toBeNull();

    await rerender(<Avatar name="Ana Lima" uri="http://x/nova.jpg" />);
    expect(screen.getByTestId('avatar-photo', { includeHiddenElements: true }).props.source).toEqual({
      uri: 'http://x/nova.jpg',
    });
  });

  it('sem foto, usa as iniciais ou o ícone genérico', async () => {
    await render(<Avatar name="Ana Lima" uri={null} />);
    expect(screen.getByText('AL', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByTestId('avatar-photo', { includeHiddenElements: true })).toBeNull();
  });
});

describe('Badge', () => {
  it('mostra o rótulo do perfil', async () => {
    await render(<RoleBadge role="TEACHER" />);
    expect(screen.getByText('Professor')).toBeOnTheScreen();
  });

  it('usa a cor cheia do tom no texto', async () => {
    await render(<Badge label="Você" tone="brand" />);
    expect(styleOf('Você').color).toBe(light.tintText);
  });
});

describe('Banner', () => {
  it('mostra aviso informativo com fechar e ação', async () => {
    const onDismiss = jest.fn();
    const onPress = jest.fn();
    await render(
      <Banner
        kind="info"
        text="Sua sessão expirou."
        onDismiss={onDismiss}
        action={{ label: 'Tentar novamente', onPress }}
      />,
    );

    expect(styleOf('Sua sessão expirou.').color).toBe(light.info);
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar aviso' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('erro usa a cor de perigo e não tem botões extras', async () => {
    await render(<Banner text="Falhou." />);
    expect(styleOf('Falhou.').color).toBe(light.danger);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('Button', () => {
  it('ghost é neutro e dangerGhost usa a cor de perigo', async () => {
    await render(<Button label="Cancelar" variant="ghost" onPress={() => undefined} />);
    expect(styleOf('Cancelar').color).toBe(light.text);

    await render(<Button label="Excluir" variant="dangerGhost" onPress={() => undefined} />);
    expect(styleOf('Excluir').color).toBe(light.danger);
  });
});

describe('Button desabilitado', () => {
  it('o primário desabilitado fica neutro, sem vermelho', async () => {
    await render(<Button label="Salvar" disabled onPress={() => undefined} />);
    expect(styleOf('Salvar').color).toBe(light.textTertiary);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });
});

describe('PostMeta', () => {
  it('mostra autor, selo "Você" e a data com o prefixo', async () => {
    await render(<PostMeta authorName="Carlos" date="13/09/2026" datePrefix="Editada" isSelf />);
    expect(screen.getByText('Carlos')).toBeOnTheScreen();
    expect(screen.getByText('Você')).toBeOnTheScreen();
    expect(screen.getByText('Editada 13/09/2026')).toBeOnTheScreen();
  });

  it('usa um texto padrão sem nome de autor', async () => {
    await render(<PostMeta authorName={null} date="" />);
    expect(screen.getByText('Autor não informado')).toBeOnTheScreen();
    expect(screen.queryByText('Você')).toBeNull();
  });
});

describe('ScreenHeader', () => {
  it('limita o crescimento do título com a fonte do usuário', async () => {
    await render(<ScreenHeader title="Posts" />);
    const title = screen.getByRole('header', { name: 'Posts' });
    expect(title.props.maxFontSizeMultiplier).toBe(1.3);
    expect(title.props.numberOfLines).toBe(1);
  });

  it('a ação como objeto vira botão com rótulo; com fonte grande, só o ícone', async () => {
    const onPress = jest.fn();
    const action = { label: 'Nova postagem', icon: 'add', onPress } as const;

    await render(<ScreenHeader title="Posts" action={action} />);
    expect(screen.getByText('Nova postagem')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Nova postagem' }));
    expect(onPress).toHaveBeenCalledTimes(1);

    mockFontScale = 2;
    await render(<ScreenHeader title="Posts" action={action} />);
    expect(screen.queryByText('Nova postagem')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Nova postagem' }));
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('aceita um elemento qualquer como ação', async () => {
    await render(<ScreenHeader title="Posts" action={<Text>Extra</Text>} />);
    expect(screen.getByText('Extra')).toBeOnTheScreen();
  });
});

describe('SegmentedControl', () => {
  it('marca a opção escolhida por estado e peso', async () => {
    await render(
      <SegmentedControl
        accessibilityLabel="Perfil"
        options={[
          { value: 'a', label: 'Professores' },
          { value: 'b', label: 'Estudantes' },
        ]}
        value="a"
        onChange={() => undefined}
      />,
    );
    expect(screen.getByRole('tab', { name: 'Professores', selected: true })).toBeOnTheScreen();
    expect(styleOf('Professores').fontWeight).toBe('600');
    expect(styleOf('Estudantes').fontWeight).toBe('500');
  });
});

describe('TextField search', () => {
  it('não mostra o rótulo, mas ele continua acessível', async () => {
    await render(<TextField variant="search" label="Buscar postagens" placeholder="Título" />);
    expect(screen.queryByText('Buscar postagens')).toBeNull();
    expect(screen.getByLabelText('Buscar postagens')).toBeOnTheScreen();
  });

  it('o campo de formulário mostra o rótulo', async () => {
    await render(<TextField label="E-mail" />);
    expect(screen.getByText('E-mail')).toBeOnTheScreen();
  });
});
