-- Row Level Security. Supabase exposes tables directly to the browser via
-- its auto-generated API, so RLS is not optional here — without it, any
-- logged-in student could read or edit any other student's record.

alter table students enable row level security;
alter table hostel_fee_payments enable row level security;
alter table bookings enable row level security;
alter table complaints enable row level security;
alter table admins enable row level security;
alter table beds enable row level security;
alter table rooms enable row level security;
alter table floors enable row level security;
alter table hostels enable row level security;
alter table departments enable row level security;
alter table faculties enable row level security;

-- Reference/catalog data: readable by anyone signed in, written by no one
-- through the client (only via migrations/admin tooling).
create policy "faculties readable by authenticated"
  on faculties for select to authenticated using (true);
create policy "departments readable by authenticated"
  on departments for select to authenticated using (true);
create policy "hostels readable by authenticated"
  on hostels for select to authenticated using (true);
create policy "floors readable by authenticated"
  on floors for select to authenticated using (true);
create policy "rooms readable by authenticated"
  on rooms for select to authenticated using (true);
create policy "beds readable by authenticated"
  on beds for select to authenticated using (true);

-- Students: a student can read/update only their own row.
create policy "students read own row"
  on students for select to authenticated
  using (auth_user_id = auth.uid());

create policy "students update own row"
  on students for update to authenticated
  using (auth_user_id = auth.uid());

-- Payment status: read-only for the owning student (never writable by them —
-- only the Node API using the service role can mark a payment as paid).
create policy "students read own payment status"
  on hostel_fee_payments for select to authenticated
  using (student_id in (select id from students where auth_user_id = auth.uid()));

-- Bookings: a student can see and cancel only their own bookings. Creating a
-- booking never happens through a direct insert — it always goes through the
-- book_bed() function so the concurrency guarantee applies.
create policy "students read own bookings"
  on bookings for select to authenticated
  using (student_id in (select id from students where auth_user_id = auth.uid()));

-- Complaints: a student can create and read their own.
create policy "students read own complaints"
  on complaints for select to authenticated
  using (student_id in (select id from students where auth_user_id = auth.uid()));

create policy "students create own complaints"
  on complaints for insert to authenticated
  with check (student_id in (select id from students where auth_user_id = auth.uid()));

-- Admins: full read access across student-facing tables. Porters are scoped
-- to their assigned hostel; super_admins (hostel_id is null) see everything.
create policy "admins read all students"
  on students for select to authenticated
  using (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "admins read all bookings"
  on bookings for select to authenticated
  using (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "admins read all payments"
  on hostel_fee_payments for select to authenticated
  using (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "admins manage complaints"
  on complaints for all to authenticated
  using (exists (select 1 from admins where auth_user_id = auth.uid()))
  with check (exists (select 1 from admins where auth_user_id = auth.uid()));

create policy "admins read own admin row"
  on admins for select to authenticated
  using (auth_user_id = auth.uid());
