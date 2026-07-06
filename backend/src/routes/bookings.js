import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { requireStudent } from "../lib/auth-middleware.js";
import { sendBookingConfirmation } from "../lib/email.js";

export const bookingsRouter = Router();

// GET /api/hostels/:hostelId/availability
// Live availability snapshot for a hostel - used to render the room picker.
// The client should also subscribe to Supabase Realtime on the `beds` table
// directly for live updates; this endpoint is for the initial page load.
bookingsRouter.get("/hostels/:hostelId/availability", async (req, res) => {
  const { hostelId } = req.params;

  const { data, error } = await supabaseAdmin
    .from("floors")
    .select(`
      id, label,
      rooms (
        id, code, facing, capacity,
        beds ( id, bed_slot, status )
      )
    `)
    .eq("hostel_id", hostelId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ floors: data });
});

// POST /api/bookings  { bed_id }
// The one endpoint that actually assigns a bed. All the concurrency safety
// lives inside the book_bed() Postgres function (see migration 0003) - this
// route is just an authenticated wrapper around it.
bookingsRouter.post("/bookings", requireStudent, async (req, res) => {
  const { bed_id } = req.body;
  if (!bed_id) return res.status(400).json({ error: "bed_id is required" });

  const { data, error } = await supabaseAdmin.rpc("book_bed", {
    p_student_id: req.student.id,
    p_bed_id: bed_id,
    p_session: req.student.session,
  });

  if (error) return res.status(500).json({ error: error.message });
  if (!data.success) return res.status(409).json(data); // 409 Conflict: bed taken / already booked / unpaid

  // Fire-and-forget confirmation email - don't block the response on it.
  sendBookingConfirmation(req.student, bed_id).catch((e) =>
    console.error("Failed to send booking confirmation email:", e.message)
  );

  res.status(201).json(data);
});

// POST /api/bookings/:id/cancel
bookingsRouter.post("/bookings/:id/cancel", requireStudent, async (req, res) => {
  const { data, error } = await supabaseAdmin.rpc("cancel_booking", {
    p_booking_id: req.params.id,
    p_student_id: req.student.id,
  });

  if (error) return res.status(500).json({ error: error.message });
  if (!data.success) return res.status(404).json(data);
  res.json(data);
});

// GET /api/bookings/mine
bookingsRouter.get("/bookings/mine", requireStudent, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      id, status, booked_at, session,
      beds ( bed_slot, rooms ( id, code, facing, floors ( label, hostels ( name ) ) ) )
    `)
    .eq("student_id", req.student.id)
    .eq("status", "confirmed")
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ booking: data });
});
