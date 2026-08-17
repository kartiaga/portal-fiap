import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login — Portal FIAP",
};

// Server Component: não precisa de "use client" porque a página em si não
// usa hooks — só renderiza o formulário, que é quem precisa ser client.
export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-paper-050 p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-red-700 uppercase">
            <span className="h-0.5 w-4 bg-red-600" />
            Plataforma acadêmica
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink-900">
            Portal FIAP
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Entre com suas credenciais institucionais.
          </p>
        </div>
        <div className="card-plain p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
