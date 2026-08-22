"use client";

import { useState } from "react";
import { fetchPostsAction, type PostListItem } from "./actions";

type PostsListProps = {
    initialPosts: PostListItem[];
    nextCursor: string | null;
    hasMore: boolean;
};

export function PostsList({
    initialPosts,
    nextCursor,
    hasMore: initialHasMore,
}: PostsListProps) {
    const [posts, setPosts] = useState<PostListItem[]>(initialPosts);
    const [cursor, setCursor] = useState<string | null>(nextCursor);
    const [hasMore, setHasMore] = useState<boolean>(initialHasMore);

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
            {posts.map((post) => (
                <article key={post.id} className="card-plain p-5">
                    <h2 className="font-display text-lg font-semibold text-ink-900">
                        {post.title}
                    </h2>

                    <p className="mt-2 text-sm text-ink-500">
                        {post.content}
                    </p>
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
        </div>
    );
}
