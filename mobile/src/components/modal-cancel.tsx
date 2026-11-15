import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { HeaderButton } from '@/components/header-button';

type ModalCancelProps = {
  /** O formulário tem alterações: o arrasto do modal fica desligado e sair pede confirmação. */
  guarding: boolean;
  onCancel: () => void;
};

/**
 * Configura o cabeçalho de um formulário aberto em modal: "Cancelar" à esquerda no iOS (no
 * Android ficam o voltar do cabeçalho e o do sistema) e o arrasto para fechar desligado enquanto
 * houver alteração não salva. A confirmação em si vem de `useDiscardGuard` na tela.
 */
export function ModalCancel({ guarding, onCancel }: ModalCancelProps) {
  return (
    <Stack.Screen
      options={{
        gestureEnabled: !guarding,
        headerLeft:
          Platform.OS === 'ios' ? () => <HeaderButton label="Cancelar" onPress={onCancel} /> : undefined,
      }}
    />
  );
}
