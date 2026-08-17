import { createUserSchema } from '@/modules/users/dto/create-user.dto'
import { loginSchema } from '@/modules/auth/dto/login.dto'
import { createPostSchema } from '@/modules/posts/dto/create-post.dto'
import { createProfileSchema } from '@/modules/profiles/dto/create-profile.dto'

describe('DTO schema validation', () => {
  it('validates a correct createUser payload', () => {
    const result = createUserSchema.safeParse({
      email: 'test@example.com',
      password: 'securepass',
      name: 'Test User',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.role).toBe('STUDENT')
    }
  })

  it('rejects invalid createUser payloads', () => {
    expect(
      createUserSchema.safeParse({ email: 'bad', password: 'short', name: '' })
        .success,
    ).toBe(false)
  })

  it('validates login payload', () => {
    expect(
      loginSchema.safeParse({
        email: 'test@example.com',
        password: 'securepass',
      }).success,
    ).toBe(true)
  })

  it('rejects invalid login payloads', () => {
    expect(
      loginSchema.safeParse({ email: 'test', password: 'short' }).success,
    ).toBe(false)
  })

  it('validates createPost payload', () => {
    expect(
      createPostSchema.safeParse({
        title: 'New post',
        content: 'This is the body of the post and it is long enough.',
      }).success,
    ).toBe(true)
  })

  it('rejects invalid createPost payloads', () => {
    expect(
      createPostSchema.safeParse({ title: 'No', content: 'Too short' }).success,
    ).toBe(false)
  })

  it('validates createProfile payload', () => {
    expect(
      createProfileSchema.safeParse({ userId: 'user-1', name: 'Profile name' })
        .success,
    ).toBe(true)
  })

  it('rejects invalid createProfile payloads', () => {
    expect(createProfileSchema.safeParse({ userId: 'user-1' }).success).toBe(
      false,
    )
  })
})
