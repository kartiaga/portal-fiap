import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const PUBLIC_ROUTES = ["/login", "/posts"];

// No Next.js 16 este arquivo se chama "proxy.ts" (renomeado de "middleware.ts").
// O comportamento é o mesmo: roda antes de qualquer rota ser renderizada.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  const isPostDetail =
    /^\/posts\/[^/]+$/.test(pathname) &&
    !["/posts/admin", "/posts/new"].includes(pathname);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isPostDetail;

  // Checagem OTIMISTA: só confirma que o cookie existe, sem decodificar o JWT.
  // A validação completa acontece em getSession(), dentro dos Server Components.
  // Bloqueia visitantes nas rotas protegidas
  if (!hasSessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redireciona usuários autenticados que acessam o login
  if (hasSessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/posts", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
