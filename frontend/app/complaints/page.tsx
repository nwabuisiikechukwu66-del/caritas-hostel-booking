"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareWarning } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useStudentSession } from "@/lib/session";
import { StudentNav } from "@/components/StudentNav";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import type { Booking, Complaint } from "@/lib/types";

export default function ComplaintsPage() {
  const router = useRouter();
  const { loading, userId, student } = useStudentSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !userId) router.replace("/login");
  }, [loading, userId, router]);

  async function loadData() {
    const [bookingRes, complaintsRes] = await Promise.all([
      api.get("/api/bookings/mine"),
      api.get("/api/complaints/mine"),
    ]);
    setBooking(bookingRes.booking ?? null);
    setComplaints(complaintsRes.complaints ?? []);
    setFetching(false);
  }

  useEffect(() => {
    if (student) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  async function submitComplaint(e: React.FormEvent) {
    e.preventDefault();
    if (!booking) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/api/complaints", {
        room_id: booking.beds.rooms.id,
        description,
      });
      setDescription("");
      loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !student || fetching) {
    return <div className="p-6 text-sm text-ink-muted">Loading...</div>;
  }

  return (
    <div className="pb-20 sm:pb-6">
      <StudentNav />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="text-lg font-semibold text-ink">Maintenance requests</h1>
        <p className="text-sm text-ink-muted">Report an issue with your room and the hostel office will act on it.</p>

        {!booking ? (
          <div className="mt-6">
            <EmptyState
              icon={<MessageSquareWarning size={28} aria-hidden="true" />}
              title="Book a bed first"
              description="You need an active room booking before you can report an issue with it."
            />
          </div>
        ) : (
          <form onSubmit={submitComplaint} className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-white p-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Describe the issue</span>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. The socket by the window sparks when I plug anything in."
                className="rounded border border-border-strong px-3 py-2.5 text-sm focus:border-primary"
              />
            </label>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={submitting} className="self-start">
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
          </form>
        )}

        <div className="mt-8">
          <h2 className="text-sm font-medium text-ink">Your requests</h2>
          {complaints.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">No requests submitted yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {complaints.map((c) => (
                <li key={c.id} className="rounded-lg border border-border bg-white p-3">
                  <div className="flex items-center justify-between">
                    <Badge value={c.status} />
                    <Badge value={c.urgency} label={`${c.urgency} urgency`} />
                  </div>
                  <p className="mt-2 text-sm text-ink">{c.description}</p>
                  <p className="mt-1 text-xs text-ink-muted capitalize">{c.category}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
