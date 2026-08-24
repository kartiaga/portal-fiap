"use client";

import { useActionState } from "react";
import { createPostAction, type PostState } from "./actions";

export function CreatePostForm() {
    const [state, formAction, pending] = useActionState(createPostAction, {} as PostState);

    return (
        <form action={formAction} className="flex w-full flex-col gap-4">
            <div className="field"><label htmlFor="title">Título</label><input id="title" name="title" required minLength={3} /></div>
            <div className="field"><label htmlFor="content">Conteúdo</label><textarea id="content" name="content" required minLength={10} rows={8} /></div>
            {state.error ? <div role="alert" className="alert alert-danger"><span>!</span><div>{state.error}</div></div> : null}
            {state.success ? <div role="status" className="alert alert-success"><span>✓</span><div>{state.success}</div></div> : null}
            <button type="submit" disabled={pending} className="btn btn-primary w-full">{pending ? "Publicando..." : "Publicar postagem"}</button>
        </form>
    );
}
