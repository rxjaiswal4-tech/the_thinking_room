import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Using createBrowserClient ensures cookies and authenticated sessions from login
// are automatically passed in all browser requests so RLS policies allow authenticated admin queries.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);