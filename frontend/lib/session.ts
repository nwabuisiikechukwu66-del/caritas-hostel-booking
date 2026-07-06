"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Student } from "./types";

interface SessionState {
  loading: boolean;
  userId: string | null;
  student: Student | null;
}

// Wraps Supabase's auth state and, once logged in, fetches the student row
// linked to this auth user. RLS ("students read own row") means this query
// only ever returns the caller's own record - there is nothing to enforce
// client-side.
export function useStudentSession(): SessionState {
  const [state, setState] = useState<SessionState>({ loading: true, userId: null, student: null });

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id ?? null;
      if (!userId) {
        if (active) setState({ loading: false, userId: null, student: null });
        return;
      }
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("auth_user_id", userId)
        .maybeSingle();
      if (active) setState({ loading: false, userId, student: student as Student | null });
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

interface AdminSessionState {
  loading: boolean;
  admin: { id: string; full_name: string; role: "super_admin" | "porter"; hostel_id: string | null } | null;
}

export function useAdminSession(): AdminSessionState {
  const [state, setState] = useState<AdminSessionState>({ loading: true, admin: null });

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) {
        if (active) setState({ loading: false, admin: null });
        return;
      }
      const { data: admin } = await supabase
        .from("admins")
        .select("id, full_name, role, hostel_id")
        .eq("auth_user_id", userId)
        .maybeSingle();
      if (active) setState({ loading: false, admin: admin as any });
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
