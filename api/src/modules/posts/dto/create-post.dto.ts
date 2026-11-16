import z from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(10),
  /**
   * Autor da postagem. Ausente, é quem está logado. Só o administrador pode informar outra
   * pessoa, e ela precisa ser um professor (ver CreatePostUseCase).
   */
  authorId: z.string().uuid().optional(),
})
