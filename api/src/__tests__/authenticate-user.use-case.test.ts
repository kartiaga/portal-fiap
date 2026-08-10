import { hashPassword } from '@/lib/password'
import { AuthenticateUserUseCase } from '@/modules/auth/use-cases/authenticate-user.use-case'

describe('AuthenticateUserUseCase', () => {
    it('returns user data when credentials are valid', async () => {
        const password = 'secret123'
        const hashedPassword = await hashPassword(password)

        const userRepository = {
            findByEmail: jest.fn().mockResolvedValue({
                id: 'user-1',
                email: 'user@example.com',
                password: hashedPassword,
                role: 'STUDENT',
            }),
        } as any

        const useCase = new AuthenticateUserUseCase(userRepository)
        const result = await useCase.handler({ email: 'user@example.com', password })

        expect(result).toEqual({ id: 'user-1', email: 'user@example.com', role: 'STUDENT' })
        expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    })

    it('throws when the user is not found', async () => {
        const userRepository = { findByEmail: jest.fn().mockResolvedValue(null) } as any
        const useCase = new AuthenticateUserUseCase(userRepository)

        await expect(useCase.handler({ email: 'missing@example.com', password: 'secret' })).rejects.toThrow('Invalid credentials')
    })

    it('throws when the password does not match', async () => {
        const userRepository = {
            findByEmail: jest.fn().mockResolvedValue({
                id: 'user-1',
                email: 'user@example.com',
                password: await hashPassword('correct-password'),
                role: 'STUDENT',
            }),
        } as any
        const useCase = new AuthenticateUserUseCase(userRepository)

        await expect(useCase.handler({ email: 'user@example.com', password: 'wrong-password' })).rejects.toThrow('Invalid credentials')
    })
})
