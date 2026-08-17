"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/session";
import { logoutAction } from "@/app/actions";

const ROLE_LABEL: Record<SessionUser["role"], string> = {
  ADMIN: "Administrador",
  TEACHER: "Professor",
  STUDENT: "Aluno",
};

const ROLE_INITIALS: Record<SessionUser["role"], string> = {
  ADMIN: "AD",
  TEACHER: "PR",
  STUDENT: "AL",
};

export function UserMenu({ role }: { role: SessionUser["role"] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-s px-2 py-1.5 text-paper-000 transition hover:bg-white/10"
      >
        <span className="avatar sm">{ROLE_INITIALS[role]}</span>
        <span className="hidden text-sm font-medium sm:block">
          {ROLE_LABEL[role]}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-m border border-ink-100 bg-paper-000 shadow-l"
        >
          <div className="border-b border-ink-100 px-4 py-3">
            <p className="font-mono text-[11px] tracking-wide text-ink-500 uppercase">
              Sessão
            </p>
            <p className="text-sm font-semibold text-ink-900">
              {ROLE_LABEL[role]}
            </p>
          </div>

          {role === "ADMIN" ? (
            <>
              <Link
                href="/users/list"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-ink-900 transition hover:bg-paper-050"
              >
                Listar usuários
              </Link>
              <Link
                href="/users/new"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-ink-900 transition hover:bg-paper-050"
              >
                Cadastrar novo usuário
              </Link>
            </>
          ) : null}

          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-3 text-left text-sm font-medium text-red-700 transition hover:bg-red-050"
            >
              Sair
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
