"use server";

import { getApiUrl } from "@/lib/api";

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type FetchPostResult =
  | { data: Post }
  | { error: string; notFound?: boolean };

export async function fetchPostAction(id: string): Promise<FetchPostResult> {
  try {
    const response = await fetch(`${getApiUrl()}/posts/${id}`, {
      cache: "no-store",
    });
    if (response.status === 404) {
      return { error: "Post não encontrado.", notFound: true };
    }

    if (!response.ok) {
      const body: { message?: string } | null = await response
        .json()
        .catch(() => null);

      return {
        error: body?.message ?? "Não foi possível carregar o post.",
      };
    }

    const data = (await response.json()) as Post;

    return { data };
  } catch {
    return {
      error: "Não foi possível conectar à API. Tente novamente em instantes.",
    };
  }
}
