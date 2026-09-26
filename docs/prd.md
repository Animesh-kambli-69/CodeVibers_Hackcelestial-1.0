Smart Resort 360–––
Product Requirements Document — Updated Version
Project Name: Smart Resort 360
Product Type: AI-powered Resort Intelligence & Guest Assistance Platform
Target: Hackathon MVP
Primary Users:
1.	Resort Manager
2.	Operations Manager
3.	Guest
________________________________________
1. Executive Summary
Smart Resort 360 is an AI-powered resort intelligence platform designed to help resort management make better decisions and provide personalized guest assistance.
The platform has three distinct user experiences:
1. Resort Manager
Gets a high-level view of the resort's business situation through:
•	Booking predictions
•	Demand/occupancy forecasting
•	Cancellation insights
•	Overall AI recommendations
•	Resort performance insights
2. Operations Manager
Gets detailed guest and operational intelligence through:
•	Complete guest information
•	Guest preferences
•	Guest behavior/pattern predictions
•	Cancellation prediction
•	Guest history
•	Personalized guest insights
3. Guest
Gets an AI-powered chatbot that can:
•	Answer resort-related questions
•	Recommend activities
•	Provide personalized suggestions
•	Answer questions about facilities/services
•	Assist with basic guest requests
The central idea is:
Resort Data → ML Predictions → AI Intelligence → Recommendations → Better Decisions
For guests:
Guest Information → Personalization → AI Assistance
________________________________________
2. Problem Statement
Resorts generate a large amount of data from:
•	Bookings
•	Guests
•	Room types
•	Booking history
•	Guest preferences
•	Reviews
•	Cancellations
•	Resort services
•	Activities
However, this information is often fragmented.
Managers may have access to the data but still need to manually analyze it to understand:
•	Future booking demand
•	Potential cancellations
•	Guest behavior
•	Guest preferences
•	Operational priorities
•	What actions should be taken
At the same time, guests may have to search through different sources to find information about resort services and activities.
Smart Resort 360 addresses both problems through an AI-powered platform.
________________________________________
3. Problem We Are Solving
The system solves two major problems.
Problem 1 — Management Intelligence
Resort managers have data but need actionable insights.
Instead of:
"Here are 10,000 bookings."
The system should provide:
"Booking demand is expected to increase over the next three days."
and:
"Several upcoming bookings have a high probability of cancellation."
and:
"Based on current booking trends, the resort should prepare for higher demand."
________________________________________
Problem 2 — Guest Assistance
Guests need information and recommendations.
Instead of manually searching:
"What activities are available?"
"What restaurants are available?"
"What can I do today?"
the guest can ask the AI chatbot directly.
________________________________________
4. Product Vision
The vision of Smart Resort 360 is:
To create an intelligent resort platform that helps managers understand what is happening, predict what may happen next, and assist guests through personalized AI.
________________________________________
5. User Roles
The system contains exactly three user roles.
                 SMART RESORT 360
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   RESORT MANAGER  OPERATIONS      GUEST
                    MANAGER
        │              │              │
        ▼              ▼              ▼
 Booking Prediction  Guest Info     AI Chatbot
 AI Recommendations  Preferences    Activities
 Demand Forecast     Predictions    Resort Info
 Overall Insights    Cancellation   Personalized Help
                     Prediction
________________________________________
6. Role 1 — Resort Manager
The Resort Manager is the business-level decision maker.
The manager should not need to examine every individual guest.
Instead, the manager receives a high-level overview of the resort.
________________________________________
7. Resort Manager Dashboard
The dashboard should provide:
Key Information
•	Current occupancy
•	Predicted occupancy
•	Booking demand
•	Upcoming booking trends
•	Cancellation risk summary
•	Overall resort performance
•	AI-generated recommendations
________________________________________
8. Booking Prediction
One of the main features for the Resort Manager is booking prediction.
The system should predict future booking demand.
Example:
Current bookings: 175

Predicted bookings next 7 days:
Day 1 → 182
Day 2 → 190
Day 3 → 198
Day 4 → 205
Day 5 → 212
The manager can use this information to understand upcoming demand.
________________________________________
9. Occupancy Forecasting
Booking prediction can be converted into an expected occupancy forecast.
Example:
Today:
Occupancy = 82%

Tomorrow:
Predicted = 87%

Day 3:
Predicted = 91%

Day 4:
Predicted = 94%
The dashboard should show this using a graph.
________________________________________
10. Cancellation Overview
The Resort Manager should receive an overall cancellation-risk summary.
For example:
Upcoming Bookings: 220

Low Risk:      165
Medium Risk:    38
High Risk:      17
The manager does not necessarily need to inspect every guest.
Detailed cancellation information belongs primarily to the Operations Manager.
________________________________________
11. Overall AI Recommendations
The Resort Manager receives AI-generated recommendations based on the overall resort situation.
Examples:
Recommendation 1
Booking demand is expected to increase over the next 4 days. Consider preparing additional operational capacity.
Recommendation 2
Cancellation risk is elevated for a segment of upcoming bookings. Review the high-risk booking group.
Recommendation 3
Demand for Deluxe rooms is increasing while availability is decreasing. Consider reviewing pricing strategy.
________________________________________
12. Recommendation Architecture
The recommendation system should use:
Historical Data
      +
Current Resort Data
      +
ML Predictions
      +
Business Rules
      ↓
Decision Engine
      ↓
AI Recommendation
The LLM should not independently invent recommendations.
It should explain recommendations generated from actual data and predefined rules.
________________________________________
13. Resort Manager — What They See
The Resort Manager dashboard should contain:
KPI Cards
•	Current Occupancy
•	Predicted Occupancy
•	Upcoming Bookings
•	Booking Demand
•	High Cancellation Risk
•	AI Recommendations
Charts
•	Booking Forecast
•	Occupancy Forecast
•	Cancellation Overview
•	Demand by Room Type
AI Section
Overall Resort Insights
Example:
AI INSIGHTS

• Booking demand is expected to rise by 12%.
• Occupancy may exceed 90% over the weekend.
• 17 upcoming bookings have high cancellation risk.
• Deluxe room demand is increasing.
________________________________________
14. Role 2 — Operations Manager
The Operations Manager focuses on individual guest intelligence and operational preparation.
The Operations Manager should be able to understand:
•	Who is arriving?
•	What does the guest prefer?
•	What has the guest done previously?
•	What type of room does the guest prefer?
•	What food preferences do they have?
•	What activities do they like?
•	How likely is the booking to be cancelled?
•	What should staff know before the guest arrives?
________________________________________
15. Operations Manager Dashboard
The Operations Manager dashboard should include:
•	Guest list
•	Guest profiles
•	Guest preferences
•	Guest history
•	Predicted preferences
•	Cancellation probability
•	Booking information
•	Special requirements
•	Personalized guest insights
________________________________________
16. Guest Information
The Operations Manager can view a guest profile.
Example:
Guest:
Rahul Sharma

Previous Visits:
3

Preferred Room:
Deluxe

Food Preference:
Vegetarian

Favorite Activities:
Spa
Pool

Average Stay:
3 nights

Average Spend:
₹12,500

Special Requirement:
Late check-in
________________________________________
17. Guest Preference Prediction
This is one of the important AI/ML features for the Operations Manager.
The system can predict likely guest preferences based on previous behavior.
For example:
Historical Behavior:

Guest booked Deluxe rooms
Guest visited Spa twice
Guest ordered vegetarian meals
Guest used Pool frequently

Prediction:

Preferred Room → Deluxe
Likely Activity → Spa
Food Preference → Vegetarian
________________________________________
18. Guest Intelligence
The system combines multiple sources of information:
Guest Profile
      +
Booking History
      +
Past Activities
      +
Food Preferences
      +
Room Preferences
      +
Previous Spending
      +
Service Requests
      ↓
Guest Intelligence
The goal is to create a useful guest profile rather than simply storing raw information.
________________________________________
19. Guest Preference Prediction — Example
Suppose a guest has:
Previous Stay 1:
Deluxe room
Spa
Vegetarian meals

Previous Stay 2:
Deluxe room
Pool
Vegetarian meals

Previous Stay 3:
Deluxe room
Spa
Vegetarian meals
The system could identify:
High likelihood:

Deluxe Room
Vegetarian Food
Spa
The Operations Manager can use this information to prepare for the guest.
________________________________________
20. Cancellation Prediction for Operations Manager
The Operations Manager receives more detailed cancellation information than the Resort Manager.
Example:
Guest: Rahul Sharma

Cancellation Probability:
84%

Risk:
HIGH

Possible contributing factors:
• Long booking lead time
• Previous cancellation history
• Booking channel
• Deposit type
This allows the operations team to pay attention to potentially unstable bookings.
________________________________________
21. Cancellation Prediction — Important Principle
The system should present cancellation prediction as a probability, not a certainty.
Incorrect:
"Rahul will cancel."
Correct:
"Rahul's booking has an estimated 84% cancellation probability."
This distinction is important both technically and from a product perspective.
________________________________________
22. Operations Manager Guest Table
Example:
Guest	Room	Arrival	Preference	Cancellation Risk
Rahul Sharma	Deluxe	Sep 28	Spa	High
Priya Patel	Suite	Sep 28	Pool	Low
Arjun Mehta	Deluxe	Sep 29	Restaurant	Medium
The manager can click a guest to see complete information.
________________________________________
23. Guest Profile Page
The guest profile should contain:
Basic Information
•	Name
•	Contact information
•	Guest ID
Booking Information
•	Current booking
•	Room type
•	Arrival
•	Departure
•	Booking channel
Preferences
•	Food
•	Room
•	Activities
•	Services
History
•	Previous stays
•	Previous bookings
•	Previous cancellations
Predictions
•	Cancellation probability
•	Preference predictions
________________________________________
24. Role 3 — Guest
The Guest receives a completely different experience.
The guest does not need access to management dashboards.
The main feature is:
AI Resort Concierge / AI Chatbot
________________________________________
25. Guest AI Chatbot
The chatbot allows guests to ask questions naturally.
Examples:
"What activities can I do today?"
"What restaurants are available?"
"What time does the pool open?"
"What can you recommend for a relaxing evening?"
"I like spa activities. What would you suggest?"
________________________________________
26. Personalized Guest Chatbot
The chatbot can use guest context.
Example:
Guest Preference:

Likes:
Spa
Pool

Food:
Vegetarian

Previous Activity:
Yoga
Guest asks:
"What should I do this evening?"
AI:
"Since you enjoyed spa activities during your previous stay, I recommend the evening spa session. You could also consider the poolside relaxation area."
________________________________________
27. AI Chatbot Knowledge
The chatbot should have access to controlled resort information.
Possible knowledge:
Resort Facilities
Restaurants
Restaurant Timings
Spa
Pool
Activities
Events
Room Facilities
Policies
Check-in Information
Check-out Information
Frequently Asked Questions
________________________________________
28. RAG for Guest Chatbot
The chatbot should use Retrieval-Augmented Generation (RAG) or a controlled knowledge context.
Flow:
Guest Question
      ↓
Search Resort Knowledge
      ↓
Relevant Information
      ↓
Guest Preferences
      ↓
LLM
      ↓
Personalized Response
This reduces the chance of hallucinating resort information.
________________________________________
29. Chatbot Hallucination Prevention
The chatbot should follow:
Only provide information available
in the resort knowledge base.

Do not invent:
• Prices
• Timings
• Facilities
• Availability
• Policies
• Activities

If information is unavailable:
tell the guest that the information is unavailable.
________________________________________
30. Guest Chatbot Example
Guest
"I want something relaxing tonight."
System Context
Guest preferences:
Spa
Pool
Yoga

Available activities:
Evening Spa
Poolside Relaxation
Yoga Session
AI
"For a relaxing evening, I recommend the evening spa session. Since you have also shown interest in yoga, the evening yoga session could be another option."
________________________________________
31. Three User Experiences
The complete product can now be represented as:
                    SMART RESORT 360
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
       MANAGER         OPERATIONS          GUEST
       MANAGER          MANAGER
          │                │                 │
          ▼                ▼                 ▼
 Booking Prediction    Guest Information   AI Chatbot
 Occupancy Forecast    Guest Preferences   Resort Info
 AI Recommendations    Preference Model    Activities
 Overall Insights      Cancellation Model  Personalization
                       Guest History
________________________________________
32. Feature Ownership by User
Feature	Resort Manager	Operations Manager	Guest
Booking Prediction	✓	—	—
Occupancy Forecast	✓	—	—
Overall AI Recommendations	✓	—	—
Resort Performance	✓	—	—
Guest Information	—	✓	Own profile only
Guest Preferences	—	✓	Own preferences
Preference Prediction	—	✓	—
Cancellation Prediction	Summary	Detailed	—
Guest History	—	✓	Limited personal view
AI Chatbot	—	—	✓
Resort Information	—	—	✓
Activity Recommendations	—	—	✓
Personalized Suggestions	—	—	✓
________________________________________
33. Overall System Architecture
                         SMART RESORT 360
                                │
               ┌────────────────┼────────────────┐
               │                │                │
               ▼                ▼                ▼
        RESORT MANAGER    OPERATIONS MANAGER   GUEST
               │                │                │
               ▼                ▼                ▼
        Manager Dashboard   Operations UI    AI Chatbot
               │                │                │
               └────────────────┼────────────────┘
                                ▼
                         NEXT.JS / REACT
                                │
                                ▼
                         NODE.JS / EXPRESS
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
         PostgreSQL        Python/FastAPI       LLM/RAG
         / Supabase              │                  │
              │                  │                  │
              │          ┌───────┴────────┐         │
              │          │                │         │
              │          ▼                ▼         │
              │      Booking Model   Preference     │
              │                       Model         │
              │          │                │         │
              │          ▼                ▼         │
              │     Cancellation      Guest        │
              │       Model          Intelligence  │
              │                                      │
              └─────────────────┬────────────────────┘
                                ▼
                         DECISION ENGINE
                                │
                                ▼
                     AI RECOMMENDATIONS
________________________________________
34. Backend Responsibilities
Node.js/Express remains the primary application backend.
It handles:
•	Authentication
•	User roles
•	APIs
•	Database operations
•	Guest information
•	Booking information
•	Calling ML services
•	Decision engine
•	Calling LLM
•	Chatbot orchestration
•	Response validation
________________________________________
35. ML Responsibilities
Python/FastAPI handles:
Model 1
Booking/Occupancy Prediction
Used by:
Resort Manager
Model 2
Cancellation Prediction
Used by:
Operations Manager
Resort Manager summary
Model 3
Guest Preference Prediction
Used by:
Operations Manager
Optional Model 4
Sentiment Analysis
Can be added later if time permits.
________________________________________
36. ML Architecture
                    Python ML Service
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
   Booking Forecast   Cancellation       Preference
                       Prediction         Prediction
          │                │                 │
          └────────────────┼─────────────────┘
                           ▼
                     Node.js Backend
________________________________________
37. Decision Engine
The Decision Engine primarily supports the Resort Manager.
It combines:
Booking Forecast
+
Occupancy Forecast
+
Cancellation Trends
+
Room Demand
+
Operational Signals
and generates:
Overall Resort Recommendations
________________________________________
38. Example Manager Recommendation
System detects:
Predicted occupancy = 95%

Booking demand = increasing

High-risk cancellations = 18

Deluxe room availability = low
Decision Engine:
Recommendation 1:
Prepare for high occupancy.

Recommendation 2:
Review high-risk bookings.

Recommendation 3:
Review Deluxe room pricing due to increased demand.
________________________________________
39. AI vs ML Responsibilities
This distinction should be very clear.
Machine Learning
Used for:
•	Prediction
•	Probability
•	Forecasting
•	Pattern recognition
LLM
Used for:
•	Natural language
•	Chatbot
•	Personalized explanations
•	Converting structured insights into understandable recommendations
Business Rules
Used for:
•	Deterministic decisions
•	Thresholds
•	Recommendation triggers
________________________________________
40. Core Data Flow
Resort Manager
Booking Data
     ↓
Database
     ↓
ML Model
     ↓
Booking / Occupancy Prediction
     ↓
Decision Engine
     ↓
AI Recommendation
     ↓
Manager Dashboard
________________________________________
Operations Manager
Guest Data
     ↓
Booking History
     ↓
ML Model
     ↓
Preference Prediction
     +
Cancellation Prediction
     ↓
Operations Dashboard
________________________________________
Guest
Guest Question
     ↓
Node.js
     ↓
Guest Profile
     +
Resort Knowledge
     ↓
RAG
     ↓
LLM
     ↓
Personalized Response
________________________________________
41. Database Requirements
The main database tables should be:
users
guests
bookings
rooms
guest_preferences
guest_activities
resort_information
cancellations
service_requests
________________________________________
42. Users
users
-------------------------
id
name
email
password_hash
role
created_at
Roles:
RESORT_MANAGER
OPERATIONS_MANAGER
GUEST
________________________________________
43. Guests
guests
-------------------------
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
created_at
________________________________________
44. Bookings
bookings
-------------------------
id
guest_id
room_id
room_type
booking_date
arrival_date
departure_date
adults
children
adr
deposit_type
booking_channel
customer_type
previous_cancellations
previous_bookings
status
created_at
________________________________________
45. Guest Preferences
guest_preferences
-------------------------
id
guest_id
preference_type
preference_value
confidence
source
Example:
guest_id = 101

preference_type = activity
preference_value = spa
confidence = 0.89
source = predicted
________________________________________
46. Guest Activities
guest_activities
-------------------------
id
guest_id
activity
frequency
last_used
Example:
Spa → 4 visits
Pool → 3 visits
Yoga → 2 visits
________________________________________
47. Resort Knowledge
This table or knowledge store contains information used by the chatbot.
resort_information
-------------------------
id
category
title
content
updated_at
Examples:
Restaurant → Opening Hours
Spa → Services
Pool → Timings
Activity → Yoga Session
Policy → Check-in
________________________________________
48. API Requirements
Resort Manager
GET /api/manager/dashboard

GET /api/manager/booking-forecast

GET /api/manager/occupancy-forecast

GET /api/manager/cancellation-summary

GET /api/manager/recommendations
________________________________________
49. Operations Manager APIs
GET /api/operations/guests

GET /api/operations/guests/:id

GET /api/operations/guests/:id/preferences

GET /api/operations/guests/:id/predictions

GET /api/operations/cancellation-risk
________________________________________
50. Guest APIs
GET /api/guest/profile

GET /api/guest/preferences

POST /api/guest/chat
________________________________________
51. ML APIs
POST /predict/booking

POST /predict/occupancy

POST /predict/cancellation

POST /predict/preferences
________________________________________
52. Booking Prediction Example
Request
{
  "historical_bookings": [...],
  "current_bookings": 175,
  "date": "2026-09-30"
}
Response
{
  "predicted_bookings": 205,
  "predicted_occupancy": 92.4
}
________________________________________
53. Preference Prediction Example
Request
{
  "guest_id": 101,
  "previous_bookings": [...],
  "activities": [...],
  "food_history": [...]
}
Response
{
  "predicted_preferences": [
    {
      "type": "room",
      "value": "Deluxe",
      "confidence": 0.91
    },
    {
      "type": "activity",
      "value": "Spa",
      "confidence": 0.87
    },
    {
      "type": "food",
      "value": "Vegetarian",
      "confidence": 0.95
    }
  ]
}
________________________________________
54. Cancellation Prediction Example
Request
{
  "lead_time": 72,
  "deposit_type": "No Deposit",
  "previous_cancellations": 2,
  "booking_channel": "Online TA",
  "adr": 8500
}
Response
{
  "cancellation_probability": 0.84,
  "risk": "HIGH"
}
________________________________________
55. AI Chatbot API
Request
{
  "guestId": 101,
  "message": "What activity would you recommend for me?"
}
Backend retrieves:
Guest Preferences
+
Guest History
+
Resort Information
Then sends relevant context to the LLM.
________________________________________
56. Chatbot Response
{
  "reply": "Based on your previous interest in spa activities, I recommend the evening spa session."
}
________________________________________
57. Authentication and Authorization
The system should use role-based access.
Resort Manager
Can access:
Manager Dashboard
Booking Prediction
Occupancy Forecast
Overall Recommendations
Operations Manager
Can access:
Guest Information
Guest Preferences
Guest Predictions
Cancellation Prediction
Guest
Can access:
Own Profile
Own Preferences
AI Chatbot
Resort Information
A guest must never be able to access another guest's information.
________________________________________
58. Security Requirements
The system must:
•	Protect authentication credentials
•	Store secrets in environment variables
•	Validate API requests
•	Use role-based authorization
•	Restrict guest data
•	Never expose database credentials
•	Protect LLM API keys
•	Use HTTPS in deployment
•	Avoid exposing unnecessary personal information
________________________________________
59. MVP Scope
For the hackathon, the recommended MVP is:
Resort Manager
P0
•	Dashboard
•	Booking prediction
•	Occupancy prediction
•	Cancellation summary
•	Overall AI recommendations
________________________________________
Operations Manager
P0
•	Guest list
•	Guest profile
•	Guest preferences
•	Preference prediction
•	Cancellation prediction
________________________________________
Guest
P0
•	AI chatbot
•	Resort information
•	Activity recommendations
•	Basic personalization
________________________________________
60. Features Removed From Previous Plan
To keep the new product focused, the following are not core features anymore:
•	Predictive maintenance
•	Autonomous staff optimization
•	Separate revenue-management module
•	Complex operations dashboard
•	Large sentiment-analysis module
•	Full PMS functionality
•	Automated pricing
•	Full booking engine
These can remain future scope.
________________________________________
61. Future Scope
Future versions can add:
Management
•	Advanced revenue optimization
•	Staff optimization
•	Predictive maintenance
•	Real-time alerts
•	Multi-resort analytics
Operations
•	Automated guest service workflows
•	Guest sentiment analysis
•	Service request prioritization
•	Personalized upselling
Guest
•	Booking through chatbot
•	Restaurant reservations
•	Spa booking
•	Activity booking
•	Voice assistant
•	WhatsApp chatbot
•	Multilingual support
________________________________________
62. Hackathon Success Criteria
The MVP should demonstrate three complete user journeys.
Journey 1 — Resort Manager
Manager Login
      ↓
Dashboard
      ↓
Booking Forecast
      ↓
Cancellation Overview
      ↓
AI Recommendations
________________________________________
Journey 2 — Operations Manager
Operations Login
      ↓
Guest List
      ↓
Guest Profile
      ↓
Preferences
      ↓
Predicted Preferences
      ↓
Cancellation Risk
________________________________________
Journey 3 — Guest
Guest Login
      ↓
AI Chatbot
      ↓
Guest asks question
      ↓
System retrieves guest context
      ↓
RAG
      ↓
LLM
      ↓
Personalized answer
________________________________________
63. Strong Demo Scenario
Use one connected scenario during the hackathon.
Suppose the system detects:
Booking demand ↑

Predicted occupancy = 95%

High cancellation bookings = 17

Guest Rahul:
Preferred room = Deluxe
Preferred activity = Spa
Food = Vegetarian
Cancellation probability = 84%
Resort Manager sees:
"Demand is expected to increase and occupancy may reach 95%. Several bookings have elevated cancellation risk. Consider reviewing upcoming booking risk and preparing for high demand."
Operations Manager sees:
"Rahul Sharma has an 84% estimated cancellation probability. If the booking remains active, his predicted preferences are Deluxe room, vegetarian meals and spa activities."
Guest asks:
"What would you recommend for me this evening?"
AI Concierge responds:
"Based on your preferences, I'd recommend the evening spa session. You may also enjoy the poolside relaxation area."
This demonstrates that the same underlying data can serve three different users in three different ways.
________________________________________
64. Product Differentiation
The system is not simply:
"A chatbot for resorts."
It is not simply:
"A hotel dashboard."
It combines:
                    SMART RESORT 360
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
        Prediction     Intelligence     AI Chat
            │              │              │
            ▼              ▼              ▼
        Management     Operations       Guests
The product connects management intelligence, guest intelligence, and personalized AI assistance.
________________________________________
65. Core Technical Philosophy
The system should separate:
Prediction
Machine Learning answers:
"What is likely to happen?"
Intelligence
Data processing answers:
"What does this mean?"
Recommendation
Business rules answer:
"What should the manager consider?"
Conversation
LLM answers:
"How can we communicate this naturally?"
This separation makes the system easier to explain and maintain.
________________________________________
66. Final Product Architecture
                    ┌─────────────────────┐
                    │   SMART RESORT 360  │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼──────────────────────┐
         │                     │                      │
         ▼                     ▼                      ▼
   RESORT MANAGER        OPERATIONS MANAGER         GUEST
         │                     │                      │
         ▼                     ▼                      ▼
 Booking Prediction      Guest Information       AI Chatbot
 Occupancy Forecast      Guest Preferences       Resort Info
 AI Recommendations      Preference Prediction   Activities
 Overall Insights        Cancellation Prediction  Personalization
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               ▼
                         NODE.JS / EXPRESS
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
       PostgreSQL          Python ML             LLM
       / Supabase           FastAPI             + RAG
            │                  │                  │
            │          ┌───────┼────────┐         │
            │          │       │        │         │
            │          ▼       ▼        ▼         │
            │       Booking Cancellation Preference
            │       Forecast Prediction Prediction
            │                                      │
            └──────────────────┬───────────────────┘
                               ▼
                       DECISION / INTELLIGENCE
                              ENGINE
                               │
                               ▼
                       AI RECOMMENDATIONS
________________________________________
67. Final MVP Definition
The Smart Resort 360 MVP consists of three role-specific experiences.
Resort Manager
"Tell me what is happening and what I should pay attention to."
Features:
•	Booking prediction
•	Occupancy forecast
•	Cancellation overview
•	Overall AI recommendations
________________________________________
Operations Manager
"Tell me who my guests are, what they prefer, and what I should prepare for."
Features:
•	Guest information
•	Guest history
•	Guest preferences
•	Preference prediction
•	Cancellation prediction
________________________________________
Guest
"Help me get the most out of my resort experience."
Features:
•	AI chatbot
•	Resort information
•	Activity recommendations
•	Personalized suggestions
________________________________________
68. Core Product Loop
For management:
Data → Prediction → Intelligence → Recommendation → Decision
For operations:
Guest Data → Behavior Analysis → Preference Prediction → Guest Preparation
For guests:
Guest Context → Resort Knowledge → AI → Personalized Assistance
________________________________________
69. Final One-Line Description
Smart Resort 360 is an AI-powered resort platform that predicts booking and guest behavior for management, provides actionable intelligence to operations teams, and gives guests a personalized AI concierge.
70. Final MVP Feature Checklist
Resort Manager
•	Login
•	Manager dashboard
•	Booking prediction
•	Occupancy forecast
•	Cancellation summary
•	Overall AI recommendations
Operations Manager
•	Login
•	Guest list
•	Guest profile
•	Guest history
•	Guest preferences
•	Preference prediction
•	Cancellation prediction
Guest
•	Login
•	AI chatbot
•	Resort information
•	Activity recommendations
•	Personalized responses
Backend
•	Authentication
•	Role-based access
•	PostgreSQL
•	REST APIs
•	ML integration
•	LLM integration
ML
•	Booking/occupancy model
•	Cancellation model
•	Preference prediction model
AI
•	RAG/controlled resort knowledge
•	Guest context
•	Personalized responses
•	Hallucination protection
________________________________________
71. Final Principle
The most important thing to preserve in the hackathon is clarity of roles.
Do not make every user see every feature.
The product should clearly communicate:
RESORT MANAGER
"What is happening to my resort?"

OPERATIONS MANAGER
"What is happening with my guests?"

GUEST
"How can I get the best experience?"
That gives Smart Resort 360 a much clearer product structure and makes the demonstration easier for judges to understand.
---
secondary features
## 13. Feature 7 — Guest Sentiment Analysis

### Priority

**Secondary**

### Objective

Analyze guest reviews to identify overall satisfaction levels, recurring issues, and experience trends across the resort.

### Users

* Resort Manager
* Operations Manager

### Input

* Guest reviews
* Review date
* Guest stay information, where available
* Review source, where available

### Processing Flow

**Guest Reviews**
↓
**NLP / LLM Analysis**
↓
**Sentiment Classification**
↓
**Topic Extraction**
↓
**Aggregated Experience Trends**

### Sentiment Categories

* Positive
* Neutral
* Negative

### Example Topics

* Room
* AC
* Wi-Fi
* Food
* Cleanliness
* Service
* Staff
* Facilities

### Example Output

**Guest Experience Issues**

| Topic       | Trend |
| ----------- | ----: |
| AC          | ↑ 27% |
| Wi-Fi       | ↑ 12% |
| Cleanliness |  ↑ 8% |
| Food        |  ↑ 5% |

The system should allow managers to identify which guest-experience areas are receiving increasing negative feedback.

### Decision Engine Integration

Sentiment trends may be passed to the Decision Engine.

Example:

**Negative AC-related reviews increasing**
→ **Recommendation:** Review AC maintenance and room-service complaints.

The sentiment module should provide evidence from reviews rather than making unsupported operational conclusions.

---

## 14. Feature 8 — Revenue / Pricing Recommendation

### Priority

**Secondary**

### Objective

Recommend room pricing adjustments based on predicted demand, occupancy, historical pricing, and booking trends.

### User


