import { getUserFromToken, supabaseAdmin } from "./supabase.js";

// Attaches req.student (the row from the students table) based on the
// Supabase session token sent from the Next.js client. Rejects if the
// student has no matching row or the token is invalid/expired.
export async function requireStudent(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: "unauthenticated" });

  const { data: student, error } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (error || !student) return res.status(403).json({ error: "no_student_record" });

  req.student = student;
  next();
}

// Same idea, but for admin/porter-only routes.
export async function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: "unauthenticated" });

  const { data: admin, error } = await supabaseAdmin
    .from("admins")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (error || !admin) return res.status(403).json({ error: "not_an_admin" });

  req.admin = admin;
  next();
}
