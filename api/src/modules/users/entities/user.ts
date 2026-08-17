export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export class User {
  id?: string
  email: string
  password: string
  role: UserRole
  createdAt?: Date
  updatedAt?: Date

  constructor(user: User) {
    this.email = user.email
    this.password = user.password
    this.role = user.role
  }
}
