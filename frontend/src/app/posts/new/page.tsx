import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getSession } from "@/lib/session";
import { CreatePostForm } from "./create-post-form";

export default async function NewPostPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "STUDENT") redirect("/");
  return (
    <div className="flex flex-1 flex-col">
      <Header role={session.role} />
      <main className="flex flex-1 flex-col items-center p-8">
        <div className="w-full max-w-2xl">
          <Link
            href="/posts"
            aria-label="Voltar aos posts"
            title="Voltar aos posts"
            className="btn btn-secondary mb-6 self-start"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M19 12H5M11 18L5 12L11 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-semibold text-ink-900">
              Nova publicação
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Compartilhe instruções, materiais e avisos com os alunos.
            </p>
          </div>
          <div className="card-plain p-6">
            <CreatePostForm />
          </div>
        </div>
      </main>
    </div>
  );
}
