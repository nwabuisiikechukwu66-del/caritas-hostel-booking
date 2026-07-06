"use client";

import { createClient } from "@supabase/supabase-js";

// Anon key only - this file runs in the browser. Every table this client
// touches is protected by the RLS policies in database/migrations/0004,
// so a student session literally cannot read another student's row even
// though this key is public.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
