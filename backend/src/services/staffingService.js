/**
 * Staffing Service.
 * Implements decision-engine.md §15: Occupancy Forecast -> Expected Workload ->
 * Required Staff -> Available Staff -> Shortage/Surplus -> Recommendation.
 * Required staff is derived from real occupied-room counts; available staff comes
 * from the real staff_members roster — nothing here is mocked.
 */
const STAFFING_CONFIG = require('../decision-engine/config/staffingThresholds');
const { getTodayString } = require('../utils/dates');

const DEPARTMENT_LABELS = {
  FRONT_DESK: 'Front Desk',
  HOUSEKEEPING: 'Housekeeping',
  FOOD_BEVERAGE: 'Food & Beverage',
  SPA_WELLNESS: 'Spa & Wellness',
};

class StaffingService {
  constructor(staffRepository, bookingRepository, config = STAFFING_CONFIG) {
    this.staffRepository = staffRepository;
    this.bookingRepository = bookingRepository;
    this.config = config;
  }

  async getDepartmentStaffing() {
    const today = getTodayString();

    const [occupiedRooms, availableByDept] = await Promise.all([
      this.bookingRepository.countCurrentlyOccupiedRooms(today),
      this.staffRepository.countActiveByDepartment(),
    ]);

    return this.config.departments.map((dept) => {
      const perRoom = this.config.requiredStaffPerOccupiedRoom[dept] || 0;
      const baseline = this.config.baselineRequired[dept] || 0;
      const required = Math.max(baseline, Math.ceil(baseline + occupiedRooms * perRoom));
      const available = availableByDept[dept] || 0;
      const shortage = Math.max(0, required - available);

      let status = 'OK';
      if (shortage > 0) {
        const shortageRatio = required > 0 ? shortage / required : 0;
        status = shortageRatio >= this.config.criticalShortageRatio ? 'CRITICAL' : 'WARNING';
      }

      return {
        department: DEPARTMENT_LABELS[dept] || dept,
        required,
        available,
        shortage,
        status,
      };
    });
  }
}

module.exports = StaffingService;
