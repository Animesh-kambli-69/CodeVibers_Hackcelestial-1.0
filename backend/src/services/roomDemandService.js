/**
 * Room Demand Service for Manager Analytics.
 */
const { getTodayString, addDays } = require('../utils/dates');
const { demandLevel } = require('../decision-engine/classify');

class RoomDemandService {
  constructor(roomRepository, bookingRepository) {
    this.roomRepository = roomRepository;
    this.bookingRepository = bookingRepository;
  }

  async getRoomDemands(windowDays = 30) {
    const today = getTodayString();
    const currentWindowEnd = addDays(today, windowDays);
    const previousWindowStart = addDays(today, -windowDays);

    const totalCounts = await this.roomRepository.getRoomCountsByType();
    const currentBooked = await this.bookingRepository.getRoomDemandCounts(today, currentWindowEnd);
    const prevBooked = await this.bookingRepository.getRoomDemandCounts(previousWindowStart, today);

    const roomTypes = ['STANDARD', 'DELUXE', 'SUITE'];

    return roomTypes.map((type) => {
      const total = totalCounts[type] || 0;
      const booked = currentBooked[type] || 0;
      const prev = prevBooked[type] || 0;
      const available = Math.max(0, total - booked);
      const occupancyRate = total > 0 ? (booked / total) * 100 : 0;
      const level = demandLevel(occupancyRate);

      let changePct = null;
      if (prev > 0) {
        changePct = Math.round(((booked - prev) / prev) * 1000) / 10;
      }

      return {
        roomType: type,
        totalRooms: total,
        bookedRooms: booked,
        availableRooms: available,
        occupancyRatePct: Math.round(occupancyRate * 10) / 10,
        demandLevel: level,
        demandChangePct: changePct,
      };
    });
  }
}

module.exports = RoomDemandService;
