# Setup guide

## 1. Create the Supabase project
supabase.com → New project (free tier is enough). In the SQL Editor, run
the four files in `database/migrations/` **in order**: 0001 → 0002 → 0003 → 0004.

## 2. Get your keys
Project Settings → API. You need the `service_role` key (server-only,
never expose it) and the `anon` key (safe for the browser).

## 3. Seed the database
```
cd database/seed
cp .env.example .env      # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run seed
```
This generates all 7 hostels, every floor and room exactly as specified,
~150 demo students across every department, realistic payment status
(80% paid / 20% unpaid), and pre-books ~40% of paid students so the
defense demo isn't an empty hostel.

## 4. Run the backend
```
cd backend
cp .env.example .env      # same Supabase keys, plus Groq/Resend if you have them
npm install
npm run dev
```
Check it's up: `curl http://localhost:4000/health`

## 5. Run the frontend
```
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```
Open http://localhost:3000

## 6. Groq and Resend (optional but recommended)
- **Groq** (console.groq.com, free): without it, complaints still save,
  just default to `category: other, urgency: medium` instead of being
  auto-triaged.
- **Resend** (resend.com, free tier 3,000 emails/month): without it,
  bookings still succeed, the confirmation email is skipped with a
  console warning.

## 7. Linking logins to seeded students/admins
The seed script creates `students` and `admins` rows but not real login
accounts - those get created (and linked automatically) the first time
someone signs up through `/signup` with their registration number, or
`/admin/signup` with their staff email. For your defense, sign up as a
handful of the seeded students/admins ahead of time so you're not doing
it live.

## Before a public/production deployment
- The frontend currently pins Next.js 14.2.x. `npm audit` in `frontend/`
  will flag several advisories that are fixed in Next.js 16 - fine for a
  local defense demo, but worth upgrading (`npm audit fix --force`, then
  retesting) before deploying anywhere publicly reachable.
- Free Supabase projects pause after 7 days with no traffic - ping the
  project (or seed script) the morning of your defense if it's gone quiet.
