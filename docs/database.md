# Smart Resort 360 — Database Specification

## 1. Purpose

This document defines the database structure for **Smart Resort 360**.

Smart Resort 360 uses a centralized database to store:

- User accounts and roles
- Guest profiles
- Guest preferences
- Bookings
- Rooms
- Guest activities
- Reviews and sentiment
- Events and festivals
- Staff information
- Operational metrics
- Service requests
- AI recommendations
- Verified resort information for the AI Concierge
- Optional ML predictions

The database supports the three application roles:

1. Resort Manager
2. Operations Manager
3. Guest

The system is designed as an **AI decision-support platform**, not as a complete Property Management System (PMS).

## 2. Recommended Database

### PostgreSQL / Supabase

Recommended because it provides:

- Relational database
- Strong relationships between tables
- SQL support
- Authentication integration
- JSON/JSONB support
- Easy API integration
- Good compatibility with Node.js
- Good compatibility with Python ML services
- Easy deployment for a hackathon

## 3. User Roles

| Role | Purpose |
|---|---|
| `RESORT_MANAGER` | Business intelligence, forecasting, recommendations, pricing, sentiment |
| `OPERATIONS_MANAGER` | Guest intelligence, operational insights, staff optimization |
| `GUEST` | Personalized AI Concierge and resort services |

There should not be separate dashboards for individual features. These are sections/features inside the three role-based dashboards.

## 4. Core Tables

### 4.1 users

Stores authentication and role information.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR(120) | User name |
| `email` | VARCHAR(255) | Unique login email |
| `password_hash` | TEXT | Hashed password |
| `role` | VARCHAR(30) | User role |
| `created_at` | TIMESTAMP | Account creation time |

Role values:

```text
RESORT_MANAGER
OPERATIONS_MANAGER
GUEST
```

### 4.2 guests

Stores guest-specific information.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → users.id |
| `name` | VARCHAR(120) | Guest name |
| `email` | VARCHAR(255) | Guest email |
| `phone` | VARCHAR(30) | Contact number |
| `food_preference` | VARCHAR(50) | Food preference |
| `preferred_room` | VARCHAR(50) | Preferred room type |
| `average_stay` | DECIMAL | Average number of nights |
| `average_spend` | DECIMAL | Average spending |
| `special_requirements` | TEXT | Special requirements |
| `created_at` | TIMESTAMP | Profile creation date |

### 4.3 rooms

Stores resort room information.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `room_number` | VARCHAR(20) | Unique room number |
| `room_type` | VARCHAR(50) | Deluxe, Suite, Standard, etc. |
| `price` | DECIMAL | Current room price |
| `capacity` | INT | Maximum guests |
| `status` | VARCHAR(30) | Current room status |

Status values:

```text
AVAILABLE
OCCUPIED
CLEANING
MAINTENANCE
RESERVED
```

### 4.4 bookings

Stores historical and current booking information.

Used for booking prediction, occupancy forecasting, cancellation prediction, revenue analysis, and guest history.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `guest_id` | UUID | Foreign key → guests.id |
| `room_id` | UUID | Foreign key → rooms.id |
| `room_type` | VARCHAR(50) | Booked room type |
| `booking_date` | DATE | Date booking was made |
| `arrival_date` | DATE | Arrival date |
| `departure_date` | DATE | Departure date |
| `adults` | INT | Number of adults |
| `children` | INT | Number of children |
| `babies` | INT | Number of babies |
| `adr` | DECIMAL | Average daily rate |
| `deposit_type` | VARCHAR(50) | Deposit information |
| `booking_channel` | VARCHAR(80) | Booking channel |
| `customer_type` | VARCHAR(50) | Customer type |
| `previous_cancellations` | INT | Previous cancellations |
| `previous_bookings` | INT | Previous bookings |
| `special_requests` | INT | Number of special requests |
| `status` | VARCHAR(30) | Booking status |
| `created_at` | TIMESTAMP | Record creation time |

Status values:

```text
CONFIRMED
CANCELLED
CHECKED_IN
CHECKED_OUT
```

### 4.5 guest_preferences

Stores predicted and explicitly provided guest preferences.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `guest_id` | UUID | Foreign key → guests.id |
| `preference_type` | VARCHAR(50) | Preference type |
| `preference_value` | VARCHAR(100) | Preference value |
| `confidence` | DECIMAL(5,4) | Model confidence |
| `source` | VARCHAR(30) | How preference was obtained |
| `updated_at` | TIMESTAMP | Last update |

Preference types may include:

```text
FOOD
ROOM
ACTIVITY
SPA
POOL
RESTAURANT
```

Source values:

```text
EXPLICIT
HISTORY
PREDICTED
```

### 4.6 guest_activities

Stores guest activity history.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `guest_id` | UUID | Foreign key → guests.id |
| `activity` | VARCHAR(100) | Activity name |
| `frequency` | INT | Number of times used |
| `last_used` | DATE | Last activity date |

### 4.7 reviews

Stores guest reviews and sentiment analysis results.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `guest_id` | UUID | Foreign key → guests.id |
| `booking_id` | UUID | Foreign key → bookings.id |
| `review_text` | TEXT | Original review |
| `rating` | DECIMAL | Guest rating |
| `sentiment` | VARCHAR(20) | Positive/Neutral/Negative |
| `sentiment_score` | DECIMAL(5,4) | Sentiment score |
| `topics` | JSONB | Extracted topics |
| `created_at` | TIMESTAMP | Review date |

### 4.8 events

Stores festivals, holidays, and other events that can influence resort demand.

The ML system does not automatically know future festivals. Events should be provided as trusted inputs.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `event_name` | VARCHAR(150) | Festival/event name |
| `event_date` | DATE | Event date |
| `event_type` | VARCHAR(50) | Festival/Holiday/Event |
| `location` | VARCHAR(150) | Event location |
| `expected_demand` | VARCHAR(20) | Expected demand |

### 4.9 staff

Stores staff information for operational analysis.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR(120) | Staff name |
| `department` | VARCHAR(50) | Department |
| `role` | VARCHAR(80) | Job role |
| `availability` | VARCHAR(30) | Availability status |
| `shift` | VARCHAR(50) | Assigned shift |

### 4.10 operations

Stores operational metrics used by the Decision Engine.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `department` | VARCHAR(50) | Department |
| `metric` | VARCHAR(100) | Metric name |
| `value` | DECIMAL | Metric value |
| `status` | VARCHAR(30) | Current status |
| `timestamp` | TIMESTAMP | Measurement time |

### 4.11 service_requests

Stores requests made by guests.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `guest_id` | UUID | Foreign key → guests.id |
| `request_type` | VARCHAR(80) | Request category |
| `description` | TEXT | Request details |
| `priority` | VARCHAR(20) | Request priority |
| `status` | VARCHAR(30) | Request status |
| `created_at` | TIMESTAMP | Creation time |

### 4.12 recommendations

Stores recommendations generated by the Decision Engine.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `category` | VARCHAR(50) | Recommendation category |
| `title` | VARCHAR(200) | Recommendation title |
| `reason` | TEXT | Why recommendation was generated |
| `suggested_action` | TEXT | Suggested action |
| `priority` | VARCHAR(20) | HIGH/MEDIUM/LOW |
| `confidence` | DECIMAL(5,4) | Supporting confidence |
| `source_data` | JSONB | Supporting inputs |
| `status` | VARCHAR(30) | Recommendation status |
| `created_at` | TIMESTAMP | Creation time |

Categories:

```text
OCCUPANCY
CANCELLATION
OPERATIONS
GUEST_EXPERIENCE
PRICING
MAINTENANCE
GUEST_PERSONALIZATION
```

Status values:

```text
NEW
VIEWED
ACCEPTED
DISMISSED
```

### 4.13 resort_information

Stores verified resort information for the AI Concierge and RAG system.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `category` | VARCHAR(50) | Information category |
| `title` | VARCHAR(200) | Information title |
| `content` | TEXT | Verified resort information |
| `updated_at` | TIMESTAMP | Last update |

Categories may include:

```text
ROOMS
RESTAURANTS
ACTIVITIES
SPA
POOL
CHECK_IN
CHECK_OUT
FACILITIES
POLICIES
FAQ
SERVICES
```

### 4.14 predictions

Optional table for storing ML prediction results.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `prediction_type` | VARCHAR(50) | Prediction category |
| `entity_id` | UUID | Related entity |
| `prediction_value` | DECIMAL | Prediction value |
| `risk_level` | VARCHAR(20) | LOW/MEDIUM/HIGH |
| `model_version` | VARCHAR(50) | ML model version |
| `predicted_for` | DATE | Prediction date |
| `created_at` | TIMESTAMP | Prediction creation time |

## 5. Relationships

```text
users
  │
  └──── 1:1 ──── guests
                    │
                    ├──── 1:N ──── bookings
                    │                 │
                    │                 └──── N:1 ──── rooms
                    ├──── 1:N ──── guest_preferences
                    ├──── 1:N ──── guest_activities
                    ├──── 1:N ──── reviews
                    └──── 1:N ──── service_requests

events
  │
  └──── demand forecasting

staff
  │
  └──── staff optimization

operations
  │
  └──── operational rules

resort_information
  │
  └──── AI Concierge / RAG

ML Predictions
  │
  └──── Decision Engine
              │
              └──── recommendations
```

## 6. Feature → Database Mapping

| Feature | Main Tables |
|---|---|
| Booking Prediction | `bookings`, `rooms`, `events` |
| Occupancy Forecast | `bookings`, `rooms`, `events` |
| Cancellation Prediction | `bookings`, `guests` |
| Guest Intelligence | `guests`, `bookings`, `guest_preferences`, `guest_activities`, `reviews` |
| Guest Preference Prediction | `guests`, `bookings`, `guest_activities`, `guest_preferences` |
| Guest Sentiment Analysis | `reviews` |
| Revenue/Pricing Recommendation | `bookings`, `rooms`, `events` |
| Staff Optimization | `staff`, `operations`, `bookings`, `rooms` |
| AI Concierge | `guests`, `guest_preferences`, `guest_activities`, `resort_information` |
| Service Requests | `service_requests`, `guests` |
| Recommendations | `recommendations` |
| Predictive Maintenance | `operations`, `predictions` |

## 7. Important Indexes

```sql
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_arrival_date ON bookings(arrival_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_room_type ON bookings(room_type);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX idx_preferences_guest_id ON guest_preferences(guest_id);
CREATE INDEX idx_service_requests_guest_id ON service_requests(guest_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
```

## 8. Overall Data Workflow

```text
Public Dataset / Synthetic Data
             ↓
        Data Cleaning
             ↓
        PostgreSQL
             ↓
       Node.js API
             ↓
       Python ML Service
             ↓
          Prediction
             ↓
       Decision Engine
             ↓
       Recommendation
             ↓
      Dashboard / Chatbot
```

## 9. Minimum Hackathon Database

Implement these first:

```text
users
guests
bookings
rooms
guest_preferences
guest_activities
reviews
events
resort_information
service_requests
recommendations
```

Add these later if time permits:

```text
staff
operations
predictions
```

## 10. Security

### Resort Manager

Can access:

- Business metrics
- Forecasts
- Cancellation insights
- Recommendations
- Sentiment
- Pricing insights

### Operations Manager

Can access:

- Guest information
- Guest history
- Guest preferences
- Cancellation risk
- Staff optimization
- Operational sentiment

### Guest

Can access:

- Own profile
- Own preferences
- Own bookings
- Resort information
- AI Concierge
- Own service requests

A guest must never receive:

- Manager metrics
- Other guest information
- Staff information
- Revenue data
- Internal recommendations

## 11. Core Principle

```text
Database
   ↓
Reliable Resort Data
   ↓
ML Predictions
   ↓
Decision Engine
   ↓
Recommendations
   ↓
LLM Explanation / Concierge
   ↓
Human Decision
```

The database stores facts and history.

ML predicts future outcomes.

The Decision Engine applies deterministic business rules.

The LLM explains information and provides conversational assistance.

The final business decision remains with the human user.
