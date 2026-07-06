import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { FACULTIES, HOSTELS, SESSION, randomName } from "./seed-data.js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// Service role key bypasses RLS — this script must never run in the browser.
const supabase = createClient(url, serviceKey);

const STUDENTS_PER_DEPARTMENT = 6; // ~150 demo students total across ~25 departments

async function seedFaculties() {
  console.log("Seeding faculties + departments...");
  const departmentIds = {}; // code -> id

  for (const [facultyName, departments] of Object.entries(FACULTIES)) {
    const { data: faculty, error: facultyErr } = await supabase
      .from("faculties")
      .upsert({ name: facultyName }, { onConflict: "name" })
      .select()
      .single();
    if (facultyErr) throw facultyErr;

    for (const [deptName, code] of departments) {
      const { data: dept, error: deptErr } = await supabase
        .from("departments")
        .upsert({ faculty_id: faculty.id, name: deptName, code }, { onConflict: "code" })
        .select()
        .single();
      if (deptErr) throw deptErr;
      departmentIds[code] = dept.id;
    }
  }
  return departmentIds;
}

async function seedHostels() {
  console.log("Seeding hostels, floors, rooms, beds...");
  const bedIds = []; // flat list of { id, gender } for later student assignment

  for (const hostel of HOSTELS) {
    const { data: hostelRow, error: hostelErr } = await supabase
      .from("hostels")
      .upsert({ name: hostel.name, gender: hostel.gender, short_code: hostel.shortCode }, { onConflict: "name" })
      .select()
      .single();
    if (hostelErr) throw hostelErr;

    for (const floorLabel of hostel.floors) {
      const { data: floorRow, error: floorErr } = await supabase
        .from("floors")
        .upsert({ hostel_id: hostelRow.id, label: floorLabel }, { onConflict: "hostel_id,label" })
        .select()
        .single();
      if (floorErr) throw floorErr;

      const roomsToInsert = [];
      for (let n = 1; n <= hostel.roomsPerFloor; n++) {
        roomsToInsert.push({
          floor_id: floorRow.id,
          room_number: n,
          code: `${hostel.shortCode}-${floorLabel}-${n}`,
          facing: n % 2 === 1 ? "front" : "back",
          capacity: 4,
        });
      }
      const { data: rooms, error: roomsErr } = await supabase
        .from("rooms")
        .upsert(roomsToInsert, { onConflict: "floor_id,room_number" })
        .select();
      if (roomsErr) throw roomsErr;

      const bedsToInsert = [];
      for (const room of rooms) {
        for (let slot = 1; slot <= room.capacity; slot++) {
          bedsToInsert.push({ room_id: room.id, bed_slot: slot });
        }
      }
      const { data: beds, error: bedsErr } = await supabase
        .from("beds")
        .upsert(bedsToInsert, { onConflict: "room_id,bed_slot" })
        .select("id");
      if (bedsErr) throw bedsErr;

      for (const bed of beds) bedIds.push({ id: bed.id, gender: hostel.gender });
    }
    console.log(`  ${hostel.name}: ${hostel.floors.length} floor(s) x ${hostel.roomsPerFloor} rooms seeded`);
  }
  return bedIds;
}

async function seedStudents(departmentIds) {
  console.log("Seeding demo students...");
  const students = [];
  let serial = 1;

  for (const [code, deptId] of Object.entries(departmentIds)) {
    for (let i = 0; i < STUDENTS_PER_DEPARTMENT; i++) {
      const gender = Math.random() > 0.5 ? "male" : "female";
      const regNo = `${code}/2023/${String(serial).padStart(4, "0")}`;
      serial++;
      students.push({
        reg_no: regNo,
        full_name: randomName(gender),
        email: `${regNo.replace(/\//g, "").toLowerCase()}@caritasuni.edu.ng`,
        gender,
        department_id: deptId,
        level: "300",
        session: SESSION,
      });
    }
  }

  const { data: inserted, error } = await supabase
    .from("students")
    .upsert(students, { onConflict: "reg_no" })
    .select("id, gender, reg_no");
  if (error) throw error;
  console.log(`  ${inserted.length} students seeded`);
  return inserted;
}

async function seedPayments(students) {
  console.log("Seeding hostel fee payment status (demo: ~80% paid)...");
  const rows = students.map((s) => ({
    student_id: s.id,
    session: SESSION,
    status: Math.random() < 0.8 ? "paid" : "unpaid",
    amount: 45000,
    marked_paid_at: Math.random() < 0.8 ? new Date().toISOString() : null,
    marked_by: "bursary-sync-demo",
  }));
  const { error } = await supabase.from("hostel_fee_payments").upsert(rows, { onConflict: "student_id,session" });
  if (error) throw error;
}

async function seedSomeBookings(students, bedIds) {
  console.log("Pre-booking ~40% of paid students so the demo isn't an empty hostel...");
  const { data: paidStudents } = await supabase
    .from("hostel_fee_payments")
    .select("student_id, students!inner(gender)")
    .eq("session", SESSION)
    .eq("status", "paid");

  const byGender = { male: [...bedIds.filter((b) => b.gender === "male")], female: [...bedIds.filter((b) => b.gender === "female")] };
  let booked = 0;

  for (const row of paidStudents) {
    if (Math.random() > 0.4) continue;
    const gender = row.students.gender;
    const pool = byGender[gender];
    if (!pool || pool.length === 0) continue;
    const idx = Math.floor(Math.random() * pool.length);
    const bed = pool.splice(idx, 1)[0];

    const { error } = await supabase.rpc("book_bed", {
      p_student_id: row.student_id,
      p_bed_id: bed.id,
      p_session: SESSION,
    });
    if (!error) booked++;
  }
  console.log(`  ${booked} demo bookings created`);
}

async function seedAdmins() {
  console.log("Seeding admin accounts (link auth_user_id manually after creating their logins)...");
  const { data: hostels } = await supabase.from("hostels").select("id, name");
  const rows = [
    { full_name: "Dr. Obinnanya Omankwu", email: "admin@caritasuni.edu.ng", role: "super_admin", hostel_id: null },
    ...hostels.map((h) => ({
      full_name: `${h.name} Porter`,
      email: `porter.${h.name.toLowerCase().replace(/[^a-z]+/g, "")}@caritasuni.edu.ng`,
      role: "porter",
      hostel_id: h.id,
    })),
  ];
  const { error } = await supabase.from("admins").upsert(rows, { onConflict: "email" });
  if (error) throw error;
}

async function main() {
  const departmentIds = await seedFaculties();
  const bedIds = await seedHostels();
  const students = await seedStudents(departmentIds);
  await seedPayments(students);
  await seedSomeBookings(students, bedIds);
  await seedAdmins();
  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  // Give Node.js fetch/sockets time to clean up on Windows to avoid the UV_HANDLE_CLOSING assertion error
  setTimeout(() => process.exit(1), 250);
});
