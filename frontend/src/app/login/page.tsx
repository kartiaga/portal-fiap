import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login — Portal FIAP",
};

// Server Component: não precisa de "use client" porque a página em si não
// usa hooks — só renderiza o formulário, que é quem precisa ser client.
export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 p-8 dark:bg-black">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Portal FIAP
      </h1>
      <LoginForm />
    </div>
  );
}
