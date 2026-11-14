import { usePreventRemove } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

/**
 * Protege um formulário alterado: sair por voltar, gesto, "Cancelar" ou arrastar o modal pede
 * confirmação antes de descartar o que foi digitado.
 *
 * `allowLeave` libera a saída sem perguntar (chame depois de salvar ou excluir com sucesso, antes
 * de navegar). `guarding` diz se a proteção está ativa, para desligar o arrasto do modal.
 */
export function useDiscardGuard(dirty: boolean) {
  const [leaving, setLeaving] = useState(false);
  const guarding = dirty && !leaving;

  const disablePrevention = usePreventRemove(guarding, ({ repeat }) => {
    Alert.alert('Descartar alterações?', 'O que você escreveu será perdido.', [
      { text: 'Continuar editando', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => {
          setLeaving(true);
          repeat();
        },
      },
    ]);
  });

  const allowLeave = useCallback(() => {
    setLeaving(true);
    disablePrevention();
  }, [disablePrevention]);

  return { guarding, allowLeave };
}
