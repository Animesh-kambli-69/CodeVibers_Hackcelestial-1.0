/**
 * Guest domain view mappers.
 * Uses explicit allow-lists to guarantee zero data leakage between roles.
 */

function toGuestProfileSelf(guest, user = {}) {
  if (!guest) return null;
  return {
    id: guest.id,
    name: guest.name,
    email: user.email || guest.email,
    phone: guest.phone || null,
    loyaltyTier: guest.loyaltyTier || 'STANDARD',
    totalStays: guest.totalStays || 0,
    specialRequirements: guest.specialRequirements || null,
    createdAt: guest.createdAt,
  };
}

function toGuestPreferenceSelf(pref) {
  if (!pref) return null;
  return {
    preferenceType: pref.preferenceType,
    preferenceValue: pref.preferenceValue,
    source: pref.source,
  };
}

function toGuestBookingSelf(booking) {
  if (!booking) return null;
  return {
    id: booking.id,
    roomNumber: booking.roomNumber || null,
    roomType: booking.roomType,
    checkInDate: booking.arrivalDate,
    checkOutDate: booking.departureDate,
    status: booking.status,
    adults: booking.adults,
    children: booking.children,
    totalNights: booking.totalNights,
    specialRequests: booking.specialRequests || 0,
    bookingDate: booking.bookingDate,
  };
}

function toOperationsGuestListItem(guest, booking, topPref = null, cancellationProb = null) {
  return {
    id: guest.id,
    name: guest.name,
    email: guest.email,
    loyaltyTier: guest.loyaltyTier || 'STANDARD',
    currentStay: booking
      ? {
          bookingId: booking.id,
          roomType: booking.roomType,
          checkInDate: booking.arrivalDate,
          checkOutDate: booking.departureDate,
          status: booking.status,
        }
      : null,
    topPreference: topPref ? topPref.preferenceValue : null,
    cancellationRisk: cancellationProb,
  };
}

module.exports = {
  toGuestProfileSelf,
  toGuestPreferenceSelf,
  toGuestBookingSelf,
  toOperationsGuestListItem,
};
