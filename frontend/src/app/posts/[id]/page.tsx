import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Header } from "@/components/header";
import { fetchPostAction } from "./actions";
import { PostActions } from "./post-actions";

function formatData(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default async function PostPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { id } = await params;
    const result = await fetchPostAction(id);

    return (
        <div className="flex flex-1 flex-col">
            <Header role={session.role} />

            <main className="mx-auto w-full max-w-3xl flex-1 p-5 sm:p-8">
                <Link href="/posts" className="mb-6 inline-block text-sm text-ink-500 hover:text-ink-900">
                    ← Voltar para posts
                </Link>

                {"error" in result ? (
                    <div className="alert alert-danger">
                        <p>{result.error}</p>
                    </div>
                ) : (
                    <article className="card-plain p-6 sm:p-8">
                        <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                            {result.data.title}
                        </h1>

                        <p className="mt-2 text-xs text-ink-500">
                            Publicado em {formatData(result.data.createdAt)}
                        </p>

                        <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                            {result.data.content}
                        </div>

                        {session.role !== "STUDENT" ? (
                            <PostActions
                                postId={result.data.id}
                                postTitle={result.data.title}
                            />
                        ) : null}
                    </article>

                )}
            </main>
        </div>
    );
}
