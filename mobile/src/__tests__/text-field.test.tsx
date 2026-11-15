import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextField } from '@/components/text-field';

describe('TextField', () => {
  it('alterna entre ocultar e mostrar o conteúdo de um campo seguro', async () => {
    await render(<TextField label="Senha" secureTextEntry value="12345678" />);
    const input = screen.getByLabelText('Senha');
    expect(input.props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('Senha').props.value).toBe('12345678');

    await fireEvent.press(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
  });

  it('não mostra o botão em campos comuns', async () => {
    await render(<TextField label="E-mail" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
