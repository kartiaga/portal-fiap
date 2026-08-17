import { User, UserRole } from '@/modules/users/entities/user'
import { Post } from '@/modules/posts/entities/post'
import { Profile } from '@/modules/profiles/entities/profile'

describe('entity constructors', () => {
  it('creates a User instance', () => {
    const data = {
      email: 'user@example.com',
      password: 'pwd',
      role: UserRole.ADMIN,
    }
    const user = new User(data)

    expect(user.email).toBe(data.email)
    expect(user.password).toBe(data.password)
    expect(user.role).toBe(UserRole.ADMIN)
  })

  it('creates a Post instance', () => {
    const data = {
      title: 'Post title',
      content: 'Body content',
      authorId: 'user-1',
    }
    const post = new Post(data)

    expect(post.title).toBe(data.title)
    expect(post.content).toBe(data.content)
    expect(post.authorId).toBe(data.authorId)
  })

  it('creates a Profile instance', () => {
    const data = { userId: 'user-1', name: 'Jane' }
    const profile = new Profile(data)

    expect(profile.userId).toBe(data.userId)
    expect(profile.name).toBe(data.name)
  })
})
