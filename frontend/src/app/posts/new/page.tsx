import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getSession } from "@/lib/session";
import { PostForm } from "../post-form";

export default async function NewPostPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

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
            Nova postagem
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Publique um aviso, material ou atividade para os alunos do portal.
          </p>
        </div>

        <div className="card-plain p-6">
          <PostForm />
        </div>
      </main>
    </div>
  );
}
