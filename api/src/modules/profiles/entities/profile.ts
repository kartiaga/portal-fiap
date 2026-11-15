export class Profile {
  id?: string
  userId: string
  name: string
  /** Chave do arquivo da foto no armazenamento. */
  avatarKey?: string
  createdAt?: Date
  updatedAt?: Date

  constructor(profile: Profile) {
    this.userId = profile.userId
    this.name = profile.name
  }
}
