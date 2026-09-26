# Product Requirements Document (PRD) — Smart Resort 360

**Project Name:** Smart Resort 360  
**Product Type:** AI-powered Resort Intelligence & Guest Assistance Platform  
**Target:** Hackathon MVP  
**Primary Users:**
1. Resort Manager
2. Operations Manager
3. Guest

---

## 1. Executive Summary
Smart Resort 360 is an AI-powered resort intelligence platform designed to help resort management make better decisions and provide personalized guest assistance.

The platform has three distinct user experiences:
1. **Resort Manager**: High-level resort business overview via booking predictions, occupancy forecasting, cancellation insights, and overall AI recommendations.
2. **Operations Manager**: Detailed guest and operational intelligence via guest profiles, preference predictions, cancellation risk per guest, and stay history.
3. **Guest**: AI-powered chatbot concierge providing activity recommendations, facility answers, and personalized assistance.

**Core Data Flow:**
- *Management:* Resort Data → ML Predictions → AI Intelligence → Recommendations → Better Decisions
- *Guest:* Guest Information → Personalization → AI Assistance

---

## 2. Problem Statement
Resort data is fragmented across bookings, guests, room types, reviews, and services. Managers must manually analyze data to anticipate demand, cancellations, and operational priorities. Meanwhile, guests struggle to find information about resort services and activities. Smart Resort 360 unifies management intelligence and guest assistance into one AI platform.

---

## 3. User Roles & Key Features

| Role | Focus | Key Features |
| :--- | :--- | :--- |
| **Resort Manager** | High-level decision maker | Booking Prediction, Occupancy Forecast, Cancellation Risk Overview, Overall AI Recommendations |
| **Operations Manager** | Individual guest intelligence | Detailed Guest Profiles, Preference Prediction, Guest Cancellation Probability, Operational Preparation |
| **Guest** | Personal experience | AI Chatbot Concierge, Activity Recommendations, Facility Timings, Personalized Suggestions |

---

## 4. Machine Learning & Backend Architecture
- **Model 1: Booking & Occupancy Prediction** (Resort Manager)
- **Model 2: Cancellation Risk Model** (Operations & Resort Manager)
- **Model 3: Guest Preference Prediction** (Operations Manager)
- **Node.js / Express Backend**: Auth, REST APIs, Decision Engine, LLM Chatbot Orchestration.
- **Python / FastAPI ML Service**: Model inference for booking, cancellation, and preferences.
