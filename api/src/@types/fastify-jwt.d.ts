import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { role: string; sub: string }
    user: { role: string; sub: string }
  }
}
