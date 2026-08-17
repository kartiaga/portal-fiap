import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Header } from "@/components/header";
import { CreateUserForm } from "./create-user-form";

export default async function NewUserPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Rota exclusiva de ADMIN: nem o proxy.ts nem o getSession() checam role,
  // então a restrição fica aqui, igual ao restante do app faz com sessão.
  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header role={session.role} />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-red-700 uppercase">
              <span className="h-0.5 w-4 bg-red-600" />
              Administração
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900">
              Criar novo usuário
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Cadastre alunos, professores ou administradores no portal.
            </p>
          </div>
          <div className="card-plain p-6">
            <CreateUserForm />
          </div>
        </div>
      </main>
    </div>
  );
}
