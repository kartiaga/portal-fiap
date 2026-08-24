"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePostAction } from "../actions";

export function PostActions({
    postId,
    postTitle,
}: {
    postId: string;
    postTitle: string;
}) {
    const router = useRouter();
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, startDeleting] = useTransition();

    function confirmDelete() {
        startDeleting(async () => {
            setError(null);
            const result = await deletePostAction(postId);

            if (result.error) {
                setError(result.error);
                return;
            }

            router.push("/posts?feedback=deleted");
        });
    }

    return (
        <>
            <div className="mt-8 flex flex-wrap gap-3 border-t border-ink-100 pt-6">
                <Link href={`/posts/${postId}/edit`} className="btn btn-secondary">
                    Editar
                </Link>
                <button
                    type="button"
                    onClick={() => setIsConfirmationOpen(true)}
                    disabled={isDeleting}
                    className="btn btn-secondary text-red-700"
                >
                    Excluir
                </button>
            </div>

            {error ? (
                <div role="alert" className="alert alert-danger mt-4">
                    <p>{error}</p>
                </div>
            ) : null}

            {isConfirmationOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-5"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isDeleting) {
                            setIsConfirmationOpen(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-detail-post-title"
                        className="w-full max-w-md rounded-m border border-ink-100 bg-paper-000 p-6 shadow-l"
                    >
                        <h2
                            id="delete-detail-post-title"
                            className="font-display text-xl font-semibold text-ink-900"
                        >
                            Excluir publicação?
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-ink-500">
                            A publicação &quot;{postTitle}&quot; será removida permanentemente.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsConfirmationOpen(false)}
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
        </>
    );
}
