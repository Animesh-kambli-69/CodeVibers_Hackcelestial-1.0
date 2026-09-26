/**
 * Digital Twin Repository — persists what-if simulation scenarios so a manager
 * can revisit or compare past simulations. A scenario stores full before/after
 * JSONB snapshots and is otherwise immutable (simulations are read-only over
 * real resort data — see digitalTwinService.js).
 */

class DigitalTwinRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async saveScenario({
    createdBy = null,
    label = null,
    scenarioParams,
    baselineState,
    simulatedState,
    impactSummary,
    recommendations = [],
    narrative = null,
  }) {
    const query = `
      INSERT INTO digital_twin_scenarios (
        created_by, label, scenario_params, baseline_state, simulated_state, impact_summary, recommendations, narrative, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW())
      RETURNING *;
    `;
    const res = await this.pool.query(query, [
      createdBy,
      label,
      JSON.stringify(scenarioParams),
      JSON.stringify(baselineState),
      JSON.stringify(simulatedState),
      JSON.stringify(impactSummary),
      JSON.stringify(recommendations),
      narrative,
    ]);
    return this._mapRow(res.rows[0]);
  }

  async findRecent(limit = 10) {
    const query = `
      SELECT * FROM digital_twin_scenarios
      ORDER BY created_at DESC
      LIMIT $1;
    `;
    const res = await this.pool.query(query, [limit]);
    return res.rows.map((r) => this._mapRow(r));
  }

  async findById(id) {
    const query = `SELECT * FROM digital_twin_scenarios WHERE id = $1;`;
    const res = await this.pool.query(query, [id]);
    if (res.rows.length === 0) return null;
    return this._mapRow(res.rows[0]);
  }

  _parse(v) {
    return typeof v === 'string' ? JSON.parse(v) : v;
  }

  _mapRow(row) {
    return {
      id: row.id,
      createdBy: row.created_by,
      label: row.label,
      scenarioParams: this._parse(row.scenario_params),
      baselineState: this._parse(row.baseline_state),
      simulatedState: this._parse(row.simulated_state),
      impactSummary: this._parse(row.impact_summary),
      recommendations: this._parse(row.recommendations),
      narrative: row.narrative,
      createdAt: row.created_at,
    };
  }
}

module.exports = DigitalTwinRepository;
