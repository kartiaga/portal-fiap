"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePostAction, type Post } from "./[id]/edit/actions";
import { createPostAction, type PostState } from "./new/actions";

type PostFormState = PostState;
type PostItem = Post;

const initialState: PostFormState = {};

/**
 * Mesmo formulário para criar e editar: quando recebe `post`, envia o id junto
 * e chama a action de atualização. Os limites de tamanho repetem os do
 * backend (título >= 3, conteúdo >= 10) para o erro aparecer antes da rede.
 */
export function PostForm({ post }: { post?: PostItem }) {
  const [state, formAction, pending] = useActionState(
    post ? updatePostAction : createPostAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="field">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          defaultValue={post?.title}
          placeholder="Ex.: Trabalho de Matemática — Entrega dia 12"
        />
      </div>

      <div className="field">
        <label htmlFor="content">Conteúdo</label>
        <textarea
          id="content"
          name="content"
          required
          minLength={10}
          rows={10}
          defaultValue={post?.content}
          placeholder="Escreva aqui o conteúdo da postagem."
        />
        <span className="hint">Mínimo de 10 caracteres.</span>
      </div>

      {state.error ? (
        <div role="alert" className="alert alert-danger">
          <span>!</span>
          <div>{state.error}</div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary flex-1"
        >
          {pending
            ? "Salvando..."
            : post
              ? "Salvar alterações"
              : "Publicar postagem"}
        </button>
        <Link href="/posts/admin" className="btn btn-secondary flex-1">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
