"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/Button";

export default function AdminSignupPage() {
  const router = useRouter();
  const [staffEmail, setStaffEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/auth/admin-signup", { staff_email: staffEmail, email, password });
      router.push("/admin/login?created=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.body?.message || err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Hostel office</p>
      <h1 className="mt-1 text-xl font-semibold text-ink">Set up your account</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Use the staff email the hostel office registered you with (e.g. porter.emmanuelhostel@caritasuni.edu.ng).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Registered staff email</span>
          <input
            required
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            className="rounded border border-border-strong px-3 py-2.5 text-sm focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Login email</span>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-border-strong px-3 py-2.5 text-sm focus:border-primary"
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? "Setting up..." : "Set up account"}
        </Button>
      </form>
    </main>
  );
}
