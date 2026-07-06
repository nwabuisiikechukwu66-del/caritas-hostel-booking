# Caritas University Hostel Management System

A student hostel booking system for Caritas University, Enugu, built to
solve the concurrency/reliability problem described in the seminar report:
students paying hostel fees but losing bed spaces to double-bookings under
load.

## Structure

```
frontend/    Next.js student portal + admin dashboard
backend/     Node.js/Express API (booking transactions, AI triage, email)
database/    Postgres migrations + seed scripts (Supabase)
docs/        Setup guide, architecture notes, API reference
```

## Quick start

See [`docs/README.md`](docs/README.md) for full setup steps. Short version:

1. Create a Supabase project, run the SQL files in `database/migrations/` in order.
2. `cd database/seed && npm install && npm run seed`
3. `cd backend && npm install && npm run dev`
4. `cd frontend && npm install && npm run dev`

Further reading: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (why this
stack, and precisely how double-booking is prevented) and
[`docs/API.md`](docs/API.md) (endpoint reference).
