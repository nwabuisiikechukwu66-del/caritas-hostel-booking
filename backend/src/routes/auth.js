import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";

export const authRouter = Router();

// POST /api/auth/signup  { reg_no, email, password }
// Students already exist as rows in `students` (seeded from university
// records) but have no login yet. This endpoint is the only bridge between
// "a person typing on a form" and "an authenticated Supabase user" - it has
// to run server-side with the service role key because creating an auth
// user and writing auth_user_id onto a protected student row are both
// operations regular (anon) clients aren't allowed to do.
authRouter.post("/auth/signup", async (req, res) => {
  const { reg_no, email, password } = req.body;
  if (!reg_no || !email || !password) {
    return res.status(400).json({ error: "reg_no, email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }

  const { data: student, error: lookupErr } = await supabaseAdmin
    .from("students")
    .select("id, auth_user_id, email, full_name")
    .ilike("reg_no", reg_no.trim())
    .maybeSingle();

  if (lookupErr) return res.status(500).json({ error: lookupErr.message });
  if (!student) {
    return res.status(404).json({
      error: "reg_no_not_found",
      message: "This registration number was not found. Contact the hostel office if you believe this is an error.",
    });
  }
  if (student.auth_user_id) {
    return res.status(409).json({
      error: "already_registered",
      message: "An account already exists for this registration number. Try logging in instead.",
    });
  }

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email verification for the campus demo flow
  });
  if (createErr) return res.status(400).json({ error: createErr.message });

  const { error: linkErr } = await supabaseAdmin
    .from("students")
    .update({ auth_user_id: created.user.id, email })
    .eq("id", student.id);

  if (linkErr) {
    // Roll back the orphaned auth user so signup can be retried cleanly.
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return res.status(500).json({ error: linkErr.message });
  }

  res.status(201).json({ success: true, full_name: student.full_name });
});

// POST /api/auth/admin-signup  { staff_email, email, password }
// Same bridge, for pre-seeded admin/porter rows (matched by their seeded
// staff email rather than a reg no).
authRouter.post("/auth/admin-signup", async (req, res) => {
  const { staff_email, email, password } = req.body;
  if (!staff_email || !email || !password) {
    return res.status(400).json({ error: "staff_email, email and password are required" });
  }

  const { data: admin, error: lookupErr } = await supabaseAdmin
    .from("admins")
    .select("id, auth_user_id, full_name")
    .ilike("email", staff_email.trim())
    .maybeSingle();

  if (lookupErr) return res.status(500).json({ error: lookupErr.message });
  if (!admin) return res.status(404).json({ error: "staff_email_not_found" });
  if (admin.auth_user_id) return res.status(409).json({ error: "already_registered" });

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) return res.status(400).json({ error: createErr.message });

  const { error: linkErr } = await supabaseAdmin
    .from("admins")
    .update({ auth_user_id: created.user.id, email })
    .eq("id", admin.id);

  if (linkErr) {
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return res.status(500).json({ error: linkErr.message });
  }

  res.status(201).json({ success: true, full_name: admin.full_name });
});
