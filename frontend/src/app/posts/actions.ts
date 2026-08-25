"use server";
import { getApiUrl } from "@/lib/api";
import { getToken } from "@/lib/session";

export type PostListItem = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedPosts = {
  items: PostListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type FetchPostsParams = {
  cursor?: string;
  limit?: number;
};

export type FetchPostsResult = { data: PaginatedPosts } | { error: string };

export type SearchPostsResult = { data: PostListItem[] } | { error: string };

/** Alias usado em telas de administração. */
export type PostItem = PostListItem;

export async function fetchPostsAction(
  params: FetchPostsParams = {},
): Promise<FetchPostsResult> {
  const token = await getToken();

  if (!token) {
    return { error: "sessão expirada. Faça login novamente." };
  }
  const query = new URLSearchParams();

  if (params.cursor) {
    query.set("cursor", params.cursor);
  }

  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  try {
    const response = await fetch(`${getApiUrl()}/posts${suffix}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body: { message?: string } | null = await response
        .json()
        .catch(() => null);

      return {
        error: body?.message ?? "Não foi possível carregar os posts.",
      };
    }

    const data = (await response.json()) as PaginatedPosts;

    return { data };
  } catch {
    return {
      error: "Não foi possível conectar à API. Tente novamnete em instantes.",
    };
  }
}

export async function searchPostsAction(
  term: string,
): Promise<SearchPostsResult> {
  const token = await getToken();

  if (!token) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const query = new URLSearchParams({ term: term.trim() });

  try {
    const response = await fetch(
      `${getApiUrl()}/posts/search?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const body: { message?: string } | null = await response
        .json()
        .catch(() => null);

      return {
        error: body?.message ?? "Não foi possível buscar os posts.",
      };
    }

    const data = (await response.json()) as PostListItem[];

    return { data };
  } catch {
    return {
      error: "Não foi possível conectar à API. Tente novamente em instantes.",
    };
  }
}

export async function deletePostAction(
  id: string,
): Promise<{ success?: string; error?: string }> {
  const token = await getToken();

  if (!token) {
    return { error: "Sessão expirada. Faça login novamente." };
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
      const body: { message?: string } | null = await response
        .json()
        .catch(() => null);

      return {
        error: body?.message ?? "Não foi possível excluir o post.",
      };
    }

    return { success: "Post excluído com sucesso." };
  } catch {
    return {
      error: "Não foi possível conectar à API. Tente novamente em instantes.",
    };
  }
}
