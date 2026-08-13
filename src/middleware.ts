import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Initialize Supabase SSR Server Client to handle cookies properly
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Fetch the current logged-in user from the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 3. SECURE RULE: Protect all `/admin` routes
  // If user tries to access /admin or /admin/dashboard without logging in, redirect to /login
  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = new URL("/login", request.url);
    // Optional: add a redirect parameter so they return back after login
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. OPTIONAL: If an authenticated admin visits /login, redirect them straight to /admin/dashboard
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}

// 5. Matcher config: ONLY run middleware on admin routes and the login page
export const config = {
  matcher: [
    /*
     * Intercept:
     * - /admin and all sub-routes (/admin/dashboard, /admin/dashboard/feed, etc.)
     * - /login
     */
    "/admin/:path*",
    "/login",
  ],
};