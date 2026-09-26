-- Smart Resort 360 Initial Database Schema (PostgreSQL)
-- Phase 0 & Phase 1 Schema with Full Constraints and Indexing

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('RESORT_MANAGER', 'OPERATIONS_MANAGER', 'GUEST')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    loyalty_tier VARCHAR(20) NOT NULL DEFAULT 'STANDARD' CHECK (loyalty_tier IN ('STANDARD', 'SILVER', 'GOLD', 'PLATINUM')),
    total_stays INT NOT NULL DEFAULT 0,
    special_requirements TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type VARCHAR(30) NOT NULL CHECK (room_type IN ('STANDARD', 'DELUXE', 'SUITE')),
    max_occupancy INT NOT NULL DEFAULT 2,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'))
);

-- 4. Bookings Table (Resort Reservations + ML Feature Columns)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')),
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    babies INT NOT NULL DEFAULT 0,
    adr DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    deposit_type VARCHAR(30) NOT NULL DEFAULT 'No Deposit',
    booking_channel VARCHAR(50) NOT NULL DEFAULT 'Direct',
    customer_type VARCHAR(50) NOT NULL DEFAULT 'Transient',
    special_requests INT NOT NULL DEFAULT 0,
    previous_cancellations INT NOT NULL DEFAULT 0,
    previous_bookings INT NOT NULL DEFAULT 0,
    room_type VARCHAR(30) NOT NULL CHECK (room_type IN ('STANDARD', 'DELUXE', 'SUITE')),
    -- Internal ML feature columns (nullable)
    distribution_channel VARCHAR(50),
    meal VARCHAR(20),
    country VARCHAR(3),
    booking_changes INT DEFAULT 0,
    required_car_parking_spaces INT DEFAULT 0,
    reserved_room_type_code VARCHAR(2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Guest Preferences Table
CREATE TABLE IF NOT EXISTS guest_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    preference_type VARCHAR(30) NOT NULL CHECK (preference_type IN ('ROOM', 'FOOD', 'ACTIVITY')),
    preference_value VARCHAR(100) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
    source VARCHAR(20) NOT NULL DEFAULT 'EXPLICIT' CHECK (source IN ('EXPLICIT', 'HISTORY', 'PREDICTED')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Guest Activities Table
CREATE TABLE IF NOT EXISTS guest_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_name VARCHAR(150) NOT NULL,
    activity_date DATE NOT NULL
);

-- 7. Resort Information Table (AI Concierge Grounding & RAG)
CREATE TABLE IF NOT EXISTS resort_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('DINING', 'SPA', 'ACTIVITIES', 'FACILITIES', 'POLICIES', 'TRANSPORTATION', 'ROOMS', 'CHECK_IN', 'CHECK_OUT', 'SERVICES')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Recommendations Table (Decision Engine Output with Lifecycle)
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('OCCUPANCY', 'CANCELLATION', 'REVENUE', 'STAFFING', 'GUEST_EXPERIENCE', 'MAINTENANCE', 'OPERATIONS', 'PRICING')),
    title VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    confidence DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
    source_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'VIEWED', 'ACCEPTED', 'DISMISSED')),
    note TEXT,
    dedup_key VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Predictions Cache Table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_type VARCHAR(50) NOT NULL,
    entity_id UUID, -- Nullable for resort-wide forecasts, or booking/guest ID
    prediction_value DECIMAL(10,4),
    risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    model_version VARCHAR(50),
    payload JSONB,
    predicted_for DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Chat Sessions & Messages (AI Concierge)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('GUEST', 'ASSISTANT')),
    content TEXT NOT NULL,
    grounded BOOLEAN DEFAULT true,
    sources JSONB DEFAULT '[]'::jsonb,
    used_preferences JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Optimal Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_guests_user_id ON guests(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_arrival_date ON bookings(arrival_date);
CREATE INDEX IF NOT EXISTS idx_bookings_departure_date ON bookings(departure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_room_type ON bookings(room_type);
CREATE INDEX IF NOT EXISTS idx_guest_preferences_guest_id ON guest_preferences(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_activities_guest_id ON guest_activities(guest_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_dedup_key ON recommendations(dedup_key);
CREATE INDEX IF NOT EXISTS idx_predictions_lookup ON predictions(prediction_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_guest_id ON chat_conversations(guest_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_id ON chat_messages(conversation_id);

-- Full-Text Search Index on Resort Information
CREATE INDEX IF NOT EXISTS idx_resort_info_fts ON resort_information USING gin(to_tsvector('english', title || ' ' || content));
