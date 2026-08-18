import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    let response = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback query without ordering
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("submissions")
        .select("*");

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }

      return NextResponse.json({
        data: fallbackData || [],
        user: user?.email || null,
        authenticated: !!user,
      });
    }

    return NextResponse.json({
      data: data || [],
      user: user?.email || null,
      authenticated: !!user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
