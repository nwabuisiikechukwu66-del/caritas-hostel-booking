-- People, payment status, bookings, complaints

create type student_level as enum ('100', '200', '300', '400', '500');
create type booking_status as enum ('confirmed', 'cancelled');
create type payment_status as enum ('paid', 'unpaid');
create type complaint_category as enum ('plumbing', 'electrical', 'structural', 'furniture', 'other');
create type complaint_urgency as enum ('low', 'medium', 'high');
create type complaint_status as enum ('open', 'in_progress', 'resolved');
create type admin_role as enum ('super_admin', 'porter');

-- ============ STUDENTS ============

create table students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  reg_no text not null unique, -- e.g. CS/2023/0456
  full_name text not null,
  email text not null unique,
  phone text,
  gender gender_type not null,
  department_id uuid not null references departments(id),
  level student_level not null,
  session text not null default '2025/2026', -- academic session applying for
  created_at timestamptz not null default now()
);

create index idx_students_department on students(department_id);
create index idx_students_reg_no on students(reg_no);

-- Hostel fee payment status. In this system payment happens on the main
-- Caritas portal, not here — this table only mirrors the paid/unpaid flag
-- so booking eligibility can be checked without a payment gateway.
create table hostel_fee_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  session text not null,
  status payment_status not null default 'unpaid',
  amount numeric(10, 2),
  marked_paid_at timestamptz,
  marked_by text, -- admin email/name who confirmed it, for audit trail
  created_at timestamptz not null default now(),
  unique (student_id, session)
);

-- ============ ADMINS / PORTERS ============

create table admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email text not null unique,
  role admin_role not null default 'porter',
  hostel_id uuid references hostels(id), -- null for super_admin (sees everything)
  created_at timestamptz not null default now()
);

-- ============ BOOKINGS ============

create table bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  bed_id uuid not null references beds(id),
  session text not null,
  status booking_status not null default 'confirmed',
  booked_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create index idx_bookings_student on bookings(student_id);
create index idx_bookings_bed on bookings(bed_id);

-- The actual concurrency guarantee: a student can only hold ONE confirmed
-- booking per session, enforced by the database, not application code.
create unique index one_confirmed_booking_per_student_per_session
  on bookings (student_id, session)
  where status = 'confirmed';

-- ============ COMPLAINTS / MAINTENANCE REQUESTS ============

create table complaints (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  room_id uuid not null references rooms(id),
  category complaint_category not null,
  urgency complaint_urgency not null default 'medium', -- set by Groq triage
  description text not null,
  status complaint_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index idx_complaints_room on complaints(room_id);
create index idx_complaints_status on complaints(status);
