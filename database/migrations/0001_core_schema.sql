-- Core academic structure + hostel physical structure
-- Run in Supabase SQL editor or via `supabase db push`

create extension if not exists "pgcrypto";

-- ============ ACADEMIC STRUCTURE ============

create table faculties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references faculties(id) on delete cascade,
  name text not null,
  code text not null unique, -- e.g. CS, MEE, ARC — used in reg no
  created_at timestamptz not null default now(),
  unique (faculty_id, name)
);

-- ============ HOSTEL PHYSICAL STRUCTURE ============

create type gender_type as enum ('male', 'female');
create type room_facing as enum ('front', 'back');

create table hostels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  gender gender_type not null,
  short_code text not null unique, -- e.g. AQ, JV, NHB, EMM, LDN, STM, NHG
  created_at timestamptz not null default now()
);

create table floors (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references hostels(id) on delete cascade,
  label text not null, -- 'A', 'B', 'C', 'D'
  created_at timestamptz not null default now(),
  unique (hostel_id, label)
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references floors(id) on delete cascade,
  room_number int not null, -- 1..30
  code text not null unique, -- e.g. 'AQ-A-1' — human readable, shown in UI
  facing room_facing not null,
  capacity int not null default 4,
  created_at timestamptz not null default now(),
  unique (floor_id, room_number)
);

create index idx_rooms_floor on rooms(floor_id);
create index idx_floors_hostel on floors(hostel_id);

-- ============ BEDS (the atomic bookable unit) ============

create type bed_status as enum ('vacant', 'occupied', 'reserved');

create table beds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  bed_slot int not null, -- 1..capacity
  status bed_status not null default 'vacant',
  created_at timestamptz not null default now(),
  unique (room_id, bed_slot)
);

create index idx_beds_room on beds(room_id);
create index idx_beds_status on beds(status);
