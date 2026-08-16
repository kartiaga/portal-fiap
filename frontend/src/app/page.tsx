import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "./actions";

export default async function Home() {
  const session = await getSession();

  // Checagem "de verdade": diferente do proxy.ts (que só olha se o cookie
  // existe), aqui decodificamos o JWT e conferimos a expiração antes de
  // renderizar qualquer coisa.
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Portal FIAP</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Logado como <strong>{session.role}</strong>.
      </p>
      {session.role === "ADMIN" ? (
        <Link
          href="/users/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Criar novo usuário
        </Link>
      ) : null}
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
