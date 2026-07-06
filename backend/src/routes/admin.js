import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { requireAdmin } from "../lib/auth-middleware.js";

export const adminRouter = Router();

// GET /api/admin/students?reg_no=CSC/2023/0001 - lookup before marking payment
adminRouter.get("/admin/students", requireAdmin, async (req, res) => {
  const { reg_no } = req.query;
  let query = supabaseAdmin.from("students").select("id, reg_no, full_name, email, gender, session");
  if (reg_no) query = query.ilike("reg_no", `%${reg_no}%`);

  const { data, error } = await query.limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ students: data });
});

// POST /api/admin/payments  { student_id, session, status }
// This is the ONLY way a payment status gets set - students have no write
// access to hostel_fee_payments (see RLS policies). In production this could
// also be a scheduled sync job against the bursary/main portal's database
// instead of manual entry.
adminRouter.post("/admin/payments", requireAdmin, async (req, res) => {
  const { student_id, session, status } = req.body;
  if (!student_id || !session || !status) {
    return res.status(400).json({ error: "student_id, session and status are required" });
  }

  const { data, error } = await supabaseAdmin
    .from("hostel_fee_payments")
    .upsert(
      {
        student_id,
        session,
        status,
        marked_paid_at: status === "paid" ? new Date().toISOString() : null,
        marked_by: req.admin.email,
      },
      { onConflict: "student_id,session" }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ payment: data });
});

// GET /api/admin/reports/occupancy - the real-time reporting the report's
// abstract promises ("generate reports in real time"). Scoped to the
// porter's hostel, or all hostels for a super_admin.
adminRouter.get("/admin/reports/occupancy", requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("hostels")
    .select(`
      id, name, gender,
      floors ( rooms ( beds ( status ) ) )
    `);

  if (error) return res.status(500).json({ error: error.message });

  const scoped = req.admin.hostel_id ? data.filter((h) => h.id === req.admin.hostel_id) : data;

  const report = scoped.map((hostel) => {
    let total = 0, occupied = 0;
    for (const floor of hostel.floors) {
      for (const room of floor.rooms) {
        for (const bed of room.beds) {
          total++;
          if (bed.status === "occupied") occupied++;
        }
      }
    }
    return {
      hostel: hostel.name,
      gender: hostel.gender,
      total_beds: total,
      occupied_beds: occupied,
      vacant_beds: total - occupied,
      occupancy_rate: total ? Math.round((occupied / total) * 100) : 0,
    };
  });

  res.json({ report });
});
