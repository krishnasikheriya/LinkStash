import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server";

export const { auth: proxy } = NextAuth(authConfig)

export default proxy((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // If the user is NOT logged in and isn't already on the login page, redirect to login
  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Optional: If they ARE logged in and try to visit the login page, redirect to the dashboard
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
