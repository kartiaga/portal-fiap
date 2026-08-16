import Link from "next/link";
import type { SessionUser } from "@/lib/session";
import { UserMenu } from "./user-menu";

export function Header({ role }: { role: SessionUser["role"] }) {
  return (
    <header className="bg-ink-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold text-paper-000"
        >
          <span className="h-2.5 w-2.5 rounded-[2px] bg-red-500" />
          Portal FIAP
        </Link>
        <UserMenu role={role} />
      </div>
    </header>
  );
}
