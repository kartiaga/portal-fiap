"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  fetchUsersAction,
  type UserListItem,
} from "./actions";

const ROLE_LABEL: Record<UserListItem["role"], string> = {
  ADMIN: "Administrador",
  TEACHER: "Professor",
  STUDENT: "Aluno",
};

const ROLE_PILL: Record<UserListItem["role"], string> = {
  ADMIN: "pill pill-red",
  TEACHER: "pill pill-blue",
  STUDENT: "pill pill-green",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UserList() {
  const [items, setItems] = useState<UserListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadUsers = useCallback(
    async (options: { cursor?: string; search?: string; append?: boolean }) => {
      setError(null);

      const result = await fetchUsersAction({
        cursor: options.cursor,
        search: options.search || undefined,
        limit: 10,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        options.append
          ? [...current, ...result.data.items]
          : result.data.items,
      );
      setNextCursor(result.data.nextCursor);
      setHasMore(result.data.hasMore);
    },
    [],
  );

  useEffect(() => {
    startTransition(() => {
      void loadUsers({ search: appliedSearch });
    });
  }, [appliedSearch, loadUsers]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(search.trim());
  }

  function handleLoadMore() {
    if (!nextCursor || !hasMore) return;

    startTransition(() => {
      void loadUsers({
        cursor: nextCursor,
        search: appliedSearch || undefined,
        append: true,
      });
    });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="field flex-1">
          <label htmlFor="search">Buscar por e-mail</label>
          <input
            id="search"
            name="search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ex.: @fiap.com.br"
          />
        </div>
        <button type="submit" disabled={isPending} className="btn btn-secondary">
          {isPending ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error ? (
        <div role="alert" className="alert alert-danger">
          <span>!</span>
          <div>{error}</div>
        </div>
      ) : null}

      <div className="card-plain overflow-hidden">
        {items.length === 0 && !isPending ? (
          <p className="px-6 py-10 text-center text-sm text-ink-500">
            {appliedSearch
              ? "Nenhum usuário encontrado para esta busca."
              : "Nenhum usuário cadastrado."}
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {items.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-ink-900">{user.email}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Criado em {formatDate(user.createdAt)}
                  </p>
                </div>
                <span className={ROLE_PILL[user.role]}>{ROLE_LABEL[user.role]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="btn btn-primary"
          >
            {isPending ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
