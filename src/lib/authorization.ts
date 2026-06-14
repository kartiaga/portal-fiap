import { UserRole } from "@/modules/users/entities/user";
import type { FastifyReply, FastifyRequest } from "fastify";

export function requireRole(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!allowedRoles.includes(request.user.role as UserRole)) {
      return reply.status(403).send({ message: "Forbidden" })
    }
  }
}

// Authorization shortcuts
export const requireAdmin = requireRole(UserRole.ADMIN)
export const requireTeacherOrAdmin = requireRole(UserRole.TEACHER, UserRole.ADMIN)