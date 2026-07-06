# Backend API reference

Base URL: `http://localhost:4000` (or wherever `backend/` is deployed).
All authenticated routes expect `Authorization: Bearer <supabase_access_token>`.

## Auth
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/signup` | none | `{ reg_no, email, password }`. Links a new Supabase Auth user to a pre-seeded student row. |
| POST | `/api/auth/admin-signup` | none | `{ staff_email, email, password }`. Same, for admin/porter rows. |

## Bookings
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/hostels/:hostelId/availability` | student | Floors → rooms → beds with live status. |
| POST | `/api/bookings` | student | `{ bed_id }`. Wraps the atomic `book_bed()` function. Returns 409 on conflict (bed taken / already booked / payment not confirmed). |
| POST | `/api/bookings/:id/cancel` | student | Frees the bed atomically. |
| GET | `/api/bookings/mine` | student | The student's current confirmed booking, if any. |

## Complaints
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/complaints` | student | `{ room_id, description }`. Category/urgency auto-set by Groq (falls back to `other`/`medium` if Groq is unavailable). |
| GET | `/api/complaints/mine` | student | The student's own complaints. |
| GET | `/api/admin/complaints` | admin | All complaints (porters scoped to their hostel), sorted by urgency then age. |
| PATCH | `/api/admin/complaints/:id` | admin | `{ status: "in_progress" \| "resolved" }`. |

## Admin
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/admin/students?reg_no=` | admin | Look up a student before marking payment. |
| POST | `/api/admin/payments` | admin | `{ student_id, session, status }`. The only way a payment status is set. |
| GET | `/api/admin/reports/occupancy` | admin | Per-hostel bed counts and occupancy rate. |

## Error shape
Non-2xx responses are JSON: `{ "error": "machine_code", "message"?: "human-readable" }`.
