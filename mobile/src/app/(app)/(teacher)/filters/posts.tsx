import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { useSession } from '@/auth/session-context';
import { FilterSheet, type FilterGroup } from '@/components/filter-sheet';

const GROUPS: FilterGroup[] = [
  {
    key: 'author',
    label: 'Autor',
    options: [
      { value: '', label: 'Todas as postagens' },
      { value: 'me', label: 'Só as minhas' },
    ],
  },
];

/**
 * Folha de filtros da aba Gerenciar, só para o administrador. O professor só vê as próprias
 * postagens e não tem o que filtrar.
 */
export default function PostsFiltersSheet() {
  const router = useRouter();
  const { user } = useSession();
  const params = useLocalSearchParams<{ author?: string }>();

  if (user?.role !== 'ADMIN') return <Redirect href="/" />;

  return (
    <FilterSheet
      groups={GROUPS}
      initial={{ author: params.author === 'me' ? 'me' : '' }}
      onApply={(values) => router.dismissTo({ pathname: '/admin', params: { author: values.author ?? '' } })}
      onClear={() => router.dismissTo({ pathname: '/admin', params: { author: '' } })}
    />
  );
}
