import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
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
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Criar novo usuário</h1>
      <CreateUserForm />
    </div>
  );
}
