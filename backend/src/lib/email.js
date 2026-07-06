import { Resend } from "resend";
import { supabaseAdmin } from "./supabase.js";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendBookingConfirmation(student, bedId) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set - skipping email send (fine for local dev).");
    return;
  }

  const { data: bed } = await supabaseAdmin
    .from("beds")
    .select("bed_slot, rooms ( code, floors ( label, hostels ( name ) ) )")
    .eq("id", bedId)
    .single();

  const roomCode = bed?.rooms?.code ?? "your room";
  const hostelName = bed?.rooms?.floors?.hostels?.name ?? "your hostel";

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hostel@caritasuni.edu.ng",
    to: student.email,
    subject: "Hostel booking confirmed",
    html: `
      <p>Hi ${student.full_name.split(" ")[1] || student.full_name},</p>
      <p>Your hostel booking is confirmed for the ${student.session} session.</p>
      <p><strong>Hostel:</strong> ${hostelName}<br/>
         <strong>Room:</strong> ${roomCode}<br/>
         <strong>Bed:</strong> ${bed?.bed_slot}</p>
      <p>Please keep this email as your confirmation.</p>
    `,
  });
}
