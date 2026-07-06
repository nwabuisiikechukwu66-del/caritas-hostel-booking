# Architecture

## Why this stack

The seminar report's central complaint is that the existing hostel system
fails under concurrent load and allows double-booking. Every architectural
decision below traces back to fixing that, on a student budget.

## Modules

```
frontend/   Next.js (App Router, TypeScript, Tailwind). Student portal +
            admin dashboard. Talks to Supabase directly for reference data
            and RLS-protected reads; talks to backend/ for anything that
            writes, needs the service role, or calls an external AI/email
            API.

backend/    Thin Node.js/Express API. Owns exactly three things a browser
            client cannot safely do itself:
              1. The booking transaction (via the book_bed() Postgres
                 function - the concurrency guarantee).
              2. Calling Groq (API key secrecy) for complaint triage.
              3. Sending email via Resend, and linking new logins to
                 pre-seeded student/admin records (service role key).

database/   Everything Postgres. migrations/ has the schema, the atomic
            booking function, and Row Level Security policies, in the
            order they must be applied. seed/ generates the entire hostel
            structure and demo data for a defense-day-ready database.

docs/       This file, API reference, and setup instructions.
```

## The concurrency guarantee, precisely

Two students book the same bed at the same instant:

1. Both requests hit `POST /api/bookings` on (possibly) different backend
   instances.
2. Both call `book_bed()` in Postgres.
3. Postgres's `SELECT ... FOR UPDATE` means only one transaction can hold
   the row lock on that bed at a time. The second transaction blocks.
4. The first transaction commits: bed marked occupied, booking inserted.
5. The second transaction resumes, re-reads the bed status (now
   `occupied`), and returns a clean rejection - never a double-booking.
6. A database-level unique index (`one_confirmed_booking_per_student_per_session`)
   is a second, independent backstop in case application logic ever races
   past the checks above.

This is enforced by Postgres itself - it holds regardless of how many
backend processes or servers are running.

## Why Supabase over Firebase

The data model is fundamentally relational (hostels → floors → rooms →
beds → bookings, all foreign-keyed), and the correctness guarantee above
requires real SQL transactions and row locks. Firestore's transaction model
doesn't map cleanly onto this. Supabase is Postgres with Auth, Storage, and
Realtime included, on a free tier generous enough for a defense demo.

## Why no payment gateway

Hostel fees are paid through the main Caritas portal, not this system.
`hostel_fee_payments` only mirrors a paid/unpaid status flag that gates
booking eligibility - no Paystack integration needed.
