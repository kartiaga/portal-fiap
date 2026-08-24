"use server";

import { getApiUrl } from "@/lib/api";
import { getToken } from "@/lib/session";

export type CreateUserState = {
  error?: string;
  success?: string;
};

export async function createUserAction(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string"
  ) {
    return { error: "Preencha todos os campos." };
  }

  if (name.length < 2) {
    return { error: "O nome deve ter pelo menos 2 caracteres." };
  }

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailIsValid) {
    return { error: "Informe um e-mail válido." };
  }
  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const token = await getToken();
  if (!token) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  try {
    const response = await fetch(`${getApiUrl()}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, password, role }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body: { message?: string } | null = await response
        .json()
        .catch(() => null);
      return {
        error: body?.message ?? "Não foi possível criar o usuário.",
      };
    }

    const message = await response.text();
    return { success: message };
  } catch {
    return {
      error: "Não foi possível conectar à API. Tente novamente em instantes.",
    };
  }
}
