/**
 * ML Service translation and mapping constants.
 * Isolated to ensure only the ML adapter deals with ML internal formats.
 */
const ML_MAPPING = Object.freeze({
  // ADR Conversion: INR to H1 Model Scale (EUR ~90 INR/unit)
  ADR_INR_PER_UNIT: 90,

  // Meal Plan Translation from ML labels to human-readable strings
  MEAL_PLANS: {
    BB: 'Bed & Breakfast',
    HB: 'Half Board',
    FB: 'Full Board',
    SC: null, // Self-catering / Undefined dropped
    Undefined: null,
  },

  // Proposed Room Type Mapping (Letter code -> Public RoomType enum)
  ROOM_TYPE_MAP: {
    A: 'STANDARD',
    B: 'STANDARD',
    C: 'STANDARD',
    D: 'DELUXE',
    E: 'DELUXE',
    F: 'DELUXE',
    G: 'SUITE',
    H: 'SUITE',
    L: 'SUITE',
    P: 'SUITE',
  },

  // PRD §20 readable factors mapping
  FACTOR_LABELS: {
    lead_time: 'Lead Time',
    previous_cancellations: 'Previous Cancellations',
    booking_channel: 'Booking Channel',
    deposit_type: 'Deposit Type',
    adr: 'Average Daily Rate',
    total_of_special_requests: 'Special Requests',
    stays_in_weekend_nights: 'Weekend Nights',
    stays_in_week_nights: 'Week Nights',
  },
});

module.exports = ML_MAPPING;
