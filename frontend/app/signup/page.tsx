"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/Button";

export default function SignupPage() {
  const router = useRouter();
  const [regNo, setRegNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/auth/signup", { reg_no: regNo, email, password });
      router.push("/login?created=1");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body?.message || err.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-xl font-semibold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Use your registration number exactly as it appears on your enrolment slip.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Registration number</span>
          <input
            required
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            className="rounded border border-border-strong px-3 py-2.5 text-sm uppercase focus:border-primary"
            placeholder="CSC/2023/0456"
          />
        </label>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-border-strong px-3 py-2.5 text-sm focus:border-primary"
            placeholder="At least 8 characters"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary">
          Log in
        </Link>
      </p>
    </main>
  );
}
