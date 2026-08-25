"use server";

import { redirect } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { getToken } from "@/lib/session";

export type PostItem = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedPosts = {
  items: PostItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type FetchPostsParams = {
  cursor?: string;
  search?: string;
  limit?: number;
};

export type FetchPostsResult = { data: PaginatedPosts } | { error: string };

export type FetchPostResult = { data: PostItem } | { error: string };

export type DeletePostResult = { success: string } | { error: string };

export type PostFormState = {
  error?: string;
};

const SESSION_EXPIRED = "Sessão expirada. Faça login novamente.";
const CONNECTION_FAILED =
  "Não foi possível conectar à API. Tente novamente em instantes.";

/**
 * Lê a mensagem de erro que a API devolve no corpo da resposta. Nem toda rota
 * responde JSON (o DELETE, por exemplo, pode devolver corpo vazio), então o
 * fallback recebido por parâmetro é o que sobra nesses casos.
 */
async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const body: { message?: string } | null = await response
    .json()
    .catch(() => null);

  return body?.message ?? fallback;
}

/**
 * A API expõe duas rotas distintas: `/posts` (paginada por cursor) e
 * `/posts/search` (lista simples, sem paginação). Esta action unifica as duas
 * no mesmo formato paginado para que a UI não precise saber a diferença —
 * quando há busca, a resposta simplesmente nunca tem próxima página.
 */
export async function fetchPostsAction(
  params: FetchPostsParams = {},
): Promise<FetchPostsResult> {
  const token = await getToken();
  if (!token) {
    return { error: SESSION_EXPIRED };
  }

  const isSearch = Boolean(params.search);
  const query = new URLSearchParams();

  if (isSearch) {
    query.set("term", params.search as string);
  } else {
    if (params.cursor) {
      query.set("cursor", params.cursor);
    }

    if (params.limit) {
      query.set("limit", String(params.limit));
    }
  }

  const path = isSearch ? "/posts/search" : "/posts";
  const suffix = query.size > 0 ? `?${query.toString()}` : "";

  try {
    const response = await fetch(`${getApiUrl()}${path}${suffix}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: await readErrorMessage(
          response,
          "Não foi possível carregar as postagens.",
        ),
      };
    }

    if (isSearch) {
      const items = (await response.json()) as PostItem[];
      return { data: { items, nextCursor: null, hasMore: false } };
    }

    const data = (await response.json()) as PaginatedPosts;
    return { data };
  } catch {
    return { error: CONNECTION_FAILED };
  }
}

export async function fetchPostAction(id: string): Promise<FetchPostResult> {
  const token = await getToken();
  if (!token) {
    return { error: SESSION_EXPIRED };
  }

  try {
    const response = await fetch(`${getApiUrl()}/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: await readErrorMessage(response, "Postagem não encontrada."),
      };
    }

    const data = (await response.json()) as PostItem;
    return { data };
  } catch {
    return { error: CONNECTION_FAILED };
  }
}

/**
 * Mesmas regras do backend (`createPostSchema`/`updatePostSchema`): título com
 * no mínimo 3 caracteres e conteúdo com no mínimo 10.
 */
function validatePostForm(
  formData: FormData,
): { title: string; content: string } | { error: string } {
  const title = formData.get("title");
  const content = formData.get("content");

  if (typeof title !== "string" || typeof content !== "string") {
    return { error: "Preencha título e conteúdo." };
  }

  if (title.trim().length < 3) {
    return { error: "O título deve ter pelo menos 3 caracteres." };
  }

  if (content.trim().length < 10) {
    return { error: "O conteúdo deve ter pelo menos 10 caracteres." };
  }

  return { title: title.trim(), content: content.trim() };
}

export async function createPostAction(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const fields = validatePostForm(formData);
  if ("error" in fields) {
    return fields;
  }

  const token = await getToken();
  if (!token) {
    return { error: SESSION_EXPIRED };
  }

  try {
    const response = await fetch(`${getApiUrl()}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fields),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: await readErrorMessage(
          response,
          "Não foi possível criar a postagem.",
        ),
      };
    }
  } catch {
    return { error: CONNECTION_FAILED };
  }

  // Fora do try/catch: redirect() sinaliza o redirecionamento lançando um erro
  // interno (NEXT_REDIRECT) que o catch acima engoliria.
  redirect("/posts/admin");
}

export async function updatePostAction(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Postagem inválida." };
  }

  const fields = validatePostForm(formData);
  if ("error" in fields) {
    return fields;
  }

  const token = await getToken();
  if (!token) {
    return { error: SESSION_EXPIRED };
  }

  try {
    const response = await fetch(`${getApiUrl()}/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fields),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: await readErrorMessage(
          response,
          "Não foi possível salvar a postagem.",
        ),
      };
    }
  } catch {
    return { error: CONNECTION_FAILED };
  }

  redirect("/posts/admin");
}

export async function deletePostAction(id: string): Promise<DeletePostResult> {
  const token = await getToken();
  if (!token) {
    return { error: SESSION_EXPIRED };
  }

  try {
    const response = await fetch(`${getApiUrl()}/posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: await readErrorMessage(
          response,
          "Não foi possível excluir a postagem.",
        ),
      };
    }

    return { success: "Postagem excluída com sucesso." };
  } catch {
    return { error: CONNECTION_FAILED };
  }
}
