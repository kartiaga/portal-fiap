"use server";
import { getApiUrl } from "@/lib/api";
import { getToken } from "@/lib/session";

export type PostListItem = {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: string;
    updateAt: string;
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

export type FetchPostsResult =
    | { data: PaginatedPosts }
    | { error: string };

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
