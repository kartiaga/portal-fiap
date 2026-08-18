"use client";

import { useActionState } from "react";
import { createPostAction, type PostState } from "./actions";

const initialState: PostState = {};

export function CreatePostForm() {
    const [state, formAction, pending] = useActionState(
        createPostAction,
        initialState,
    );

    return (
        <form action={formAction} className="flex w-full flex-col gap-4">
            <div className="field">
                <label htmlFor="title">Título</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    minLength={3}
                    placeholder="Ex.: Plano de aula — Redes de computadores"
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
                    placeholder="Escreva o conteúdo da publicação para os alunos..."
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
                {pending ? "Publicando..." : "Publicar postagem"}
            </button>
        </form>
    );
}
