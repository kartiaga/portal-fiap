import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Header } from "@/components/header";

const ROLE_LABEL = {
  ADMIN: "Administrador",
  TEACHER: "Professor",
  STUDENT: "Aluno",
} as const;

const ROLE_PILL = {
  ADMIN: "pill-red",
  TEACHER: "pill-blue",
  STUDENT: "pill-green",
} as const;

export default async function Home() {
  const session = await getSession();

  // Checagem "de verdade": diferente do proxy.ts (que só olha se o cookie
  // existe), aqui decodificamos o JWT e conferimos a expiração antes de
  // renderizar qualquer coisa.
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header role={session.role} />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="card-plain w-full max-w-md p-8 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500 font-display text-xl font-bold text-red-600"
            style={{ transform: "rotate(-4deg)" }}
          >
            FI
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Portal FIAP
          </h1>
          <p className="mt-3 text-sm text-ink-500">
            Você está logado como{" "}
            <span className={`pill ${ROLE_PILL[session.role]}`}>
              {ROLE_LABEL[session.role]}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
