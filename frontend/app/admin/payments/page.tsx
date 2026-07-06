"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAdminSession } from "@/lib/session";
import { AdminNav } from "@/components/AdminNav";
import { Button } from "@/components/Button";

interface StudentRow {
  id: string;
  reg_no: string;
  full_name: string;
  email: string;
  session: string;
}

const SESSION = "2025/2026";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { loading, admin } = useAdminSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !admin) router.replace("/admin/login");
  }, [loading, admin, router]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setMessage(null);
    const res = await api.get(`/api/admin/students?reg_no=${encodeURIComponent(query)}`);
    setResults(res.students ?? []);
    setSearching(false);
  }

  async function setStatus(studentId: string, status: "paid" | "unpaid") {
    setUpdatingId(studentId);
    await api.post("/api/admin/payments", { student_id: studentId, session: SESSION, status });
    setUpdatingId(null);
    setMessage(`Marked as ${status}.`);
  }

  if (loading || !admin) {
    return <div className="p-6 text-sm text-ink-muted">Loading...</div>;
  }

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="text-lg font-semibold text-ink">Hostel fee status</h1>
        <p className="text-sm text-ink-muted">
          Search a student by registration number and confirm their hostel fee payment for {SESSION}.
        </p>

        <form onSubmit={search} className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. CSC/2023/0456"
            className="flex-1 rounded border border-border-strong px-3 py-2.5 text-sm focus:border-primary"
          />
          <Button type="submit" disabled={searching}>
            <Search size={16} aria-hidden="true" />
            Search
          </Button>
        </form>

        {message && <p className="mt-3 text-sm text-success">{message}</p>}

        <ul className="mt-4 flex flex-col gap-2">
          {results.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
              <div>
                <p className="text-sm font-medium text-ink">{s.full_name}</p>
                <p className="text-xs text-ink-muted">{s.reg_no}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={updatingId === s.id}
                  onClick={() => setStatus(s.id, "unpaid")}
                >
                  Mark unpaid
                </Button>
                <Button disabled={updatingId === s.id} onClick={() => setStatus(s.id, "paid")}>
                  Mark paid
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
