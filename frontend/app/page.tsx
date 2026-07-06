"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Caritas University, Enugu</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Hostel Portal</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Check live room availability, book your bed, and raise maintenance requests — all from your phone.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <BedDouble size={18} aria-hidden="true" />
          Student login
        </Link>
        <Link
          href="/signup"
          className="flex items-center justify-center rounded border border-border-strong px-4 py-3 text-sm font-medium text-ink hover:bg-white"
        >
          Create a student account
        </Link>
        <Link
          href="/admin/login"
          className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ShieldCheck size={16} aria-hidden="true" />
          Hostel staff login
        </Link>
      </div>
    </main>
  );
}
