import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getSession } from "@/lib/session";
import { fetchPostByIdAction } from "./actions";
import { UpdatePostForm } from "./update-post-form";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role === "STUDENT") redirect("/");
    const { id } = await params;
    const result = await fetchPostByIdAction(id);
    if (result.error || !result.data) return <div className="flex flex-1 flex-col"><Header role={session.role} /><main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center p-8"><div className="card-plain w-full p-6 text-center"><h1 className="font-display text-2xl font-semibold text-ink-900">Publicação não encontrada</h1><p className="mt-3 text-sm text-ink-500">{result.error ?? "A publicação solicitada não existe ou foi removida."}</p><Link href="/posts" className="btn btn-secondary mt-6">Voltar aos posts</Link></div></main></div>;
    return <div className="flex flex-1 flex-col"><Header role={session.role} /><main className="flex flex-1 flex-col items-center justify-center p-8"><div className="w-full max-w-2xl"><Link href="/posts" aria-label="Voltar aos posts" title="Voltar aos posts" className="btn btn-secondary mb-6 self-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 18L5 12L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></Link><h1 className="mb-6 text-center font-display text-2xl font-semibold text-ink-900">Editar publicação</h1><div className="card-plain p-6"><UpdatePostForm post={result.data} /></div></div></main></div>;
}
