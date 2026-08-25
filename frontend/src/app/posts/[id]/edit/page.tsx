import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getSession } from "@/lib/session";
import { fetchPostAction } from "../../actions";
import { PostForm } from "../../post-form";

export default async function EditPostPage({
  params,
}: PageProps<"/posts/[id]/edit">) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Mesma regra da criação: edição é exclusiva de docentes e administradores.
  if (session.role === "STUDENT") {
    redirect("/");
  }

  const { id } = await params;
  const result = await fetchPostAction(id);

  return (
    <div className="flex flex-1 flex-col">
      <Header role={session.role} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-8">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-red-700 uppercase">
            <span className="h-0.5 w-4 bg-red-600" />
            Postagens
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900">
            Editar postagem
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Ajuste o título e o conteúdo. As alterações ficam visíveis para os
            alunos assim que salvas.
          </p>
        </div>

        {"error" in result ? (
          <>
            <div role="alert" className="alert alert-danger">
              <span>!</span>
              <div>{result.error}</div>
            </div>
            <Link href="/posts/admin" className="btn btn-secondary self-start">
              Voltar para as postagens
            </Link>
          </>
        ) : (
          <div className="card-plain p-6">
            <PostForm post={result.data} />
          </div>
        )}
      </main>
    </div>
  );
}
