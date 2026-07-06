"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email or password is incorrect.");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Hostel office</p>
      <h1 className="mt-1 text-xl font-semibold text-ink">Staff login</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-border-strong px-3 py-2.5 text-sm focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-border-strong px-3 py-2.5 text-sm focus:border-primary"
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        First time here?{" "}
        <Link href="/admin/signup" className="font-medium text-primary">
          Set up your staff account
        </Link>
      </p>
    </main>
  );
}
