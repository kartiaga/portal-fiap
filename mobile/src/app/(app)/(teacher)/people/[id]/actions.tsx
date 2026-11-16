import { useLocalSearchParams } from 'expo-router';

import { parseListedRole } from '@/features/people/config';
import { PersonActionsSheet } from '@/features/people/person-actions-sheet';

/**
 * Ações de uma pessoa (Editar e Excluir), em folha nativa do tamanho do conteúdo, aberta pelos três
 * pontinhos do cartão na aba Pessoas. Nome e perfil chegam nos parâmetros, para a folha abrir sem
 * esperar a API.
 */
export default function PersonActionsRoute() {
  const params = useLocalSearchParams<{ id: string; name?: string; role?: string }>();

  return (
    <PersonActionsSheet
      id={params.id}
      name={params.name || 'Nome não informado'}
      role={parseListedRole(params.role) ?? 'STUDENT'}
    />
  );
}
