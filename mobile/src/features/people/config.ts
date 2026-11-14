import type { PersonRole } from './api';

export const peopleConfig: Record<
  PersonRole,
  {
    plural: string;
    singular: string;
    /** Rótulo do botão de cadastro. */
    newLabel: string;
    createPath: '/teachers/create' | '/students/create';
  }
> = {
  TEACHER: {
    plural: 'Professores',
    singular: 'professor',
    newLabel: 'Novo professor',
    createPath: '/teachers/create',
  },
  STUDENT: {
    plural: 'Estudantes',
    singular: 'estudante',
    newLabel: 'Novo estudante',
    createPath: '/students/create',
  },
};
