-- Smart Resort 360 — Check-In / Check-Out Lifecycle
-- Adds the columns and audit log needed to actually mutate booking/room state
-- instead of only displaying it (see backend/src/repositories/bookingRepository.js,
-- previously read-only per Principle P8 — this migration is the deliberate,
-- narrowly-scoped exception: status + timestamps only, never dates/room/price).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Booking check-in/out timestamps + early/late flags.
-- "Early" / "late" are date-level (this schema has no arrival/departure time-of-day):
-- early_checkin  = checked in before the booked arrival_date
-- late_checkout  = checked out after the booked departure_date
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS early_checkin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS late_checkout BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Room status audit log — every transition in the room lifecycle
--    AVAILABLE -> OCCUPIED (check-in) -> MAINTENANCE (check-out turnover) -> AVAILABLE (maintenance complete)
--    is recorded here, so the full cycle is reconstructable and attributable.
CREATE TABLE IF NOT EXISTS room_status_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    from_status VARCHAR(30) NOT NULL,
    to_status VARCHAR(30) NOT NULL,
    reason VARCHAR(60), -- 'GUEST_CHECK_IN' | 'CHECKOUT_TURNOVER' | 'MAINTENANCE_COMPLETE'
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_status_log_room_id ON room_status_log (room_id, changed_at DESC);
