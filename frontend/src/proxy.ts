import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const PUBLIC_ROUTES = ["/login"];

// No Next.js 16 este arquivo se chama "proxy.ts" (renomeado de "middleware.ts").
// O comportamento é o mesmo: roda antes de qualquer rota ser renderizada.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Checagem OTIMISTA: só confirma que o cookie existe, sem decodificar o JWT.
  // A validação completa acontece em getSession(), dentro dos Server Components.
  if (!hasSessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSessionCookie && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
