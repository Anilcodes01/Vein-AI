import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const { pathname } = req.nextUrl;
  const publicPaths = ["/"];

  if (!sessionToken && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (sessionToken && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  console.log("Allowing request through");
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/info", "/dashboard/:path*"],
};
