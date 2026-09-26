/**
 * Weather Repository — persists weather snapshots as a durable cache so the
 * Digital Twin can degrade gracefully (AVAILABLE → STALE → UNAVAILABLE) when
 * the live weather API is unreachable, mirroring predictionRepository's role
 * for ML forecasts.
 */

class WeatherRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async saveSnapshot({
    source = 'open-meteo',
    latitude,
    longitude,
    isForecast = false,
    forecastDate = null,
    temperatureC = null,
    feelsLikeC = null,
    precipitationMm = null,
    windSpeedKmh = null,
    weatherCode = null,
    condition = null,
    raw = null,
  }) {
    const query = `
      INSERT INTO weather_snapshots (
        source, latitude, longitude, is_forecast, forecast_date,
        temperature_c, feels_like_c, precipitation_mm, wind_speed_kmh, weather_code, condition, raw, captured_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW())
      RETURNING *;
    `;
    const res = await this.pool.query(query, [
      source,
      latitude,
      longitude,
      isForecast,
      forecastDate,
      temperatureC,
      feelsLikeC,
      precipitationMm,
      windSpeedKmh,
      weatherCode,
      condition,
      raw ? JSON.stringify(raw) : null,
    ]);
    return this._mapRow(res.rows[0]);
  }

  async saveBatch(snapshots = []) {
    const results = [];
    for (const s of snapshots) {
      results.push(await this.saveSnapshot(s));
    }
    return results;
  }

  async findLatestCurrent() {
    const query = `
      SELECT * FROM weather_snapshots
      WHERE is_forecast = FALSE
      ORDER BY captured_at DESC
      LIMIT 1;
    `;
    const res = await this.pool.query(query);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async findLatestForecast(days = 7) {
    const query = `
      SELECT DISTINCT ON (forecast_date) *
      FROM weather_snapshots
      WHERE is_forecast = TRUE
      ORDER BY forecast_date ASC, captured_at DESC
      LIMIT $1;
    `;
    const res = await this.pool.query(query, [days]);
    return res.rows.map((r) => this._mapRow(r));
  }

  _mapRow(row) {
    return {
      id: row.id,
      source: row.source,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      isForecast: row.is_forecast,
      forecastDate: row.forecast_date instanceof Date ? row.forecast_date.toISOString().split('T')[0] : row.forecast_date,
      temperatureC: row.temperature_c !== null ? parseFloat(row.temperature_c) : null,
      feelsLikeC: row.feels_like_c !== null ? parseFloat(row.feels_like_c) : null,
      precipitationMm: row.precipitation_mm !== null ? parseFloat(row.precipitation_mm) : null,
      windSpeedKmh: row.wind_speed_kmh !== null ? parseFloat(row.wind_speed_kmh) : null,
      weatherCode: row.weather_code,
      condition: row.condition,
      raw: typeof row.raw === 'string' ? JSON.parse(row.raw) : row.raw,
      capturedAt: row.captured_at,
    };
  }
}

module.exports = WeatherRepository;
