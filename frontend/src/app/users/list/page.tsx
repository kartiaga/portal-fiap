import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getSession } from "@/lib/session";
import { UserList } from "./user-list";

export default async function UsersListPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
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
            Usuários cadastrados
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Liste e busque usuários do portal. Use &quot;Carregar mais&quot;
            para ver os próximos registros.
          </p>
        </div>

        <UserList />

        <Link href="/users/new" className="btn btn-ghost self-start">
          Cadastrar novo usuário
        </Link>
      </main>
    </div>
  );
}
