// Nome do cookie que guarda o token. Fica isolado aqui porque tanto
// src/proxy.ts (roda antes das rotas) quanto src/lib/session.ts
// (roda dentro de Server Components/Actions) precisam do mesmo valor.
export const SESSION_COOKIE_NAME = "token";
