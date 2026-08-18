"use server";

import { getApiUrl } from "@/lib/api";
import { getToken } from "@/lib/session";

export type PostState = {
    error?: string;
    success?: string;
};

export async function createPostAction(
    _prevState: PostState,
    formData: FormData,
): Promise<PostState> {
    const title = formData.get("title");
    const content = formData.get("content");

    if (typeof title !== "string" || typeof content !== "string") {
        return { error: "Preencha título e conteúdo da postagem." };
    }

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (cleanTitle.length < 3) {
        return { error: "O título deve ter pelo menos 3 caracteres." };
    }

    if (cleanContent.length < 10) {
        return {
            error: "O conteúdo deve ter pelo menos 10 caracteres.",
        };
    }

    const token = await getToken();
    if (!token) {
        return { error: "Sessão expirada. Faça login novamente." };
    }

    try {
        const response = await fetch(`${getApiUrl()}/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title: cleanTitle,
                content: cleanContent,
            }),
            cache: "no-store",
        });

        if (!response.ok) {
            const body: { message?: string } | null = await response
                .json()
                .catch(() => null);

            return {
                error: body?.message ?? "Não foi possível criar a publicação.",
            };
        }

        return { success: "Publicação criada com sucesso." };
    } catch {
        return {
            error: "Não foi possível conectar à API. Tente novamente em instantes.",
        };
    }
}
