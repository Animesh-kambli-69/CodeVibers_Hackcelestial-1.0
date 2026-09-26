# System Architecture

## Smart Resort 360
# Smart Resort 360 — Architecture

## 1. Architecture Overview

Smart Resort 360 uses a three-application architecture:

```text
Frontend
   ↓
Node.js / Express Backend
   ↓
┌──────────────────┐
│                  │
▼                  ▼
Database         ML Service
                 Python/FastAPI
```

The backend acts as the central application layer.

The ML service is isolated as a specialized service for machine-learning workloads.

---

# 2. High-Level Architecture

```text
                         SMART RESORT 360
                                │
                                ▼
                     ┌───────────────────┐
                     │   Next.js / React │
                     │   Tailwind CSS    │
                     │   Recharts        │
                     └─────────┬─────────┘
                               │
                            REST API
                               │
                               ▼
                     ┌───────────────────┐
                     │ Node.js + Express │
                     │                   │
                     │ API Layer         │
                     │ Business Logic    │
                     │ Decision Engine   │
                     │ AI Orchestration  │
                     └──────┬───────┬────┘
                            │       │
                            │       │ HTTP
                            │       ▼
                            │  ┌──────────────┐
                            │  │ Python       │
                            │  │ FastAPI      │
                            │  │              │
                            │  │ ML Models    │
                            │  └──────────────┘
                            │
                            ▼
                     ┌───────────────┐
                     │ PostgreSQL    │
                     │ / Supabase    │
                     └───────────────┘
```

---

# 3. Frontend

Technology:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Recharts

Responsibilities:

* Manager dashboard
* Forecast visualization
* Cancellation-risk visualization
* Guest profiles
* AI Concierge
* AI insights
* Recommendations

The frontend communicates with the Node.js backend through REST APIs.

---

# 4. Backend

Technology:

* Node.js
* Express.js

Responsibilities:

* REST API
* Business logic
* Database access
* Decision engine
* ML service communication
* LLM communication
* Guest and booking operations

The backend is the primary application layer.

---

# 5. ML Service

Technology:

* Python
* FastAPI
* Pandas
* NumPy
* Scikit-learn
* XGBoost

Responsibilities:

* Data preprocessing
* Feature engineering
* ML model training/experimentation
* ML inference
* Occupancy prediction
* Cancellation prediction

The ML service communicates with the Node.js backend through HTTP.

---

# 6. Database

Technology:

* PostgreSQL
* Supabase

The database stores application and resort data such as:

* Guests
* Bookings
* Rooms
* Reviews
* Staff
* Service requests

The exact schema is maintained in `database.md`.

---

# 7. Decision Engine

The Decision Engine combines:

```text
ML Predictions
      +
Business Rules
      +
Resort Data
      +
LLM Reasoning
```

It produces:

* Alerts
* Insights
* Recommendations
* Suggested actions

The LLM should not be the sole source of business decisions.

---

# 8. Communication Flow

## Dashboard

```text
Next.js
   ↓
Express API
   ↓
Database / ML Service
   ↓
Express
   ↓
Next.js
```

## ML Prediction

```text
Express
   ↓ HTTP
FastAPI
   ↓
ML Model
   ↓
Prediction
   ↓
Express
   ↓
Frontend
```

## AI Concierge

```text
Guest
 ↓
Next.js
 ↓
Express
 ↓
Guest Data + Resort Context
 ↓
LLM
 ↓
Express
 ↓
Next.js
 ↓
Guest
```

---

# 9. Architectural Principle

Keep responsibilities separated:

```text
Frontend
→ Presentation

Backend
→ Application + Business Logic

ML Service
→ Machine Learning

Database
→ Persistence

LLM
→ Natural Language Reasoning / Interaction
```

Do not move business logic into the frontend.

Do not place ML implementation inside the Node.js backend.

Do not allow the LLM to independently control critical business decisions.
