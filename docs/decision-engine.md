# Smart Resort 360 — Decision Engine Specification

## 1. Purpose

The Decision Engine converts:

- Current resort data
- ML predictions
- Operational information
- Guest experience insights

into **actionable recommendations**.

The Decision Engine does not replace the resort manager or operations manager.

Its purpose is to answer:

> Given what the system knows right now, what action should the resort consider?

## 2. Core Architecture

```text
Real Resort Data
      ↓
ML Predictions
      ↓
Decision Engine
      ↓
Recommendation
      ↓
LLM Explanation
      ↓
Human Decision
```

Example:

```text
Predicted Occupancy = 94%
             ↓
Decision Engine
             ↓
Occupancy > 90%
             ↓
HIGH OCCUPANCY RULE
             ↓
Recommendation:
Prepare operational capacity
```

## 3. ML vs Decision Engine vs LLM

| Layer | Responsibility | Example |
|---|---|---|
| ML | Prediction | Occupancy will be 94% |
| Decision Engine | Business rule | Occupancy > 90% |
| Recommendation | Suggested action | Prepare operations |
| LLM | Explanation/conversation | Explain why action is recommended |
| Human | Final decision | Manager decides |

## 4. Responsibilities

The Decision Engine should:

- Evaluate ML predictions
- Apply deterministic business rules
- Combine related signals
- Generate recommendations
- Assign priority
- Explain the data behind a recommendation
- Avoid duplicate recommendations
- Store recommendation status

## 5. What It Should NOT Do

The Decision Engine should not:

- Automatically change room prices
- Automatically cancel bookings
- Automatically modify staff schedules
- Automatically reject guests
- Invent resort information
- Override human decisions
- Generate recommendations without supporting data

For high-impact actions, the system remains human-in-the-loop.

## 6. Input State

Example:

```json
{
  "occupancy": {
    "current": 88,
    "predicted": 94
  },
  "bookings": {
    "predicted": 205,
    "highRiskCancellations": 17
  },
  "rooms": {
    "total": 220,
    "available": 13
  },
  "staff": {
    "housekeepingAvailable": 12,
    "housekeepingRequired": 15
  },
  "sentiment": {
    "positive": 68,
    "neutral": 20,
    "negative": 12,
    "topics": {
      "AC": 27,
      "WiFi": 12,
      "Cleanliness": 8,
      "Food": 5
    }
  },
  "demand": {
    "level": "HIGH"
  }
}
```

## 7. Output Format

```json
{
  "category": "OPERATIONS",
  "priority": "HIGH",
  "title": "Increase housekeeping capacity",
  "reason": "Predicted occupancy is 94% and required housekeeping capacity is 15 while 12 are available.",
  "suggested_action": "Consider allocating 3 additional housekeeping staff.",
  "confidence": 0.89,
  "source": [
    "occupancy_forecast",
    "staff_availability"
  ],
  "status": "NEW"
}
```

## 8. Recommendation Categories

```text
OCCUPANCY
CANCELLATION
OPERATIONS
GUEST_EXPERIENCE
PRICING
MAINTENANCE
GUEST_PERSONALIZATION
```

## 9. Priority Levels

```text
HIGH
MEDIUM
LOW
```

Priority can consider:

- Business impact
- Urgency
- Number of guests affected
- Prediction confidence
- Operational risk

Thresholds should be configurable rather than treated as universal truths.

## 10. Central Rule Configuration

```javascript
const RULE_CONFIG = {
  highOccupancy: 90,
  highCancellationRisk: 0.70,
  mediumCancellationRisk: 0.40,
  highMaintenanceRisk: 0.80,
  lowRoomAvailability: 0.10,
  highRiskCancellationCount: 10
};

module.exports = RULE_CONFIG;
```

## 11. Decision Engine Workflow

```text
1. Receive resort state
        ↓
2. Validate inputs
        ↓
3. Load rule configuration
        ↓
4. Evaluate business rules
        ↓
5. Generate recommendations
        ↓
6. Assign priority
        ↓
7. Deduplicate recommendations
        ↓
8. Store recommendations
        ↓
9. Return recommendations
        ↓
10. Optional LLM explanation
```

# 12. Core Rules

## Rule 1 — High Occupancy

### Trigger

```text
predicted_occupancy > 90%
```

Example:

```text
Predicted Occupancy = 94%
```

Recommendation:

```text
Title:
Prepare for high occupancy

Reason:
Predicted occupancy is 94%.

Suggested Action:
Review housekeeping, front-desk and guest-service capacity.
```

Category:

```text
OCCUPANCY
```

Priority:

```text
HIGH
```

## Rule 2 — High Cancellation Risk

### Trigger

```text
cancellation_probability >= 0.70
```

Example:

```text
Guest: Rahul
Cancellation Probability: 0.84
```

Recommendation:

```text
Title:
Review high-risk booking

Reason:
The booking has an estimated cancellation probability of 84%.

Suggested Action:
Review the booking and consider appropriate guest communication.
```

The system must not automatically cancel the booking.

## Rule 3 — Medium Cancellation Risk

### Trigger

```text
0.40 <= cancellation_probability < 0.70
```

Recommendation:

```text
Title:
Monitor booking cancellation risk

Suggested Action:
Keep the booking under observation.
```

## Rule 4 — High Demand + Low Availability

### Trigger

```text
demand = HIGH
AND
room_availability <= configured_threshold
```

Example:

```text
Demand = HIGH
Available Rooms = 13
Total Rooms = 220

Availability Ratio =
13 / 220

= 5.9%
```

Recommendation:

```text
Title:
Review room pricing strategy

Reason:
Demand is high and available room inventory is low.

Suggested Action:
Review room pricing and availability strategy.
```

The system only recommends; it does not automatically change prices.

## Rule 5 — Staff Shortage

### Trigger

```text
required_staff > available_staff
```

Example:

```text
Required Housekeeping Staff = 15
Available Housekeeping Staff = 12
```

Calculation:

```text
Shortage = 15 - 12 = 3
```

Recommendation:

```text
Title:
Housekeeping staff shortage

Reason:
Required staff is 15 while 12 are currently available.

Suggested Action:
Consider allocating 3 additional housekeeping staff.
```

## Rule 6 — Increasing Negative Sentiment

Compare the current sentiment period with a previous period.

Example:

```text
Previous AC complaints = 15%
Current AC complaints = 27%
```

Recommendation:

```text
Title:
Increasing AC complaints

Reason:
Negative guest feedback related to AC has increased.

Suggested Action:
Investigate recent AC complaints and maintenance requests.
```

Category:

```text
GUEST_EXPERIENCE
```

## Rule 7 — Sentiment + Maintenance Correlation

### Trigger

```text
negative AC complaints increasing
AND
AC maintenance requests increasing
```

Recommendation:

```text
Title:
Inspect AC systems

Reason:
Guest complaints and AC maintenance requests are both increasing.

Suggested Action:
Consider inspecting affected AC units.
```

This connects:

```text
Guest Experience
        +
Operations
        ↓
Actionable Insight
```

## Rule 8 — High Occupancy + Staff Shortage

### Trigger

```text
predicted_occupancy > 90%
AND
required_staff > available_staff
```

Example:

```text
Predicted Occupancy = 94%
Required Staff = 15
Available Staff = 12
```

Recommendation:

```text
Title:
Prepare additional housekeeping capacity

Reason:
High occupancy is expected while housekeeping capacity is below requirement.

Suggested Action:
Consider allocating 3 additional staff.
```

## Rule 9 — High Occupancy + High Cancellation Risk

### Trigger

```text
predicted_occupancy > 90%
AND
high_risk_cancellations > configured_threshold
```

Recommendation:

```text
Title:
Review high-risk bookings before peak occupancy

Reason:
High occupancy is forecast while multiple bookings have elevated cancellation risk.

Suggested Action:
Review high-risk bookings and prepare operations for forecast demand.
```

# 13. Event / Festival Workflow

The ML model should receive festivals and events as explicit inputs.

The AI does not magically know future festivals.

Events should exist in a trusted event calendar.

```text
Event Calendar
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

Useful event features:

```text
is_festival
days_to_festival
festival_type
historical_festival_occupancy
current_booking_velocity
```

Example:

```text
Event = Diwali
Historical Diwali Occupancy = 91%
Current Booking Velocity = HIGH
```

The ML model may predict:

```text
Predicted Occupancy = 95%
```

Then:

```text
95% > 90%
```

The high occupancy rule triggers.

Recommendation:

```text
Prepare for peak occupancy during Diwali.
```

# 14. Pricing Recommendation Workflow

```text
Historical ADR
       +
Current ADR
       +
Predicted Occupancy
       +
Demand
       +
Room Availability
       +
Booking Velocity
       ↓
Decision Engine
       ↓
Pricing Recommendation
```

Example:

```text
Room Type: Deluxe
Current ADR: ₹8,000
Predicted Occupancy: 93%
Demand: HIGH
Availability: LOW
```

The system may generate:

```text
Recommended Price Review: ₹9,200
```

The manager remains responsible for the final pricing decision.

# 15. Staff Optimization Workflow

The basic MVP does not require ML for staff optimization.

```text
Occupancy Forecast
        ↓
Expected Workload
        ↓
Required Staff
        ↓
Available Staff
        ↓
Shortage / Surplus
        ↓
Decision Rule
        ↓
Recommendation
```

Example:

```text
Required = 15
Available = 12
Shortage = 3
```

Output:

```text
Consider allocating 3 additional housekeeping staff.
```

# 16. Guest Personalization Workflow

```text
Guest Message
      ↓
Authenticate Guest
      ↓
Identify Guest
      ↓
Retrieve Guest Profile
      ↓
Retrieve Guest Preferences
      ↓
Retrieve Guest History
      ↓
Retrieve Resort Information
      ↓
Filter Suitable Options
      ↓
LLM
      ↓
Personalized Response
```

Example guest profile:

```text
Food Preference: Vegetarian
Preferred Room: Deluxe
Spa Preference Score: 87%
```

A guest asks:

```text
"What would you recommend for me this evening?"
```

The backend retrieves:

```text
Guest Profile
+
Preference Scores
+
Resort Activities
+
Restaurant Information
```

The LLM can provide a personalized recommendation based only on verified resort information.

# 17. AI Concierge Safety Rule

The chatbot should not invent:

- Restaurant timings
- Activity availability
- Room availability
- Prices
- Resort policies
- Facility information
- Service availability

If verified information is unavailable:

```text
I don't have verified information about that right now.
```

# 18. Maintenance Rule — Stretch Feature

Predictive maintenance is a stretch feature.

Inputs may include:

```text
Equipment Type
Operating Hours
Temperature
Vibration
Last Maintenance
Previous Failures
```

ML predicts:

```text
Failure Probability = 0.87
```

Rule:

```text
IF failure_probability > 0.80
THEN
recommend preventive inspection
```

Output:

```text
HVAC-102 has elevated predicted failure risk.
Consider scheduling preventive maintenance.
```

The system does not automatically schedule maintenance.

# 19. Deduplication

Multiple rules may trigger for the same underlying problem.

Example:

```text
Rule A:
High Occupancy

Rule B:
High Occupancy + Staff Shortage

Rule C:
High Occupancy + Operational Risk
```

Merge similar recommendations.

Final recommendation:

```text
HIGH PRIORITY

Prepare for peak occupancy

Reason:
Occupancy is forecast at 94% and housekeeping capacity is below the required level.

Suggested Action:
Review housekeeping and guest-service capacity.
```

# 20. Recommendation Prioritization

```text
Triggered Rules
      ↓
Deduplicate
      ↓
Calculate Priority
      ↓
Sort
      ↓
Return Recommendations
```

Possible factors:

```text
Business Impact
Urgency
Guests Affected
Prediction Confidence
Operational Risk
```

# 21. Recommendation Lifecycle

```text
NEW
 ↓
VIEWED
 ↓
ACCEPTED
   OR
DISMISSED
```

`ACCEPTED` means the user accepts the recommendation for consideration/action. It does not mean the system automatically executed it.

# 22. API

Recommended endpoint:

```http
GET /api/manager/recommendations
```

Example response:

```json
{
  "recommendations": [
    {
      "id": "rec-1001",
      "category": "OPERATIONS",
      "priority": "HIGH",
      "title": "Address housekeeping shortage",
      "reason": "Forecast occupancy is 96% and required staff is 15 while 12 are available.",
      "suggested_action": "Consider allocating 3 additional staff.",
      "confidence": 0.89,
      "status": "NEW"
    }
  ]
}
```

Optional status endpoints:

```http
PATCH /api/manager/recommendations/:id/view
PATCH /api/manager/recommendations/:id/accept
PATCH /api/manager/recommendations/:id/dismiss
```

# 23. Implementation Structure

```text
decision-engine/
│
├── rules/
│   ├── occupancyRule.js
│   ├── cancellationRule.js
│   ├── pricingRule.js
│   ├── staffingRule.js
│   ├── sentimentRule.js
│   └── maintenanceRule.js
│
├── config/
│   └── thresholds.js
│
├── services/
│   ├── evaluateRules.js
│   ├── prioritize.js
│   └── deduplicate.js
│
└── index.js
```

# 24. Example Core Function

```javascript
function generateRecommendations(state) {
  const recommendations = [];

  recommendations.push(...checkOccupancyRule(state));
  recommendations.push(...checkCancellationRule(state));
  recommendations.push(...checkPricingRule(state));
  recommendations.push(...checkStaffRule(state));
  recommendations.push(...checkSentimentRule(state));
  recommendations.push(...checkMaintenanceRule(state));

  return deduplicateAndPrioritize(recommendations);
}
```

# 25. Example Occupancy Rule

```javascript
function checkOccupancyRule(state) {
  const recommendations = [];

  if (state.occupancy.predicted > 90) {
    recommendations.push({
      category: "OCCUPANCY",
      priority: "HIGH",
      title: "Prepare for high occupancy",
      reason:
        `Predicted occupancy is ${state.occupancy.predicted}%.`,
      suggested_action:
        "Review housekeeping and guest-service capacity.",
      confidence:
        state.occupancy.confidence || null
    });
  }

  return recommendations;
}
```

# 26. Example Staff Rule

```javascript
function checkStaffRule(state) {
  const recommendations = [];

  const required = state.staff.housekeepingRequired;
  const available = state.staff.housekeepingAvailable;

  if (required > available) {
    const shortage = required - available;

    recommendations.push({
      category: "OPERATIONS",
      priority: "HIGH",
      title: "Housekeeping staff shortage",
      reason:
        `Required staff is ${required} while ${available} are available.`,
      suggested_action:
        `Consider allocating ${shortage} additional housekeeping staff.`
    });
  }

  return recommendations;
}
```

# 27. Example Cancellation Rule

```javascript
function checkCancellationRule(booking) {
  const recommendations = [];

  if (booking.cancellationProbability >= 0.70) {
    recommendations.push({
      category: "CANCELLATION",
      priority: "HIGH",
      title: "Review high-risk booking",
      reason:
        `Cancellation probability is ${
          booking.cancellationProbability * 100
        }%.`,
      suggested_action:
        "Review booking and consider appropriate guest communication."
    });
  }

  return recommendations;
}
```

# 28. Booking Prediction Example

```text
Historical Booking Data
          ↓
XGBoost
          ↓
Predicted Bookings = 205
          ↓
Available Rooms = 220
          ↓
Occupancy = 93.18%
          ↓
Decision Engine
          ↓
93.18% > 90%
          ↓
HIGH OCCUPANCY RULE
          ↓
Recommendation
```

# 29. Cancellation Example

```text
Booking Data
     ↓
Cancellation Model
     ↓
Probability = 0.84
     ↓
Decision Engine
     ↓
0.84 >= 0.70
     ↓
HIGH RISK
     ↓
Recommendation:
Review booking
```

# 30. Pricing Example

```text
Current ADR
     +
Predicted Occupancy
     +
Demand
     +
Availability
     ↓
Decision Engine
     ↓
Pricing Recommendation
```

Example:

```text
Current Price = ₹8,000
Predicted Occupancy = 93%
Demand = HIGH
Availability = LOW

Suggested Price Review = ₹9,200
```

# 31. Staff Example

```text
Predicted Occupancy = 96%
        ↓
Expected Workload
        ↓
Required Staff = 15
        ↓
Available Staff = 12
        ↓
Shortage = 3
        ↓
Recommendation
```

# 32. Sentiment Example

```text
Guest Reviews
      ↓
Sentiment Analysis
      ↓
Topic Extraction
      ↓
AC complaints increasing
      ↓
Decision Engine
      ↓
Recommendation
```

Example:

```text
AC complaints: +27%

Recommendation:
Investigate increasing AC complaints.
```

If maintenance data also shows an increase:

```text
AC complaints ↑
+
AC maintenance requests ↑
        ↓
Recommend AC inspection
```

# 33. Error Handling

The Decision Engine should not create recommendations when required data is missing.

Example:

```text
Predicted Occupancy = NULL
```

Return:

```text
Insufficient data to generate occupancy recommendation.
```

# 34. Validation

Before evaluating rules:

```text
Check required fields
        ↓
Validate data types
        ↓
Validate ranges
        ↓
Handle missing values
        ↓
Evaluate rules
```

Examples:

```text
Occupancy must be between 0 and 100.
Probability must be between 0 and 1.
Required staff cannot be negative.
Available rooms cannot be negative.
```

# 35. Decision Engine Principles

### 1. Deterministic

Same input should produce the same recommendation.

### 2. Explainable

Every recommendation should contain a reason.

### 3. Data-backed

Every recommendation should have supporting data.

### 4. Configurable

Thresholds should not be hard-coded throughout the application.

### 5. Human-in-the-loop

The system recommends; humans decide.

### 6. No hallucination

The engine should not invent facts.

### 7. No hidden actions

Recommendations should never silently change prices, bookings, staff schedules, or resort operations.

# 36. Final Architecture

```text
                  SMART RESORT 360
                         │
                         ↓
                  Resort Database
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     Booking Data    Guest Data    Operations Data
          │              │              │
          ↓              ↓              ↓
       ML Models      Guest AI       Operational Data
          │              │              │
          ↓              │              │
     Predictions         │              │
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                  DECISION ENGINE
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
         Occupancy   Cancellation   Operations
             ↓           ↓           ↓
             └───────────┼───────────┘
                         ↓
                  Recommendations
                         │
                         ↓
                   LLM Explanation
                         │
                         ↓
                  Human Decision
```

# 37. Final Smart Resort 360 Principle

```text
Real Data
   ↓
ML Prediction
   ↓
Deterministic Business Rule
   ↓
Actionable Recommendation
   ↓
LLM Explanation
   ↓
Human Decision
```

The system should not stop at:

```text
"What happened?"
```

It should progress toward:

```text
"What is likely to happen?"
        ↓
"What does that mean?"
        ↓
"What should the resort consider doing?"
```

This is the core decision-support workflow of Smart Resort 360.
