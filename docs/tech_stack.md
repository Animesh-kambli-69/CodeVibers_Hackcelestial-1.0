# Smart Resort 360 — Technology Stack

## 1. Frontend

### Next.js

Used as the primary frontend framework.

Responsibilities:

* Application routing
* Server/client rendering
* UI structure
* Frontend application

### React

Used for interactive UI components.

### TypeScript

Used for frontend type safety.

### Tailwind CSS

Used for styling and UI development.

### Recharts

Used for:

* Occupancy charts
* Revenue charts
* Forecast visualizations
* Trend visualizations

---

# 2. Backend

### Node.js

Runtime for the main application backend.

### Express.js

Framework for:

* REST APIs
* Middleware
* Request handling
* Backend application structure

---

# 3. Machine Learning

### Python

Used for machine-learning development.

### FastAPI

Used to expose ML functionality through HTTP APIs.

### Pandas

Used for:

* Data loading
* Data cleaning
* Data transformation

### NumPy

Used for numerical processing.

### Scikit-learn

Used for:

* Preprocessing
* Model evaluation
* Machine-learning utilities

### XGBoost

Used for predictive models such as:

* Occupancy forecasting
* Cancellation-risk prediction

---

# 4. Database

### PostgreSQL

Primary relational database.

### Supabase

Used as the managed PostgreSQL platform.

---

# 5. AI

The project uses an LLM for:

* AI Concierge
* Natural-language explanations
* Contextual recommendations
* Decision-engine reasoning

Embeddings/RAG may be used for retrieving resort-specific information.

---

# 6. Architecture

```text
Next.js / React
       ↓
Node.js / Express
       ↓
PostgreSQL / Supabase

Node.js / Express
       ↓
Python / FastAPI
       ↓
ML Models
```

---

# 7. Deployment

Target deployment:

```text
Frontend
→ Vercel

Backend
→ Render / Railway

ML Service
→ Render / Railway

Database
→ Supabase
```

The final hosting provider may change based on hackathon constraints.

---

# 8. Technology Principle

Use each technology where it provides the most value.

```text
Next.js
→ User interface

Node.js
→ Application/backend logic

Python
→ Machine learning

PostgreSQL
→ Structured data

LLM
→ Natural-language intelligence
```

Avoid introducing additional technologies unless they solve a demonstrated requirement.
