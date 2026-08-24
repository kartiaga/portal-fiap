import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getSession } from "@/lib/session";
import { PostAdminList } from "./post-admin-list";

export default async function PostsAdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Gestão de postagens é exclusiva de docentes e administradores, espelhando
  // o requireTeacherOrAdmin que a API aplica nas rotas de POST/PUT/DELETE.
  if (session.role === "STUDENT") {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header role={session.role} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-red-700 uppercase">
            <span className="h-0.5 w-4 bg-red-600" />
            Administração
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900">
            Gerenciar postagens
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Veja todas as postagens do portal, edite o conteúdo ou exclua o que
            não deve mais ficar no ar.
          </p>
        </div>

        <PostAdminList currentUserId={session.sub} />

        <Link href="/posts/new" className="btn btn-ghost self-start">
          Criar nova postagem
        </Link>
      </main>
    </div>
  );
}
