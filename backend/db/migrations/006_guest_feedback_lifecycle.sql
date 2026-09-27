-- Smart Resort 360 — Guest Account Lifecycle + Feedback
--
-- Guest login accounts are now auto-provisioned at check-in (see
-- bookingLifecycleService.checkIn) and destroyed once their purpose (a
-- post-stay feedback submission) is served or a grace window expires (see
-- feedbackService.js / guestAccountService.js), per product decision:
-- "feedback first, then destroy".
--
-- guest_feedback.grace_deadline is the hard cutoff: if feedback isn't
-- submitted by then, the account is destroyed anyway on the next login
-- attempt or maintenance sweep (db/scripts/cleanup-expired-guest-accounts.js).
--
-- feedback_token supports an unauthenticated QR/link-based submission path
-- as an alternative to logging in (the account may already be gone by the
-- time the guest scans a printed QR code).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS guest_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    sentiment VARCHAR(20) CHECK (sentiment IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
    topics TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED')),
    feedback_token VARCHAR(64) UNIQUE,
    grace_deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_guest_feedback_guest_id ON guest_feedback (guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_feedback_status_deadline ON guest_feedback (status, grace_deadline);
