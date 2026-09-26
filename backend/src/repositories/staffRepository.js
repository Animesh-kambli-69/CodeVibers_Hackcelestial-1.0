/**
 * Staff Repository — real roster headcount by department.
 */

class StaffRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async countActiveByDepartment() {
    const query = `
      SELECT department, COUNT(*) as active_count
      FROM staff_members
      WHERE is_active = TRUE
      GROUP BY department;
    `;
    const res = await this.pool.query(query);
    const byDept = {};
    for (const row of res.rows) {
      byDept[row.department] = parseInt(row.active_count, 10);
    }
    return byDept;
  }

  async listByDepartment(department) {
    const query = `
      SELECT id, name, department, role, shift, is_active, hired_at, created_at
      FROM staff_members
      WHERE department = $1
      ORDER BY is_active DESC, name ASC;
    `;
    const res = await this.pool.query(query, [department]);
    return res.rows.map((row) => this._mapRow(row));
  }

  _mapRow(row) {
    return {
      id: row.id,
      name: row.name,
      department: row.department,
      role: row.role,
      shift: row.shift,
      isActive: row.is_active,
      hiredAt: row.hired_at instanceof Date ? row.hired_at.toISOString().split('T')[0] : row.hired_at,
      createdAt: row.created_at,
    };
  }
}

module.exports = StaffRepository;
