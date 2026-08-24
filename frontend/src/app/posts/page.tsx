import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Header } from "@/components/header";
import { fetchPostsAction } from "./actions";
import { PostsList } from "./posts-list";

export default async function PostsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const result = await fetchPostsAction({ limit: 10 });

    return (
        <div className="flex flex-1 flex-col">
            <Header role={session.role} />

            <main className="mx-auto w-full max-w-5xl flex-1 p-5 sm:p-8">
                <h1 className="mb-6 font-display text-2xl font-semibold text-ink-900">
                    Posts
                </h1>

                {"error" in result ? (
                    <div className="alert alert-danger">
                        <p>{result.error}</p>
                    </div>
                ) : (
                   <PostsList
                   initialPosts={result.data.items}
                   nextCursor={result.data.nextCursor}
                   hasMore={result.data.hasMore}
                   /> 
                )}
            </main>
        </div>
    );
}
