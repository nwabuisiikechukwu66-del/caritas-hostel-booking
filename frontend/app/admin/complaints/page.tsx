"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAdminSession } from "@/lib/session";
import { AdminNav } from "@/components/AdminNav";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquareWarning } from "lucide-react";

interface AdminComplaint {
  id: string;
  category: string;
  urgency: string;
  description: string;
  status: string;
  created_at: string;
  rooms: { code: string; floors: { hostels: { name: string } } };
}

export default function AdminComplaintsPage() {
  const router = useRouter();
  const { loading, admin } = useAdminSession();
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [fetching, setFetching] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !admin) router.replace("/admin/login");
  }, [loading, admin, router]);

  async function load() {
    const res = await api.get("/api/admin/complaints");
    setComplaints(res.complaints ?? []);
    setFetching(false);
  }

  useEffect(() => {
    if (admin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    await api.patch(`/api/admin/complaints/${id}`, { status });
    await load();
    setUpdatingId(null);
  }

  if (loading || !admin || fetching) {
    return <div className="p-6 text-sm text-ink-muted">Loading...</div>;
  }

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="text-lg font-semibold text-ink">Maintenance queue</h1>
        <p className="text-sm text-ink-muted">Sorted by urgency, then oldest first. Urgency is set automatically.</p>

        {complaints.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<MessageSquareWarning size={28} aria-hidden="true" />}
              title="Nothing to triage"
              description="No open maintenance requests right now."
            />
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {complaints.map((c) => (
              <li key={c.id} className="rounded-lg border border-border bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge value={c.urgency} label={`${c.urgency} urgency`} />
                  <Badge value={c.status} />
                  <span className="text-xs text-ink-muted capitalize">{c.category}</span>
                </div>
                <p className="mt-2 text-sm text-ink">{c.description}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {c.rooms?.floors?.hostels?.name} &middot; room {c.rooms?.code}
                </p>

                <div className="mt-3 flex gap-2">
                  {c.status !== "in_progress" && (
                    <Button variant="secondary" disabled={updatingId === c.id} onClick={() => updateStatus(c.id, "in_progress")}>
                      Mark in progress
                    </Button>
                  )}
                  {c.status !== "resolved" && (
                    <Button disabled={updatingId === c.id} onClick={() => updateStatus(c.id, "resolved")}>
                      Mark resolved
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
