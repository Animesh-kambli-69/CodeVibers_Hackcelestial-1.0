const { getPool } = require('../src/config/database');
const { getTodayString } = require('../src/utils/dates');

async function seedAllMasterData() {
  const pool = getPool();
  const today = getTodayString();

  console.log(`[MASTER SEEDER] Initializing full resort database population anchored around ${today}...`);

  // Fetch reference IDs
  const usersRes = await pool.query(`SELECT id, email, role FROM users`);
  const guestsRes = await pool.query(`SELECT id, name, email FROM guests`);
  const roomsRes = await pool.query(`SELECT id, room_number, room_type FROM rooms`);
  const bookingsRes = await pool.query(`SELECT id, guest_id, room_id, status, arrival_date FROM bookings`);

  const managerUser = usersRes.rows.find(u => u.role === 'RESORT_MANAGER') || usersRes.rows[0];
  const guests = guestsRes.rows;
  const rooms = roomsRes.rows;
  const bookings = bookingsRes.rows;

  console.log(`Found ${guests.length} guests, ${rooms.length} rooms, ${bookings.length} bookings.`);

  // 1. RECOMMENDATIONS
  console.log('Seeding AI recommendations...');
  await pool.query(`DELETE FROM recommendations`);
  
  const recs = [
    {
      category: 'PRICING',
      title: 'Surge Pricing for Weekend Deluxe Suites',
      reason: 'Predicted occupancy exceeds 88% on Friday and Saturday due to regional holiday demand.',
      suggested_action: 'Increase Deluxe and Suite ADR by 12% ($45/night) to optimize RevPAR without impacting conversion.',
      priority: 'HIGH',
      confidence: 0.94,
      status: 'NEW',
      dedup_key: 'rec-pricing-weekend-surge-01',
      source_data: { forecastDemand: 92, currentADR: 280, proposedADR: 315 }
    },
    {
      category: 'STAFFING',
      title: 'Increase Housekeeping Roster for 18 Expected Arrivals',
      reason: 'Turnover volume tomorrow peaks between 11:00 AM and 2:00 PM with 16 check-outs and 18 arrivals.',
      suggested_action: 'Deploy 4 additional housekeeping team members to ensure all Deluxe Lagoon Villas are staged prior to 2:00 PM.',
      priority: 'HIGH',
      confidence: 0.91,
      status: 'NEW',
      dedup_key: 'rec-staffing-turnover-02',
      source_data: { expectedTurnovers: 34, peakHour: '12:30 PM' }
    },
    {
      category: 'OPERATIONS',
      title: 'Prepare Indoor Dining Contingency for Afternoon Rain Forecast',
      reason: 'Precipitation forecast shows 75% probability of 18mm rainfall between 4:00 PM and 7:00 PM.',
      suggested_action: 'Shift Terrace Bar reservations to the covered Ocean Atrium and prep weatherized patio canopies.',
      priority: 'HIGH',
      confidence: 0.89,
      status: 'NEW',
      dedup_key: 'rec-weather-indoor-dining-03',
      source_data: { precipitationMm: 18.5, affectedZones: ['Outdoor Terrace', 'Beach Bar'] }
    },
    {
      category: 'OCCUPANCY',
      title: 'Re-balance Standard vs Deluxe Room Allocation',
      reason: 'Standard Garden rooms are 100% booked for next week with 14 pending requests, while Deluxe has 12 unsold units.',
      suggested_action: 'Offer complimentary room upgrades to high-loyalty Platinum guests in Standard rooms to free up entry-tier inventory.',
      priority: 'MEDIUM',
      confidence: 0.88,
      status: 'NEW',
      dedup_key: 'rec-inventory-upgrade-04',
      source_data: { standardOccupancy: 100, deluxeAvailable: 12 }
    },
    {
      category: 'GUEST_EXPERIENCE',
      title: 'Proactive VIP Welcome Gift for Returning Platinum Guests',
      reason: '3 VIP Platinum loyalty members arriving today with combined historic spend exceeding $28,000.',
      suggested_action: 'Arrange organic fruit platter, chilled artisanal sparkling wine, and personalized welcome notes from General Manager.',
      priority: 'MEDIUM',
      confidence: 0.96,
      status: 'NEW',
      dedup_key: 'rec-guest-vip-amenity-05',
      source_data: { arrivingVips: 3, tier: 'PLATINUM' }
    },
    {
      category: 'CANCELLATION',
      title: 'High-Risk Booking Engagement for 4 OTA Reservations',
      reason: 'ML Model flags 4 non-deposit OTA reservations with >70% probability of cancellation.',
      suggested_action: 'Send automated welcome email with prepaid breakfast upgrade incentive to secure confirmation.',
      priority: 'HIGH',
      confidence: 0.87,
      status: 'NEW',
      dedup_key: 'rec-cancel-engage-06',
      source_data: { atRiskCount: 4, revenueAtRisk: 3400 }
    },
    {
      category: 'REVENUE',
      title: 'Last-Minute Discount Incentive for Midweek Bungalows',
      reason: 'Wednesday occupancy dipping to 62% in Private Pool Bungalows.',
      suggested_action: 'Deploy 15% promotional direct email offer to local loyalty database members within 200km.',
      priority: 'MEDIUM',
      confidence: 0.83,
      status: 'VIEWED',
      dedup_key: 'rec-pricing-midweek-promo-07',
      source_data: { targetOccupancy: 78, gap: 16 }
    },
    {
      category: 'STAFFING',
      title: 'Schedule Front Desk Multilingual Concierge Support',
      reason: 'Upcoming cohort includes 8 international arrivals from Germany and Japan.',
      suggested_action: 'Assign multilingual guest relations officers during peak arrival hours (3:00 PM - 6:00 PM).',
      priority: 'LOW',
      confidence: 0.86,
      status: 'ACCEPTED',
      dedup_key: 'rec-staffing-multilingual-08',
      source_data: { internationalGuestCount: 8 }
    },
    {
      category: 'MAINTENANCE',
      title: 'Scheduled Filter Replacement for North Lagoon Villas',
      reason: 'Preventative 90-day maintenance cycle due on Villas 101 to 108.',
      suggested_action: 'Perform maintenance during low occupancy window (11:00 AM - 1:00 PM).',
      priority: 'LOW',
      confidence: 0.82,
      status: 'NEW',
      dedup_key: 'rec-maintenance-lagoon-09',
      source_data: { unitsCount: 8 }
    }
  ];

  for (const r of recs) {
    await pool.query(`
      INSERT INTO recommendations (
        category, title, reason, suggested_action, priority, confidence, status, dedup_key, source_data, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    `, [r.category, r.title, r.reason, r.suggested_action, r.priority, r.confidence, r.status, r.dedup_key, JSON.stringify(r.source_data)]);
  }

  // 2. SERVICE REQUESTS
  console.log('Seeding service requests...');
  await pool.query(`DELETE FROM service_requests`);

  const requestTemplates = [
    { type: 'Housekeeping', desc: 'Extra hypoallergenic pillows and Egyptian cotton linen refresh', status: 'IN_PROGRESS' },
    { type: 'Dining', desc: 'Champagne and artisanal cheese platter delivery for sunset celebration', status: 'PENDING' },
    { type: 'Luggage', desc: 'Luggage assistance for departure checkout at Villa 204', status: 'COMPLETED' },
    { type: 'Maintenance', desc: 'Balcony jacuzzi temperature calibration requested to 38°C', status: 'IN_PROGRESS' },
    { type: 'Concierge', desc: 'Private catamaran island snorkeling tour reservation for 4 guests', status: 'PENDING' },
    { type: 'Spa', desc: 'Couple Ayurvedic deep tissue massage scheduling for 5:30 PM', status: 'COMPLETED' },
    { type: 'Housekeeping', desc: 'Daily turn-down service with lavender essential oil mist', status: 'COMPLETED' },
    { type: 'Dining', desc: 'Vegan gluten-free breakfast set delivery to suite at 8:00 AM', status: 'PENDING' },
    { type: 'Amenities', desc: 'Complimentary high-speed HDMI connection and conference speaker for suite', status: 'COMPLETED' },
    { type: 'Transportation', desc: 'Luxury airport limousine transfer booking for 2:30 PM flight', status: 'PENDING' },
    { type: 'Maintenance', desc: 'Air conditioning whisper-mode adjustment in master bedroom', status: 'COMPLETED' },
    { type: 'Housekeeping', desc: 'Fresh pool towels and organic sunscreen kit refresh for private deck', status: 'IN_PROGRESS' }
  ];

  for (let i = 0; i < requestTemplates.length; i++) {
    const t = requestTemplates[i];
    const guestId = guests[i % guests.length].id;
    const roomId = rooms[i % rooms.length].id;

    await pool.query(`
      INSERT INTO service_requests (
        guest_id, room_id, type, description, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${i * 3} HOURS', NOW())
    `, [guestId, roomId, t.type, t.desc, t.status]);
  }

  // 3. SOCIAL SIGNALS
  console.log('Seeding social signals...');
  await pool.query(`DELETE FROM social_signals`);

  const signals = [
    {
      source: 'TripAdvisor',
      query: 'Smart Resort 360',
      title: 'Unbelievable sunset view from the Deluxe Lagoon Villa. Butler service was world-class!',
      author: 'TravelerLover_99',
      sentiment: 'POSITIVE',
      weather_related: false
    },
    {
      source: 'Google Reviews',
      query: 'Smart Resort 360 Spa',
      title: 'Ayurvedic massage at the sanctuary spa was pure bliss after a long flight. 5/5 stars.',
      author: 'Samantha W.',
      sentiment: 'POSITIVE',
      weather_related: false
    },
    {
      source: 'Reddit',
      query: 'Resort Weather Travel',
      title: 'Monsoon showers in the afternoon made the infinity pool look breathtaking. Cozy rainy vibes.',
      author: 'Wanderlust_Nomad',
      sentiment: 'POSITIVE',
      weather_related: true
    },
    {
      source: 'Twitter/X',
      query: 'Smart Resort 360 dining',
      title: 'Michelin-starred tasting menu at Ocean Breeze exceeded all expectations. The tuna tartare is a must-try.',
      author: '@FoodieGlobe',
      sentiment: 'POSITIVE',
      weather_related: false
    },
    {
      source: 'Reddit',
      query: 'Coastal weather alert',
      title: 'High wind gusts reported near the north bay today, ferry charters delayed until 3 PM.',
      author: 'CoastalWatch',
      sentiment: 'NEUTRAL',
      weather_related: true
    },
    {
      source: 'Google Reviews',
      query: 'Smart Resort 360',
      title: 'Check-in was seamless and the AI concierge app gave accurate recommendations for reef snorkeling.',
      author: 'Rajiv M.',
      sentiment: 'POSITIVE',
      weather_related: false
    },
    {
      source: 'TripAdvisor',
      query: 'Smart Resort 360 breakfast',
      title: 'Abundant breakfast buffet with fresh coconut water and tropical fruits. Very attentive staff.',
      author: 'Elena_Global',
      sentiment: 'POSITIVE',
      weather_related: false
    },
    {
      source: 'Twitter/X',
      query: 'Resort catamaran tour',
      title: 'Sunset catamaran cruise was the highlight of our vacation. Crystal clear waters!',
      author: '@OceanExplorer',
      sentiment: 'POSITIVE',
      weather_related: true
    }
  ];

  for (let i = 0; i < signals.length; i++) {
    const s = signals[i];
    await pool.query(`
      INSERT INTO social_signals (
        source, query, title, url, author, external_created_at, sentiment, weather_related, raw, captured_at
      ) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${i * 4} HOURS', $6, $7, $8, NOW())
    `, [
      s.source,
      s.query,
      s.title,
      'https://example.com/review/' + (i + 1),
      s.author,
      s.sentiment,
      s.weather_related,
      JSON.stringify({ score: s.sentiment === 'POSITIVE' ? 0.92 : 0.55 })
    ]);
  }

  // 4. GUEST FEEDBACK
  console.log('Seeding guest feedback...');
  await pool.query(`DELETE FROM guest_feedback`);

  const feedbackData = [
    { rating: 5, comment: 'Phenomenal hospitality, spotless suite, and the concierge was always prompt.', sentiment: 'POSITIVE', topics: ['Staff', 'Cleanliness', 'Concierge'] },
    { rating: 5, comment: 'The ocean view from our balcony was mesmerizing. Exceptional breakfast spread.', sentiment: 'POSITIVE', topics: ['View', 'Breakfast', 'Food'] },
    { rating: 4, comment: 'Great wellness amenities. The spa was serene and very relaxing.', sentiment: 'POSITIVE', topics: ['Spa', 'Wellness'] },
    { rating: 5, comment: 'Fast room service and courteous housekeeping team. Will definitely visit again.', sentiment: 'POSITIVE', topics: ['Room Service', 'Housekeeping'] },
    { rating: 4, comment: 'Beautiful infinity pool. The afternoon rain was handled gracefully by staff.', sentiment: 'POSITIVE', topics: ['Pool', 'Weather Service'] },
    { rating: 5, comment: 'Direct website booking was seamless and VIP Platinum perks were appreciated.', sentiment: 'POSITIVE', topics: ['Booking', 'Loyalty Perks'] }
  ];

  for (let i = 0; i < feedbackData.length; i++) {
    const f = feedbackData[i];
    const booking = bookings[i % bookings.length];
    const guestId = booking ? booking.guest_id : guests[i % guests.length].id;
    const bookingId = booking ? booking.id : null;

    await pool.query(`
      INSERT INTO guest_feedback (
        booking_id, guest_id, rating, comment, sentiment, topics, status, feedback_token, grace_deadline, created_at, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'SUBMITTED', $7, NOW() + INTERVAL '7 DAYS', NOW() - INTERVAL '${i * 6} HOURS', NOW() - INTERVAL '${i * 6} HOURS')
    `, [bookingId, guestId, f.rating, f.comment, f.sentiment, f.topics, `token-${i + 1}-${Date.now()}`]);
  }

  // 5. RESORT INFORMATION
  console.log('Seeding resort knowledge base...');
  await pool.query(`DELETE FROM resort_information`);

  const articles = [
    {
      category: 'DINING',
      title: 'Ocean Breeze Fine Dining Restaurant',
      content: 'Michelin-starred coastal gastronomy open daily from 6:30 PM to 11:00 PM. Specializes in fresh seafood, dry-aged steaks, and organic produce. Smart casual dress code required. Reservations recommended 24 hours in advance.'
    },
    {
      category: 'DINING',
      title: 'Lagoon Cafe & Breakfast Bistro',
      content: 'Full gourmet international breakfast buffet served daily from 6:30 AM to 10:30 AM. Features live egg stations, freshly baked French pastries, organic smoothies, and traditional regional specialities. In-room dining available 24/7.'
    },
    {
      category: 'DINING',
      title: 'Sunset Tapas & Cocktail Atrium',
      content: 'Open daily from 4:00 PM to midnight. Handcrafted signature botanical cocktails, premium vintage wines, and Spanish-Mediterranean tapas overlooking the panoramic ocean sunset. Live acoustic jazz on weekends.'
    },
    {
      category: 'SPA',
      title: 'Celestial Ayurvedic & Hydrotherapy Spa',
      content: 'Holistic wellness sanctuary open daily from 8:00 AM to 9:00 PM. Features 8 private couple treatment villas, Swedish and Ayurvedic massages, thermal steam rooms, and mineral vitality plunge pools. Advance booking via AI Concierge.'
    },
    {
      category: 'ACTIVITIES',
      title: 'Private Coral Reef Snorkeling & Marine Excursion',
      content: 'Guided underwater snorkeling expeditions depart twice daily at 9:00 AM and 2:00 PM from the Marine Center. All professional equipment, wetsuits, and marine biologist guides included complimentary for all registered guests.'
    },
    {
      category: 'ACTIVITIES',
      title: 'Sunset Catamaran Coastal Cruise',
      content: 'Luxury twin-hull catamaran cruise departs daily at 5:00 PM. Includes chilled champagne, canapes, and dolphin watching along the outer reef lagoons. Bookings close at 3:00 PM daily.'
    },
    {
      category: 'FACILITIES',
      title: 'Infinity Edge Ocean Pool & Sun Deck',
      content: 'Olympic-length heated infinity pool overlooking the turquoise sea. Open from 6:00 AM to 10:00 PM daily. Complimentary plush loungers, chilled fruit skewers, and towel service provided by pool concierge.'
    },
    {
      category: 'FACILITIES',
      title: '24-Hour Technogym Fitness Sanctuary',
      content: 'Fully equipped fitness center featuring Technogym cardio machines, free weights up to 40kg, and dedicated yoga studio. Complimentary personal training consultations available upon request.'
    },
    {
      category: 'POLICIES',
      title: 'Check-In, Check-Out & Early Arrival Policy',
      content: 'Standard check-in time is 3:00 PM; check-out is 11:00 AM. Early arrivals and late departures are accommodated complimentary based on room availability. Luggage storage and resort hospitality lounge access provided 24/7.'
    },
    {
      category: 'TRANSPORTATION',
      title: 'Airport Limousine & Helipad Transfer Service',
      content: 'Private luxury Mercedes-Benz and Tesla airport transfers can be arranged with 24 hours notice. The resort also features an operational certified private helipad for direct VIP arrivals.'
    }
  ];

  for (const a of articles) {
    await pool.query(`
      INSERT INTO resort_information (category, title, content, updated_at)
      VALUES ($1, $2, $3, NOW())
    `, [a.category, a.title, a.content]);
  }

  // 6. DIGITAL TWIN SCENARIOS
  console.log('Seeding Digital Twin scenarios...');
  await pool.query(`DELETE FROM digital_twin_scenarios`);

  const scenarios = [
    {
      label: 'Heavy Monsoon Storm Weekend (+35mm Rain)',
      narrative: 'Simulated impact of severe tropical rain across operational zones. High shift load on indoor dining (+32%) with reduced pool activity (-65%).',
      scenario_params: { precipitationMm: 35, temperatureC: 24, windSpeedKmh: 45 },
      baseline_state: { occupancy: 82.5, revpar: 268, energyKw: 1420, guestSatisfaction: 4.8 },
      simulated_state: { occupancy: 78.0, revpar: 254, energyKw: 1560, guestSatisfaction: 4.6 },
      impact_summary: { netRevenueImpact: -1850, indoorDemandIncreasePct: 32 },
      recommendations: [
        'Shift Terrace dining reservations to Ocean Atrium canopy',
        'Deploy 2 additional indoor activities coordinators for Kids Club',
        'Inspect drainage sumps near Lagoon Villas'
      ]
    },
    {
      label: 'Peak Holiday Surge (98% High Occupancy)',
      narrative: 'Simulated high-demand period with 215 out of 220 rooms booked. RevPAR maximizes at $345.',
      scenario_params: { precipitationMm: 0, temperatureC: 29, windSpeedKmh: 12 },
      baseline_state: { occupancy: 74.0, revpar: 242, energyKw: 1350, guestSatisfaction: 4.8 },
      simulated_state: { occupancy: 97.7, revpar: 345, energyKw: 1890, guestSatisfaction: 4.7 },
      impact_summary: { netRevenueImpact: +14200, staffDemandIncreasePct: 24 },
      recommendations: [
        'Authorize 15% surge pricing on remaining Suite inventory',
        'Add 3 staff to front desk morning check-out shift',
        'Pre-order 25% extra linen supply'
      ]
    },
    {
      label: 'Coastal Heatwave & Calm Seas Advisory',
      narrative: 'High temperature (+34°C) increasing pool and beach beverage revenue by 48%. High AC cooling power draw.',
      scenario_params: { precipitationMm: 0, temperatureC: 34, windSpeedKmh: 8 },
      baseline_state: { occupancy: 80.0, revpar: 260, energyKw: 1400, guestSatisfaction: 4.8 },
      simulated_state: { occupancy: 83.5, revpar: 275, energyKw: 1720, guestSatisfaction: 4.9 },
      impact_summary: { netRevenueImpact: +4600, coolingLoadIncreasePct: 28 },
      recommendations: [
        'Set chiller setpoint to 23°C in public atriums',
        'Double poolside hydration and fruit skewer distribution',
        'Promote morning snorkeling tours during calm water window'
      ]
    }
  ];

  for (const sc of scenarios) {
    await pool.query(`
      INSERT INTO digital_twin_scenarios (
        created_by, label, scenario_params, baseline_state, simulated_state, impact_summary, recommendations, narrative, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      managerUser ? managerUser.id : null,
      sc.label,
      JSON.stringify(sc.scenario_params),
      JSON.stringify(sc.baseline_state),
      JSON.stringify(sc.simulated_state),
      JSON.stringify(sc.impact_summary),
      JSON.stringify(sc.recommendations),
      sc.narrative
    ]);
  }

  // 7. CHAT CONVERSATIONS & MESSAGES
  console.log('Seeding chat messages...');
  await pool.query(`DELETE FROM chat_messages`);

  const convRes = await pool.query(`SELECT id, guest_id FROM chat_conversations LIMIT 2`);
  if (convRes.rows.length > 0) {
    const convId = convRes.rows[0].id;
    await pool.query(`
      INSERT INTO chat_messages (conversation_id, role, content, grounded, sources, used_preferences, created_at)
      VALUES
      ($1, 'GUEST', 'What are the dining options tonight and can I get a massage?', true, '[]', '[]', NOW() - INTERVAL '30 MINUTES'),
      ($1, 'ASSISTANT', 'Good evening! You have exceptional options tonight. Ocean Breeze Fine Dining offers fresh Michelin-inspired seafood until 11:00 PM, and the Sunset Tapas Atrium features live acoustic jazz. Our Celestial Ayurvedic Spa is open until 9:00 PM with hydrotherapy and couples massage treatments available. Would you like me to reserve a table or appointment for you?', true, '[{"id":"dining-1","title":"Ocean Breeze Fine Dining Restaurant","category":"Dining"},{"id":"spa-1","title":"Celestial Ayurvedic & Hydrotherapy Spa","category":"Spa"}]', '[]', NOW() - INTERVAL '29 MINUTES')
    `, [convId]);
  }

  console.log('✅ Master Data Seeding completed successfully! All tables fully populated.');
  process.exit(0);
}

seedAllMasterData().catch(err => {
  console.error('Master Seeding Failed:', err);
  process.exit(1);
});
