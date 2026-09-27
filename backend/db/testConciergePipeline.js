const { getPool } = require('../src/config/database');
const ConciergeService = require('../src/services/conciergeService');
const ChatRepository = require('../src/repositories/chatRepository');
const ResortInfoRepository = require('../src/repositories/resortInfoRepository');
const GuestRepository = require('../src/repositories/guestRepository');
const PreferenceRepository = require('../src/repositories/preferenceRepository');
const BookingRepository = require('../src/repositories/bookingRepository');
const AiService = require('../src/services/aiService');

async function testConciergePipeline() {
  const pool = getPool();
  const guestRes = await pool.query("SELECT id, name FROM guests WHERE email = 'rahul.sharma@example.com' LIMIT 1");
  const guest = guestRes.rows[0];
  console.log('Testing with guest:', guest.name, guest.id);

  const concierge = new ConciergeService(
    new ChatRepository(pool),
    new ResortInfoRepository(pool),
    new GuestRepository(pool),
    new PreferenceRepository(pool),
    new BookingRepository(pool),
    new AiService()
  );

  const q1 = await concierge.processMessage({ guestId: guest.id, message: 'Sunset Catamaran Coastal Cruise' });
  console.log('\n--- QUERY 1: Sunset Catamaran Coastal Cruise ---');
  console.log('Grounded:', q1.reply.grounded);
  console.log('Sources:', q1.reply.sources);
  console.log('AI Reply:\n', q1.reply.content);

  const q2 = await concierge.processMessage({ guestId: guest.id, message: 'what are dining options' });
  console.log('\n--- QUERY 2: what are dining options ---');
  console.log('Grounded:', q2.reply.grounded);
  console.log('Sources:', q2.reply.sources);
  console.log('AI Reply:\n', q2.reply.content);

  process.exit(0);
}

testConciergePipeline().catch(err => {
  console.error(err);
  process.exit(1);
});
