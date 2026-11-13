import type { PersonRole } from './api';

export const peopleConfig: Record<PersonRole, {
  plural: string;
  singular: string;
  listPath: '/teachers' | '/students';
  createPath: '/teachers/create' | '/students/create';
}> = {
  TEACHER: {
    plural: 'Professores',
    singular: 'professor',
    listPath: '/teachers',
    createPath: '/teachers/create',
  },
  STUDENT: {
    plural: 'Estudantes',
    singular: 'estudante',
    listPath: '/students',
    createPath: '/students/create',
  },
};
