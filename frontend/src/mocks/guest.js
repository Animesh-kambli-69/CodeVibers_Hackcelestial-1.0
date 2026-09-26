// ─── Guest Role Mock Data ───
// Private & personalized guest view (Rahul Sharma)

export const guestProfile = {
  id: 'g-101',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 98765 43210',
  loyaltyTier: 'Gold Member',
  currentStay: {
    roomType: 'Deluxe Room',
    roomNumber: '214',
    checkIn: '2026-09-28',
    checkOut: '2026-10-01',
    nights: 3,
    status: 'CONFIRMED'
  }
};

export const guestPreferences = [
  { type: 'Wellness', value: 'Evening Spa Sessions', sourceLabel: 'Your Stated Preference' },
  { type: 'Dining', value: 'Vegetarian Cuisine', sourceLabel: 'Your Stated Preference' },
  { type: 'Leisure', value: 'Infinity Pool & Lounge', sourceLabel: 'Based on Past Stays' }
];

export const guestBookings = [
  {
    id: 'bk-9041',
    resortName: 'Smart Resort 360 - Goa Sanctuary',
    dates: '28 Sep 2026 – 01 Oct 2026',
    roomType: 'Deluxe Room',
    status: 'UPCOMING',
    guests: '2 Adults'
  },
  {
    id: 'bk-8102',
    resortName: 'Smart Resort 360 - Goa Sanctuary',
    dates: '12 Jan 2026 – 15 Jan 2026',
    roomType: 'Deluxe Room',
    status: 'COMPLETED',
    guests: '2 Adults'
  }
];

export const resortInfoCatalog = [
  {
    id: 'info-1',
    category: 'Spa',
    title: 'Ananda Ayurvedic Spa & Wellness',
    summary: 'Signature herbal treatments, couples massage, and evening relaxation therapy.',
    timings: '08:00 AM – 09:00 PM',
    location: 'Wellness Wing, Floor 1'
  },
  {
    id: 'info-2',
    category: 'Pool',
    title: 'Horizon Infinity Pool & Sun Deck',
    summary: 'Temperature-controlled infinity pool overlooking the ocean with poolside beverage service.',
    timings: '06:00 AM – 10:00 PM',
    location: 'Beachfront Deck'
  },
  {
    id: 'info-3',
    category: 'Restaurants',
    title: 'Saffron Fine Dining & Veg Kitchen',
    summary: 'Organic farm-to-table vegetarian delicacies prepared by Executive Chef Anand.',
    timings: '07:00 AM – 11:00 PM',
    location: 'Main Pavilion'
  },
  {
    id: 'info-4',
    category: 'Activities',
    title: 'Sunset Beach Yoga & Meditation',
    summary: 'Guided mindfulness and yoga sessions on the quiet North Cove beach.',
    timings: '05:30 PM – 06:30 PM (Daily)',
    location: 'North Cove Beach'
  }
];

export const chatMockResponses = {
  defaultGrounded: {
    conversationId: "conv-9901",
    reply: {
      id: "reply-1",
      content: "Welcome Rahul! For a relaxing evening, I highly recommend our Sunset Yoga session at North Cove Beach at 5:30 PM, followed by an Ayurvedic Spa session. We also have delicious organic vegetarian dining at Saffron Fine Dining open until 11:00 PM.",
      grounded: true,
      usedPreferences: ["Vegetarian", "Spa"],
      sources: [
        { id: "info-1", title: "Ananda Ayurvedic Spa & Wellness", category: "Spa" },
        { id: "info-3", title: "Saffron Fine Dining & Veg Kitchen", category: "Restaurants" },
        { id: "info-4", title: "Sunset Beach Yoga & Meditation", category: "Activities" }
      ]
    }
  },
  ungroundedFallback: {
    conversationId: "conv-9901",
    reply: {
      id: "reply-2",
      content: "I don't have verified details about a helipad at the resort in our resort guide. Please check directly with our Front Desk concierge team for special transport arrangements.",
      grounded: false,
      usedPreferences: [],
      sources: []
    }
  }
};
