-- Smart Resort 360 — Staffing Schema
-- Adds a real staff roster so department staffing (Operations > Staffing) is
-- computed from actual headcount + occupancy, not mocked. Matches the workflow
-- documented in backend/docs/decision-engine.md §15 (Staff Optimization Workflow):
-- Occupancy Forecast -> Expected Workload -> Required Staff -> Available Staff -> Shortage.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    department VARCHAR(30) NOT NULL CHECK (department IN ('FRONT_DESK', 'HOUSEKEEPING', 'FOOD_BEVERAGE', 'SPA_WELLNESS')),
    role VARCHAR(60),
    shift VARCHAR(20) NOT NULL DEFAULT 'DAY' CHECK (shift IN ('DAY', 'EVENING', 'NIGHT')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- on today's roster / not on leave
    hired_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_members_department ON staff_members (department);
CREATE INDEX IF NOT EXISTS idx_staff_members_active ON staff_members (is_active);
