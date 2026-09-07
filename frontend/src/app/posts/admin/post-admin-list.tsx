"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  deletePostAction,
  fetchPostsAction,
  searchPostsAction,
  type PostItem,
} from "../actions";

const EXCERPT_MAX_LENGTH = 160;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function toExcerpt(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();

  return normalized.length > EXCERPT_MAX_LENGTH
    ? `${normalized.slice(0, EXCERPT_MAX_LENGTH)}…`
    : normalized;
}

export function PostAdminList({ currentUserId }: { currentUserId: string }) {
  const [items, setItems] = useState<PostItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  // Id da postagem aguardando confirmação de exclusão: evita excluir com um
  // clique acidental, sem depender de window.confirm().
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadPosts = useCallback(
    async (options: { cursor?: string; search?: string; append?: boolean }) => {
      setError(null);

      if (options.search) {
        const result = await searchPostsAction(options.search);

        if ("error" in result) {
          setError(result.error);
          return;
        }

        setItems(result.data);
        setNextCursor(null);
        setHasMore(false);
        return;
      }

      const result = await fetchPostsAction({
        cursor: options.cursor,
        limit: 10,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setItems((current) =>
        options.append ? [...current, ...result.data.items] : result.data.items,
      );
      setNextCursor(result.data.nextCursor);
      setHasMore(result.data.hasMore);
    },
    [],
  );

  useEffect(() => {
    startTransition(async () => {
      await loadPosts({ search: appliedSearch });
    });
  }, [appliedSearch, loadPosts]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setConfirmingId(null);
    setAppliedSearch(search.trim());
  }

  function handleLoadMore() {
    if (!nextCursor || !hasMore) return;

    startTransition(async () => {
      await loadPosts({
        cursor: nextCursor,
        search: appliedSearch || undefined,
        append: true,
      });
    });
  }

  function handleDelete(id: string) {
    setError(null);
    setNotice(null);

    startTransition(async () => {
      const result = await deletePostAction(id);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Remove localmente em vez de recarregar a lista: recarregar do zero
      // descartaria as páginas já trazidas pelo "Carregar mais".
      setItems((current) => current.filter((post) => post.id !== id));
      setConfirmingId(null);
      setNotice(result.success ?? null);
    });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="field flex-1">
          <label htmlFor="search">Buscar por título ou conteúdo</label>
          <input
            id="search"
            name="search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ex.: matemática"
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

      {notice ? (
        <div role="status" className="alert alert-success">
          <span>✓</span>
          <div>{notice}</div>
        </div>
      ) : null}

      <div className="card-plain overflow-hidden">
        {items.length === 0 && !isPending ? (
          <p className="px-6 py-10 text-center text-sm text-ink-500">
            {appliedSearch
              ? "Nenhuma postagem encontrada para esta busca."
              : "Nenhuma postagem cadastrada."}
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {items.map((post) => (
              <li key={post.id} className="flex flex-col gap-3 px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-ink-900">
                      {post.title}
                    </p>
                    <p className="mt-1 text-sm text-ink-700">
                      {toExcerpt(post.content)}
                    </p>
                    <p className="mt-2 font-mono text-xs text-ink-500">
                      Criada em {formatDate(post.createdAt)} · Atualizada em{" "}
                      {formatDate(post.updatedAt)}
                    </p>
                  </div>
                  {post.authorId === currentUserId ? (
                    <span className="pill pill-blue shrink-0 self-start whitespace-nowrap">
                      Sua postagem
                    </span>
                  ) : null}
                </div>

                {confirmingId === post.id ? (
                  <div className="flex flex-col gap-3 rounded-s border border-red-100 bg-red-050 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-red-700">
                      Excluir <strong>{post.title}</strong>? Esta ação não pode
                      ser desfeita.
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={isPending}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        disabled={isPending}
                        className="btn btn-danger btn-sm"
                      >
                        {isPending ? "Excluindo..." : "Confirmar exclusão"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="btn btn-secondary btn-sm"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setConfirmingId(post.id);
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      Excluir
                    </button>
                  </div>
                )}
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
