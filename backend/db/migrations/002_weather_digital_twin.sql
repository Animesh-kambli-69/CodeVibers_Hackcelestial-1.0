-- Smart Resort 360 — Weather-Driven Digital Twin Schema
-- Adds weather observations/forecasts, real-world social signals, and
-- what-if simulation scenarios as an additive extension to 001_initial_schema.sql.
-- Nothing here mutates rooms/bookings/guests; the Digital Twin is read-only over
-- real resort data and writes only to these new tables.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Weather Snapshots (live observation + forecast points, from a live weather API)
CREATE TABLE IF NOT EXISTS weather_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL DEFAULT 'open-meteo',
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_forecast BOOLEAN NOT NULL DEFAULT FALSE,
    forecast_date DATE,
    temperature_c DECIMAL(5,2),
    feels_like_c DECIMAL(5,2),
    precipitation_mm DECIMAL(6,2),
    wind_speed_kmh DECIMAL(6,2),
    weather_code INT,
    condition VARCHAR(60),
    raw JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_snapshots_captured_at ON weather_snapshots (captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_snapshots_forecast_date ON weather_snapshots (forecast_date);

-- 2. Social Signals (real-world public traveler/social reactions tied to weather events)
CREATE TABLE IF NOT EXISTS social_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL DEFAULT 'reddit',
    query VARCHAR(200) NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    author VARCHAR(120),
    external_created_at TIMESTAMPTZ,
    sentiment VARCHAR(20) CHECK (sentiment IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
    weather_related BOOLEAN NOT NULL DEFAULT TRUE,
    raw JSONB,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_signals_captured_at ON social_signals (captured_at DESC);

-- 3. Digital Twin Scenarios (what-if / counterfactual simulation runs)
-- baseline_state / simulated_state / impact_summary / recommendations are stored as JSONB
-- snapshots so a scenario is fully reproducible without re-querying live services.
CREATE TABLE IF NOT EXISTS digital_twin_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    label VARCHAR(120),
    scenario_params JSONB NOT NULL,
    baseline_state JSONB NOT NULL,
    simulated_state JSONB NOT NULL,
    impact_summary JSONB NOT NULL,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    narrative TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_twin_scenarios_created_at ON digital_twin_scenarios (created_at DESC);
