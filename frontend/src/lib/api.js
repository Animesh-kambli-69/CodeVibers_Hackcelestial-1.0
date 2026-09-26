import {
  managerDashboard,
  bookingForecast,
  occupancyForecast,
  cancellationSummary,
  roomDemand,
  recommendations,
  pricingRecommendations,
  sentiment
} from '../mocks/manager.js';

import {
  operationsDashboard,
  guestList,
  guestProfiles,
  cancellationRiskList,
  staffingData,
  serviceRequestsData
} from '../mocks/operations.js';

import {
  guestProfile,
  guestPreferences,
  guestBookings,
  resortInfoCatalog,
  chatMockResponses
} from '../mocks/guest.js';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

async function resolveMock(path, init = {}) {
  // Simulate network latency (80ms)
  await new Promise((resolve) => setTimeout(resolve, 80));

  const cleanPath = path.split('?')[0];

  if (cleanPath === '/manager/dashboard') return { data: managerDashboard };
  if (cleanPath === '/manager/booking-forecast') return { data: bookingForecast };
  if (cleanPath === '/manager/occupancy-forecast') return { data: occupancyForecast };
  if (cleanPath === '/manager/cancellation-summary') return { data: cancellationSummary };
  if (cleanPath === '/manager/room-demand') return { data: roomDemand };
  if (cleanPath === '/manager/recommendations') return { data: recommendations };
  if (cleanPath === '/manager/pricing-recommendations') return { data: pricingRecommendations };
  if (cleanPath === '/manager/sentiment') return { data: sentiment };

  if (cleanPath === '/operations/dashboard') return { data: operationsDashboard };
  if (cleanPath === '/operations/guests') return { data: guestList };
  if (cleanPath.startsWith('/operations/guests/')) {
    const parts = cleanPath.split('/');
    const guestId = parts[parts.length - 1] || 'g-101';
    const profile = guestProfiles[guestId] || guestProfiles['g-101'];
    return { data: profile };
  }
  if (cleanPath === '/operations/cancellation-risk') return { data: cancellationRiskList };
  if (cleanPath === '/operations/staffing') return { data: staffingData };
  if (cleanPath === '/operations/service-requests') return { data: serviceRequestsData };

  if (cleanPath === '/guest/profile') return { data: guestProfile };
  if (cleanPath === '/guest/preferences') return { data: guestPreferences };
  if (cleanPath === '/guest/bookings') return { data: guestBookings };
  if (cleanPath === '/guest/resort-info') return { data: resortInfoCatalog };
  if (cleanPath === '/guest/service-requests') {
    if (init.method === 'POST') {
      const body = init.body ? JSON.parse(init.body) : {};
      const newReq = {
        id: `req-${Date.now().toString().slice(-4)}`,
        guestName: guestProfile.name,
        roomNumber: guestProfile.currentStay.roomNumber,
        type: body.type,
        status: 'PENDING',
        description: body.description,
        requestedAt: 'Just now',
        isGuestView: true
      };
      // Push to the global operations mock array so it appears on the Ops Dashboard!
      serviceRequestsData.unshift(newReq);
      return { data: newReq };
    } else {
      // GET requests for the guest
      const guestReqs = serviceRequestsData.filter(r => r.guestName === guestProfile.name);
      return { data: guestReqs };
    }
  }
  if (cleanPath === '/guest/chat') {
    const body = init.body ? JSON.parse(init.body) : {};
    const text = (body.message || '').toLowerCase();
    if (text.includes('helipad') || text.includes('flight') || text.includes('airport landing')) {
      return { data: chatMockResponses.ungroundedFallback };
    }
    return { data: chatMockResponses.defaultGrounded };
  }

  // Fallback default response
  return { status: 'ok', message: 'Mock response placeholder', path };
}

export async function apiRequest(path, init = {}) {
  const cleanPath = path.split('?')[0];
  const phase2Endpoints = [
    '/manager/pricing-recommendations',
    '/manager/sentiment',
    '/operations/staffing',
    '/operations/service-requests',
    '/guest/service-requests'
  ];

  if (import.meta.env.VITE_USE_MOCKS === 'true' || phase2Endpoints.includes(cleanPath)) {
    return resolveMock(path, init);
  }

  const token = localStorage.getItem('resortToken');
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...body.error };
  return body;
}
