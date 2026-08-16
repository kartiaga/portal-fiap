"use client";

import { useActionState } from "react";
import { createUserAction, type CreateUserState } from "./actions";

const initialState: CreateUserState = {};

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          placeholder="Nome completo"
          className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="usuario@fiap.com.br"
          className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-700"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-zinc-700">
          Papel
        </label>
        <select
          id="role"
          name="role"
          defaultValue="STUDENT"
          className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        >
          <option value="STUDENT">Aluno</option>
          <option value="TEACHER">Professor</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p role="status" className="text-sm text-green-600">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Criando..." : "Criar usuário"}
      </button>
    </form>
  );
}
