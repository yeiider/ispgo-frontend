import { NextResponse } from "next/server"

// Rutas públicas que no requieren autenticación
const publicPaths = ["/login", "/forgot-password", "/register"]

export default function proxy(request) {
  const { pathname } = request.nextUrl

  // Verificar si es una ruta pública
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Obtener token de las cookies
  const token = request.cookies.get("access_token")?.value

  // Si no hay token y no es ruta pública, redirigir a login
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si hay token y está en login, redirigir al dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|icon).*)"],
}
