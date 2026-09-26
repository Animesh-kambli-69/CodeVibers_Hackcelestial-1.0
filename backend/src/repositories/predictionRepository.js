/**
 * Prediction Repository for caching ML inference results.
 */

class PredictionRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findLatest(predictionType, entityId = null) {
    let query;
    let params;

    if (entityId) {
      query = `
        SELECT id, prediction_type, entity_id, prediction_value, risk_level, model_version, payload, predicted_for, created_at
        FROM predictions
        WHERE prediction_type = $1 AND entity_id = $2
        ORDER BY created_at DESC
        LIMIT 1;
      `;
      params = [predictionType, entityId];
    } else {
      query = `
        SELECT id, prediction_type, entity_id, prediction_value, risk_level, model_version, payload, predicted_for, created_at
        FROM predictions
        WHERE prediction_type = $1 AND entity_id IS NULL
        ORDER BY created_at DESC
        LIMIT 1;
      `;
      params = [predictionType];
    }

    const res = await this.pool.query(query, params);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  async save({ predictionType, entityId = null, predictionValue = null, riskLevel = null, modelVersion = null, payload = null, predictedFor = null }) {
    const query = `
      INSERT INTO predictions (
        prediction_type, entity_id, prediction_value, risk_level, model_version, payload, predicted_for, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW()
      )
      RETURNING *;
    `;
    const res = await this.pool.query(query, [
      predictionType,
      entityId,
      predictionValue,
      riskLevel,
      modelVersion,
      payload ? JSON.stringify(payload) : null,
      predictedFor,
    ]);

    return this._mapRow(res.rows[0]);
  }

  _mapRow(row) {
    return {
      id: row.id,
      predictionType: row.prediction_type,
      entityId: row.entity_id,
      predictionValue: row.prediction_value !== null ? parseFloat(row.prediction_value) : null,
      riskLevel: row.risk_level,
      modelVersion: row.model_version,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
      predictedFor: row.predicted_for instanceof Date ? row.predicted_for.toISOString().split('T')[0] : row.predicted_for,
      createdAt: row.created_at,
    };
  }
}

module.exports = PredictionRepository;
