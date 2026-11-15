import type { FastifyReply, FastifyRequest } from 'fastify'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}

/**
 * Id de quem está conectado numa rota pública: lê o token se ele vier e for válido, sem recusar
 * a requisição quando ele falta ou não vale.
 */
export async function optionalViewerId(
  request: FastifyRequest,
): Promise<string | undefined> {
  if (!request.headers.authorization) return undefined
  try {
    await request.jwtVerify()
    return request.user.sub
  } catch {
    return undefined
  }
}
