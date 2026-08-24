import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Header } from "@/components/header";
import { fetchPostsAction } from "./actions";
import { FeedbackAlert } from "./feedback-alert";
import { PostsList } from "./posts-list";

export default async function PostsPage({
    searchParams,
}: {
    searchParams: Promise<{ feedback?: string }>;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { feedback } = await searchParams;
    const result = await fetchPostsAction({ limit: 10 });
    const feedbackMessage = feedback === "created"
        ? "Publicação criada com sucesso."
        : feedback === "updated"
            ? "Publicação atualizada com sucesso."
            : null;

    return (
        <div className="flex flex-1 flex-col">
            <Header role={session.role} />

            <main className="mx-auto w-full max-w-5xl flex-1 p-5 sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h1 className="font-display text-2xl font-semibold text-ink-900">
                        Posts
                    </h1>
                    {session.role !== "STUDENT" ? (
                        <Link href="/posts/new" className="btn btn-primary">
                            Criar post
                        </Link>
                    ) : null}
                </div>

                {feedbackMessage ? (
                    <FeedbackAlert message={feedbackMessage} />
                ) : null}

                {"error" in result ? (
                    <div className="alert alert-danger">
                        <p>{result.error}</p>
                    </div>
                ) : (
                    <PostsList
                        initialPosts={result.data.items}
                        nextCursor={result.data.nextCursor}
                        hasMore={result.data.hasMore}
                        role={session.role}
                    />
                )}
            </main>
        </div>
    );
}
