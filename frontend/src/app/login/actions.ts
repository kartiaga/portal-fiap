"use server";

import { redirect } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { setSessionCookie } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Preencha e-mail e senha." };
  }

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailIsValid) {
    return { error: "Informe um e-mail válido." };
  }
  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  let token: string;

  try {
    const response = await fetch(`${getApiUrl()}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body: { message?: string } | null = await response
        .json()
        .catch(() => null);
      return { error: body?.message ?? "Credenciais inválidas." };
    }

    const data: { token: string } = await response.json();
    token = data.token;
  } catch {
    return {
      error: "Não foi possível conectar à API. Tente novamente em instantes.",
    };
  }

  // redirect() lança um erro especial internamente (NEXT_REDIRECT) — por isso
  // fica FORA do try/catch acima. Se estivesse dentro, o catch genérico
  // engoliria esse erro e o redirecionamento nunca aconteceria de fato.
  await setSessionCookie(token);
  redirect("/");
}
