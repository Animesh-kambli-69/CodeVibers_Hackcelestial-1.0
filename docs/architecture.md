# Smart Resort 360 — System Architecture

## 1. Overview

Smart Resort 360 is an AI-powered resort intelligence and decision-support platform.

The system combines:

- Machine Learning for prediction
- Node.js/Express for application APIs and business logic
- PostgreSQL/Supabase for structured resort data
- A Decision Engine for actionable recommendations
- An LLM-powered AI Concierge for guest assistance
- Next.js/React dashboards for three user roles

### Core Architecture Principle

```text
Resort Data
    ↓
ML Predictions
    ↓
Decision Engine
    ↓
Actionable Recommendations
    ↓
Human Decision
```

For guests:

```text
Guest Identity
    ↓
Guest Profile + Preferences + History
    ↓
Verified Resort Knowledge
    ↓
AI Concierge
    ↓
Personalized Assistance
```

---

## 2. High-Level Architecture

```text
                         SMART RESORT 360
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Next.js / React UI │
                    │     + Tailwind CSS  │
                    └──────────┬──────────┘
                               │ HTTPS / REST
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │     API Backend     │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
    ┌────────────────┐ ┌───────────────┐ ┌─────────────────┐
    │ PostgreSQL /   │ │ Python ML     │ │ AI / LLM       │
    │ Supabase       │ │ Service       │ │ Service        │
    │                │ │ FastAPI       │ │ Concierge/RAG  │
    └────────────────┘ └───────┬───────┘ └────────┬────────┘
             │                 │                  │
             │                 ▼                  │
             │        ┌─────────────────┐         │
             │        │ ML Models       │         │
             │        │ XGBoost /       │         │
             │        │ Gradient Boost  │         │
             │        └────────┬────────┘         │
             │                 │                  │
             └─────────────────┼──────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │  Decision Engine    │
                    │  Business Rules     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Recommendations &   │
                    │ Operational Insights│
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
      Resort Manager     Operations Manager     Guest
         Dashboard            Dashboard       AI Concierge
```

---

## 3. User Roles

Smart Resort 360 has three primary roles.

### 3.1 Resort Manager

Responsible for business-level decisions.

Features:

- Booking Prediction
- Occupancy Forecast
- AI Recommendations
- Revenue/Pricing Recommendation
- Guest Sentiment Overview
- Business KPIs

### 3.2 Operations Manager

Responsible for day-to-day resort operations.

Features:

- Guest information
- Guest preferences
- Cancellation risk
- Operational insights
- Staff Optimization
- Guest sentiment / complaint trends
- Service-related information

### 3.3 Guest

Receives personalized resort assistance.

Features:

- AI Concierge / Chatbot
- Resort information
- Personalized recommendations
- Guest preferences
- Booking/service information
- Service requests

---

# 4. Frontend Architecture

## Technology

- Next.js
- React
- Tailwind CSS
- Recharts or similar charting library
- JWT/session-based authentication

## Frontend Structure

```text
frontend/
├── app/
│   ├── login/
│   ├── manager/
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   ├── occupancy/
│   │   ├── pricing/
│   │   ├── sentiment/
│   │   └── recommendations/
│   ├── operations/
│   │   ├── dashboard/
│   │   ├── guests/
│   │   ├── cancellations/
│   │   ├── staffing/
│   │   └── operations/
│   └── guest/
│       ├── home/
│       ├── concierge/
│       ├── profile/
│       └── requests/
│
├── components/
│   ├── charts/
│   ├── cards/
│   ├── tables/
│   ├── chatbot/
│   ├── recommendations/
│   └── layout/
│
├── services/
│   └── api.ts
│
└── middleware.ts
```

## Role-Based Routing

```text
Login
  ↓
Authenticate User
  ↓
Read User Role
  ├── RESORT_MANAGER → Manager Dashboard
  ├── OPERATIONS_MANAGER → Operations Dashboard
  └── GUEST → Guest Interface
```

Users should only access screens permitted for their role.

---

# 5. Backend Architecture

## Technology

- Node.js
- Express.js
- REST APIs
- JWT/session authentication
- PostgreSQL/Supabase client
- Decision Engine

## Backend Responsibilities

The Node.js backend acts as the main application layer.

It handles:

- Authentication
- Authorization
- User management
- Guest management
- Booking APIs
- Resort data APIs
- Calling ML services
- Calling AI services
- Decision Engine execution
- Recommendation management
- Service requests
- Validation
- Error handling

## Backend Structure

```text
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── guestController.js
│   │   ├── predictionController.js
│   │   ├── recommendationController.js
│   │   └── conciergeController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── guestRoutes.js
│   │   ├── predictionRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── conciergeRoutes.js
│   │
│   ├── services/
│   │   ├── mlService.js
│   │   ├── aiService.js
│   │   ├── decisionService.js
│   │   └── guestService.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   └── errorHandler.js
│   │
│   ├── decision-engine/
│   │   ├── rules/
│   │   ├── config/
│   │   └── services/
│   │
│   └── server.js
```

---

# 6. Database Architecture

## Technology

PostgreSQL is the primary relational database.

Supabase can be used to provide:

- PostgreSQL
- Authentication
- Database APIs
- Storage if required

## Main Tables

```text
users
  │
  └── guests
       │
       ├── bookings
       ├── guest_preferences
       ├── guest_activities
       ├── reviews
       └── service_requests

rooms
  │
  └── bookings

events

staff
  │
  └── operations

recommendations

resort_information

predictions
```

## Important Entities

### Users

Stores authentication and role information.

```text
id
name
email
password_hash
role
created_at
```

### Guests

Stores guest profile information.

```text
id
user_id
name
email
phone
food_preference
preferred_room
average_stay
average_spend
special_requirements
```

### Bookings

Stores historical and current booking information.

Important fields include:

```text
booking_date
arrival_date
departure_date
room_type
adr
booking_channel
customer_type
previous_cancellations
previous_bookings
special_requests
status
```

### Guest Preferences

Stores explicit and predicted preferences.

```text
guest_id
preference_type
preference_value
confidence
source
updated_at
```

### Reviews

Stores guest reviews and sentiment results.

```text
review_text
rating
sentiment
sentiment_score
topics
```

### Events

Stores festivals and other demand-driving events.

```text
event_name
event_date
event_type
location
expected_demand
```

### Staff

Stores staff availability and operational information.

### Recommendations

Stores Decision Engine output.

### Resort Information

Stores verified information used by the AI Concierge.

---

# 7. Machine Learning Architecture

Python is used for machine learning.

## Technology

- Python
- FastAPI
- pandas
- NumPy
- scikit-learn
- XGBoost

## ML Service

```text
Node.js Backend
      │
      │ REST API
      ▼
Python FastAPI ML Service
      │
      ├── Booking Prediction Model
      ├── Cancellation Prediction Model
      ├── Guest Preference Model
      └── Optional Maintenance Model
```

---

# 8. Booking Prediction

## Objective

Predict future booking demand.

## Inputs

- Historical bookings
- Booking dates
- Arrival/departure dates
- Room type
- Booking channel
- Customer type
- Historical demand
- Seasonality
- Events/festivals
- Current booking velocity

## Model

Recommended MVP model:

```text
XGBoost / Gradient Boosting
```

## Flow

```text
Historical Booking Data
        +
Current Booking Data
        +
Event Calendar
        +
Seasonality
        ↓
Feature Engineering
        ↓
XGBoost Model
        ↓
Predicted Bookings
```

Example:

```json
{
  "predicted_bookings": 205,
  "prediction_date": "2026-09-30"
}
```

---

# 9. Occupancy Forecast

Occupancy can be calculated using predicted occupied rooms and available rooms.

```text
Available Rooms = 220
Predicted Occupied Rooms = 203

Occupancy =
203 / 220 × 100

= 92.27%
```

Flow:

```text
Booking Prediction
       +
Room Inventory
       ↓
Occupancy Calculation
       ↓
Occupancy Forecast
```

Example:

```json
{
  "predicted_occupancy": 92.27
}
```

The dashboard should clearly present this as a forecast rather than a guaranteed result.

---

# 10. Cancellation Prediction

## Objective

Predict the probability that a booking will be cancelled.

## Inputs

- Lead time
- Deposit type
- Booking channel
- Customer type
- Previous cancellations
- Previous bookings
- Room type
- ADR
- Special requests
- Arrival date
- Historical booking behavior

## Flow

```text
Booking
  ↓
Feature Engineering
  ↓
Cancellation ML Model
  ↓
Cancellation Probability
  ↓
Decision Engine
```

Example:

```json
{
  "booking_id": 1452,
  "cancellation_probability": 0.84,
  "risk_level": "HIGH"
}
```

---

# 11. Guest Preference Prediction

Guest personalization uses profile information and historical behavior.

## Inputs

- Food preferences
- Preferred room type
- Previous activities
- Previous bookings
- Average stay
- Spending patterns
- Service requests
- Review history

## Flow

```text
Guest Profile
     +
Booking History
     +
Activity History
     +
Service Requests
     ↓
Preference Model / Recommendation Logic
     ↓
Predicted Preferences
     ↓
Guest Profile Context
     ↓
AI Concierge
```

Example:

```json
{
  "guest_id": 42,
  "preferences": [
    {
      "type": "food",
      "value": "vegetarian",
      "confidence": 0.94
    },
    {
      "type": "activity",
      "value": "spa",
      "confidence": 0.81
    }
  ]
}
```

---

# 12. Guest Sentiment Analysis

## Objective

Understand guest satisfaction and identify recurring problems.

## Flow

```text
Guest Review
    ↓
NLP / LLM
    ↓
Sentiment Classification
    ↓
Topic Extraction
    ↓
Aggregation
    ↓
Decision Engine
```

Possible sentiment values:

```text
POSITIVE
NEUTRAL
NEGATIVE
```

Possible topics:

```text
Room
AC
Wi-Fi
Food
Cleanliness
Service
Staff
Facilities
```

Example aggregated insight:

```text
AC complaints      +27%
Wi-Fi complaints   +12%
Cleanliness         +8%
Food                +5%
```

---

# 13. Revenue / Pricing Recommendation

The system recommends pricing changes but does not automatically change prices in the MVP.

## Inputs

- Occupancy forecast
- Historical ADR
- Current ADR
- Booking velocity
- Demand
- Seasonality
- Room type
- Availability

## Flow

```text
Occupancy Forecast
       +
Demand
       +
Availability
       +
Historical ADR
       ↓
Pricing Recommendation Logic
       ↓
Recommended Price
       ↓
Resort Manager
```

Example:

```text
Room: Deluxe
Current Price: ₹8,000
Predicted Occupancy: 93%
Demand: HIGH

Recommended Price: ₹9,200
```

Final pricing decisions remain with the resort manager.

---

# 14. Staff Optimization

## Objective

Identify staffing shortages before they affect operations.

## Inputs

- Expected check-ins
- Expected check-outs
- Occupancy
- Expected workload
- Available staff
- Department
- Shift

## Flow

```text
Occupancy Forecast
       +
Check-ins / Check-outs
       +
Expected Workload
       +
Available Staff
       ↓
Staff Requirement Calculation
       ↓
Shortage Detection
       ↓
Decision Engine
       ↓
Staff Recommendation
```

Example:

```text
Required Housekeeping Staff = 15
Available Staff = 12

Shortage = 3

Recommendation:
Consider allocating 3 additional housekeeping staff.
```

---

# 15. Event and Festival Integration

The AI should not be expected to magically know future festivals.

Events are an explicit data source.

## Event Inputs

```text
event_name
event_date
event_type
location
expected_demand
```

The ML feature set can include:

```text
is_festival
days_to_festival
festival_type
historical_festival_occupancy
current_booking_velocity
```

## Flow

```text
Trusted Event Calendar
        +
Historical Event Data
        +
Current Bookings
        +
Booking Velocity
        +
Seasonality
        ↓
Feature Engineering
        ↓
ML Model
        ↓
Booking Prediction
        ↓
Occupancy Forecast
        ↓
Decision Engine
        ↓
Recommendation
```

---

# 16. Decision Engine

The Decision Engine converts predictions into actionable recommendations.

## Responsibilities

ML answers:

> What is likely to happen?

Decision Engine answers:

> What should the resort consider doing?

LLM answers:

> How should this information be explained conversationally?

Human answers:

> What action should actually be taken?

## Architecture

```text
ML Predictions
      +
Database Data
      ↓
Decision Engine
      ↓
Business Rules
      ↓
Priority
      ↓
Recommendation
```

## Example Rules

### High Occupancy

```text
IF predicted_occupancy > 90%
THEN
recommend reviewing operational capacity
```

### High Cancellation Risk

```text
IF cancellation_probability >= 0.70
THEN
flag booking as HIGH RISK
```

### Medium Cancellation Risk

```text
IF 0.40 <= cancellation_probability < 0.70
THEN
monitor booking
```

### Staff Shortage

```text
IF required_staff > available_staff
THEN
shortage = required_staff - available_staff
```

### High Demand + Low Availability

```text
IF demand = HIGH
AND room_availability <= threshold
THEN
recommend reviewing pricing strategy
```

The Decision Engine should not automatically perform high-impact business actions in the MVP.

---

# 17. AI Concierge Architecture

The AI Concierge is designed for guests.

## Main Principle

The chatbot should answer using verified resort information and guest-specific context.

## Flow

```text
Guest Login
     ↓
Authentication Session / JWT
     ↓
Identify guest_id
     ↓
Retrieve:
  - Guest Profile
  - Preferences
  - Booking
  - Activity History
  - Service Requests
     ↓
Retrieve Verified Resort Information
     ↓
LLM
     ↓
Personalized Response
```

## Example

Guest asks:

> What activity would you recommend for me?

System retrieves:

```text
Guest preference:
Spa

Past activity:
Spa used twice

Resort activities:
Spa
Pool
Tennis
Restaurant
```

AI Concierge can then provide a personalized recommendation based on those verified inputs.

---

# 18. AI Knowledge Layer

The AI Concierge should use a controlled resort knowledge source.

Possible source:

```text
resort_information
```

Example categories:

```text
Rooms
Restaurants
Activities
Spa
Pool
Check-in
Check-out
Wi-Fi
Policies
Transportation
Emergency Information
```

The chatbot should not invent resort policies, prices, opening hours, or services.

If verified information is unavailable, it should say that the information is unavailable rather than fabricate an answer.

---

# 19. API Architecture

Example REST endpoints:

## Authentication

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

## Bookings

```text
GET  /api/bookings
GET  /api/bookings/:id
POST /api/bookings
```

## Guests

```text
GET /api/guests
GET /api/guests/:id
GET /api/guests/:id/preferences
```

## Predictions

```text
GET  /api/predictions/bookings
GET  /api/predictions/occupancy
GET  /api/predictions/cancellations/:bookingId
POST /api/predictions/run
```

## Recommendations

```text
GET  /api/recommendations
POST /api/recommendations/:id/view
POST /api/recommendations/:id/accept
POST /api/recommendations/:id/dismiss
```

## Concierge

```text
POST /api/concierge/chat
GET  /api/concierge/context
```

## Operations

```text
GET /api/operations/staff
GET /api/operations/workload
GET /api/operations/sentiment
```

---

# 20. ML API Communication

The Node.js backend communicates with the Python ML service.

```text
Next.js
   ↓
Node.js API
   ↓
Python FastAPI
   ↓
ML Model
   ↓
Prediction
   ↓
Node.js
   ↓
Database
   ↓
Dashboard
```

Example internal API:

```text
POST /predict/bookings
POST /predict/cancellation
POST /predict/preferences
```

Example booking prediction response:

```json
{
  "predicted_bookings": 205,
  "confidence": 0.89,
  "model_version": "booking-xgb-v1"
}
```

---

# 21. End-to-End Data Flow

## Manager Flow

```text
Historical Resort Data
        ↓
PostgreSQL
        ↓
Node.js Backend
        ↓
Python ML Service
        ↓
Predictions
        ↓
Decision Engine
        ↓
Recommendations
        ↓
Manager Dashboard
```

## Operations Flow

```text
Guest + Booking + Operations Data
        ↓
PostgreSQL
        ↓
ML / Analytics
        ↓
Cancellation / Preference / Workload Insights
        ↓
Decision Engine
        ↓
Operations Dashboard
```

## Guest Flow

```text
Guest Login
        ↓
JWT / Session
        ↓
Guest ID
        ↓
Guest Profile + History
        ↓
Verified Resort Knowledge
        ↓
AI Concierge
        ↓
Personalized Response
```

---

# 22. Authentication and Authorization

Authentication identifies the user.

Authorization determines what the user can access.

## Role-Based Access

```text
RESORT_MANAGER
    ↓
Business Metrics
Forecasts
Recommendations
Pricing Insights
Sentiment

OPERATIONS_MANAGER
    ↓
Guest Information
Preferences
Cancellation Risk
Staffing
Operations

GUEST
    ↓
Own Profile
Own Booking
Resort Information
AI Concierge
Service Requests
```

Guests must not access:

- Other guest information
- Revenue information
- Internal recommendations
- Staff information
- Manager dashboards
- Internal operational metrics

---

# 23. Security Architecture

Recommended controls:

- HTTPS
- Password hashing
- JWT/session authentication
- Role-based authorization
- Input validation
- API rate limiting
- Environment variables for secrets
- Database access controls
- Parameterized queries
- Server-side authorization checks

Secrets should never be hardcoded.

Example:

```text
DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
ML_SERVICE_URL
```

---

# 24. Error Handling

Every service should handle failures gracefully.

Example:

```text
ML Service unavailable
        ↓
Backend catches error
        ↓
Return meaningful API response
        ↓
Dashboard shows:
"Prediction temporarily unavailable."
```

The system should not present a failed prediction as a valid prediction.

Similarly, if the AI Concierge cannot retrieve verified resort information, it should not fabricate an answer.

---

# 25. Deployment Architecture

A practical hackathon deployment can use:

```text
                    Internet
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Vercel / Frontend   Backend Host
        Next.js             Node.js
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
             Supabase       Python ML       LLM API
             PostgreSQL     FastAPI         Provider
```

Possible hosting choices:

### Frontend

- Vercel

### Backend

- Render
- Railway
- Similar Node.js hosting

### ML Service

- Render
- Railway
- Similar Python/FastAPI hosting

### Database

- Supabase PostgreSQL

---

# 26. Recommended Repository Structure

A monorepo is practical for a hackathon.

```text
smart-resort-360/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   └── package.json
│
├── backend/
│   ├── src/
│   └── package.json
│
├── ml-service/
│   ├── models/
│   ├── training/
│   ├── inference/
│   ├── main.py
│   └── requirements.txt
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   └── decision-engine.md
│
└── README.md
```

---

# 27. Team Architecture

For a five-person hackathon team:

```text
Member 1 → ML
  ├── Booking Prediction
  ├── Cancellation Prediction
  └── Preference/Sentiment logic

Member 2 → Backend
  ├── APIs
  ├── Authentication
  ├── Database integration
  └── Decision Engine

Member 3 → Frontend
  ├── Resort Manager Dashboard
  └── Charts / KPIs

Member 4 → Frontend
  ├── Operations Dashboard
  └── Guest AI Concierge UI

Member 5 → Research / Integration
  ├── Dataset preparation
  ├── AI prompts
  ├── Testing
  ├── Documentation
  └── Integration support
```

---

# 28. MVP Architecture

For a short hackathon, prioritize:

```text
1. Authentication + Roles
2. PostgreSQL/Supabase Database
3. Manager Dashboard
4. Operations Dashboard
5. Guest Concierge
6. Booking Prediction
7. Cancellation Prediction
8. Occupancy Calculation
9. Decision Engine
10. Seeded Demo Data
```

Optional after MVP:

```text
11. Guest Preference Prediction
12. Sentiment Analysis
13. Revenue/Pricing Recommendation
14. Staff Optimization
15. Predictive Maintenance
```

---

# 29. Recommended MVP Data Flow

```text
                    ┌─────────────────┐
                    │ Resort Database │
                    └────────┬────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
       Booking Data     Guest Data      Operations Data
             │               │                │
             ▼               ▼                ▼
       Booking ML       Preference       Workload
             │           Logic/ML         Analysis
             ▼               │                │
       Occupancy             │                │
             │               │                │
             └───────────────┼────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Decision Engine │
                    └────────┬────────┘
                             ▼
                    Recommendations
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
             Manager      Operations    Guest
            Dashboard      Dashboard   Concierge
```

---

# 30. Architecture Principles

### Principle 1 — Separate Prediction from Decision

ML predicts outcomes.

The Decision Engine applies business rules.

### Principle 2 — Keep Humans in Control

Recommendations should support managers rather than automatically making high-impact business decisions.

### Principle 3 — Use Verified Resort Data

The AI Concierge should rely on trusted resort information.

### Principle 4 — Role-Based Access

Each user sees only the information required for their role.

### Principle 5 — Explain Recommendations

Every recommendation should include:

```text
What happened?
Why does it matter?
What is suggested?
How confident is the system?
```

### Principle 6 — Build MVP First

The core product should work end-to-end before adding advanced features.

---

# 31. Final Architecture

```text
                         SMART RESORT 360
                               │
                               ▼
                     ┌──────────────────┐
                     │ Next.js / React  │
                     │ Role-Based UI    │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Node.js/Express  │
                     │ API + Auth       │
                     └────────┬─────────┘
                              │
          ┌───────────────────┼────────────────────┐
          │                   │                    │
          ▼                   ▼                    ▼
 ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
 │ PostgreSQL /   │   │ Python FastAPI │   │ AI Concierge   │
 │ Supabase       │   │ ML Service     │   │ LLM + Knowledge│
 └───────┬────────┘   └───────┬────────┘   └───────┬────────┘
         │                    │                    │
         │                    ▼                    │
         │             ┌──────────────┐            │
         │             │ ML Models    │            │
         │             │ XGBoost      │            │
         │             └──────┬───────┘            │
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Decision Engine  │
                    │ Rules + Priority │
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │ Recommendations  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Resort Manager   Operations       Guest
          Dashboard       Dashboard     AI Concierge
```

## Final Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + React |
| UI | Tailwind CSS |
| Charts | Recharts |
| Backend | Node.js + Express |
| ML Service | Python + FastAPI |
| ML | XGBoost / scikit-learn |
| Data Processing | pandas + NumPy |
| Database | PostgreSQL / Supabase |
| AI | LLM API |
| Authentication | JWT / Session |
| API | REST |
| Frontend Hosting | Vercel |
| Backend Hosting | Render / Railway |
| ML Hosting | Render / Railway |
| Database Hosting | Supabase |

## Core System Formula

```text
Reliable Resort Data
        ↓
Machine Learning Predictions
        ↓
Decision Engine
        ↓
Actionable Recommendations
        ↓
Human Decision
```

For guests:

```text
Guest Identity
        ↓
Guest Profile + History
        ↓
Verified Resort Knowledge
        ↓
AI Concierge
        ↓
Personalized Assistance
```
