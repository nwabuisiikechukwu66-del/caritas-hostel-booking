-- This function is the technical core of the whole project: it is what
-- makes the system behave correctly when many students try to book at the
-- same moment, which is exactly the failure mode described in chapter 1.
--
-- Two students calling this for the SAME bed_id at the SAME instant cannot
-- both succeed. `select ... for update` takes a row lock on the bed the
-- instant the first transaction touches it; the second transaction blocks
-- until the first commits or rolls back, then re-checks the (now updated)
-- status and is correctly rejected. This is enforced by Postgres itself,
-- not by application code — it holds even if two separate server instances
-- (e.g. two Node processes) hit it at once.

create or replace function book_bed(
  p_student_id uuid,
  p_bed_id uuid,
  p_session text
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_bed_status bed_status;
  v_existing_booking uuid;
  v_payment_status payment_status;
  v_booking_id uuid;
begin
  -- 1. Confirm hostel fee is paid for this session before allowing booking.
  select status into v_payment_status
  from hostel_fee_payments
  where student_id = p_student_id and session = p_session;

  if v_payment_status is distinct from 'paid' then
    return jsonb_build_object(
      'success', false,
      'error', 'payment_required',
      'message', 'Hostel fee has not been confirmed as paid for this session.'
    );
  end if;

  -- 2. Reject if this student already holds a confirmed booking this session.
  select id into v_existing_booking
  from bookings
  where student_id = p_student_id and session = p_session and status = 'confirmed';

  if v_existing_booking is not null then
    return jsonb_build_object(
      'success', false,
      'error', 'already_booked',
      'message', 'You already have a confirmed room for this session.'
    );
  end if;

  -- 3. Lock the target bed row. This is the critical line: any other
  --    transaction trying to book the same bed will wait here.
  select status into v_bed_status
  from beds
  where id = p_bed_id
  for update;

  if v_bed_status is null then
    return jsonb_build_object('success', false, 'error', 'not_found', 'message', 'Bed does not exist.');
  end if;

  if v_bed_status <> 'vacant' then
    return jsonb_build_object(
      'success', false,
      'error', 'bed_unavailable',
      'message', 'This bed was just taken by another student. Please pick another.'
    );
  end if;

  -- 4. Mark the bed occupied and create the booking, atomically.
  update beds set status = 'occupied' where id = p_bed_id;

  insert into bookings (student_id, bed_id, session, status)
  values (p_student_id, p_bed_id, p_session, 'confirmed')
  returning id into v_booking_id;

  return jsonb_build_object('success', true, 'booking_id', v_booking_id);
exception
  when unique_violation then
    -- Belt-and-braces: if the app-level checks above somehow raced past each
    -- other, the unique index from 0002 still refuses a second confirmed
    -- booking for the same student/session.
    return jsonb_build_object(
      'success', false,
      'error', 'already_booked',
      'message', 'You already have a confirmed room for this session.'
    );
end;
$$;

-- Companion function: cancel a booking and free the bed atomically.
create or replace function cancel_booking(p_booking_id uuid, p_student_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_bed_id uuid;
begin
  select bed_id into v_bed_id
  from bookings
  where id = p_booking_id and student_id = p_student_id and status = 'confirmed'
  for update;

  if v_bed_id is null then
    return jsonb_build_object('success', false, 'error', 'not_found');
  end if;

  update bookings set status = 'cancelled', cancelled_at = now() where id = p_booking_id;
  update beds set status = 'vacant' where id = v_bed_id;

  return jsonb_build_object('success', true);
end;
$$;
