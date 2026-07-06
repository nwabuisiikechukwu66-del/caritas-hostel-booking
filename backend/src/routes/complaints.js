import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { requireStudent, requireAdmin } from "../lib/auth-middleware.js";
import { triageComplaint } from "../lib/ai-triage.js";

export const complaintsRouter = Router();

// POST /api/complaints  { room_id, description }
complaintsRouter.post("/complaints", requireStudent, async (req, res) => {
  const { room_id, description } = req.body;
  if (!room_id || !description) {
    return res.status(400).json({ error: "room_id and description are required" });
  }

  const { category, urgency } = await triageComplaint(description);

  const { data, error } = await supabaseAdmin
    .from("complaints")
    .insert({
      student_id: req.student.id,
      room_id,
      description,
      category,
      urgency,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ complaint: data });
});

// GET /api/complaints/mine
complaintsRouter.get("/complaints/mine", requireStudent, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("complaints")
    .select("*")
    .eq("student_id", req.student.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ complaints: data });
});

// GET /api/admin/complaints - porters see complaints for their hostel only,
// super_admins see everything. Sorted so 'high' urgency + 'open' surface first.
complaintsRouter.get("/admin/complaints", requireAdmin, async (req, res) => {
  let query = supabaseAdmin
    .from("complaints")
    .select("*, rooms ( code, floors ( hostel_id, hostels ( name ) ) )")
    .order("urgency", { ascending: false })
    .order("created_at", { ascending: true });

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const scoped = req.admin.hostel_id
    ? data.filter((c) => c.rooms?.floors?.hostel_id === req.admin.hostel_id)
    : data;

  res.json({ complaints: scoped });
});

// PATCH /api/admin/complaints/:id  { status }
complaintsRouter.patch("/admin/complaints/:id", requireAdmin, async (req, res) => {
  const { status } = req.body;
  const update = { status };
  if (status === "resolved") update.resolved_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("complaints")
    .update(update)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ complaint: data });
});
