"use server";

import { redirect } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { getToken } from "@/lib/session";

export type Post = { id: string; title: string; content: string; authorId: string; createdAt: string; updatedAt: string };
export type PostState = { error?: string; success?: string };

export async function fetchPostByIdAction(id: string): Promise<{ data?: Post; error?: string }> {
    try {
        const response = await fetch(`${getApiUrl()}/posts/${id}`, { cache: "no-store" });
        if (!response.ok) {
            const body: { message?: string } | null = await response.json().catch(() => null);
            return { error: body?.message ?? "Não foi possível carregar a publicação." };
        }
        return { data: (await response.json()) as Post };
    } catch {
        return { error: "Não foi possível conectar à API. Tente novamente em instantes." };
    }
}

export async function updatePostAction(_previousState: PostState, formData: FormData): Promise<PostState> {
    const id = formData.get("id");
    const title = formData.get("title");
    const content = formData.get("content");
    if (typeof id !== "string" || typeof title !== "string" || typeof content !== "string") return { error: "Dados da postagem inválidos." };
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (cleanTitle.length < 3) return { error: "O título deve ter pelo menos 3 caracteres." };
    if (cleanTitle.length > 255) return { error: "O título deve ter no máximo 255 caracteres." };
    if (cleanContent.length < 10) return { error: "O conteúdo deve ter pelo menos 10 caracteres." };
    const token = await getToken();
    if (!token) return { error: "Sessão expirada. Faça login novamente." };
    try {
        const response = await fetch(`${getApiUrl()}/posts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: cleanTitle, content: cleanContent }), cache: "no-store" });
        if (!response.ok) {
            const body: { message?: string } | null = await response.json().catch(() => null);
            return { error: body?.message ?? "Não foi possível atualizar a publicação." };
        }
    } catch {
        return { error: "Não foi possível conectar à API. Tente novamente em instantes." };
    }

    redirect("/posts?feedback=updated");
}
