"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api, ApiError } from "@/lib/api";
import { useStudentSession } from "@/lib/session";
import { StudentNav } from "@/components/StudentNav";
import { BedGrid } from "@/components/BedGrid";
import { Button } from "@/components/Button";
import type { Floor, Bed, Room } from "@/lib/types";

export default function HostelDetailPage() {
  const { hostelId } = useParams<{ hostelId: string }>();
  const router = useRouter();
  const { loading, userId, student } = useStudentSession();

  const [hostelName, setHostelName] = useState("");
  const [floors, setFloors] = useState<Floor[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<{ bed: Bed; room: Room } | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !userId) router.replace("/login");
  }, [loading, userId, router]);

  async function loadAvailability() {
    setFetching(true);
    const [{ data: hostel }, availability] = await Promise.all([
      supabase.from("hostels").select("name").eq("id", hostelId).single(),
      api.get(`/api/hostels/${hostelId}/availability`),
    ]);
    setHostelName(hostel?.name ?? "");
    setFloors(availability.floors ?? []);
    setActiveFloorId((prev) => prev ?? availability.floors?.[0]?.id ?? null);
    setFetching(false);
  }

  useEffect(() => {
    if (student) loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, hostelId]);

  async function confirmBooking() {
    if (!selected) return;
    setBooking(true);
    setError(null);
    try {
      await api.post("/api/bookings", { bed_id: selected.bed.id });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body?.message || "That bed is no longer available. Pick another.");
      } else {
        setError("Something went wrong. Try again.");
      }
      setSelected(null);
      loadAvailability(); // refresh - someone else may have just taken a bed
    } finally {
      setBooking(false);
    }
  }

  if (loading || !student || fetching) {
    return <div className="p-6 text-sm text-ink-muted">Loading...</div>;
  }

  const activeFloor = floors.find((f) => f.id === activeFloorId);

  return (
    <div className="pb-32 sm:pb-6">
      <StudentNav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="text-lg font-semibold text-ink">{hostelName}</h1>
        <p className="text-sm text-ink-muted">Tap a vacant bed to select it, then confirm below.</p>

        {/* Floor tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => {
                setActiveFloorId(floor.id);
                setSelected(null);
              }}
              className={`shrink-0 rounded px-3 py-1.5 text-sm font-medium ${
                floor.id === activeFloorId ? "bg-primary text-white" : "bg-white text-ink-muted border border-border-strong"
              }`}
            >
              Floor {floor.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success" /> Vacant</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ink-faint" /> Occupied</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> Reserved</span>
        </div>

        <div className="mt-4">
          {activeFloor && (
            <BedGrid rooms={activeFloor.rooms} selectedBedId={selected?.bed.id} onSelectBed={(bed, room) => setSelected({ bed, room })} />
          )}
        </div>
      </main>

      {/* Sticky confirm bar */}
      {selected && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white p-4 sm:bottom-0">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-2 sm:px-4">
            <div>
              <p className="text-sm font-medium text-ink">
                Room {selected.room.code}, bed {selected.bed.bed_slot}
              </p>
              {error && <p className="text-sm text-danger">{error}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button onClick={confirmBooking} disabled={booking}>
                {booking ? "Booking..." : "Confirm booking"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
