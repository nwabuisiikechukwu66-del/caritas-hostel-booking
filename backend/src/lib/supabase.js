import { createClient } from "@supabase/supabase-js";

// Service role key: this connection bypasses RLS entirely. It must only ever
// live here, in server-side code — never in the Next.js client bundle.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Verifies the bearer token from a request and returns the authenticated
// user, or null. Used by middleware to identify which student is calling.
export async function getUserFromToken(accessToken) {
  if (!accessToken) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error) return null;
  return data.user;
}
