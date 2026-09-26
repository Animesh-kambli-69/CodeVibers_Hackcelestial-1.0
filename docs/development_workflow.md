# Smart Resort 360 — Development Workflow

## 1. Development Principle

The project will be developed in phases.

The team should not independently build unrelated features without shared contracts.

The development flow is:

```text
Plan
 ↓
Define Contract
 ↓
Build
 ↓
Integrate
 ↓
Test
 ↓
Demo
```

---

# 2. Phase 1 — Project Setup

Create:

* Repository
* Folder structure
* Frontend application
* Backend application
* ML service
* Documentation

---

# 3. Phase 2 — Data Foundation

Define:

* Database entities
* Dataset
* Data fields
* ML features
* Sample data

The database and ML team must agree on the data structure.

---

# 4. Phase 3 — ML

Build:

### Model 1

Occupancy forecasting.

### Model 2

Cancellation prediction.

Both models must have defined:

```text
Input
Output
Evaluation
```

---

# 5. Phase 4 — Backend

Implement:

* Database access
* Core APIs
* ML service client
* AI service client
* Decision engine

---

# 6. Phase 5 — Frontend

Build:

### Manager

* Dashboard
* Forecast
* Cancellation risks
* AI insights
* Recommendations

### Guest

* Guest profile
* AI Concierge
* Service request

Frontend development may use mocked data before backend integration.

---

# 7. Phase 6 — Integration

Connect:

```text
Frontend
 ↓
Backend
 ↓
Database
```

and:

```text
Backend
 ↓
ML Service
```

and:

```text
Backend
 ↓
LLM
```

---

# 8. Phase 7 — Decision Engine

Combine:

```text
ML
+
Rules
+
Resort Data
+
LLM
```

to generate actionable recommendations.

---

# 9. Phase 8 — Testing

Test:

* APIs
* ML responses
* Database queries
* Frontend states
* AI responses
* Full user flows

---

# 10. Phase 9 — Demo

The demo should show:

```text
Resort Data
 ↓
Prediction
 ↓
Problem Identified
 ↓
AI Recommendation
 ↓
Manager Action
```

Then demonstrate:

```text
Guest
 ↓
AI Concierge
 ↓
Personalized Assistance
```

---

# 11. Six-Hour Hackathon Workflow

| Time      | Work                     |
| --------- | ------------------------ |
| 0:00–0:30 | Architecture + contracts |
| 0:30–1:15 | Project setup            |
| 1:15–2:15 | Data + ML                |
| 2:15–3:00 | Backend/ML integration   |
| 3:00–3:45 | Decision engine          |
| 3:45–4:30 | Dashboard integration    |
| 4:30–5:00 | AI Concierge             |
| 5:00–5:20 | Secondary features       |
| 5:20–5:40 | Testing                  |
| 5:40–6:00 | Demo preparation         |

---

# 12. Parallel Development

The five team members work in parallel.

```text
Member 1
ML
 ↓
Models + ML API

Member 2
Backend
 ↓
API + Database + Decision Engine

Member 3
Frontend
 ↓
Manager Dashboard

Member 4
Frontend
 ↓
Guest + Concierge

Member 5
Integration
 ↓
Data + Contracts + QA + Demo
```

---

# 13. Integration Rule

At approximately the halfway point of the hackathon, the system must have a working vertical slice:

```text
Data
 ↓
ML
 ↓
Backend
 ↓
Frontend
```

Do not wait until the end to integrate.

---

# 14. Scope Rule

If time becomes limited:

```text
Remove secondary features
        ↓
Keep core features
        ↓
Keep integration
        ↓
Keep demo quality
```

Never sacrifice the core end-to-end flow just to add more features.
