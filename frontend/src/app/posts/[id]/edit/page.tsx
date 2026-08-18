import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getSession } from "@/lib/session";
import { fetchPostByIdAction } from "./actions";
import { UpdatePostForm } from "./update-post-form";

export default async function EditPostPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    if (session.role === "STUDENT") {
        redirect("/");
    }

    const { id } = await params;
    const result = await fetchPostByIdAction(id);

    if ("error" in result || !result.data) {
        return (
            <div className="flex flex-1 flex-col">
                <Header role={session.role} />
                <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 p-8">
                    <div className="card-plain w-full p-6 text-center">
                        <h1 className="font-display text-2xl font-semibold text-ink-900">
                            Publicação não encontrada
                        </h1>
                        <p className="mt-3 text-sm text-ink-500">
                            {result.error ?? "A publicação solicitada não existe ou foi removida."}
                        </p>
                        <Link href="/" className="btn btn-secondary mt-6">
                            Voltar ao início
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <Header role={session.role} />
            <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
                <div className="w-full max-w-2xl">
                    <div className="mb-6 text-center">
                        <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-red-700 uppercase">
                            <span className="h-0.5 w-4 bg-red-600" />
                            Docência
                        </span>
                        <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900">
                            Editar publicação
                        </h1>
                    </div>

                    <div className="card-plain p-6">
                        <UpdatePostForm post={result.data} />
                    </div>
                </div>
            </main>
        </div>
    );
}
