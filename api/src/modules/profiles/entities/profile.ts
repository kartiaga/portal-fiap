export class Profile {
  id?: string
  userId: string
  name: string
  avatarUrl?: string
  createdAt?: Date
  updatedAt?: Date

  constructor(profile: Profile) {
    this.userId = profile.userId
    this.name = profile.name
  }
}
