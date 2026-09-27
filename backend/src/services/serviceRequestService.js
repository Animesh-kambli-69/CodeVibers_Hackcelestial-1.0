/**
 * Guest Service Request Service.
 * Guests raise requests during an active stay (housekeeping, amenities,
 * dining, etc.); Operations works the queue and updates status.
 */
const { NotFoundError, ValidationError } = require('../utils/errors');

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

class ServiceRequestService {
  constructor(serviceRequestRepository, bookingRepository) {
    this.serviceRequestRepository = serviceRequestRepository;
    this.bookingRepository = bookingRepository;
  }

  async createForGuest(guestId, { type, description }) {
    const activeStay = await this.bookingRepository.findActiveCheckedInStay(guestId);
    const roomId = activeStay ? activeStay.roomId : null;

    const created = await this.serviceRequestRepository.create({
      guestId,
      roomId,
      type,
      description: description || null,
    });

    return this._toGuestView(created);
  }

  async listForGuest(guestId) {
    const rows = await this.serviceRequestRepository.listByGuestId(guestId);
    return rows.map((r) => this._toGuestView(r));
  }

  async listForOperations({ status } = {}) {
    const rows = await this.serviceRequestRepository.listAll({ status });
    return rows.map((r) => this._toOperationsView(r));
  }

  async updateStatus(requestId, status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const updated = await this.serviceRequestRepository.updateStatus(requestId, status);
    if (!updated) {
      throw new NotFoundError('Service request not found');
    }
    return this._toOperationsView(updated);
  }

  _toGuestView(row) {
    return {
      id: row.id,
      type: row.type,
      status: row.status,
      description: row.description,
      requestedAt: row.createdAt,
    };
  }

  _toOperationsView(row) {
    return {
      id: row.id,
      guestName: row.guestName || null,
      roomNumber: row.roomNumber || null,
      type: row.type,
      description: row.description,
      status: row.status,
      requestedAt: row.createdAt,
    };
  }
}

module.exports = ServiceRequestService;
