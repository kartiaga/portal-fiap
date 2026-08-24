"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { SessionUser } from "@/lib/session";
import { deletePostAction, fetchPostsAction, type PostListItem } from "./actions";

type PostsListProps = {
    initialPosts: PostListItem[];
    nextCursor: string | null;
    hasMore: boolean;
    role: SessionUser["role"];
};

export function PostsList({
    initialPosts,
    nextCursor,
    hasMore: initialHasMore,
    role,
}: PostsListProps) {
    const [posts, setPosts] = useState<PostListItem[]>(initialPosts);
    const [cursor, setCursor] = useState<string | null>(nextCursor);
    const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
    const [error, setError] = useState<string | null>(null);
    const [postToDelete, setPostToDelete] = useState<PostListItem | null>(null);
    const [isDeleting, startDeleting] = useTransition();
    const canManagePosts = role === "TEACHER" || role === "ADMIN";

    function confirmDelete() {
        if (!postToDelete) {
            return;
        }

        const postId = postToDelete.id;
        startDeleting(async () => {
            setError(null);
            const result = await deletePostAction(postId);

            if (result.error) {
                setError(result.error);
                return;
            }

            setPosts((currentPosts) =>
                currentPosts.filter((post) => post.id !== postId),
            );
            setPostToDelete(null);
        });
    }

    async function loadMorePosts() {
        if (!cursor) {
            return;
        }

        const result = await fetchPostsAction({
            cursor,
            limit: 10,
        });

        if ("error" in result) {
            return;
        }

        setPosts((currentPosts) => [
            ...currentPosts,
            ...result.data.items,
        ]);
        setCursor(result.data.nextCursor);
        setHasMore(result.data.hasMore);
    }

    return (
        <div className="flex flex-col gap-4">
            {error ? (
                <div role="alert" className="alert alert-danger">
                    <p>{error}</p>
                </div>
            ) : null}

            {posts.map((post) => (
                <article key={post.id} className="card-plain p-5">
                    <Link href={`/posts/${post.id}`}>
                        <h2 className="font-display text-lg font-semibold text-ink-900">
                            {post.title}
                        </h2>
                    </Link>

                    <p className="mt-2 text-sm text-ink-500">
                        {post.content}
                    </p>

                    {canManagePosts ? (
                        <div className="mt-4 flex gap-3 border-t border-ink-100 pt-4">
                            <Link
                                href={`/posts/${post.id}/edit`}
                                className="btn btn-secondary"
                            >
                                Editar
                            </Link>
                            <button
                                type="button"
                                onClick={() => setPostToDelete(post)}
                                disabled={isDeleting}
                                className="btn btn-secondary text-red-700"
                            >
                                Excluir
                            </button>
                        </div>
                    ) : null}
                </article>
            ))}

            {hasMore && (
                <button
                    type="button"
                    onClick={loadMorePosts}
                    className="btn btn-primary self-center"
                >
                    carregar mais
                </button>
            )}

            {!hasMore && (
                <p className="py-4 text-center text-sm text-ink-500">
                    Não há mais posts.
                </p>
            )}

            {postToDelete ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-5"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isDeleting) {
                            setPostToDelete(null);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-post-title"
                        className="w-full max-w-md rounded-m border border-ink-100 bg-paper-000 p-6 shadow-l"
                    >
                        <h2
                            id="delete-post-title"
                            className="font-display text-xl font-semibold text-ink-900"
                        >
                            Excluir publicação?
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-ink-500">
                            A publicação &quot;{postToDelete.title}&quot; será removida
                            permanentemente.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setPostToDelete(null)}
                                disabled={isDeleting}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="btn btn-primary"
                            >
                                {isDeleting ? "Excluindo..." : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
