/**
 * ML Service Adapter.
 * The ONLY file in the backend that knows ML internal URLs, snake_case payloads, and mappings.
 * Connects to the FastAPI service at ML_SERVICE_URL (/api/v1/ml).
 */
const env = require('../config/env');
const appConfig = require('../config/app');
const ML_MAPPING = require('../config/mlMapping');
const { request } = require('../utils/http');
const { MlUnavailableError } = require('../utils/errors');
const logger = require('../utils/logger');

class MlService {
  constructor(baseUrl = env.ML_SERVICE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.cachedVersions = null;
  }

  async health() {
    try {
      const res = await request(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: appConfig.ML.HEALTH_TIMEOUT_MS,
      });

      if (!res.ok) {
        return { ok: false, modelsLoaded: false };
      }

      const data = await res.json();
      return {
        ok: data.status === 'ok',
        modelsLoaded: !!data.models_loaded,
      };
    } catch (err) {
      return { ok: false, modelsLoaded: false };
    }
  }

  async getModelVersions() {
    if (this.cachedVersions) {
      return this.cachedVersions;
    }

    try {
      const res = await request(`${this.baseUrl}/data/summary`, {
        method: 'GET',
        timeout: appConfig.ML.TIMEOUT_MS,
      });

      if (!res.ok) {
        return { cancellation: null, occupancy: null, preferences: null };
      }

      const data = await res.json();
      this.cachedVersions = {
        cancellation: data.cancellation ? `cancellation@${data.cancellation.version || '1.0.0'}` : null,
        occupancy: data.occupancy ? `occupancy@${data.occupancy.version || '1.0.0'}` : null,
        preferences: data.guest_preferences ? `guest_preferences@${data.guest_preferences.version || '1.0.0'}` : null,
      };
      return this.cachedVersions;
    } catch (err) {
      logger.warn({ error: err.message }, 'Failed to fetch ML model versions metadata');
      return { cancellation: null, occupancy: null, preferences: null };
    }
  }

  async forecastOccupancy(days = 7) {
    try {
      const res = await request(`${this.baseUrl}/predict/occupancy?days=${days}`, {
        method: 'GET',
        timeout: appConfig.ML.TIMEOUT_MS,
      });

      if (!res.ok) {
        throw new MlUnavailableError(`ML occupancy forecast failed with status ${res.status}`);
      }

      const data = await res.json();
      const predictions = (data.predictions || []).map((p) => ({
        date: p.date,
        predictedBookings: Math.round((p.predicted_confirmed_bookings || 0) * 10) / 10,
        predictedOccupancy: Math.min(100, Math.max(0, Math.round((p.predicted_occupancy_rate || 0) * 10) / 10)),
        demandLevel: p.demand_level,
        dayOfWeek: p.day_of_week,
      }));

      return {
        forecastDays: data.forecast_days || predictions.length,
        predictions,
      };
    } catch (err) {
      if (err instanceof MlUnavailableError) throw err;
      throw new MlUnavailableError(`ML Service unavailable: ${err.message}`);
    }
  }

  async scoreCancellation(booking) {
    try {
      // Scale ADR to H1 dataset scale
      const scaledAdr = booking.adr ? booking.adr / ML_MAPPING.ADR_INR_PER_UNIT : 100;

      // Extract arrival month name
      const arrivalDate = new Date(booking.arrivalDate);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const arrivalMonth = monthNames[arrivalDate.getUTCMonth()] || 'January';

      // Calculate lead time in days
      const leadTime = Math.max(0, Math.round((new Date(booking.arrivalDate) - new Date(booking.bookingDate)) / (1000 * 60 * 60 * 24)));

      const payload = {
        lead_time: leadTime,
        adr: scaledAdr,
        adults: booking.adults || 1,
        children: booking.children || 0,
        babies: booking.babies || 0,
        stays_in_weekend_nights: booking.weekendNights || 0,
        stays_in_week_nights: booking.weekNights || 0,
        previous_cancellations: booking.previousCancellations || 0,
        previous_bookings_not_canceled: booking.previousBookings || 0,
        booking_changes: booking.bookingChanges || 0,
        required_car_parking_spaces: booking.requiredCarParkingSpaces || 0,
        total_of_special_requests: booking.specialRequests || 0,
        is_repeated_guest: (booking.previousBookings || 0) > 0 ? 1 : 0,
        room_type_changed: 0,
        market_segment: booking.bookingChannel || 'Direct',
        distribution_channel: booking.distributionChannel || 'Direct',
        deposit_type: booking.depositType || 'No Deposit',
        customer_type: booking.customerType || 'Transient',
        arrival_date_month: arrivalMonth,
      };

      if (booking.meal) payload.meal = booking.meal;
      if (booking.country) payload.country = booking.country;
      if (booking.reservedRoomTypeCode) payload.reserved_room_type = booking.reservedRoomTypeCode;

      const res = await request(`${this.baseUrl}/predict/cancellation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: appConfig.ML.TIMEOUT_MS,
      });

      if (!res.ok) {
        throw new MlUnavailableError(`Cancellation scoring failed with status ${res.status}`);
      }

      const data = await res.json();
      return {
        probability: data.cancellation_probability,
        riskScorePct: data.risk_score_pct,
        topRiskFactors: data.top_risk_factors || [],
      };
    } catch (err) {
      if (err instanceof MlUnavailableError) throw err;
      throw new MlUnavailableError(`ML Cancellation Service unavailable: ${err.message}`);
    }
  }

  async predictGuestPreferences(guestContext) {
    try {
      const scaledAdr = guestContext.adr ? guestContext.adr / ML_MAPPING.ADR_INR_PER_UNIT : 100;
      const payload = {
        adults: guestContext.adults || 1,
        children: guestContext.children || 0,
        babies: guestContext.babies || 0,
        total_stays: guestContext.totalStays || 1,
        stays_in_weekend_nights: guestContext.weekendNights || 0,
        stays_in_week_nights: guestContext.weekNights || 0,
        adr: scaledAdr,
        total_of_special_requests: guestContext.specialRequests || 0,
        required_car_parking_spaces: guestContext.requiredCarParkingSpaces || 0,
        country: guestContext.country || 'PRT',
        market_segment: guestContext.bookingChannel || 'Direct',
        customer_type: guestContext.customerType || 'Transient',
      };

      const res = await request(`${this.baseUrl}/predict/guest-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: appConfig.ML.TIMEOUT_MS,
      });

      if (!res.ok) {
        throw new MlUnavailableError(`Preference prediction failed with status ${res.status}`);
      }

      const data = await res.json();
      const predictions = [];

      // Meal Plan Translation (FOOD)
      if (data.predicted_meal_plan && ML_MAPPING.MEAL_PLANS[data.predicted_meal_plan]) {
        predictions.push({
          preferenceType: 'FOOD',
          preferenceValue: ML_MAPPING.MEAL_PLANS[data.predicted_meal_plan],
          confidence: data.meal_confidence || 0.8,
          source: 'PREDICTED',
        });
      }

      // Room Type Translation (ROOM)
      if (data.predicted_room_type && ML_MAPPING.ROOM_TYPE_MAP[data.predicted_room_type]) {
        predictions.push({
          preferenceType: 'ROOM',
          preferenceValue: ML_MAPPING.ROOM_TYPE_MAP[data.predicted_room_type],
          confidence: data.room_confidence || 0.7,
          source: 'PREDICTED',
        });
      }

      return predictions;
    } catch (err) {
      if (err instanceof MlUnavailableError) throw err;
      throw new MlUnavailableError(`ML Preference Service unavailable: ${err.message}`);
    }
  }
}

module.exports = MlService;
