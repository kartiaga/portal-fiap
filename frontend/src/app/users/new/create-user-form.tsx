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
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="field">
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          placeholder="Nome completo"
        />
      </div>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="usuario@fiap.com.br"
        />
      </div>

      <div className="field">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="field">
        <label htmlFor="role">Papel</label>
        <select id="role" name="role" defaultValue="STUDENT">
          <option value="STUDENT">Aluno</option>
          <option value="TEACHER">Professor</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      {state.error ? (
        <div role="alert" className="alert alert-danger">
          <span>!</span>
          <div>{state.error}</div>
        </div>
      ) : null}

      {state.success ? (
        <div role="status" className="alert alert-success">
          <span>✓</span>
          <div>{state.success}</div>
        </div>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Criando..." : "Criar usuário"}
      </button>
    </form>
  );
}
