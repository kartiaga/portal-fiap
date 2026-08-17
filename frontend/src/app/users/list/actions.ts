"use server";

import { getApiUrl } from "@/lib/api";
import { getToken } from "@/lib/session";

export type UserListItem = {
  id: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

export type PaginatedUsers = {
  items: UserListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type FetchUsersParams = {
  cursor?: string;
  search?: string;
  limit?: number;
};

export type FetchUsersResult =
  | { data: PaginatedUsers }
  | { error: string };

export async function fetchUsersAction(
  params: FetchUsersParams = {},
): Promise<FetchUsersResult> {
  const token = await getToken();
  if (!token) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const query = new URLSearchParams();

  if (params.cursor) {
    query.set("cursor", params.cursor);
  }

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";

  try {
    const response = await fetch(`${getApiUrl()}/users${suffix}`, {
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
        error: body?.message ?? "Não foi possível carregar os usuários.",
      };
    }

    const data = (await response.json()) as PaginatedUsers;
    return { data };
  } catch {
    return {
      error: "Não foi possível conectar à API. Tente novamente em instantes.",
    };
  }
}
