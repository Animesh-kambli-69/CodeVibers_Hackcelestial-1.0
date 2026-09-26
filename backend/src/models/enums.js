/**
 * Standard Enums for Smart Resort 360 Backend.
 * Single source of truth corresponding to api.md §2.
 */

const Role = Object.freeze({
  RESORT_MANAGER: 'RESORT_MANAGER',
  OPERATIONS_MANAGER: 'OPERATIONS_MANAGER',
  GUEST: 'GUEST',
});

const RiskLevel = Object.freeze({
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
});

const BookingStatus = Object.freeze({
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
});

const RoomType = Object.freeze({
  STANDARD: 'STANDARD',
  DELUXE: 'DELUXE',
  SUITE: 'SUITE',
});

const RoomStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
});

const RecommendationCategory = Object.freeze({
  OCCUPANCY: 'OCCUPANCY',
  CANCELLATION: 'CANCELLATION',
  REVENUE: 'REVENUE',
  STAFFING: 'STAFFING',
  GUEST_EXPERIENCE: 'GUEST_EXPERIENCE',
  MAINTENANCE: 'MAINTENANCE',
  WEATHER: 'WEATHER',
});

const RecommendationPriority = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
});

const RecommendationStatus = Object.freeze({
  NEW: 'NEW',
  VIEWED: 'VIEWED',
  ACCEPTED: 'ACCEPTED',
  DISMISSED: 'DISMISSED',
});

const PredictionStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  STALE: 'STALE',
  UNAVAILABLE: 'UNAVAILABLE',
});

const PreferenceType = Object.freeze({
  ROOM: 'ROOM',
  FOOD: 'FOOD',
  ACTIVITY: 'ACTIVITY',
});

const PreferenceSource = Object.freeze({
  EXPLICIT: 'EXPLICIT',
  HISTORY: 'HISTORY',
  PREDICTED: 'PREDICTED',
});

const ResortInfoCategory = Object.freeze({
  DINING: 'DINING',
  SPA: 'SPA',
  ACTIVITIES: 'ACTIVITIES',
  FACILITIES: 'FACILITIES',
  POLICIES: 'POLICIES',
  TRANSPORTATION: 'TRANSPORTATION',
});

module.exports = {
  Role,
  RiskLevel,
  BookingStatus,
  RoomType,
  RoomStatus,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
  PredictionStatus,
  PreferenceType,
  PreferenceSource,
  ResortInfoCategory,
};
