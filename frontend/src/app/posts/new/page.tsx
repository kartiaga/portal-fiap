import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getSession } from "@/lib/session";
import { CreatePostForm } from "./create-post-form";

export default async function NewPostPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    if (session.role === "STUDENT") {
        redirect("/");
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
                            Nova publicação
                        </h1>
                        <p className="mt-2 text-sm text-ink-500">
                            Compartilhe instruções, materiais e avisos com os alunos.
                        </p>
                    </div>

                    <div className="card-plain p-6">
                        <CreatePostForm />
                    </div>
                </div>
            </main>
        </div>
    );
}
