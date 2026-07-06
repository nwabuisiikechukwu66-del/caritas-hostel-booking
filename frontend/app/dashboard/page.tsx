"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleAlert, BedDouble, MessageSquareWarning } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useStudentSession } from "@/lib/session";
import { StudentNav } from "@/components/StudentNav";
import { Button } from "@/components/Button";
import type { Booking, PaymentStatus } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { loading, userId, student } = useStudentSession();
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !userId) router.replace("/login");
  }, [loading, userId, router]);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const [{ data: paymentRow }, bookingRes] = await Promise.all([
        supabase
          .from("hostel_fee_payments")
          .select("status")
          .eq("session", student.session)
          .maybeSingle(),
        api.get("/api/bookings/mine"),
      ]);
      setPayment((paymentRow?.status as PaymentStatus) ?? "unpaid");
      setBooking(bookingRes.booking ?? null);
      setDataLoading(false);
    })();
  }, [student]);

  if (loading || !student || dataLoading) {
    return <div className="p-6 text-sm text-ink-muted">Loading...</div>;
  }

  return (
    <div className="pb-20 sm:pb-6">
      <StudentNav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="text-lg font-semibold text-ink">Welcome, {student.full_name.split(" ")[0]}</h1>
        <p className="text-sm text-ink-muted">
          {student.reg_no} &middot; Session {student.session}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Payment status */}
          <div className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              {payment === "paid" ? (
                <CircleCheck size={18} className="text-success" aria-hidden="true" />
              ) : (
                <CircleAlert size={18} className="text-warning" aria-hidden="true" />
              )}
              <p className="text-sm font-medium text-ink">Hostel fee</p>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {payment === "paid"
                ? "Confirmed as paid for this session. You can book a bed."
                : "Not yet confirmed as paid. Complete payment on the main student portal, then check back here."}
            </p>
          </div>

          {/* Booking status */}
          <div className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              <BedDouble size={18} className="text-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-ink">Your room</p>
            </div>
            {booking ? (
              <p className="mt-1 text-sm text-ink-muted">
                {booking.beds.rooms.floors.hostels.name}, room {booking.beds.rooms.code}, bed {booking.beds.bed_slot}
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink-muted">You haven&apos;t booked a bed yet for this session.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {!booking && (
            <Button
              onClick={() => router.push("/hostels")}
              disabled={payment !== "paid"}
              className="sm:w-auto"
            >
              <BedDouble size={16} aria-hidden="true" />
              Browse hostels &amp; book a bed
            </Button>
          )}
          <Button variant="secondary" onClick={() => router.push("/complaints")} className="sm:w-auto">
            <MessageSquareWarning size={16} aria-hidden="true" />
            Report a maintenance issue
          </Button>
        </div>
      </main>
    </div>
  );
}
