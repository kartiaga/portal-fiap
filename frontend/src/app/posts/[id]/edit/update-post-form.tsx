"use client";

import { useActionState } from "react";
import { updatePostAction, type PostState } from "./actions";

const initialState: PostState = {};

export function UpdatePostForm({
    post,
}: {
    post: { id: string; title: string; content: string };
}) {
    const [state, formAction, pending] = useActionState(
        updatePostAction,
        initialState,
    );

    return (
        <form action={formAction} className="flex w-full flex-col gap-4">
            <input type="hidden" name="id" defaultValue={post.id} />

            <div className="field">
                <label htmlFor="title">Título</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    minLength={3}
                    defaultValue={post.title}
                />
            </div>

            <div className="field">
                <label htmlFor="content">Conteúdo</label>
                <textarea
                    id="content"
                    name="content"
                    required
                    minLength={10}
                    rows={8}
                    defaultValue={post.content}
                    className="min-h-[160px] resize-y rounded-[6px] border border-ink-100 bg-paper-000 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-red-500 focus:shadow-[0_0_0_3px_var(--red-100)]"
                />
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
                {pending ? "Salvando..." : "Salvar alterações"}
            </button>
        </form>
    );
}
