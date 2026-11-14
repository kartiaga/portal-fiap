import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { useSession } from '@/auth/session-context';
import { FilterSheet, type FilterGroup } from '@/components/filter-sheet';
import { peopleConfig, parseListedRole } from '@/features/people/config';
import { canViewPeople } from '@/features/people/permissions';

/** Folha de filtros da aba Pessoas: o perfil. O administrador também lista administradores. */
export default function PeopleFiltersSheet() {
  const router = useRouter();
  const { user } = useSession();
  const params = useLocalSearchParams<{ role?: string }>();

  if (!canViewPeople(user?.role)) return <Redirect href="/" />;

  const groups: FilterGroup[] = [
    {
      key: 'role',
      label: 'Perfil',
      options: [
        { value: '', label: 'Todos' },
        { value: 'TEACHER', label: peopleConfig.TEACHER.plural },
        { value: 'STUDENT', label: peopleConfig.STUDENT.plural },
        ...(user?.role === 'ADMIN' ? [{ value: 'ADMIN', label: peopleConfig.ADMIN.plural }] : []),
      ],
    },
  ];

  return (
    <FilterSheet
      groups={groups}
      initial={{ role: parseListedRole(params.role) ?? '' }}
      onApply={(values) => router.dismissTo({ pathname: '/people', params: { role: values.role ?? '' } })}
      onClear={() => router.dismissTo({ pathname: '/people', params: { role: '' } })}
    />
  );
}
